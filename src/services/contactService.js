// src/services/contactService.js
import Contacts from 'react-native-contacts';
import { PermissionsAndroid, Platform } from 'react-native';
import api from './api';

class ContactService {
  async requestContactsPermission() {
    if (Platform.OS === 'ios') {
      const permission = await Contacts.checkPermission();
      if (permission === 'undefined') {
        const request = await Contacts.requestPermission();
        return request === 'authorized';
      }
      return permission === 'authorized';
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'Chatry needs access to your contacts to find friends using the app.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny'
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }

  async getDeviceContacts() {
    try {
      const hasPermission = await this.requestContactsPermission();
      
      if (!hasPermission) {
        throw new Error('Contacts permission denied');
      }

      const contacts = await Contacts.getAll();
      
      // Extract phone numbers
      const phoneContacts = [];
      
      contacts.forEach(contact => {
        const name = `${contact.givenName} ${contact.familyName}`.trim() || 
                     contact.displayName || 
                     'Unknown';
        
        contact.phoneNumbers.forEach(phone => {
          if (phone.number) {
            phoneContacts.push({
              name,
              phoneNumber: phone.number.replace(/\s/g, '') // Remove spaces
            });
          }
        });
      });

      return phoneContacts;
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  }

  async syncContacts() {
    try {
      const contacts = await this.getDeviceContacts();
      const response = await api.syncContacts(contacts);
      return response.contacts;
    } catch (error) {
      console.error('Error syncing contacts:', error);
      throw error;
    }
  }
}

export default new ContactService();