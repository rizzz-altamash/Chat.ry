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
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLogin, setIsLogin] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
  
//   // Login mode state - 'phone' or 'username'
//   const [loginMode, setLoginMode] = useState('phone');
  
//   // Country picker states
//   const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
//   const [showCountryPicker, setShowCountryPicker] = useState(false);
  
//   // Username availability states
//   const [usernameAvailable, setUsernameAvailable] = useState(null);
//   const [checkingUsername, setCheckingUsername] = useState(false);
//   const [lastCheckedUsername, setLastCheckedUsername] = useState('');
  
//   // Error states
//   const [nameError, setNameError] = useState('');
//   const [phoneError, setPhoneError] = useState('');
//   const [usernameError, setUsernameError] = useState('');
//   const [passwordError, setPasswordError] = useState('');

//   // Load saved country on mount
//   useEffect(() => {
//     loadSavedCountry();
//   }, []);

//   // Debounced username check
//   useEffect(() => {
//     if (!isLogin && username.length >= 3 && username !== lastCheckedUsername) {
//       const timeoutId = setTimeout(() => {
//         checkUsernameAvailability(username);
//       }, 500); // 500ms delay
      
//       return () => clearTimeout(timeoutId);
//     } else if (username.length < 3) {
//       setUsernameAvailable(null);
//     }
//   }, [username, isLogin]);

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

//   const checkUsernameAvailability = async (usernameToCheck) => {
//     try {
//       setCheckingUsername(true);
//       setLastCheckedUsername(usernameToCheck);
      
//       const response = await api.checkUsernameAvailability(usernameToCheck);
//       const isAvailable = response.available;
      
//       setUsernameAvailable(isAvailable);
      
//       if (!isAvailable) {
//         setUsernameError('Username already taken');
//       } else {
//         setUsernameError('');
//       }
//     } catch (error) {
//       console.log('Username check error:', error);
//       setUsernameAvailable(false);
//       setUsernameError('Error checking username');
//     } finally {
//       setCheckingUsername(false);
//     }
//   };

//   const handleCountrySelect = async (country) => {
//     setSelectedCountry(country);
//     setShowCountryPicker(false);
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

//   const validatePhone = () => {
//     // For login with username mode, phone is not required
//     if (isLogin && loginMode === 'username') {
//       return true;
//     }
    
//     if (!phone.trim()) {
//       setPhoneError('Phone number is required');
//       return false;
//     }
//     const phoneRegex = /^[0-9]{6,15}$/;
//     if (!phoneRegex.test(phone.trim())) {
//       setPhoneError('Enter a valid phone number');
//       return false;
//     }
//     setPhoneError('');
//     return true;
//   };

//   const validateUsername = () => {
//     // For registration, username is always required
//     if (!isLogin) {
//       if (!username.trim()) {
//         setUsernameError('Username is required');
//         return false;
//       }
//       const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
//       if (!usernameRegex.test(username.trim())) {
//         setUsernameError('Username must be 3-20 characters (letters, numbers, underscore only)');
//         return false;
//       }
//       // Check if username is available
//       if (usernameAvailable === false) {
//         setUsernameError('Username already taken');
//         return false;
//       }
//     }
    
//     // For login with username mode
//     if (isLogin && loginMode === 'username') {
//       if (!username.trim()) {
//         setUsernameError('Username is required');
//         return false;
//       }
//     }
    
//     setUsernameError('');
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
//     const isUsernameValid = validateUsername();
    
//     return isNameValid && isPhoneValid && isPasswordValid && isUsernameValid;
//   };

//   const handleAuth = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       if (isLogin) {
//         let response;
        
//         if (loginMode === 'phone') {
//           // Login with phone
//           const fullPhoneNumber = phone.trim().startsWith('+') 
//             ? phone.trim() 
//             : selectedCountry.code + phone.trim();
          
//           response = await api.login(fullPhoneNumber, password);
//         } else {
//           // Login with username - Need to add this API method
//           response = await api.loginWithUsername(username.toLowerCase(), password);
//         }
        
//         const wsConnected = await websocket.connect();
//         if (wsConnected) {
//           // navigation.replace('Main');
//           navigation.reset({
//             index: 0,
//             routes: [{name: 'Main'}],
//           });
//         } else {
//           Alert.alert('Warning', 'Chat connection failed.');
//           // navigation.replace('Main');
//         }
//       } else {
//         // Registration
//         const fullPhoneNumber = phone.trim().startsWith('+') 
//           ? phone.trim() 
//           : selectedCountry.code + phone.trim();
        
//         await api.sendOTP(fullPhoneNumber);
        
//         navigation.navigate('OTP', {
//           phone: fullPhoneNumber,
//           name: name.trim(),
//           username: username.trim().toLowerCase(),
//           password,
//           countryCode: selectedCountry.code
//         });
//       }
      
//     } catch (error) {
//       if (error.message.includes('Phone number already registered')) {
//         setPhoneError('This phone number is already registered');
//       } else if (error.message.includes('Invalid credentials')) {
//         if (loginMode === 'phone') {
//           setPasswordError('Invalid phone number or password');
//         } else {
//           setPasswordError('Invalid username or password');
//         }
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
//     setLoginMode('phone'); // Reset to phone login
//   };

//   // Check if register button should be disabled
//   const isRegisterDisabled = () => {
//     if (!isLogin) {
//       return loading || 
//              !name.trim() || 
//              !phone.trim() || 
//              !username.trim() || 
//              !password || 
//              checkingUsername ||
//              usernameAvailable === false ||
//              usernameAvailable === null;
//     }
//     return loading;
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
//             <Text style={styles.appName}>Chatry</Text>
//             <Text style={styles.tagline}>Modern messaging for modern people</Text>
//           </View>

//           <View style={styles.formContainer}>
//             {/* Login Mode Selector (only for login) */}
//             {isLogin && (
//               <View style={styles.loginModeContainer}>
//                 <TouchableOpacity
//                   style={[styles.loginModeButton, loginMode === 'phone' && styles.activeLoginMode]}
//                   onPress={() => {
//                     setLoginMode('phone');
//                     setUsernameError('');
//                     setPhoneError('');
//                   }}>
//                   <Icon name="call" size={16} color={loginMode === 'phone' ? colors.white : colors.gray6} />
//                   <Text style={[styles.loginModeText, loginMode === 'phone' && styles.activeLoginModeText]}>
//                     Phone
//                   </Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={[styles.loginModeButton, loginMode === 'username' && styles.activeLoginMode]}
//                   onPress={() => {
//                     setLoginMode('username');
//                     setUsernameError('');
//                     setPhoneError('');
//                   }}>
//                   <Icon name="at" size={16} color={loginMode === 'username' ? colors.white : colors.gray6} />
//                   <Text style={[styles.loginModeText, loginMode === 'username' && styles.activeLoginModeText]}>
//                     Username
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             {/* Name Input (only for registration) */}
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

//             {/* Username Input (for registration or username login) */}
//             {(!isLogin || (isLogin && loginMode === 'username')) && (
//               <View style={styles.inputGroup}>
//                 <View style={[styles.inputWrapper, usernameError && styles.inputError]}>
//                   <Icon name="at" size={20} color={colors.gray6} style={styles.inputIcon} />
//                   <TextInput
//                     style={styles.input}
//                     placeholder={isLogin ? "Username" : "Choose a unique username"}
//                     value={username}
//                     onChangeText={(text) => {
//                       const cleanUsername = text.toLowerCase().replace(/\s/g, '');
//                       setUsername(cleanUsername);
//                       if (usernameError) validateUsername();
//                     }}
//                     onBlur={validateUsername}
//                     autoCapitalize="none"
//                     placeholderTextColor={colors.gray5}
//                   />
//                   {!isLogin && username.length >= 3 && (
//                     checkingUsername ? (
//                       <ActivityIndicator size="small" color={colors.gray6} />
//                     ) : (
//                       usernameAvailable !== null && (
//                         <Icon 
//                           name={usernameAvailable ? "checkmark-circle" : "close-circle"} 
//                           size={20} 
//                           color={usernameAvailable ? colors.success : colors.danger} 
//                         />
//                       )
//                     )
//                   )}
//                 </View>
//                 {usernameError ? (
//                   <View style={styles.errorContainer}>
//                     <Icon name="alert-circle" size={14} color={colors.danger} />
//                     <Text style={styles.errorText}>{usernameError}</Text>
//                   </View>
//                 ) : null}
//                 {!isLogin && username.length >= 3 && !usernameError && (
//                   <Text style={[styles.usernameHint, !usernameAvailable && styles.unavailableHint]}>
//                     {checkingUsername ? 'Checking availability...' :
//                      usernameAvailable ? `@${username} is available!` : 
//                      `@${username} is already taken`}
//                   </Text>
//                 )}
//               </View>
//             )}
            
//             {/* Phone Input (for registration or phone login) */}
//             {(!isLogin || (isLogin && loginMode === 'phone')) && (
//               <View style={styles.inputGroup}>
//                 <View style={[styles.phoneInputWrapper, phoneError && styles.inputError]}>
//                   <TouchableOpacity 
//                     style={styles.countrySelector}
//                     onPress={() => setShowCountryPicker(true)}>
//                     <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
//                     <Text style={styles.countryCode}>{selectedCountry.code}</Text>
//                     <Icon name="chevron-down" size={16} color={colors.gray6} />
//                   </TouchableOpacity>
                  
//                   <View style={styles.divider} />
                  
//                   <TextInput
//                     style={styles.phoneInput}
//                     placeholder="Phone number"
//                     value={phone}
//                     onChangeText={(text) => {
//                       const numericText = text.replace(/[^0-9]/g, '');
//                       setPhone(numericText);
//                       if (phoneError) validatePhone();
//                     }}
//                     onBlur={validatePhone}
//                     keyboardType="phone-pad"
//                     placeholderTextColor={colors.gray5}
//                   />
//                 </View>
//                 {phoneError ? (
//                   <View style={styles.errorContainer}>
//                     <Icon name="alert-circle" size={14} color={colors.danger} />
//                     <Text style={styles.errorText}>{phoneError}</Text>
//                   </View>
//                 ) : null}
//               </View>
//             )}

//             {/* Password Input */}
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
//               style={[
//                 styles.authButton, 
//                 (isLogin ? loading : isRegisterDisabled()) && styles.authButtonDisabled
//               ]}
//               onPress={handleAuth}
//               disabled={isLogin ? loading : isRegisterDisabled()}
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
//   loginModeContainer: {
//     flexDirection: 'row',
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderRadius: 10,
//     padding: 4,
//     marginBottom: 20,
//   },
//   loginModeButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   activeLoginMode: {
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   loginModeText: {
//     marginLeft: 6,
//     fontSize: 16,
//     color: 'rgba(255, 255, 255, 0.8)',
//   },
//   activeLoginModeText: {
//     color: colors.white,
//     fontWeight: '600',
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
//   usernameHint: {
//     fontSize: 12,
//     color: colors.success,
//     marginTop: 4,
//     marginLeft: 4,
//   },
//   unavailableHint: {
//     color: colors.danger,
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
// });

// export default LoginScreen;










// src/screens/LoginScreen.js
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
//   Animated,
//   Dimensions,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import colors from '../styles/colors';
// import api from '../services/api';
// import websocket from '../services/websocket';
// import CountryPicker, { COUNTRIES } from '../components/CountryPicker';

// const {width} = Dimensions.get('window');

// const LoginScreen = ({navigation}) => {
//   const [phone, setPhone] = useState('');
//   const [name, setName] = useState('');
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLogin, setIsLogin] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
  
//   // Login mode state - 'phone' or 'username'
//   const [loginMode, setLoginMode] = useState('phone');
  
//   // Country picker states
//   const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
//   const [showCountryPicker, setShowCountryPicker] = useState(false);
  
//   // Username availability states
//   const [usernameAvailable, setUsernameAvailable] = useState(null);
//   const [checkingUsername, setCheckingUsername] = useState(false);
//   const [lastCheckedUsername, setLastCheckedUsername] = useState('');
  
//   // Error states
//   const [nameError, setNameError] = useState('');
//   const [phoneError, setPhoneError] = useState('');
//   const [usernameError, setUsernameError] = useState('');
//   const [passwordError, setPasswordError] = useState('');

//   // Animation values
//   const fadeAnim = new Animated.Value(0);
//   const slideAnim = new Animated.Value(50);

//   // Load saved country on mount
//   useEffect(() => {
//     loadSavedCountry();
//     // Entrance animation
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         tension: 20,
//         friction: 7,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   // Debounced username check
//   useEffect(() => {
//     if (!isLogin && username.length >= 3 && username !== lastCheckedUsername) {
//       const timeoutId = setTimeout(() => {
//         checkUsernameAvailability(username);
//       }, 500); // 500ms delay
      
//       return () => clearTimeout(timeoutId);
//     } else if (username.length < 3) {
//       setUsernameAvailable(null);
//     }
//   }, [username, isLogin]);

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

//   const checkUsernameAvailability = async (usernameToCheck) => {
//     try {
//       setCheckingUsername(true);
//       setLastCheckedUsername(usernameToCheck);
      
//       const response = await api.checkUsernameAvailability(usernameToCheck);
//       const isAvailable = response.available;
      
//       setUsernameAvailable(isAvailable);
      
//       if (!isAvailable) {
//         setUsernameError('Username already taken');
//       } else {
//         setUsernameError('');
//       }
//     } catch (error) {
//       console.log('Username check error:', error);
//       setUsernameAvailable(false);
//       setUsernameError('Error checking username');
//     } finally {
//       setCheckingUsername(false);
//     }
//   };

//   const handleCountrySelect = async (country) => {
//     setSelectedCountry(country);
//     setShowCountryPicker(false);
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

//   const validatePhone = () => {
//     // For login with username mode, phone is not required
//     if (isLogin && loginMode === 'username') {
//       return true;
//     }
    
//     if (!phone.trim()) {
//       setPhoneError('Phone number is required');
//       return false;
//     }
//     const phoneRegex = /^[0-9]{6,15}$/;
//     if (!phoneRegex.test(phone.trim())) {
//       setPhoneError('Enter a valid phone number');
//       return false;
//     }
//     setPhoneError('');
//     return true;
//   };

//   const validateUsername = () => {
//     // For registration, username is always required
//     if (!isLogin) {
//       if (!username.trim()) {
//         setUsernameError('Username is required');
//         return false;
//       }
//       const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
//       if (!usernameRegex.test(username.trim())) {
//         setUsernameError('Username must be 3-20 characters (letters, numbers, underscore only)');
//         return false;
//       }
//       // Check if username is available
//       if (usernameAvailable === false) {
//         setUsernameError('Username already taken');
//         return false;
//       }
//     }
    
//     // For login with username mode
//     if (isLogin && loginMode === 'username') {
//       if (!username.trim()) {
//         setUsernameError('Username is required');
//         return false;
//       }
//     }
    
//     setUsernameError('');
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
//     const isUsernameValid = validateUsername();
    
//     return isNameValid && isPhoneValid && isPasswordValid && isUsernameValid;
//   };

//   const handleAuth = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       if (isLogin) {
//         let response;
        
//         if (loginMode === 'phone') {
//           // Login with phone
//           const fullPhoneNumber = phone.trim().startsWith('+') 
//             ? phone.trim() 
//             : selectedCountry.code + phone.trim();
          
//           response = await api.login(fullPhoneNumber, password);
//         } else {
//           // Login with username - Need to add this API method
//           response = await api.loginWithUsername(username.toLowerCase(), password);
//         }
        
//         const wsConnected = await websocket.connect();
//         if (wsConnected) {
//           // navigation.replace('Main');
//           navigation.reset({
//             index: 0,
//             routes: [{name: 'Main'}],
//           });
//         } else {
//           Alert.alert('Warning', 'Chat connection failed.');
//           // navigation.replace('Main');
//         }
//       } else {
//         // Registration
//         const fullPhoneNumber = phone.trim().startsWith('+') 
//           ? phone.trim() 
//           : selectedCountry.code + phone.trim();
        
//         await api.sendOTP(fullPhoneNumber);
        
//         navigation.navigate('OTP', {
//           phone: fullPhoneNumber,
//           name: name.trim(),
//           username: username.trim().toLowerCase(),
//           password,
//           countryCode: selectedCountry.code
//         });
//       }
      
//     } catch (error) {
//       if (error.message.includes('Phone number already registered')) {
//         setPhoneError('This phone number is already registered');
//       } else if (error.message.includes('Invalid credentials')) {
//         if (loginMode === 'phone') {
//           setPasswordError('Invalid phone number or password');
//         } else {
//           setPasswordError('Invalid username or password');
//         }
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
//     setLoginMode('phone'); // Reset to phone login
//   };

//   // Check if register button should be disabled
//   const isRegisterDisabled = () => {
//     if (!isLogin) {
//       return loading || 
//              !name.trim() || 
//              !phone.trim() || 
//              !username.trim() || 
//              !password || 
//              checkingUsername ||
//              usernameAvailable === false ||
//              usernameAvailable === null;
//     }
//     return loading;
//   };

//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={['#1a1a2e', '#0f0f1e', '#16213e']}
//         style={styles.gradient}>
        
//         {/* Animated background elements */}
//         <View style={styles.backgroundShapes}>
//           <LinearGradient
//             colors={['rgba(138, 43, 226, 0.3)', 'rgba(30, 144, 255, 0.2)']}
//             style={[styles.shape1]}
//           />
//           <LinearGradient
//             colors={['rgba(255, 20, 147, 0.2)', 'rgba(138, 43, 226, 0.3)']}
//             style={[styles.shape2]}
//           />
//         </View>

//         <KeyboardAvoidingView
//           style={styles.keyboardView}
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//           <ScrollView contentContainerStyle={styles.scrollContainer}>
//             <Animated.View 
//               style={[
//                 styles.logoContainer,
//                 {
//                   opacity: fadeAnim,
//                   transform: [{translateY: slideAnim}]
//                 }
//               ]}>
//               <View style={styles.logoWrapper}>
//                 <LinearGradient
//                   colors={['rgba(138, 43, 226, 0.3)', 'rgba(30, 144, 255, 0.3)']}
//                   style={styles.logoGradient}>
//                   <View style={styles.logoInner}>
//                     <Icon name="chatbubbles" size={50} color="#fff" />
//                   </View>
//                 </LinearGradient>
//               </View>
//               <Text style={styles.appName}>Chat.ry</Text>
//               <Text style={styles.tagline}>Where conversations come alive</Text>
//             </Animated.View>

//             <Animated.View 
//               style={[
//                 styles.formContainer,
//                 {
//                   opacity: fadeAnim,
//                   transform: [{translateY: slideAnim}]
//                 }
//               ]}>
//               {/* Glass card effect */}
//               <View style={styles.glassCard}>
//                 {/* Login Mode Selector (only for login) */}
//                 {isLogin && (
//                   <View style={styles.loginModeContainer}>
//                     <TouchableOpacity
//                       style={[styles.loginModeButton, loginMode === 'phone' && styles.activeLoginMode]}
//                       onPress={() => {
//                         setLoginMode('phone');
//                         setUsernameError('');
//                         setPhoneError('');
//                       }}
//                       activeOpacity={0.7}>
//                       <Icon name="call" size={18} color={loginMode === 'phone' ? '#fff' : 'rgba(255,255,255,0.5)'} />
//                       <Text style={[styles.loginModeText, loginMode === 'phone' && styles.activeLoginModeText]}>
//                         Phone
//                       </Text>
//                     </TouchableOpacity>
                    
//                     <TouchableOpacity
//                       style={[styles.loginModeButton, loginMode === 'username' && styles.activeLoginMode]}
//                       onPress={() => {
//                         setLoginMode('username');
//                         setUsernameError('');
//                         setPhoneError('');
//                       }}
//                       activeOpacity={0.7}>
//                       <Icon name="at" size={18} color={loginMode === 'username' ? '#fff' : 'rgba(255,255,255,0.5)'} />
//                       <Text style={[styles.loginModeText, loginMode === 'username' && styles.activeLoginModeText]}>
//                         Username
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}

//                 {/* Name Input (only for registration) */}
//                 {!isLogin && (
//                   <View style={styles.inputGroup}>
//                     <View style={[styles.inputWrapper, nameError && styles.inputError]}>
//                       <View style={styles.inputIconWrapper}>
//                         <Icon name="person" size={20} color="rgba(255,255,255,0.7)" />
//                       </View>
//                       <TextInput
//                         style={styles.input}
//                         placeholder="Your full name"
//                         value={name}
//                         onChangeText={(text) => {
//                           setName(text);
//                           if (nameError) validateName();
//                         }}
//                         onBlur={validateName}
//                         placeholderTextColor="rgba(255,255,255,0.4)"
//                       />
//                     </View>
//                     {nameError ? (
//                       <View style={styles.errorContainer}>
//                         <Icon name="alert-circle" size={14} color="#ff6b6b" />
//                         <Text style={styles.errorText}>{nameError}</Text>
//                       </View>
//                     ) : null}
//                   </View>
//                 )}

//                 {/* Username Input (for registration or username login) */}
//                 {(!isLogin || (isLogin && loginMode === 'username')) && (
//                   <View style={styles.inputGroup}>
//                     <View style={[styles.inputWrapper, usernameError && styles.inputError]}>
//                       <View style={styles.inputIconWrapper}>
//                         <Icon name="at" size={20} color="rgba(255,255,255,0.7)" />
//                       </View>
//                       <TextInput
//                         style={styles.input}
//                         placeholder={isLogin ? "Username" : "Choose a unique username"}
//                         value={username}
//                         onChangeText={(text) => {
//                           const cleanUsername = text.toLowerCase().replace(/\s/g, '');
//                           setUsername(cleanUsername);
//                           if (usernameError) validateUsername();
//                         }}
//                         onBlur={validateUsername}
//                         autoCapitalize="none"
//                         placeholderTextColor="rgba(255,255,255,0.4)"
//                       />
//                       {!isLogin && username.length >= 3 && (
//                         <View style={styles.statusIcon}>
//                           {checkingUsername ? (
//                             <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
//                           ) : (
//                             usernameAvailable !== null && (
//                               <Icon 
//                                 name={usernameAvailable ? "checkmark-circle" : "close-circle"} 
//                                 size={20} 
//                                 color={usernameAvailable ? "#4ecdc4" : "#ff6b6b"} 
//                               />
//                             )
//                           )}
//                         </View>
//                       )}
//                     </View>
//                     {usernameError ? (
//                       <View style={styles.errorContainer}>
//                         <Icon name="alert-circle" size={14} color="#ff6b6b" />
//                         <Text style={styles.errorText}>{usernameError}</Text>
//                       </View>
//                     ) : null}
//                     {!isLogin && username.length >= 3 && !usernameError && (
//                       <Text style={[styles.usernameHint, !usernameAvailable && styles.unavailableHint]}>
//                         {checkingUsername ? 'Checking availability...' :
//                          usernameAvailable ? `@${username} is available!` : 
//                          `@${username} is already taken`}
//                       </Text>
//                     )}
//                   </View>
//                 )}
                
//                 {/* Phone Input (for registration or phone login) */}
//                 {(!isLogin || (isLogin && loginMode === 'phone')) && (
//                   <View style={styles.inputGroup}>
//                     <View style={[styles.phoneInputWrapper, phoneError && styles.inputError]}>
//                       <TouchableOpacity 
//                         style={styles.countrySelector}
//                         onPress={() => setShowCountryPicker(true)}
//                         activeOpacity={0.7}>
//                         <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
//                         <Text style={styles.countryCode}>{selectedCountry.code}</Text>
//                         <Icon name="chevron-down" size={16} color="rgba(255,255,255,0.5)" />
//                       </TouchableOpacity>
                      
//                       <View style={styles.divider} />
                      
//                       <TextInput
//                         style={styles.phoneInput}
//                         placeholder="Phone number"
//                         value={phone}
//                         onChangeText={(text) => {
//                           const numericText = text.replace(/[^0-9]/g, '');
//                           setPhone(numericText);
//                           if (phoneError) validatePhone();
//                         }}
//                         onBlur={validatePhone}
//                         keyboardType="phone-pad"
//                         placeholderTextColor="rgba(255,255,255,0.4)"
//                       />
//                     </View>
//                     {phoneError ? (
//                       <View style={styles.errorContainer}>
//                         <Icon name="alert-circle" size={14} color="#ff6b6b" />
//                         <Text style={styles.errorText}>{phoneError}</Text>
//                       </View>
//                     ) : null}
//                   </View>
//                 )}

//                 {/* Password Input */}
//                 <View style={styles.inputGroup}>
//                   <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
//                     <View style={styles.inputIconWrapper}>
//                       <Icon name="lock-closed" size={20} color="rgba(255,255,255,0.7)" />
//                     </View>
//                     <TextInput
//                       style={styles.input}
//                       placeholder="Password"
//                       value={password}
//                       onChangeText={(text) => {
//                         setPassword(text);
//                         if (passwordError) validatePassword();
//                       }}
//                       onBlur={validatePassword}
//                       secureTextEntry={!showPassword}
//                       placeholderTextColor="rgba(255,255,255,0.4)"
//                     />
//                     <TouchableOpacity
//                       onPress={() => setShowPassword(!showPassword)}
//                       style={styles.eyeIcon}
//                       activeOpacity={0.7}>
//                       <Icon
//                         name={showPassword ? "eye" : "eye-off"}
//                         size={20}
//                         color="rgba(255,255,255,0.7)"
//                       />
//                     </TouchableOpacity>
//                   </View>
//                   {passwordError ? (
//                     <View style={styles.errorContainer}>
//                       <Icon name="alert-circle" size={14} color="#ff6b6b" />
//                       <Text style={styles.errorText}>{passwordError}</Text>
//                     </View>
//                   ) : null}
//                 </View>
                
//                 <TouchableOpacity
//                   style={[
//                     styles.authButton, 
//                     (isLogin ? loading : isRegisterDisabled()) && styles.authButtonDisabled
//                   ]}
//                   onPress={handleAuth}
//                   disabled={isLogin ? loading : isRegisterDisabled()}
//                   activeOpacity={0.8}>
//                   <LinearGradient
//                     colors={['#8a2be2', '#1e90ff']}
//                     start={{x: 0, y: 0}}
//                     end={{x: 1, y: 0}}
//                     style={styles.authButtonGradient}>
//                     {loading ? (
//                       <ActivityIndicator color="#fff" />
//                     ) : (
//                       <>
//                         <Text style={styles.authButtonText}>
//                           {isLogin ? 'Sign In' : 'Create Account'}
//                         </Text>
//                         <Icon name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
//                       </>
//                     )}
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.switchButton}
//                 onPress={handleModeSwitch}
//                 activeOpacity={0.7}>
//                 <Text style={styles.switchText}>
//                   {isLogin ? "New here? " : "Already have an account? "}
//                   <Text style={styles.switchTextBold}>
//                     {isLogin ? "Create Account" : "Sign In"}
//                   </Text>
//                 </Text>
//               </TouchableOpacity>

//               <Text style={styles.termsText}>
//                 By continuing, you agree to our{' '}
//                 <Text style={styles.termsLink}>Terms</Text> &{' '}
//                 <Text style={styles.termsLink}>Privacy Policy</Text>
//               </Text>
//             </Animated.View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </LinearGradient>

//       {/* Country Picker Modal */}
//       <CountryPicker
//         visible={showCountryPicker}
//         onClose={() => setShowCountryPicker(false)}
//         onSelect={handleCountrySelect}
//         selectedCountry={selectedCountry}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   gradient: {
//     flex: 1,
//   },
//   backgroundShapes: {
//     ...StyleSheet.absoluteFillObject,
//     overflow: 'hidden',
//   },
//   shape1: {
//     position: 'absolute',
//     width: 300,
//     height: 300,
//     borderRadius: 150,
//     top: -100,
//     right: -100,
//     opacity: 0.5,
//     transform: [{rotate: '45deg'}],
//   },
//   shape2: {
//     position: 'absolute',
//     width: 400,
//     height: 400,
//     borderRadius: 200,
//     bottom: -150,
//     left: -150,
//     opacity: 0.3,
//     transform: [{rotate: '-30deg'}],
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     paddingHorizontal: 24,
//   },
//   logoContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingTop: 60,
//     paddingBottom: 20,
//   },
//   logoWrapper: {
//     marginBottom: 24,
//   },
//   logoGradient: {
//     width: 100,
//     height: 100,
//     borderRadius: 30,
//     padding: 2,
//   },
//   logoInner: {
//     flex: 1,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 28,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backdropFilter: 'blur(20px)',
//   },
//   appName: {
//     fontSize: 48,
//     fontWeight: '800',
//     color: '#fff',
//     marginBottom: 8,
//     letterSpacing: -1,
//   },
//   tagline: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.7)',
//     fontWeight: '300',
//     letterSpacing: 0.5,
//   },
//   formContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingBottom: 40,
//   },
//   glassCard: {
//     backgroundColor: 'rgba(255,255,255,0.08)',
//     borderRadius: 24,
//     padding: 28,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)',
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 10},
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 10,
//   },
//   loginModeContainer: {
//     flexDirection: 'row',
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 16,
//     padding: 4,
//     marginBottom: 24,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)',
//   },
//   loginModeButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   activeLoginMode: {
//     backgroundColor: 'rgba(138,43,226,0.3)',
//   },
//   loginModeText: {
//     marginLeft: 8,
//     fontSize: 15,
//     color: 'rgba(255,255,255,0.5)',
//     fontWeight: '500',
//   },
//   activeLoginModeText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)',
//     height: 56,
//     overflow: 'hidden',
//   },
//   phoneInputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)',
//     height: 56,
//     overflow: 'hidden',
//   },
//   inputIconWrapper: {
//     width: 48,
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255,255,255,0.03)',
//   },
//   countrySelector: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     height: '100%',
//     backgroundColor: 'rgba(255,255,255,0.03)',
//   },
//   countryFlag: {
//     fontSize: 24,
//     marginRight: 8,
//   },
//   countryCode: {
//     fontSize: 15,
//     color: 'rgba(255,255,255,0.9)',
//     fontWeight: '500',
//     marginRight: 4,
//   },
//   divider: {
//     width: 1,
//     height: 24,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     marginHorizontal: 4,
//   },
//   phoneInput: {
//     flex: 1,
//     height: '100%',
//     fontSize: 16,
//     color: '#fff',
//     paddingHorizontal: 16,
//     fontWeight: '400',
//   },
//   inputError: {
//     borderColor: '#ff6b6b',
//   },
//   input: {
//     flex: 1,
//     height: '100%',
//     fontSize: 16,
//     color: '#fff',
//     paddingHorizontal: 16,
//     fontWeight: '400',
//   },
//   statusIcon: {
//     paddingRight: 16,
//   },
//   eyeIcon: {
//     paddingHorizontal: 16,
//   },
//   errorContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//     marginLeft: 4,
//   },
//   errorText: {
//     color: '#ff6b6b',
//     fontSize: 13,
//     marginLeft: 6,
//     flex: 1,
//     fontWeight: '400',
//   },
//   usernameHint: {
//     fontSize: 13,
//     color: '#4ecdc4',
//     marginTop: 6,
//     marginLeft: 4,
//     fontWeight: '500',
//   },
//   unavailableHint: {
//     color: '#ff6b6b',
//   },
//   authButton: {
//     marginTop: 8,
//     borderRadius: 16,
//     overflow: 'hidden',
//     elevation: 8,
//     shadowColor: '#8a2be2',
//     shadowOffset: {width: 0, height: 4},
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   authButtonGradient: {
//     height: 56,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   authButtonDisabled: {
//     opacity: 0.6,
//     elevation: 0,
//   },
//   authButtonText: {
//     color: '#fff',
//     fontSize: 17,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
//   buttonIcon: {
//     marginLeft: 8,
//   },
//   switchButton: {
//     alignItems: 'center',
//     paddingVertical: 16,
//     marginTop: 8,
//   },
//   switchText: {
//     color: 'rgba(255,255,255,0.6)',
//     fontSize: 15,
//     fontWeight: '400',
//   },
//   switchTextBold: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   termsText: {
//     textAlign: 'center',
//     color: 'rgba(255,255,255,0.5)',
//     fontSize: 13,
//     marginTop: 8,
//     lineHeight: 20,
//   },
//   termsLink: {
//     color: 'rgba(138,43,226,0.8)',
//     fontWeight: '500',
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
//   Dimensions,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../services/api';
// import websocket from '../services/websocket';
// import CountryPicker, { COUNTRIES } from '../components/CountryPicker';

// const { width } = Dimensions.get('window');

// const LoginScreen = ({navigation}) => {
//   const [phone, setPhone] = useState('');
//   const [name, setName] = useState('');
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLogin, setIsLogin] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
  
//   // Login mode state - 'phone' or 'username'
//   const [loginMode, setLoginMode] = useState('phone');
  
//   // Country picker states
//   const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
//   const [showCountryPicker, setShowCountryPicker] = useState(false);
  
//   // Username availability states
//   const [usernameAvailable, setUsernameAvailable] = useState(null);
//   const [checkingUsername, setCheckingUsername] = useState(false);
//   const [lastCheckedUsername, setLastCheckedUsername] = useState('');
  
//   // Error states
//   const [nameError, setNameError] = useState('');
//   const [phoneError, setPhoneError] = useState('');
//   const [usernameError, setUsernameError] = useState('');
//   const [passwordError, setPasswordError] = useState('');

//   // Load saved country on mount
//   useEffect(() => {
//     loadSavedCountry();
//   }, []);

//   // Debounced username check
//   useEffect(() => {
//     if (!isLogin && username.length >= 3 && username !== lastCheckedUsername) {
//       const timeoutId = setTimeout(() => {
//         checkUsernameAvailability(username);
//       }, 500); // 500ms delay
      
//       return () => clearTimeout(timeoutId);
//     } else if (username.length < 3) {
//       setUsernameAvailable(null);
//     }
//   }, [username, isLogin]);

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

//   const checkUsernameAvailability = async (usernameToCheck) => {
//     try {
//       setCheckingUsername(true);
//       setLastCheckedUsername(usernameToCheck);
      
//       const response = await api.checkUsernameAvailability(usernameToCheck);
//       const isAvailable = response.available;
      
//       setUsernameAvailable(isAvailable);
      
//       if (!isAvailable) {
//         setUsernameError('Username already taken');
//       } else {
//         setUsernameError('');
//       }
//     } catch (error) {
//       console.log('Username check error:', error);
//       setUsernameAvailable(false);
//       setUsernameError('Error checking username');
//     } finally {
//       setCheckingUsername(false);
//     }
//   };

//   const handleCountrySelect = async (country) => {
//     setSelectedCountry(country);
//     setShowCountryPicker(false);
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

//   const validatePhone = () => {
//     // For login with username mode, phone is not required
//     if (isLogin && loginMode === 'username') {
//       return true;
//     }
    
//     if (!phone.trim()) {
//       setPhoneError('Phone number is required');
//       return false;
//     }
//     const phoneRegex = /^[0-9]{6,15}$/;
//     if (!phoneRegex.test(phone.trim())) {
//       setPhoneError('Enter a valid phone number');
//       return false;
//     }
//     setPhoneError('');
//     return true;
//   };

//   const validateUsername = () => {
//     // For registration, username is always required
//     if (!isLogin) {
//       if (!username.trim()) {
//         setUsernameError('Username is required');
//         return false;
//       }
//       const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
//       if (!usernameRegex.test(username.trim())) {
//         setUsernameError('Username must be 3-20 characters (letters, numbers, underscore only)');
//         return false;
//       }
//       // Check if username is available
//       if (usernameAvailable === false) {
//         setUsernameError('Username already taken');
//         return false;
//       }
//     }
    
//     // For login with username mode
//     if (isLogin && loginMode === 'username') {
//       if (!username.trim()) {
//         setUsernameError('Username is required');
//         return false;
//       }
//     }
    
//     setUsernameError('');
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
//     const isUsernameValid = validateUsername();
    
//     return isNameValid && isPhoneValid && isPasswordValid && isUsernameValid;
//   };

//   const handleAuth = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);

//     try {
//       if (isLogin) {
//         let response;
        
//         if (loginMode === 'phone') {
//           // Login with phone
//           const fullPhoneNumber = phone.trim().startsWith('+') 
//             ? phone.trim() 
//             : selectedCountry.code + phone.trim();
          
//           response = await api.login(fullPhoneNumber, password);
//         } else {
//           // Login with username - Need to add this API method
//           response = await api.loginWithUsername(username.toLowerCase(), password);
//         }
        
//         const wsConnected = await websocket.connect();
//         if (wsConnected) {
//           navigation.reset({
//             index: 0,
//             routes: [{name: 'Main'}],
//           });
//         } else {
//           Alert.alert('Warning', 'Chat connection failed.');
//         }
//       } else {
//         // Registration
//         const fullPhoneNumber = phone.trim().startsWith('+') 
//           ? phone.trim() 
//           : selectedCountry.code + phone.trim();
        
//         await api.sendOTP(fullPhoneNumber);
        
//         navigation.navigate('OTP', {
//           phone: fullPhoneNumber,
//           name: name.trim(),
//           username: username.trim().toLowerCase(),
//           password,
//           countryCode: selectedCountry.code
//         });
//       }
      
//     } catch (error) {
//       if (error.message.includes('Phone number already registered')) {
//         setPhoneError('This phone number is already registered');
//       } else if (error.message.includes('Invalid credentials')) {
//         if (loginMode === 'phone') {
//           setPasswordError('Invalid phone number or password');
//         } else {
//           setPasswordError('Invalid username or password');
//         }
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
//     setLoginMode('phone'); // Reset to phone login
//   };

//   // Check if register button should be disabled
//   const isRegisterDisabled = () => {
//     if (!isLogin) {
//       return loading || 
//              !name.trim() || 
//              !phone.trim() || 
//              !username.trim() || 
//              !password || 
//              checkingUsername ||
//              usernameAvailable === false ||
//              usernameAvailable === null;
//     }
//     return loading;
//   };

//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={['#1a1a1a', '#2d2d2d']}
//         style={styles.backgroundGradient}
//       />
      
//       <KeyboardAvoidingView
//         style={styles.keyboardView}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
//         <ScrollView 
//           contentContainerStyle={styles.scrollContainer}
//           showsVerticalScrollIndicator={false}>
          
//           {/* Logo Section */}
//           <View style={styles.logoSection}>
//             <View style={styles.logoContainer}>
//               <LinearGradient
//                 colors={['#FFD700', '#FFA500']}
//                 style={styles.logoGradient}>
//                 <Icon name="chatbubbles" size={40} color="#1a1a1a" />
//               </LinearGradient>
//             </View>
//             <Text style={styles.appName}>Chat.ry</Text>
//             <Text style={styles.tagline}>Connect with elegance</Text>
//           </View>

//           {/* Form Card */}
//           <View style={styles.formCard}>
//             <View style={styles.formHeader}>
//               <Text style={styles.formTitle}>
//                 {isLogin ? 'Welcome Back' : 'Create Account'}
//               </Text>
//               <Text style={styles.formSubtitle}>
//                 {isLogin ? 'Sign in to continue' : 'Join our community'}
//               </Text>
//             </View>

//             {/* Login Mode Tabs (only for login) */}
//             {isLogin && (
//               <View style={styles.tabContainer}>
//                 <TouchableOpacity
//                   style={[styles.tab, loginMode === 'phone' && styles.activeTab]}
//                   onPress={() => {
//                     setLoginMode('phone');
//                     setUsernameError('');
//                     setPhoneError('');
//                   }}
//                   activeOpacity={0.7}>
//                   <Icon 
//                     name="call" 
//                     size={18} 
//                     color={loginMode === 'phone' ? '#1a1a1a' : '#999'} 
//                   />
//                   <Text style={[styles.tabText, loginMode === 'phone' && styles.activeTabText]}>
//                     Phone
//                   </Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={[styles.tab, loginMode === 'username' && styles.activeTab]}
//                   onPress={() => {
//                     setLoginMode('username');
//                     setUsernameError('');
//                     setPhoneError('');
//                   }}
//                   activeOpacity={0.7}>
//                   <Icon 
//                     name="at" 
//                     size={18} 
//                     color={loginMode === 'username' ? '#1a1a1a' : '#999'} 
//                   />
//                   <Text style={[styles.tabText, loginMode === 'username' && styles.activeTabText]}>
//                     Username
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             {/* Name Input (only for registration) */}
//             {!isLogin && (
//               <View style={styles.inputContainer}>
//                 <View style={[styles.inputWrapper, nameError && styles.inputError]}>
//                   <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Full name"
//                     value={name}
//                     onChangeText={(text) => {
//                       setName(text);
//                       if (nameError) validateName();
//                     }}
//                     onBlur={validateName}
//                     placeholderTextColor="#999"
//                   />
//                 </View>
//                 {nameError ? (
//                   <Text style={styles.errorText}>{nameError}</Text>
//                 ) : null}
//               </View>
//             )}

//             {/* Username Input (for registration or username login) */}
//             {(!isLogin || (isLogin && loginMode === 'username')) && (
//               <View style={styles.inputContainer}>
//                 <View style={[styles.inputWrapper, usernameError && styles.inputError]}>
//                   <Icon name="at" size={20} color="#666" style={styles.inputIcon} />
//                   <TextInput
//                     style={styles.input}
//                     placeholder={isLogin ? "Username" : "Choose username"}
//                     value={username}
//                     onChangeText={(text) => {
//                       const cleanUsername = text.toLowerCase().replace(/\s/g, '');
//                       setUsername(cleanUsername);
//                       if (usernameError) validateUsername();
//                     }}
//                     onBlur={validateUsername}
//                     autoCapitalize="none"
//                     placeholderTextColor="#999"
//                   />
//                   {!isLogin && username.length >= 3 && (
//                     checkingUsername ? (
//                       <ActivityIndicator size="small" color="#FFD700" />
//                     ) : (
//                       usernameAvailable !== null && (
//                         <Icon 
//                           name={usernameAvailable ? "checkmark-circle" : "close-circle"} 
//                           size={20} 
//                           color={usernameAvailable ? "#4CAF50" : "#F44336"} 
//                         />
//                       )
//                     )
//                   )}
//                 </View>
//                 {usernameError ? (
//                   <Text style={styles.errorText}>{usernameError}</Text>
//                 ) : (
//                   !isLogin && username.length >= 3 && !usernameError && usernameAvailable !== null && (
//                     <Text style={[styles.hintText, !usernameAvailable && styles.errorText]}>
//                       {checkingUsername ? 'Checking...' :
//                        usernameAvailable ? `@${username} is available` : 
//                        `@${username} is taken`}
//                     </Text>
//                   )
//                 )}
//               </View>
//             )}
            
//             {/* Phone Input (for registration or phone login) */}
//             {(!isLogin || (isLogin && loginMode === 'phone')) && (
//               <View style={styles.inputContainer}>
//                 <View style={[styles.phoneWrapper, phoneError && styles.inputError]}>
//                   <TouchableOpacity 
//                     style={styles.countryButton}
//                     onPress={() => setShowCountryPicker(true)}
//                     activeOpacity={0.7}>
//                     <Text style={styles.flag}>{selectedCountry.flag}</Text>
//                     <Text style={styles.countryCode}>{selectedCountry.code}</Text>
//                     <Icon name="chevron-down" size={16} color="#666" />
//                   </TouchableOpacity>
                  
//                   <View style={styles.phoneDivider} />
                  
//                   <TextInput
//                     style={styles.phoneInput}
//                     placeholder="Phone number"
//                     value={phone}
//                     onChangeText={(text) => {
//                       const numericText = text.replace(/[^0-9]/g, '');
//                       setPhone(numericText);
//                       if (phoneError) validatePhone();
//                     }}
//                     onBlur={validatePhone}
//                     keyboardType="phone-pad"
//                     placeholderTextColor="#999"
//                   />
//                 </View>
//                 {phoneError ? (
//                   <Text style={styles.errorText}>{phoneError}</Text>
//                 ) : null}
//               </View>
//             )}

//             {/* Password Input */}
//             <View style={styles.inputContainer}>
//               <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
//                 <Icon name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
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
//                   placeholderTextColor="#999"
//                 />
//                 <TouchableOpacity
//                   onPress={() => setShowPassword(!showPassword)}
//                   activeOpacity={0.7}>
//                   <Icon
//                     name={showPassword ? "eye" : "eye-off"}
//                     size={20}
//                     color="#666"
//                   />
//                 </TouchableOpacity>
//               </View>
//               {passwordError ? (
//                 <Text style={styles.errorText}>{passwordError}</Text>
//               ) : null}
//             </View>
            
//             {/* Submit Button */}
//             <TouchableOpacity
//               onPress={handleAuth}
//               disabled={isLogin ? loading : isRegisterDisabled()}
//               activeOpacity={0.8}>
//               <LinearGradient
//                 colors={['#FFD700', '#FFA500']}
//                 style={[
//                   styles.submitButton,
//                   (isLogin ? loading : isRegisterDisabled()) && styles.submitButtonDisabled
//                 ]}>
//                 {loading ? (
//                   <ActivityIndicator color="#1a1a1a" />
//                 ) : (
//                   <Text style={styles.submitButtonText}>
//                     {isLogin ? 'Sign In' : 'Create Account'}
//                   </Text>
//                 )}
//               </LinearGradient>
//             </TouchableOpacity>

//             {/* Switch Mode */}
//             <TouchableOpacity
//               style={styles.switchContainer}
//               onPress={handleModeSwitch}
//               activeOpacity={0.7}>
//               <Text style={styles.switchText}>
//                 {isLogin ? "Don't have an account? " : "Already have an account? "}
//                 <Text style={styles.switchLink}>
//                   {isLogin ? 'Sign Up' : 'Sign In'}
//                 </Text>
//               </Text>
//             </TouchableOpacity>

//             {/* Terms */}
//             <Text style={styles.termsText}>
//               By continuing, you agree to our{' '}
//               <Text style={styles.termsLink}>Terms of Service</Text>
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
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   backgroundGradient: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 350,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     paddingBottom: 30,
//   },
//   logoSection: {
//     alignItems: 'center',
//     paddingTop: 60,
//     paddingBottom: 30,
//   },
//   logoContainer: {
//     marginBottom: 16,
//   },
//   logoGradient: {
//     width: 80,
//     height: 80,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 8,
//     shadowColor: '#FFD700',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   appName: {
//     fontSize: 36,
//     fontWeight: '800',
//     color: '#fff',
//     letterSpacing: -0.5,
//   },
//   tagline: {
//     fontSize: 16,
//     color: 'rgba(255, 255, 255, 0.8)',
//     marginTop: 4,
//   },
//   formCard: {
//     flex: 1,
//     backgroundColor: '#fff',
//     marginHorizontal: 20,
//     borderRadius: 24,
//     padding: 24,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//   },
//   formHeader: {
//     marginBottom: 24,
//   },
//   formTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     marginBottom: 4,
//   },
//   formSubtitle: {
//     fontSize: 16,
//     color: '#666',
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#f5f5f5',
//     borderRadius: 12,
//     padding: 4,
//     marginBottom: 24,
//   },
//   tab: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   activeTab: {
//     backgroundColor: '#FFD700',
//   },
//   tabText: {
//     marginLeft: 6,
//     fontSize: 16,
//     color: '#999',
//     fontWeight: '500',
//   },
//   activeTabText: {
//     color: '#1a1a1a',
//     fontWeight: '600',
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f8f8',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     height: 56,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
//   phoneWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f8f8',
//     borderRadius: 12,
//     height: 56,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
//   inputError: {
//     borderColor: '#F44336',
//   },
//   inputIcon: {
//     marginRight: 12,
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: '#1a1a1a',
//   },
//   countryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },
//   flag: {
//     fontSize: 24,
//     marginRight: 8,
//   },
//   countryCode: {
//     fontSize: 16,
//     color: '#1a1a1a',
//     marginRight: 4,
//     fontWeight: '500',
//   },
//   phoneDivider: {
//     width: 1,
//     height: 24,
//     backgroundColor: '#e0e0e0',
//     marginRight: 12,
//   },
//   phoneInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#1a1a1a',
//     paddingRight: 16,
//   },
//   errorText: {
//     fontSize: 12,
//     color: '#F44336',
//     marginTop: 6,
//     marginLeft: 4,
//   },
//   hintText: {
//     fontSize: 12,
//     color: '#4CAF50',
//     marginTop: 6,
//     marginLeft: 4,
//   },
//   submitButton: {
//     height: 56,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 8,
//   },
//   submitButtonDisabled: {
//     opacity: 0.6,
//   },
//   submitButtonText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     letterSpacing: 0.5,
//   },
//   switchContainer: {
//     alignItems: 'center',
//     marginTop: 24,
//   },
//   switchText: {
//     fontSize: 15,
//     color: '#666',
//   },
//   switchLink: {
//     color: '#FFD700',
//     fontWeight: '600',
//   },
//   termsText: {
//     textAlign: 'center',
//     fontSize: 13,
//     color: '#999',
//     marginTop: 16,
//     lineHeight: 18,
//   },
//   termsLink: {
//     color: '#FFD700',
//     fontWeight: '500',
//   },
// });

// export default LoginScreen;







// BEST 
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
  Dimensions,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import websocket from '../services/websocket';
import CountryPicker, { COUNTRIES } from '../components/CountryPicker';

const { width, height } = Dimensions.get('window');

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
          navigation.reset({
            index: 0,
            routes: [{name: 'Main'}],
          });
        } else {
          Alert.alert('Warning', 'Chat connection failed.');
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
    <View style={styles.container}>
      {/* Premium Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={['#000', '#2d1810', '#000']}
          style={styles.backgroundGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        />
        
        {/* Decorative Elements */}
        {/* <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} /> */}
        
        {/* Golden Glow Effects */}
        {/* <LinearGradient
          colors={['rgba(255, 215, 0, 0.3)', 'transparent']}
          style={styles.glowEffect1}
        />
        <LinearGradient
          colors={['rgba(255, 165, 0, 0.2)', 'transparent']}
          style={styles.glowEffect2}
        /> */}
      </View>
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.logoGradient}>
                <Icon name="chatbubbles" size={40} color="#1a1a1a" />
              </LinearGradient>
              <View style={styles.logoGlow} />
            </View>
            <Text style={styles.appName}>Chat.ry</Text>
            <Text style={styles.tagline}>Connect with elegance</Text>
          </View>

          {/* Glass Morphism Form Card */}
          <View style={styles.glassCardWrapper}>
            <View style={styles.glassCard}>
              {/* Glass Effect Overlay */}
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.glassOverlay}
              />
              
              <View style={styles.formContent}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </Text>
                  <Text style={styles.formSubtitle}>
                    {isLogin ? 'Sign in to continue' : 'Join our community'}
                  </Text>
                </View>

                {/* Login Mode Tabs (only for login) */}
                {isLogin && (
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[styles.tab, loginMode === 'phone' && styles.activeTab]}
                      onPress={() => {
                        setLoginMode('phone');
                        setUsernameError('');
                        setPhoneError('');
                      }}
                      activeOpacity={0.7}>
                      <Icon 
                        name="call" 
                        size={18} 
                        color={loginMode === 'phone' ? '#1a1a1a' : '#fff'} 
                      />
                      <Text style={[styles.tabText, loginMode === 'phone' && styles.activeTabText]}>
                        Phone
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.tab, loginMode === 'username' && styles.activeTab]}
                      onPress={() => {
                        setLoginMode('username');
                        setUsernameError('');
                        setPhoneError('');
                      }}
                      activeOpacity={0.7}>
                      <Icon 
                        name="at" 
                        size={18} 
                        color={loginMode === 'username' ? '#1a1a1a' : '#fff'} 
                      />
                      <Text style={[styles.tabText, loginMode === 'username' && styles.activeTabText]}>
                        Username
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Name Input (only for registration) */}
                {!isLogin && (
                  <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, nameError && styles.inputError]}>
                      <Icon name="person" size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Full name"
                        value={name}
                        onChangeText={(text) => {
                          setName(text);
                          if (nameError) validateName();
                        }}
                        onBlur={validateName}
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      />
                    </View>
                    {nameError ? (
                      <Text style={styles.errorText}>{nameError}</Text>
                    ) : null}
                  </View>
                )}

                {/* Username Input (for registration or username login) */}
                {(!isLogin || (isLogin && loginMode === 'username')) && (
                  <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, usernameError && styles.inputError]}>
                      <Icon name="at" size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={isLogin ? "Username" : "Choose username"}
                        value={username}
                        onChangeText={(text) => {
                          const cleanUsername = text.toLowerCase().replace(/\s/g, '');
                          setUsername(cleanUsername);
                          if (usernameError) validateUsername();
                        }}
                        onBlur={validateUsername}
                        autoCapitalize="none"
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      />
                      {!isLogin && username.length >= 3 && (
                        checkingUsername ? (
                          <ActivityIndicator size="small" color="#FFD700" />
                        ) : (
                          usernameAvailable !== null && (
                            <Icon 
                              name={usernameAvailable ? "checkmark-circle" : "close-circle"} 
                              size={20} 
                              color={usernameAvailable ? "#4CAF50" : "#F44336"} 
                            />
                          )
                        )
                      )}
                    </View>
                    {usernameError ? (
                      <Text style={styles.errorText}>{usernameError}</Text>
                    ) : (
                      !isLogin && username.length >= 3 && !usernameError && usernameAvailable !== null && (
                        <Text style={[styles.hintText, !usernameAvailable && styles.errorText]}>
                          {checkingUsername ? 'Checking...' :
                           usernameAvailable ? `@${username} is available` : 
                           `@${username} is taken`}
                        </Text>
                      )
                    )}
                  </View>
                )}
                
                {/* Phone Input (for registration or phone login) */}
                {(!isLogin || (isLogin && loginMode === 'phone')) && (
                  <View style={styles.inputContainer}>
                    <View style={[styles.phoneWrapper, phoneError && styles.inputError]}>
                      <TouchableOpacity 
                        style={styles.countryButton}
                        onPress={() => setShowCountryPicker(true)}
                        activeOpacity={0.7}>
                        <Text style={styles.flag}>{selectedCountry.flag}</Text>
                        <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                        <Icon name="chevron-down" size={16} color="rgba(255, 255, 255, 0.6)" />
                      </TouchableOpacity>
                      
                      <View style={styles.phoneDivider} />
                      
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
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      />
                    </View>
                    {phoneError ? (
                      <Text style={styles.errorText}>{phoneError}</Text>
                    ) : null}
                  </View>
                )}

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
                    <Icon name="lock-closed" size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
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
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}>
                      <Icon
                        name={showPassword ? "eye" : "eye-off"}
                        size={20}
                        color="rgba(255, 255, 255, 0.6)"
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  ) : null}
                </View>
                
                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleAuth}
                  disabled={isLogin ? loading : isRegisterDisabled()}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={[
                      styles.submitButton,
                      (isLogin ? loading : isRegisterDisabled()) && styles.submitButtonDisabled
                    ]}>
                    {loading ? (
                      <ActivityIndicator color="#1a1a1a" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {isLogin ? 'Sign In' : 'Create Account'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Switch Mode */}
                <TouchableOpacity
                  style={styles.switchContainer}
                  onPress={handleModeSwitch}
                  activeOpacity={0.7}>
                  <Text style={styles.switchText}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Text style={styles.switchLink}>
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </Text>
                  </Text>
                </TouchableOpacity>

                {/* Terms */}
                <Text style={styles.termsText}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                </Text>
              </View>
            </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  backgroundContainer: {
    position: 'absolute',
    width: width,
    height: height,
  },
  backgroundGradient: {
    position: 'absolute',
    width: width,
    height: height,
  },
  // decorativeCircle1: {
  //   position: 'absolute',
  //   width: 300,
  //   height: 300,
  //   borderRadius: 150,
  //   backgroundColor: 'rgba(255, 215, 0, 0.1)',
  //   top: -100,
  //   right: -100,
  //   transform: [{scale: 1.5}],
  // },
  // decorativeCircle2: {
  //   position: 'absolute',
  //   width: 200,
  //   height: 200,
  //   borderRadius: 100,
  //   backgroundColor: 'rgba(255, 165, 0, 0.08)',
  //   bottom: 100,
  //   left: -50,
  // },
  // glowEffect1: {
  //   position: 'absolute',
  //   width: 400,
  //   height: 400,
  //   borderRadius: 200,
  //   top: -200,
  //   left: -100,
  //   opacity: 0.5,
  // },
  // glowEffect2: {
  //   position: 'absolute',
  //   width: 300,
  //   height: 300,
  //   borderRadius: 150,
  //   bottom: -150,
  //   right: -50,
  //   opacity: 0.4,
  // },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    top: -10,
    left: -10,
    zIndex: -1,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  glassCardWrapper: {
    flex: 1,
    marginHorizontal: 20,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  formContent: {
    padding: 24,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  phoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  inputError: {
    borderColor: 'rgba(244, 67, 54, 0.6)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  flag: {
    fontSize: 24,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    color: '#fff',
    marginRight: 4,
    fontWeight: '500',
  },
  phoneDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingRight: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 6,
    marginLeft: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 6,
    marginLeft: 4,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  switchContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  switchText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  switchLink: {
    color: '#FFD700',
    fontWeight: '600',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: '#FFD700',
    fontWeight: '500',
  },
});

export default LoginScreen;