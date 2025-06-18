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












// // src/screens/LoginScreen.js
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
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import colors from '../styles/colors';
// import api from '../services/api';
// import websocket from '../services/websocket';
// import CountryPicker, { COUNTRIES } from '../components/CountryPicker';

// const LoginScreen = ({navigation}) => {
//   const [phone, setPhone] = useState('');
//   const [name, setName] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLogin, setIsLogin] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [username, setUsername] = useState('');
//   const [usernameError, setUsernameError] = useState('');
//   const [usernameAvailable, setUsernameAvailable] = useState(null); // null, true, or false
//   const [checkingUsername, setCheckingUsername] = useState(false);
  
//   // Country picker states
//   const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default India
//   const [showCountryPicker, setShowCountryPicker] = useState(false);
  
//   // Error states for each field
//   const [nameError, setNameError] = useState('');
//   const [phoneError, setPhoneError] = useState('');
//   const [passwordError, setPasswordError] = useState('');

//   // Add username availability check function
//   const checkUsernameAvailability = async (usernameToCheck) => {
//     try {
//       setCheckingUsername(true);
//       const response = await api.searchByUsername(usernameToCheck);
//       // If no users found with this username, it's available
//       const isAvailable = response.users.length === 0;
//       setUsernameAvailable(isAvailable);
      
//       if (!isAvailable) {
//         setUsernameError('Username already taken');
//       } else {
//         setUsernameError('');
//       }
//     } catch (error) {
//       console.log('Username check error:', error);
//     } finally {
//       setCheckingUsername(false);
//     }
//   };

//   // Load saved country on mount
//   useEffect(() => {
//     loadSavedCountry();
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

//   const handleCountrySelect = async (country) => {
//     setSelectedCountry(country);
//     setShowCountryPicker(false);
//     // Save selection
//     try {
//       await AsyncStorage.setItem('lastUsedCountryCode', country.code);
//     } catch (error) {
//       console.log('Error saving country:', error);
//     }
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

//   const validateUsername = () => {
//     if (!isLogin) {  // Required field for registration
//       if (!username.trim()) {
//         setUsernameError('Username is required');
//         return false;
//       }
//       const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
//       if (!usernameRegex.test(username.trim())) {
//         setUsernameError('Username must be 3-20 characters (letters, numbers, underscore only)');
//         return false;
//       }
//     }
//     setUsernameError('');
//     return true;
//   };

//   const validatePhone = () => {
//     if (!phone.trim()) {
//       setPhoneError('Phone number is required');
//       return false;
//     }
//     // Basic phone validation - adjust based on selected country
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
//     const isUsernameValid = isLogin ? true : (validateUsername() && usernameAvailable === true);
    
//     return isNameValid && isPhoneValid && isPasswordValid && isUsernameValid;
//   };

//   const handleAuth = async () => {
//     // Validate form before submission
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       // Create full phone number with country code
//       const fullPhoneNumber = phone.trim().startsWith('+') 
//         ? phone.trim() 
//         : selectedCountry.code + phone.trim();

//       if (isLogin) {
//         // Login with full phone number
//         const response = await api.login(fullPhoneNumber, password);
        
//         const wsConnected = await websocket.connect();
//         if (wsConnected) {
//           navigation.replace('Main');
//         } else {
//           Alert.alert('Warning', 'Chat connection failed. Some features may not work.');
//           navigation.replace('Main');
//         }
//       } else {
//         // Send OTP for registration
//         await api.sendOTP(fullPhoneNumber);
        
//         // Navigate to OTP screen with full phone number
//         navigation.navigate('OTP', {
//           phone: fullPhoneNumber,
//           name: name.trim(),
//           username: username.trim(),
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

//   // Clear errors when switching between login/register
//   const handleModeSwitch = () => {
//     setIsLogin(!isLogin);
//     setNameError('');
//     setPhoneError('');
//     setPasswordError('');
//     setUsernameError('');
//     setName('');
//     setPhone('');
//     setPassword('');
//     setUsername('');
//     setUsernameAvailable(null);
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
//               <>
//                 <View style={styles.inputGroup}>
//                   <View style={[styles.inputWrapper, nameError && styles.inputError]}>
//                     <Icon name="person-outline" size={20} color={colors.gray6} style={styles.inputIcon} />
//                     <TextInput
//                       style={styles.input}
//                       placeholder="Your name"
//                       value={name}
//                       onChangeText={(text) => {
//                         setName(text);
//                         if (nameError) validateName();
//                       }}
//                       onBlur={validateName}
//                       placeholderTextColor={colors.gray5}
//                     />
//                   </View>
//                   {nameError ? (
//                     <View style={styles.errorContainer}>
//                       <Icon name="alert-circle" size={14} color={colors.danger} />
//                       <Text style={styles.errorText}>{nameError}</Text>
//                     </View>
//                   ) : null}
//                 </View>

//                 <View style={styles.inputGroup}>
//                   <View style={[styles.inputWrapper, usernameError && styles.inputError]}>
//                     <Icon name="at" size={20} color={colors.gray6} style={styles.inputIcon} />
//                     <TextInput
//                       style={styles.input}
//                       placeholder="Choose a username"
//                       value={username}
//                       onChangeText={(text) => {
//                         // Convert to lowercase and remove spaces
//                         const cleanUsername = text.toLowerCase().replace(/\s/g, '');
//                         setUsername(cleanUsername);
//                         if (usernameError) validateUsername();
//                         // Check availability after 3 characters
//                         if (cleanUsername.length >= 3) {
//                           checkUsernameAvailability(cleanUsername);
//                         }
//                       }}
//                       onBlur={validateUsername}
//                       autoCapitalize="none"
//                       placeholderTextColor={colors.gray5}
//                     />
//                     {usernameAvailable !== null && username.length >= 3 && (
//                       <Icon 
//                         name={usernameAvailable ? "checkmark-circle" : "close-circle"} 
//                         size={20} 
//                         color={usernameAvailable ? colors.success : colors.danger} 
//                       />
//                     )}
//                   </View>
//                   {usernameError ? (
//                     <View style={styles.errorContainer}>
//                       <Icon name="alert-circle" size={14} color={colors.danger} />
//                       <Text style={styles.errorText}>{usernameError}</Text>
//                     </View>
//                   ) : null}
//                   {username && !usernameError && (
//                     <Text style={[styles.usernameHint, usernameAvailable === false && styles.unavailableHint]}>
//                       {usernameAvailable === null ? `Your username will be @${username}` :
//                       usernameAvailable ? `@${username} is available!` : 
//                       `@${username} is already taken`}
//                     </Text>
//                   )}
//                 </View>
//               </>
//             )}
            
//             {/* Phone Input with Country Selector */}
//             <View style={styles.inputGroup}>
//               <View style={[styles.phoneInputWrapper, phoneError && styles.inputError]}>
//                 <TouchableOpacity 
//                   style={styles.countrySelector}
//                   onPress={() => setShowCountryPicker(true)}>
//                   <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
//                   <Text style={styles.countryCode}>{selectedCountry.code}</Text>
//                   <Icon name="chevron-down" size={16} color={colors.gray6} />
//                 </TouchableOpacity>
                
//                 <View style={styles.divider} />
                
//                 <TextInput
//                   style={styles.phoneInput}
//                   placeholder="Phone number"
//                   value={phone}
//                   onChangeText={(text) => {
//                     // Only allow numbers
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

//       {/* Country Picker Modal */}
//       <CountryPicker
//         visible={showCountryPicker}
//         onClose={() => setShowCountryPicker(false)}
//         onSelect={handleCountrySelect}
//         selectedCountry={selectedCountry}
//       />
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
//   phoneInputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//     borderRadius: 12,
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
//   countryFlag: {
//     fontSize: 24,
//     marginRight: 8,
//   },
//   countryCode: {
//     fontSize: 16,
//     color: colors.gray7,
//     marginRight: 4,
//   },
//   divider: {
//     width: 1,
//     height: 30,
//     backgroundColor: colors.gray3,
//     marginRight: 12,
//   },
//   phoneInput: {
//     flex: 1,
//     height: 56,
//     fontSize: 16,
//     color: colors.gray9,
//     paddingRight: 16,
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
//   usernameHint: {
//     fontSize: 12,
//     color: colors.success,
//     marginTop: 4,
//     marginLeft: 4,
//   },
//   unavailableHint: {
//     color: colors.danger,
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login mode state - 'phone' or 'username'
  const [loginMode, setLoginMode] = useState('phone');
  
  // Country picker states
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
  // Username availability states
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [lastCheckedUsername, setLastCheckedUsername] = useState('');
  
  // Error states
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load saved country on mount
  useEffect(() => {
    loadSavedCountry();
  }, []);

  // Debounced username check
  useEffect(() => {
    if (!isLogin && username.length >= 3 && username !== lastCheckedUsername) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 500); // 500ms delay
      
      return () => clearTimeout(timeoutId);
    } else if (username.length < 3) {
      setUsernameAvailable(null);
    }
  }, [username, isLogin]);

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

  const checkUsernameAvailability = async (usernameToCheck) => {
    try {
      setCheckingUsername(true);
      setLastCheckedUsername(usernameToCheck);
      
      const response = await api.checkUsernameAvailability(usernameToCheck);
      const isAvailable = response.available;
      
      setUsernameAvailable(isAvailable);
      
      if (!isAvailable) {
        setUsernameError('Username already taken');
      } else {
        setUsernameError('');
      }
    } catch (error) {
      console.log('Username check error:', error);
      setUsernameAvailable(false);
      setUsernameError('Error checking username');
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
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
    // For login with username mode, phone is not required
    if (isLogin && loginMode === 'username') {
      return true;
    }
    
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      return false;
    }
    const phoneRegex = /^[0-9]{6,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      setPhoneError('Enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateUsername = () => {
    // For registration, username is always required
    if (!isLogin) {
      if (!username.trim()) {
        setUsernameError('Username is required');
        return false;
      }
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username.trim())) {
        setUsernameError('Username must be 3-20 characters (letters, numbers, underscore only)');
        return false;
      }
      // Check if username is available
      if (usernameAvailable === false) {
        setUsernameError('Username already taken');
        return false;
      }
    }
    
    // For login with username mode
    if (isLogin && loginMode === 'username') {
      if (!username.trim()) {
        setUsernameError('Username is required');
        return false;
      }
    }
    
    setUsernameError('');
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
    const isUsernameValid = validateUsername();
    
    return isNameValid && isPhoneValid && isPasswordValid && isUsernameValid;
  };

  const handleAuth = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        let response;
        
        if (loginMode === 'phone') {
          // Login with phone
          const fullPhoneNumber = phone.trim().startsWith('+') 
            ? phone.trim() 
            : selectedCountry.code + phone.trim();
          
          response = await api.login(fullPhoneNumber, password);
        } else {
          // Login with username - Need to add this API method
          response = await api.loginWithUsername(username.toLowerCase(), password);
        }
        
        const wsConnected = await websocket.connect();
        if (wsConnected) {
          // navigation.replace('Main');
          navigation.reset({
            index: 0,
            routes: [{name: 'Main'}],
          });
        } else {
          Alert.alert('Warning', 'Chat connection failed.');
          // navigation.replace('Main');
        }
      } else {
        // Registration
        const fullPhoneNumber = phone.trim().startsWith('+') 
          ? phone.trim() 
          : selectedCountry.code + phone.trim();
        
        await api.sendOTP(fullPhoneNumber);
        
        navigation.navigate('OTP', {
          phone: fullPhoneNumber,
          name: name.trim(),
          username: username.trim().toLowerCase(),
          password,
          countryCode: selectedCountry.code
        });
      }
      
    } catch (error) {
      if (error.message.includes('Phone number already registered')) {
        setPhoneError('This phone number is already registered');
      } else if (error.message.includes('Invalid credentials')) {
        if (loginMode === 'phone') {
          setPasswordError('Invalid phone number or password');
        } else {
          setPasswordError('Invalid username or password');
        }
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
    setUsernameError('');
    setName('');
    setPhone('');
    setPassword('');
    setUsername('');
    setUsernameAvailable(null);
    setLoginMode('phone'); // Reset to phone login
  };

  // Check if register button should be disabled
  const isRegisterDisabled = () => {
    if (!isLogin) {
      return loading || 
             !name.trim() || 
             !phone.trim() || 
             !username.trim() || 
             !password || 
             checkingUsername ||
             usernameAvailable === false ||
             usernameAvailable === null;
    }
    return loading;
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
            {/* Login Mode Selector (only for login) */}
            {isLogin && (
              <View style={styles.loginModeContainer}>
                <TouchableOpacity
                  style={[styles.loginModeButton, loginMode === 'phone' && styles.activeLoginMode]}
                  onPress={() => {
                    setLoginMode('phone');
                    setUsernameError('');
                    setPhoneError('');
                  }}>
                  <Icon name="call" size={16} color={loginMode === 'phone' ? colors.white : colors.gray6} />
                  <Text style={[styles.loginModeText, loginMode === 'phone' && styles.activeLoginModeText]}>
                    Phone
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.loginModeButton, loginMode === 'username' && styles.activeLoginMode]}
                  onPress={() => {
                    setLoginMode('username');
                    setUsernameError('');
                    setPhoneError('');
                  }}>
                  <Icon name="at" size={16} color={loginMode === 'username' ? colors.white : colors.gray6} />
                  <Text style={[styles.loginModeText, loginMode === 'username' && styles.activeLoginModeText]}>
                    Username
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Name Input (only for registration) */}
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

            {/* Username Input (for registration or username login) */}
            {(!isLogin || (isLogin && loginMode === 'username')) && (
              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, usernameError && styles.inputError]}>
                  <Icon name="at" size={20} color={colors.gray6} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={isLogin ? "Username" : "Choose a unique username"}
                    value={username}
                    onChangeText={(text) => {
                      const cleanUsername = text.toLowerCase().replace(/\s/g, '');
                      setUsername(cleanUsername);
                      if (usernameError) validateUsername();
                    }}
                    onBlur={validateUsername}
                    autoCapitalize="none"
                    placeholderTextColor={colors.gray5}
                  />
                  {!isLogin && username.length >= 3 && (
                    checkingUsername ? (
                      <ActivityIndicator size="small" color={colors.gray6} />
                    ) : (
                      usernameAvailable !== null && (
                        <Icon 
                          name={usernameAvailable ? "checkmark-circle" : "close-circle"} 
                          size={20} 
                          color={usernameAvailable ? colors.success : colors.danger} 
                        />
                      )
                    )
                  )}
                </View>
                {usernameError ? (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={14} color={colors.danger} />
                    <Text style={styles.errorText}>{usernameError}</Text>
                  </View>
                ) : null}
                {!isLogin && username.length >= 3 && !usernameError && (
                  <Text style={[styles.usernameHint, !usernameAvailable && styles.unavailableHint]}>
                    {checkingUsername ? 'Checking availability...' :
                     usernameAvailable ? `@${username} is available!` : 
                     `@${username} is already taken`}
                  </Text>
                )}
              </View>
            )}
            
            {/* Phone Input (for registration or phone login) */}
            {(!isLogin || (isLogin && loginMode === 'phone')) && (
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
            )}

            {/* Password Input */}
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
              style={[
                styles.authButton, 
                (isLogin ? loading : isRegisterDisabled()) && styles.authButtonDisabled
              ]}
              onPress={handleAuth}
              disabled={isLogin ? loading : isRegisterDisabled()}
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
  loginModeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  loginModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeLoginMode: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginModeText: {
    marginLeft: 6,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeLoginModeText: {
    color: colors.white,
    fontWeight: '600',
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
  usernameHint: {
    fontSize: 12,
    color: colors.success,
    marginTop: 4,
    marginLeft: 4,
  },
  unavailableHint: {
    color: colors.danger,
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