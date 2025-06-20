// src/services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  constructor() {
    // Replace with your computer's IP address
    this.baseURL = 'http://192.168.1.6:3000/api'; // CHANGE THIS TO YOUR IP!
  }

  async getHeaders(requireAuth = true) {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (requireAuth) {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const headers = await this.getHeaders();
      const url = `${this.baseURL}${endpoint}`;
      
      console.log('🚀 API Request:', {
        url,
        method: options.method || 'GET',
        headers,
        body: options.body
      });
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });

      console.log('📥 Response Status:', response.status);
      
      const text = await response.text();
      console.log('📥 Response Text:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('❌ Failed to parse JSON:', text);
        throw new Error('Invalid JSON response');
      }

      if (!response.ok) {
        console.error('❌ API Error:', data);
        // Check if error has _id property issue
        if (data.error && typeof data.error === 'object') {
          throw new Error('Server error: Invalid data structure');
        }
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('❌ Request failed:', error);
      // throw error;
      
      // Don't try to access error._id if error might be undefined
      if (error && error.message) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  // Helper function to parse phone number
  parsePhoneNumber(fullPhoneNumber) {
    console.log('🔍 Parsing phone:', fullPhoneNumber);
    
    // Remove any spaces or special characters first
    const cleanPhone = fullPhoneNumber.replace(/\s+/g, '').replace(/-/g, '');
    
    if (cleanPhone.startsWith('+')) {
      // Country codes ki list - most specific pehle 
      const countryCodePatterns = [
        { regex: /^\+91(\d{10})$/, code: '+91' },      // India
        { regex: /^\+1(\d{10})$/, code: '+1' },        // USA/Canada
        { regex: /^\+44(\d{10,11})$/, code: '+44' },   // UK
        { regex: /^\+971(\d{8,9})$/, code: '+971' },   // UAE
        { regex: /^\+65(\d{8})$/, code: '+65' },       // Singapore
        { regex: /^\+86(\d{11})$/, code: '+86' },      // China
        { regex: /^\+61(\d{9})$/, code: '+61' },       // Australia
        { regex: /^\+49(\d{10,11})$/, code: '+49' },   // Germany
        { regex: /^\+33(\d{9})$/, code: '+33' },       // France
        { regex: /^\+81(\d{10})$/, code: '+81' },      // Japan
        // Add more as needed
      ];
      
      // Check each pattern
      for (const pattern of countryCodePatterns) {
        const match = cleanPhone.match(pattern.regex);
        if (match) {
          console.log('✅ Matched pattern for', pattern.code);
          return {
            countryCode: pattern.code,
            phone: match[1]  // Captured group contains just the number
          };
        }
      }
      
      // Fallback - generic pattern
      // This will handle any country code not in our list
      const genericMatch = cleanPhone.match(/^(\+\d{1,3})(\d{6,15})$/);
      if (genericMatch) {
        console.log('⚠️ Using generic pattern');
        return {
          countryCode: genericMatch[1],
          phone: genericMatch[2]
        };
      }
    }
    
    // If no country code, assume India
    console.log('⚠️ No country code found, using default');
    return {
      countryCode: '+91',
      phone: cleanPhone
    };
  }

  // Auth endpoints
  async login(fullPhoneNumber, password) {
    // Parse phone number for backward compatibility
    const { countryCode, phone } = this.parsePhoneNumber(fullPhoneNumber);
    
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        phone: countryCode + phone, // Send full phone for login
        password 
      })
    });

    if (response.token) {
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    }

    return response;
  }

  // Add this new method for username availability check
  async checkUsernameAvailability(username) {
    try {
      // Don't send auth header for this request
      const response = await fetch(`${this.baseURL}/auth/check-username/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        }
      });
      
      const data = await response.json();

      if (!response.ok) {
        console.error('Username check failed:', data);
        return { available: false, error: data.error };
      }

      return data;
    } catch (error) {
      console.error('Username availability  check error:', error);
      return { available: false, error: 'Network error' };
    }
  }

  async loginWithUsername(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        username: username.toLowerCase(), // Ensure lowercase
        password 
      })
    });

    if (response.token) {
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    }

    return response;
  }

  async sendOTP(fullPhoneNumber) {
    // Parse phone number to separate country code and number
    const { countryCode, phone } = this.parsePhoneNumber(fullPhoneNumber);
    
    console.log('📱 Sending OTP:', { countryCode, phone });
    console.log('📱 Full phone received:', fullPhoneNumber); // YE ADD KARO

    const requestBody = { 
      phone: phone,           
      countryCode: countryCode
    };
    
    console.log('📱 Request Body:', JSON.stringify(requestBody)); // YE BHI ADD KARO
    
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ 
        phone: phone,           // Just the number part
        countryCode: countryCode // Country code separately
      })
    });
  }

  async verifyOTP(fullPhoneNumber, otp, name, username, password) {
    // Parse phone number for consistency
    const { countryCode, phone } = this.parsePhoneNumber(fullPhoneNumber);
    
    const response = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ 
        phone: countryCode + phone, // Send full phone for verification
        otp, 
        name, 
        username, 
        password 
      })
    });

    if (response.token) {
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      // Ignore logout errors - user wants to logout anyway
      console.log('Logout API error:', error);
    } finally {
      // Always clear local data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/profile');
  }

  async getUserInfo(userId) {
    return this.request(`/users/${userId}/info`);
  }

  async updateProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async searchUsers(query) {
    return this.request(`/users/search?query=${encodeURIComponent(query)}`);
  }

  async searchByUsername(username) {
    return this.request(`/contacts/search?username=${username}`);
  }

  async addContact(userId) {
    return this.request('/users/contacts', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  async getContacts() {
    return this.request('/users/contacts');
  }

  async syncContacts(contacts) {
    return this.request('/contacts/sync', {
      method: 'POST',
      body: JSON.stringify({ contacts })
    });
  }

  // Message endpoints
  async getChats() {
    return this.request('/messages/chats');
  }

  async getChatMessages(chatId, page = 1) {
    return this.request(`/messages/chat/${chatId}?page=${page}`);
  }

  async sendMessage(recipientId, text) {
    return this.request('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ recipientId, text })
    });
  }

  async markAsRead(messageIds, chatId) {
    return this.request('/messages/read', {
      method: 'POST',
      body: JSON.stringify({ messageIds, chatId })
    });
  }

  async deleteMessage(messageId) {
    return this.request(`/messages/${messageId}`, {
      method: 'DELETE'
    });
  }

  // Group endpoints
  async getGroups() {
    return this.request('/groups');
  }

  async createGroup(name, description, memberIds) {
    return this.request('/groups/create', {
      method: 'POST',
      body: JSON.stringify({ name, description, memberIds })
    });
  }

  async getGroupMessages(groupId, page = 1) {
    return this.request(`/groups/${groupId}/messages?page=${page}`);
  }

  async sendGroupMessage(groupId, text) {
    return this.request('/groups/message', {
      method: 'POST',
      body: JSON.stringify({ groupId, text })
    });
  }

  async addGroupMembers(groupId, memberIds) {
    return this.request(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ memberIds })
    });
  }

  async removeGroupMember(groupId, memberId) {
    return this.request(`/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE'
    });
  }

  async updateGroup(groupId, data) {
    return this.request(`/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async reportGroupMember(groupId, memberId, reason) {
    return this.request(`/groups/${groupId}/report/${memberId}`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // Make member admin
  async makeAdmin(groupId, memberId) {
    return this.request(`/groups/${groupId}/admin/${memberId}`, {
      method: 'POST'
    });
  }

  // Remove admin privileges
  async removeAdmin(groupId, memberId) {
    return this.request(`/groups/${groupId}/admin/${memberId}`, {
      method: 'DELETE'
    });
  }

  // Update group settings
  async updateGroupSettings(groupId, settings) {
    return this.request(`/groups/${groupId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async deleteGroupFromList(groupId) {
    return this.request(`/groups/${groupId}/delete-from-list`, {
      method: 'DELETE'
    });
  }
}

export default new ApiService();