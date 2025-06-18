// // ===== src/screens/LoginScreen.js =====
// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   FlatList,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as RNLocalize from 'react-native-localize';
// import colors from '../styles/colors';
// import api from '../services/api';
// import websocket from '../services/websocket';

// // Popular countries with their codes
// const COUNTRIES = [
//   { code: '+91', flag: '🇮🇳', name: 'India', iso: 'IN' },
//   { code: '+1', flag: '🇺🇸', name: 'USA', iso: 'US' },
//   { code: '+44', flag: '🇬🇧', name: 'UK', iso: 'GB' },
//   { code: '+971', flag: '🇦🇪', name: 'UAE', iso: 'AE' },
//   { code: '+65', flag: '🇸🇬', name: 'Singapore', iso: 'SG' },
//   { code: '+61', flag: '🇦🇺', name: 'Australia', iso: 'AU' },
//   { code: '+86', flag: '🇨🇳', name: 'China', iso: 'CN' },
//   { code: '+49', flag: '🇩🇪', name: 'Germany', iso: 'DE' },
//   { code: '+33', flag: '🇫🇷', name: 'France', iso: 'FR' },
//   { code: '+81', flag: '🇯🇵', name: 'Japan', iso: 'JP' },
//   // Add more countries as needed
// ];

// const LoginScreen = ({navigation}) => {
//   const [phone, setPhone] = useState('');
//   const [name, setName] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLogin, setIsLogin] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
//   const [showCountryPicker, setShowCountryPicker] = useState(false);
  
//   // Error states for each field
//   const [nameError, setNameError] = useState('');
//   const [phoneError, setPhoneError] = useState('');
//   const [passwordError, setPasswordError] = useState('');

//   // Load saved country preference
//   useEffect(() => {
//     loadSavedCountry();
//     detectUserCountry();
//   }, []);

//   const loadSavedCountry = async () => {
//     try {
//       const savedCountryCode = await AsyncStorage.getItem('lastUsedCountryCode');
//       if (savedCountryCode) {
//         const country = COUNTRIES.find(c => c.code === savedCountryCode);
//         if (country) {
//           setSelectedCountry(country);
//         }
//       }
//     } catch (error) {
//       console.log('Error loading saved country:', error);
//     }
//   };

//   const detectUserCountry = () => {
//     try {
//       const deviceCountry = RNLocalize.getCountry();
//       const country = COUNTRIES.find(c => c.iso === deviceCountry);
//       if (country && !AsyncStorage.getItem('lastUsedCountryCode')) {
//         setSelectedCountry(country);
//       }
//     } catch (error) {
//       console.log('Error detecting country:', error);
//     }
//   };

//   const selectCountry = async (country) => {
//     setSelectedCountry(country);
//     setShowCountryPicker(false);
//     // Save preference
//     await AsyncStorage.setItem('lastUsedCountryCode', country.code);
//   };

//   // Validation functions
//   const validateName = () => {
//     if (!isLogin && !name.trim()) {
//       setNameError('Name is required');
//       return false;
//     }
//     if (!isLogin && name.trim().length < 2) {
//       setNameError('Name must be at least 2 characters');
//       return false;
//     }
//     setNameError('');
//     return true;
//   };

//   const validatePhone = () => {
//     if (!phone.trim()) {
//       setPhoneError('Phone number is required');
//       return false;
//     }
    
//     // Basic validation - adjust regex based on country if needed
//     const phoneRegex = /^[0-9]{6,15}$/;
//     if (!phoneRegex.test(phone.trim())) {
//       setPhoneError('Enter a valid phone number');
//       return false;
//     }
//     setPhoneError('');
//     return true;
//   };

//   const validatePassword = () => {
//     if (!password) {
//       setPasswordError('Password is required');
//       return false;
//     }
//     if (password.length < 6) {
//       setPasswordError('Password must be at least 6 characters');
//       return false;
//     }
//     setPasswordError('');
//     return true;
//   };

//   // Validate all fields
//   const validateForm = () => {
//     const isNameValid = isLogin ? true : validateName();
//     const isPhoneValid = validatePhone();
//     const isPasswordValid = validatePassword();
    
//     return isNameValid && isPhoneValid && isPasswordValid;
//   };

//   const handleAuth = async () => {
//     // Validate form before submission
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
      
//       // Always use full phone number with country code
//       const fullPhoneNumber = phone.trim().startsWith('+') 
//         ? phone.trim() 
//         : selectedCountry.code + phone.trim();
      
//       if (isLogin) {
//         const response = await api.login(fullPhoneNumber, password);

//         const wsConnected = await websocket.connect();
//         if (wsConnected) {
//           navigation.replace('Main');
//         } else {
//           Alert.alert('Warning', 'Chat connection failed.');
//           // navigation.replace('Main');
//         }
//       } else {

//         // Send OTP first
//         await api.sendOTP(fullPhoneNumber);
        
//         // Navigate to OTP screen
//         navigation.navigate('OTP', {
//           phone: fullPhoneNumber,
//           name: name.trim(),
//           password,
//           countryCode: selectedCountry.code
//         });
//       }
      
//     } catch (error) {
//       // Check if error contains validation errors from backend
//       if (error.message.includes('Phone number already registered')) {
//         setPhoneError('This phone number is already registered');
//       } else if (error.message.includes('Invalid credentials')) {
//         setPasswordError('Invalid phone number or password');
//       } else {
//         Alert.alert(
//           'Error',
//           error.message || (isLogin ? 'Login failed' : 'Registration failed')
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Country Picker Modal
//   const CountryPickerModal = () => (
//     <Modal
//       visible={showCountryPicker}
//       transparent={true}
//       animationType="slide">
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Select Country</Text>
//             <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
//               <Icon name="close" size={24} color={colors.gray7} />
//             </TouchableOpacity>
//           </View>
          
//           <FlatList
//             data={COUNTRIES}
//             keyExtractor={(item) => item.code}
//             renderItem={({item}) => (
//               <TouchableOpacity
//                 style={styles.countryItem}
//                 onPress={() => selectCountry(item)}>
//                 <Text style={styles.countryFlag}>{item.flag}</Text>
//                 <Text style={styles.countryName}>{item.name}</Text>
//                 <Text style={styles.countryCode}>{item.code}</Text>
//               </TouchableOpacity>
//             )}
//           />
//         </View>
//       </View>
//     </Modal>
//   );

//   // Clear errors when switching between login/register
//   const handleModeSwitch = () => {
//     setIsLogin(!isLogin);
//     setNameError('');
//     setPhoneError('');
//     setPasswordError('');
//     setName('');
//     setPhone('');
//     setPassword('');
//   };

//   return (
//     <LinearGradient
//       colors={[colors.gradientStart, colors.gradientEnd]}
//       style={styles.gradient}>
//       <KeyboardAvoidingView
//         style={styles.container}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//           <View style={styles.logoContainer}>
//             <View style={styles.logoCircle}>
//               <Icon name="chatbubbles-outline" size={60} color={colors.white} />
//             </View>
//             <Text style={styles.appName}>Chat.ry</Text>
//             <Text style={styles.tagline}>Modern messaging for modern people</Text>
//           </View>

//           <View style={styles.formContainer}>
//             {!isLogin && (
//               <View style={styles.inputGroup}>
//                 <View style={[styles.inputWrapper, nameError && styles.inputError]}>
//                   <Icon name="person-outline" size={20} color={colors.gray6} style={styles.inputIcon} />
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Your name"
//                     value={name}
//                     onChangeText={(text) => {
//                       setName(text);
//                       if (nameError) validateName();
//                     }}
//                     onBlur={validateName}
//                     placeholderTextColor={colors.gray5}
//                   />
//                 </View>
//                 {nameError ? (
//                   <View style={styles.errorContainer}>
//                     <Icon name="alert-circle" size={14} color={colors.danger} />
//                     <Text style={styles.errorText}>{nameError}</Text>
//                   </View>
//                 ) : null}
//               </View>
//             )}
            
//             {/* <View style={styles.inputGroup}>
//               <View style={[styles.inputWrapper, phoneError && styles.inputError]}>
//                 <Icon name="call-outline" size={20} color={colors.gray6} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Phone number"
//                   value={phone}
//                   onChangeText={(text) => {
//                     setPhone(text);
//                     if (phoneError) validatePhone();
//                   }}
//                   onBlur={validatePhone}
//                   keyboardType="phone-pad"
//                   placeholderTextColor={colors.gray5}
//                 />
//               </View>
//               {phoneError ? (
//                 <View style={styles.errorContainer}>
//                   <Icon name="alert-circle" size={14} color={colors.danger} />
//                   <Text style={styles.errorText}>{phoneError}</Text>
//                 </View>
//               ) : null}
//             </View> */}

//             <View style={styles.inputGroup}>
//               <View style={[styles.phoneInputWrapper, phoneError && styles.inputError]}>
//                 <TouchableOpacity 
//                   style={styles.countrySelector}
//                   onPress={() => setShowCountryPicker(true)}>
//                   <Text style={styles.selectedFlag}>{selectedCountry.flag}</Text>
//                   <Text style={styles.selectedCode}>{selectedCountry.code}</Text>
//                   <Icon name="chevron-down" size={16} color={colors.gray6} />
//                 </TouchableOpacity>
                
//                 <View style={styles.phoneDivider} />
                
//                 <Icon name="call-outline" size={20} color={colors.gray6} style={styles.phoneIcon} />
//                 <TextInput
//                   style={styles.phoneInput}
//                   placeholder="Phone number"
//                   value={phone}
//                   onChangeText={(text) => {
//                     // Allow only numbers
//                     const numericText = text.replace(/[^0-9]/g, '');
//                     setPhone(numericText);
//                     if (phoneError) validatePhone();
//                   }}
//                   onBlur={validatePhone}
//                   keyboardType="phone-pad"
//                   placeholderTextColor={colors.gray5}
//                 />
//               </View>
//               {phoneError ? (
//                 <View style={styles.errorContainer}>
//                   <Icon name="alert-circle" size={14} color={colors.danger} />
//                   <Text style={styles.errorText}>{phoneError}</Text>
//                 </View>
//               ) : null}
//             </View>

//             <View style={styles.inputGroup}>
//               <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
//                 <Icon name="lock-closed-outline" size={20} color={colors.gray6} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Password"
//                   value={password}
//                   onChangeText={(text) => {
//                     setPassword(text);
//                     if (passwordError) validatePassword();
//                   }}
//                   onBlur={validatePassword}
//                   secureTextEntry={!showPassword}
//                   placeholderTextColor={colors.gray5}
//                 />
//                 <TouchableOpacity
//                   onPress={() => setShowPassword(!showPassword)}
//                   style={styles.eyeIcon}>
//                   <Icon
//                     name={showPassword ? "eye-outline" : "eye-off-outline"}
//                     size={20}
//                     color={colors.gray6}
//                   />
//                 </TouchableOpacity>
//               </View>
//               {passwordError ? (
//                 <View style={styles.errorContainer}>
//                   <Icon name="alert-circle" size={14} color={colors.danger} />
//                   <Text style={styles.errorText}>{passwordError}</Text>
//                 </View>
//               ) : null}
//             </View>
            
//             <TouchableOpacity
//               style={[styles.authButton, loading && styles.authButtonDisabled]}
//               onPress={handleAuth}
//               disabled={loading}
//               activeOpacity={0.8}>
//               {loading ? (
//                 <ActivityIndicator color={colors.gradientStart} />
//               ) : (
//                 <>
//                   <Text style={styles.authButtonText}>
//                     {isLogin ? 'Login' : 'Register'}
//                   </Text>
//                   <Icon name="arrow-forward" size={20} color={colors.gradientStart} style={styles.buttonIcon} />
//                 </>
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.switchButton}
//               onPress={handleModeSwitch}>
//               <Text style={styles.switchText}>
//                 {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
//               </Text>
//             </TouchableOpacity>

//             <Text style={styles.termsText}>
//               By continuing, you agree to our Terms of Service
//             </Text>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>

//       <CountryPickerModal />

//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   gradient: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     paddingHorizontal: 30,
//   },
//   logoContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingTop: 60,
//   },
//   logoCircle: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 20,
//   },
//   appName: {
//     fontSize: 42,
//     fontWeight: '700',
//     color: colors.white,
//     marginBottom: 10,
//   },
//   tagline: {
//     fontSize: 16,
//     color: 'rgba(255, 255, 255, 0.8)',
//     textAlign: 'center',
//   },
//   formContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingBottom: 40,
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     elevation: 3,
//     shadowColor: colors.shadowColor,
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   inputError: {
//     borderColor: colors.danger,
//     borderWidth: 1,
//   },
//   inputIcon: {
//     marginRight: 12,
//   },
//   input: {
//     flex: 1,
//     height: 56,
//     fontSize: 16,
//     color: colors.gray9,
//   },
//   eyeIcon: {
//     padding: 8,
//   },
//   errorContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 6,
//     marginLeft: 4,
//   },
//   errorText: {
//     color: colors.danger,
//     fontSize: 12,
//     marginLeft: 4,
//     flex: 1,
//   },
//   authButton: {
//     flexDirection: 'row',
//     backgroundColor: colors.white,
//     borderRadius: 12,
//     height: 56,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 10,
//     marginBottom: 15,
//     elevation: 3,
//     shadowColor: colors.shadowColor,
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   authButtonDisabled: {
//     opacity: 0.6,
//   },
//   authButtonText: {
//     color: colors.gradientStart,
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   buttonIcon: {
//     marginLeft: 8,
//   },
//   switchButton: {
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   switchText: {
//     color: 'rgba(255, 255, 255, 0.9)',
//     fontSize: 15,
//   },
//   termsText: {
//     textAlign: 'center',
//     color: 'rgba(255, 255, 255, 0.7)',
//     fontSize: 13,
//     marginTop: 10,
//   },
//   // Country selector 
//   phoneInputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//     borderRadius: 12,
//     paddingRight: 16,
//     elevation: 3,
//     shadowColor: colors.shadowColor,
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   countrySelector: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 18,
//   },
//   selectedFlag: {
//     fontSize: 24,
//     marginRight: 8,
//   },
//   selectedCode: {
//     fontSize: 16,
//     color: colors.gray7,
//     marginRight: 4,
//   },
//   phoneDivider: {
//     width: 1,
//     height: 30,
//     backgroundColor: colors.gray3,
//     marginRight: 12,
//   },
//   phoneIcon: {
//     marginRight: 8,
//   },
//   phoneInput: {
//     flex: 1,
//     height: 56,
//     fontSize: 16,
//     color: colors.gray9,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: colors.white,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: '70%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.gray2,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: colors.gray8,
//   },
//   countryItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.gray2,
//   },
//   countryFlag: {
//     fontSize: 28,
//     marginRight: 12,
//   },
//   countryName: {
//     flex: 1,
//     fontSize: 16,
//     color: colors.gray8,
//   },
//   countryCode: {
//     fontSize: 16,
//     color: colors.gray6,
//   },
// });

// export default LoginScreen;












// src/screens/LoginScreen.js
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../styles/colors';
import api from '../services/api';
import websocket from '../services/websocket';
import CountryPicker, { COUNTRIES } from '../components/CountryPicker';

const LoginScreen = ({navigation}) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Country picker states
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default India
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
  // Error states for each field
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load saved country on mount
  useEffect(() => {
    loadSavedCountry();
  }, []);

  const loadSavedCountry = async () => {
    try {
      const savedCountryCode = await AsyncStorage.getItem('lastUsedCountryCode');
      if (savedCountryCode) {
        const country = COUNTRIES.find(c => c.code === savedCountryCode);
        if (country) {
          setSelectedCountry(country);
        }
      }
    } catch (error) {
      console.log('Error loading saved country:', error);
    }
  };

  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    // Save selection
    try {
      await AsyncStorage.setItem('lastUsedCountryCode', country.code);
    } catch (error) {
      console.log('Error saving country:', error);
    }
  };

  // Validation functions
  const validateName = () => {
    if (!isLogin && !name.trim()) {
      setNameError('Name is required');
      return false;
    }
    if (!isLogin && name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  const validatePhone = () => {
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      return false;
    }
    // Basic phone validation - adjust based on selected country
    const phoneRegex = /^[0-9]{6,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      setPhoneError('Enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Validate all fields
  const validateForm = () => {
    const isNameValid = isLogin ? true : validateName();
    const isPhoneValid = validatePhone();
    const isPasswordValid = validatePassword();
    
    return isNameValid && isPhoneValid && isPasswordValid;
  };

  const handleAuth = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create full phone number with country code
      const fullPhoneNumber = phone.trim().startsWith('+') 
        ? phone.trim() 
        : selectedCountry.code + phone.trim();

      if (isLogin) {
        // Login with full phone number
        const response = await api.login(fullPhoneNumber, password);
        
        const wsConnected = await websocket.connect();
        if (wsConnected) {
          navigation.replace('Main');
        } else {
          Alert.alert('Warning', 'Chat connection failed. Some features may not work.');
          navigation.replace('Main');
        }
      } else {
        // Send OTP for registration
        await api.sendOTP(fullPhoneNumber);
        
        // Navigate to OTP screen with full phone number
        navigation.navigate('OTP', {
          phone: fullPhoneNumber,
          name: name.trim(),
          password,
          countryCode: selectedCountry.code
        });
      }
      
    } catch (error) {
      // Check if error contains validation errors from backend
      if (error.message.includes('Phone number already registered')) {
        setPhoneError('This phone number is already registered');
      } else if (error.message.includes('Invalid credentials')) {
        setPasswordError('Invalid phone number or password');
      } else {
        Alert.alert(
          'Error',
          error.message || (isLogin ? 'Login failed' : 'Registration failed')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear errors when switching between login/register
  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setNameError('');
    setPhoneError('');
    setPasswordError('');
    setName('');
    setPhone('');
    setPassword('');
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Icon name="chatbubbles-outline" size={60} color={colors.white} />
            </View>
            <Text style={styles.appName}>Chatry</Text>
            <Text style={styles.tagline}>Modern messaging for modern people</Text>
          </View>

          <View style={styles.formContainer}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, nameError && styles.inputError]}>
                  <Icon name="person-outline" size={20} color={colors.gray6} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (nameError) validateName();
                    }}
                    onBlur={validateName}
                    placeholderTextColor={colors.gray5}
                  />
                </View>
                {nameError ? (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={14} color={colors.danger} />
                    <Text style={styles.errorText}>{nameError}</Text>
                  </View>
                ) : null}
              </View>
            )}
            
            {/* Phone Input with Country Selector */}
            <View style={styles.inputGroup}>
              <View style={[styles.phoneInputWrapper, phoneError && styles.inputError]}>
                <TouchableOpacity 
                  style={styles.countrySelector}
                  onPress={() => setShowCountryPicker(true)}>
                  <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                  <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                  <Icon name="chevron-down" size={16} color={colors.gray6} />
                </TouchableOpacity>
                
                <View style={styles.divider} />
                
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone number"
                  value={phone}
                  onChangeText={(text) => {
                    // Only allow numbers
                    const numericText = text.replace(/[^0-9]/g, '');
                    setPhone(numericText);
                    if (phoneError) validatePhone();
                  }}
                  onBlur={validatePhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.gray5}
                />
              </View>
              {phoneError ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color={colors.danger} />
                  <Text style={styles.errorText}>{phoneError}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
                <Icon name="lock-closed-outline" size={20} color={colors.gray6} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePassword();
                  }}
                  onBlur={validatePassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={colors.gray5}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}>
                  <Icon
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.gray6}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color={colors.danger} />
                  <Text style={styles.errorText}>{passwordError}</Text>
                </View>
              ) : null}
            </View>
            
            <TouchableOpacity
              style={[styles.authButton, loading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color={colors.gradientStart} />
              ) : (
                <>
                  <Text style={styles.authButtonText}>
                    {isLogin ? 'Login' : 'Register'}
                  </Text>
                  <Icon name="arrow-forward" size={20} color={colors.gradientStart} style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={handleModeSwitch}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <CountryPicker
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelect={handleCountrySelect}
        selectedCountry={selectedCountry}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    color: colors.gray7,
    marginRight: 4,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.gray3,
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: colors.gray9,
    paddingRight: 16,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: colors.gray9,
  },
  eyeIcon: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  authButton: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: colors.gradientStart,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
  },
  termsText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginTop: 10,
  },
});

export default LoginScreen;