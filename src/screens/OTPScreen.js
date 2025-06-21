// // ===== src/screens/OTPScreen.js =====
// import React, {useState, useRef, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Platform,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import colors from '../styles/colors';
// import api from '../services/api';
// import websocket from '../services/websocket';

// const OTPScreen = ({navigation, route}) => {
//   const {phone, name, password, username, countryCode} = route.params;
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [loading, setLoading] = useState(false);
//   const [timer, setTimer] = useState(300); // 5 minutes
//   const [canResend, setCanResend] = useState(false);
  
//   // Refs for input fields
//   const inputRefs = useRef([]);

//   useEffect(() => {
//     // Start countdown timer
//     const interval = setInterval(() => {
//       setTimer((prev) => {
//         if (prev <= 1) {
//           setCanResend(true);
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const handleOtpChange = (value, index) => {
//     // Only allow numbers
//     if (value && !/^\d+$/.test(value)) return;

//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     // Auto focus next input
//     if (value && index < 5) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleKeyPress = (e, index) => {
//     if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handleVerifyOTP = async () => {
//     const otpString = otp.join('');
    
//     if (otpString.length !== 6) {
//       Alert.alert('Error', 'Please enter complete OTP');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Verify OTP
//       const fullPhone = phone.startsWith('+') ? phone : '+91' + phone;
//       const response = await api.verifyOTP(fullPhone, otpString, name, username || '', password);
      
//       // Connect WebSocket
//       await websocket.connect();
      
//       // Navigate to main app
//       navigation.reset({
//         index: 0,
//         routes: [{name: 'Main'}],
//       });
      
//     } catch (error) {
//       Alert.alert('Error', error.message || 'Invalid OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     if (!canResend) return;

//     try {
//       await api.sendOTP(phone);
//       Alert.alert('Success', 'OTP sent successfully');
      
//       // Reset timer
//       setTimer(300);
//       setCanResend(false);
      
//       // Restart timer
//       const interval = setInterval(() => {
//         setTimer((prev) => {
//           if (prev <= 1) {
//             setCanResend(true);
//             clearInterval(interval);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
      
//     } catch (error) {
//       Alert.alert('Error', error.message || 'Failed to send OTP');
//     }
//   };

//   // For development - show OTP hint
//   const [showHint, setShowHint] = useState(false);
//   useEffect(() => {
//     if (__DEV__) {
//       // In development, show hint after 2 seconds
//       setTimeout(() => setShowHint(true), 2000);
//     }
//   }, []);

//   return (
//     <LinearGradient
//       colors={[colors.gradientStart, colors.gradientEnd]}
//       style={styles.gradient}>
//       <View style={styles.container}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={24} color={colors.white} />
//         </TouchableOpacity>

//         <View style={styles.content}>
//           <Icon name="shield-checkmark" size={80} color={colors.white} />
          
//           <Text style={styles.title}>Verify Phone Number</Text>
//           <Text style={styles.subtitle}>
//             We've sent a 6-digit code to{'\n'}
//             <Text style={styles.phoneNumber}>{phone}</Text>
//           </Text>

//           {__DEV__ && showHint && (
//             <Text style={styles.devHint}>
//               Development Mode: Check console for OTP
//             </Text>
//           )}

//           <View style={styles.otpContainer}>
//             {otp.map((digit, index) => (
//               <TextInput
//                 key={index}
//                 ref={(ref) => (inputRefs.current[index] = ref)}
//                 style={[
//                   styles.otpInput,
//                   digit && styles.otpInputFilled
//                 ]}
//                 value={digit}
//                 onChangeText={(value) => handleOtpChange(value, index)}
//                 onKeyPress={(e) => handleKeyPress(e, index)}
//                 keyboardType="number-pad"
//                 maxLength={1}
//                 selectTextOnFocus
//                 autoFocus={index === 0}
//               />
//             ))}
//           </View>

//           <Text style={styles.timerText}>
//             {timer > 0 ? `Resend code in ${formatTime(timer)}` : 'You can resend code now'}
//           </Text>

//           <TouchableOpacity
//             style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
//             onPress={handleVerifyOTP}
//             disabled={loading}>
//             {loading ? (
//               <ActivityIndicator color={colors.gradientStart} />
//             ) : (
//               <Text style={styles.verifyButtonText}>Verify & Continue</Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
//             onPress={handleResendOTP}
//             disabled={!canResend}>
//             <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
//               Didn't receive code? Resend
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
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
//   backButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     left: 20,
//     zIndex: 1,
//     padding: 10,
//   },
//   content: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 30,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: colors.white,
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: 'rgba(255, 255, 255, 0.8)',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   phoneNumber: {
//     fontWeight: '600',
//     color: colors.white,
//   },
//   devHint: {
//     fontSize: 14,
//     color: colors.warning,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginBottom: 20,
//   },
//   otpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginBottom: 20,
//     marginTop: 20,
//   },
//   otpInput: {
//     width: 45,
//     height: 55,
//     borderRadius: 10,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//     color: colors.white,
//     fontSize: 24,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   otpInputFilled: {
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//     borderColor: 'rgba(255, 255, 255, 0.5)',
//   },
//   timerText: {
//     fontSize: 14,
//     color: 'rgba(255, 255, 255, 0.8)',
//     marginBottom: 30,
//   },
//   verifyButton: {
//     width: '100%',
//     height: 56,
//     backgroundColor: colors.white,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 20,
//     elevation: 3,
//     shadowColor: colors.shadowColor,
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   verifyButtonDisabled: {
//     opacity: 0.6,
//   },
//   verifyButtonText: {
//     color: colors.gradientStart,
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   resendButton: {
//     padding: 10,
//   },
//   resendButtonDisabled: {
//     opacity: 0.5,
//   },
//   resendText: {
//     color: colors.white,
//     fontSize: 16,
//   },
//   resendTextDisabled: {
//     color: 'rgba(255, 255, 255, 0.5)',
//   },
// });

// export default OTPScreen;












// // src/screens/OTPScreen.js
// import React, {useState, useRef, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   Animated,
//   Dimensions,
//   Vibration,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import colors from '../styles/colors';
// import api from '../services/api';
// import websocket from '../services/websocket';

// const {width} = Dimensions.get('window');

// const OTPScreen = ({navigation, route}) => {
//   const {phone, name, password, username, countryCode} = route.params;
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [loading, setLoading] = useState(false);
//   const [timer, setTimer] = useState(300); // 5 minutes
//   const [canResend, setCanResend] = useState(false);
  
//   // Refs for input fields
//   const inputRefs = useRef([]);
  
//   // Animation values
//   const fadeAnim = new Animated.Value(0);
//   const slideAnim = new Animated.Value(30);
//   const shakeAnim = new Animated.Value(0);
//   const scaleAnims = useRef(otp.map(() => new Animated.Value(1))).current;

//   useEffect(() => {
//     // Start countdown timer
//     const interval = setInterval(() => {
//       setTimer((prev) => {
//         if (prev <= 1) {
//           setCanResend(true);
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     // Entrance animation
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         tension: 20,
//         friction: 7,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     return () => clearInterval(interval);
//   }, []);

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const animateInput = (index) => {
//     Animated.sequence([
//       Animated.timing(scaleAnims[index], {
//         toValue: 1.1,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(scaleAnims[index], {
//         toValue: 1,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const shakeAnimation = () => {
//     Animated.sequence([
//       Animated.timing(shakeAnim, {
//         toValue: 10,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(shakeAnim, {
//         toValue: -10,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(shakeAnim, {
//         toValue: 10,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(shakeAnim, {
//         toValue: 0,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//     ]).start();
    
//     if (Platform.OS !== 'web') {
//       Vibration.vibrate(500);
//     }
//   };

//   const handleOtpChange = (value, index) => {
//     // Only allow numbers
//     if (value && !/^\d+$/.test(value)) return;

//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     if (value) {
//       animateInput(index);
//       // Auto focus next input
//       if (index < 5) {
//         inputRefs.current[index + 1]?.focus();
//       }
//     }
//   };

//   const handleKeyPress = (e, index) => {
//     if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handleVerifyOTP = async () => {
//     const otpString = otp.join('');
    
//     if (otpString.length !== 6) {
//       shakeAnimation();
//       Alert.alert('Error', 'Please enter complete OTP');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Verify OTP
//       const fullPhone = phone.startsWith('+') ? phone : '+91' + phone;
//       const response = await api.verifyOTP(fullPhone, otpString, name, username || '', password);
      
//       // Connect WebSocket
//       await websocket.connect();
      
//       // Navigate to main app
//       navigation.reset({
//         index: 0,
//         routes: [{name: 'Main'}],
//       });
      
//     } catch (error) {
//       shakeAnimation();
//       Alert.alert('Error', error.message || 'Invalid OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     if (!canResend) return;

//     try {
//       await api.sendOTP(phone);
//       Alert.alert('Success', 'OTP sent successfully');
      
//       // Reset timer
//       setTimer(300);
//       setCanResend(false);
      
//       // Restart timer
//       const interval = setInterval(() => {
//         setTimer((prev) => {
//           if (prev <= 1) {
//             setCanResend(true);
//             clearInterval(interval);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
      
//     } catch (error) {
//       Alert.alert('Error', error.message || 'Failed to send OTP');
//     }
//   };

//   // For development - show OTP hint
//   const [showHint, setShowHint] = useState(false);
//   useEffect(() => {
//     if (__DEV__) {
//       // In development, show hint after 2 seconds
//       setTimeout(() => setShowHint(true), 2000);
//     }
//   }, []);

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
//             colors={['rgba(78, 205, 196, 0.2)', 'rgba(138, 43, 226, 0.3)']}
//             style={[styles.shape2]}
//           />
//         </View>

//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           activeOpacity={0.7}>
//           <View style={styles.backButtonInner}>
//             <Icon name="arrow-back" size={24} color="#fff" />
//           </View>
//         </TouchableOpacity>

//         <View style={styles.content}>
//           <Animated.View
//             style={[
//               styles.header,
//               {
//                 opacity: fadeAnim,
//                 transform: [{translateY: slideAnim}]
//               }
//             ]}>
//             <View style={styles.iconContainer}>
//               <LinearGradient
//                 colors={['rgba(78, 205, 196, 0.3)', 'rgba(138, 43, 226, 0.3)']}
//                 style={styles.iconGradient}>
//                 <View style={styles.iconInner}>
//                   <Icon name="shield-checkmark" size={50} color="#fff" />
//                 </View>
//               </LinearGradient>
//             </View>
            
//             <Text style={styles.title}>Verification Code</Text>
//             <Text style={styles.subtitle}>
//               We've sent a 6-digit code to
//             </Text>
//             <Text style={styles.phoneNumber}>{phone}</Text>
//           </Animated.View>

//           {__DEV__ && showHint && (
//             <Animated.View 
//               style={[
//                 styles.devHint,
//                 {opacity: fadeAnim}
//               ]}>
//               <Icon name="information-circle" size={16} color="#feca57" />
//               <Text style={styles.devHintText}>Dev Mode: Check console for OTP</Text>
//             </Animated.View>
//           )}

//           <Animated.View 
//             style={[
//               styles.otpWrapper,
//               {
//                 opacity: fadeAnim,
//                 transform: [
//                   {translateY: slideAnim},
//                   {translateX: shakeAnim}
//                 ]
//               }
//             ]}>
//             <View style={styles.otpContainer}>
//               {otp.map((digit, index) => (
//                 <Animated.View
//                   key={index}
//                   style={[
//                     styles.otpInputWrapper,
//                     {transform: [{scale: scaleAnims[index]}]}
//                   ]}>
//                   <TextInput
//                     ref={(ref) => (inputRefs.current[index] = ref)}
//                     style={[
//                       styles.otpInput,
//                       digit && styles.otpInputFilled
//                     ]}
//                     value={digit}
//                     onChangeText={(value) => handleOtpChange(value, index)}
//                     onKeyPress={(e) => handleKeyPress(e, index)}
//                     keyboardType="number-pad"
//                     maxLength={1}
//                     selectTextOnFocus
//                     autoFocus={index === 0}
//                   />
//                 </Animated.View>
//               ))}
//             </View>
//           </Animated.View>

//           <Animated.View 
//             style={[
//               styles.timerContainer,
//               {opacity: fadeAnim}
//             ]}>
//             {timer > 0 ? (
//               <View style={styles.timerWrapper}>
//                 <Icon name="time-outline" size={16} color="rgba(255,255,255,0.5)" />
//                 <Text style={styles.timerText}>
//                   Resend code in {formatTime(timer)}
//                 </Text>
//               </View>
//             ) : (
//               <Text style={styles.canResendText}>You can resend code now</Text>
//             )}
//           </Animated.View>

//           <Animated.View
//             style={[
//               styles.buttonsContainer,
//               {
//                 opacity: fadeAnim,
//                 transform: [{translateY: slideAnim}]
//               }
//             ]}>
//             <TouchableOpacity
//               style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
//               onPress={handleVerifyOTP}
//               disabled={loading}
//               activeOpacity={0.8}>
//               <LinearGradient
//                 colors={['#8a2be2', '#1e90ff']}
//                 start={{x: 0, y: 0}}
//                 end={{x: 1, y: 0}}
//                 style={styles.verifyButtonGradient}>
//                 {loading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <>
//                     <Text style={styles.verifyButtonText}>Verify & Continue</Text>
//                     <Icon name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
//                   </>
//                 )}
//               </LinearGradient>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
//               onPress={handleResendOTP}
//               disabled={!canResend}
//               activeOpacity={0.7}>
//               <Icon 
//                 name="refresh" 
//                 size={18} 
//                 color={canResend ? '#8a2be2' : 'rgba(255,255,255,0.3)'} 
//               />
//               <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
//                 Resend Code
//               </Text>
//             </TouchableOpacity>
//           </Animated.View>

//           <Animated.Text 
//             style={[
//               styles.securityText,
//               {opacity: fadeAnim}
//             ]}>
//             <Icon name="lock-closed" size={12} color="rgba(255,255,255,0.4)" />
//             {'  '}Your security is our priority
//           </Animated.Text>
//         </View>
//       </LinearGradient>
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
//     width: 250,
//     height: 250,
//     borderRadius: 125,
//     top: -80,
//     left: -80,
//     opacity: 0.5,
//     transform: [{rotate: '45deg'}],
//   },
//   shape2: {
//     position: 'absolute',
//     width: 350,
//     height: 350,
//     borderRadius: 175,
//     bottom: -120,
//     right: -120,
//     opacity: 0.3,
//     transform: [{rotate: '-30deg'}],
//   },
//   backButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     left: 20,
//     zIndex: 1,
//   },
//   backButtonInner: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//   },
//   content: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 30,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   iconContainer: {
//     marginBottom: 24,
//   },
//   iconGradient: {
//     width: 100,
//     height: 100,
//     borderRadius: 30,
//     padding: 2,
//   },
//   iconInner: {
//     flex: 1,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 28,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: '700',
//     color: '#fff',
//     marginBottom: 8,
//     letterSpacing: -0.5,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.6)',
//     fontWeight: '400',
//     marginBottom: 4,
//   },
//   phoneNumber: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#4ecdc4',
//     letterSpacing: 0.5,
//   },
//   devHint: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(254,202,87,0.1)',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 12,
//     marginBottom: 30,
//     borderWidth: 1,
//     borderColor: 'rgba(254,202,87,0.2)',
//   },
//   devHintText: {
//     fontSize: 14,
//     color: '#feca57',
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   otpWrapper: {
//     width: '100%',
//   },
//   otpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     paddingHorizontal: 10,
//   },
//   otpInputWrapper: {
//     flex: 1,
//     marginHorizontal: 6,
//   },
//   otpInput: {
//     height: 60,
//     borderRadius: 16,
//     backgroundColor: 'rgba(255,255,255,0.08)',
//     borderWidth: 2,
//     borderColor: 'rgba(255,255,255,0.2)',
//     color: '#fff',
//     fontSize: 24,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
//   otpInputFilled: {
//     backgroundColor: 'rgba(138,43,226,0.2)',
//     borderColor: 'rgba(138,43,226,0.5)',
//   },
//   timerContainer: {
//     marginTop: 30,
//     marginBottom: 40,
//   },
//   timerWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   timerText: {
//     fontSize: 15,
//     color: 'rgba(255,255,255,0.5)',
//     marginLeft: 6,
//     fontWeight: '400',
//   },
//   canResendText: {
//     fontSize: 15,
//     color: '#4ecdc4',
//     fontWeight: '500',
//   },
//   buttonsContainer: {
//     width: '100%',
//     alignItems: 'center',
//   },
//   verifyButton: {
//     width: '100%',
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginBottom: 20,
//     elevation: 8,
//     shadowColor: '#8a2be2',
//     shadowOffset: {width: 0, height: 4},
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   verifyButtonGradient: {
//     height: 56,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   verifyButtonDisabled: {
//     opacity: 0.6,
//     elevation: 0,
//   },
//   verifyButtonText: {
//     color: '#fff',
//     fontSize: 17,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
//   buttonIcon: {
//     marginLeft: 8,
//   },
//   resendButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     backgroundColor: 'rgba(255,255,255,0.08)',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)',
//   },
//   resendButtonDisabled: {
//     opacity: 0.5,
//   },
//   resendText: {
//     color: '#8a2be2',
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   resendTextDisabled: {
//     color: 'rgba(255,255,255,0.3)',
//   },
//   securityText: {
//     position: 'absolute',
//     bottom: 40,
//     fontSize: 13,
//     color: 'rgba(255,255,255,0.4)',
//     fontWeight: '400',
//   },
// });

// export default OTPScreen;







// // src/screens/OTPScreen.js
// import React, {useState, useRef, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   Dimensions,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import LinearGradient from 'react-native-linear-gradient';
// import api from '../services/api';
// import websocket from '../services/websocket';

// const { width } = Dimensions.get('window');

// const OTPScreen = ({navigation, route}) => {
//   const {phone, name, password, username, countryCode} = route.params;
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [loading, setLoading] = useState(false);
//   const [timer, setTimer] = useState(300); // 5 minutes
//   const [canResend, setCanResend] = useState(false);
  
//   // Refs for input fields
//   const inputRefs = useRef([]);

//   useEffect(() => {
//     // Start countdown timer
//     const interval = setInterval(() => {
//       setTimer((prev) => {
//         if (prev <= 1) {
//           setCanResend(true);
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const handleOtpChange = (value, index) => {
//     // Only allow numbers
//     if (value && !/^\d+$/.test(value)) return;

//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     // Auto focus next input
//     if (value && index < 5) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleKeyPress = (e, index) => {
//     if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handleVerifyOTP = async () => {
//     const otpString = otp.join('');
    
//     if (otpString.length !== 6) {
//       Alert.alert('Error', 'Please enter complete OTP');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Verify OTP
//       const fullPhone = phone.startsWith('+') ? phone : '+91' + phone;
//       const response = await api.verifyOTP(fullPhone, otpString, name, username || '', password);
      
//       // Connect WebSocket
//       await websocket.connect();
      
//       // Navigate to main app
//       navigation.reset({
//         index: 0,
//         routes: [{name: 'Main'}],
//       });
      
//     } catch (error) {
//       Alert.alert('Error', error.message || 'Invalid OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     if (!canResend) return;

//     try {
//       await api.sendOTP(phone);
//       Alert.alert('Success', 'OTP sent successfully');
      
//       // Reset timer
//       setTimer(300);
//       setCanResend(false);
      
//       // Restart timer
//       const interval = setInterval(() => {
//         setTimer((prev) => {
//           if (prev <= 1) {
//             setCanResend(true);
//             clearInterval(interval);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
      
//     } catch (error) {
//       Alert.alert('Error', error.message || 'Failed to send OTP');
//     }
//   };

//   // For development - show OTP hint
//   const [showHint, setShowHint] = useState(false);
//   useEffect(() => {
//     if (__DEV__) {
//       // In development, show hint after 2 seconds
//       setTimeout(() => setShowHint(true), 2000);
//     }
//   }, []);

//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={['#1a1a1a', '#2d2d2d']}
//         style={styles.backgroundGradient}
//       />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           activeOpacity={0.7}>
//           <View style={styles.backButtonInner}>
//             <Icon name="arrow-back" size={24} color="#1a1a1a" />
//           </View>
//         </TouchableOpacity>
//       </View>

//       {/* Content Card */}
//       <View style={styles.contentWrapper}>
//         <View style={styles.contentCard}>
//           {/* Icon */}
//           <View style={styles.iconContainer}>
//             <LinearGradient
//               colors={['#FFD700', '#FFA500']}
//               style={styles.iconGradient}>
//               <Icon name="shield-checkmark" size={40} color="#1a1a1a" />
//             </LinearGradient>
//           </View>
          
//           {/* Title and Description */}
//           <Text style={styles.title}>Verification Code</Text>
//           <Text style={styles.subtitle}>
//             We've sent a verification code to
//           </Text>
//           <Text style={styles.phoneNumber}>{phone}</Text>

//           {/* Dev Hint */}
//           {__DEV__ && showHint && (
//             <View style={styles.devHintContainer}>
//               <Icon name="information-circle" size={16} color="#FFD700" />
//               <Text style={styles.devHint}>
//                 Dev Mode: Check console for OTP
//               </Text>
//             </View>
//           )}

//           {/* OTP Input */}
//           <View style={styles.otpContainer}>
//             {otp.map((digit, index) => (
//               <View key={index} style={styles.otpBox}>
//                 <TextInput
//                   ref={(ref) => (inputRefs.current[index] = ref)}
//                   style={[
//                     styles.otpInput,
//                     digit && styles.otpInputFilled
//                   ]}
//                   value={digit}
//                   onChangeText={(value) => handleOtpChange(value, index)}
//                   onKeyPress={(e) => handleKeyPress(e, index)}
//                   keyboardType="number-pad"
//                   maxLength={1}
//                   selectTextOnFocus
//                   autoFocus={index === 0}
//                 />
//                 {digit && (
//                   <View style={styles.otpDot} />
//                 )}
//               </View>
//             ))}
//           </View>

//           {/* Timer */}
//           <View style={styles.timerContainer}>
//             <Icon 
//               name="time-outline" 
//               size={16} 
//               color={timer > 60 ? '#666' : '#FFD700'} 
//             />
//             <Text style={[styles.timerText, timer <= 60 && styles.timerWarning]}>
//               {timer > 0 ? formatTime(timer) : 'Code expired'}
//             </Text>
//           </View>

//           {/* Verify Button */}
//           <TouchableOpacity
//             onPress={handleVerifyOTP}
//             disabled={loading}
//             activeOpacity={0.8}>
//             <LinearGradient
//               colors={['#FFD700', '#FFA500']}
//               style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}>
//               {loading ? (
//                 <ActivityIndicator color="#1a1a1a" />
//               ) : (
//                 <>
//                   <Text style={styles.verifyButtonText}>Verify & Continue</Text>
//                   <Icon name="arrow-forward" size={20} color="#1a1a1a" style={styles.buttonIcon} />
//                 </>
//               )}
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* Resend Section */}
//           <View style={styles.resendContainer}>
//             <Text style={styles.resendText}>
//               Didn't receive the code?
//             </Text>
//             <TouchableOpacity
//               onPress={handleResendOTP}
//               disabled={!canResend}
//               activeOpacity={0.7}>
//               <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
//                 Resend Code
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* Security Note */}
//           <View style={styles.securityNote}>
//             <Icon name="lock-closed" size={14} color="#999" />
//             <Text style={styles.securityText}>
//               Your security is our priority. This code expires in 5 minutes.
//             </Text>
//           </View>
//         </View>
//       </View>
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
//     height: 300,
//   },
//   header: {
//     paddingTop: Platform.OS === 'ios' ? 50 : 30,
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   backButton: {
//     width: 48,
//     height: 48,
//   },
//   backButtonInner: {
//     width: 48,
//     height: 48,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   contentWrapper: {
//     flex: 1,
//     paddingHorizontal: 20,
//     justifyContent: 'center',
//     paddingBottom: 40,
//   },
//   contentCard: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 32,
//     alignItems: 'center',
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//   },
//   iconContainer: {
//     marginBottom: 24,
//   },
//   iconGradient: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 6,
//     shadowColor: '#FFD700',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 4,
//   },
//   phoneNumber: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 24,
//   },
//   devHintContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF8DC',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginBottom: 20,
//   },
//   devHint: {
//     fontSize: 13,
//     color: '#B8860B',
//     marginLeft: 6,
//   },
//   otpContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     maxWidth: 300,
//     marginBottom: 24,
//   },
//   otpBox: {
//     position: 'relative',
//   },
//   otpInput: {
//     width: 48,
//     height: 56,
//     borderRadius: 12,
//     backgroundColor: '#f8f8f8',
//     borderWidth: 2,
//     borderColor: '#e0e0e0',
//     fontSize: 24,
//     fontWeight: '600',
//     textAlign: 'center',
//     color: '#1a1a1a',
//   },
//   otpInputFilled: {
//     borderColor: '#FFD700',
//     backgroundColor: '#FFFAF0',
//   },
//   otpDot: {
//     position: 'absolute',
//     bottom: 8,
//     left: '50%',
//     marginLeft: -3,
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#FFD700',
//   },
//   timerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   timerText: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 6,
//     fontWeight: '500',
//   },
//   timerWarning: {
//     color: '#FFD700',
//   },
//   verifyButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: 56,
//     paddingHorizontal: 32,
//     borderRadius: 12,
//     minWidth: 200,
//   },
//   verifyButtonDisabled: {
//     opacity: 0.6,
//   },
//   verifyButtonText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     letterSpacing: 0.5,
//   },
//   buttonIcon: {
//     marginLeft: 8,
//   },
//   resendContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 24,
//     marginBottom: 20,
//   },
//   resendText: {
//     fontSize: 15,
//     color: '#666',
//     marginRight: 6,
//   },
//   resendLink: {
//     fontSize: 15,
//     color: '#FFD700',
//     fontWeight: '600',
//   },
//   resendLinkDisabled: {
//     color: '#ccc',
//   },
//   securityNote: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },
//   securityText: {
//     fontSize: 12,
//     color: '#999',
//     marginLeft: 6,
//     flex: 1,
//     textAlign: 'center',
//   },
// });

// export default OTPScreen;












// BEST 
// src/screens/OTPScreen.js
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import api from '../services/api';
import websocket from '../services/websocket';

const { width, height } = Dimensions.get('window');

const OTPScreen = ({navigation, route}) => {
  const {phone, name, password, username, countryCode} = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  
  // Refs for input fields
  const inputRefs = useRef([]);

  useEffect(() => {
    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value, index) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter complete OTP');
      return;
    }

    setLoading(true);

    try {
      // Verify OTP
      const fullPhone = phone.startsWith('+') ? phone : '+91' + phone;
      const response = await api.verifyOTP(fullPhone, otpString, name, username || '', password);
      
      // Connect WebSocket
      await websocket.connect();
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{name: 'Main'}],
      });
      
    } catch (error) {
      Alert.alert('Error', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      await api.sendOTP(phone);
      Alert.alert('Success', 'OTP sent successfully');
      
      // Reset timer
      setTimer(300);
      setCanResend(false);
      
      // Restart timer
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    }
  };

  // For development - show OTP hint
  const [showHint, setShowHint] = useState(false);
  useEffect(() => {
    if (__DEV__) {
      // In development, show hint after 2 seconds
      setTimeout(() => setShowHint(true), 2000);
    }
  }, []);

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
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} /> */}
        
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
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <View style={styles.backButtonInner}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentWrapper}>
        {/* Glass Morphism Card */}
        <View style={styles.glassCard}>
          {/* Glass Effect Overlay */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.glassOverlay}
          />
          
          <View style={styles.cardContent}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.iconGradient}>
                <Icon name="shield-checkmark" size={40} color="#1a1a1a" />
              </LinearGradient>
              <View style={styles.iconGlow} />
            </View>
            
            {/* Title and Description */}
            <Text style={styles.title}>Verification Code</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to
            </Text>
            <Text style={styles.phoneNumber}>{phone}</Text>

            {/* Dev Hint */}
            {__DEV__ && showHint && (
              <View style={styles.devHintContainer}>
                <Icon name="information-circle" size={16} color="#FFD700" />
                <Text style={styles.devHint}>
                  Dev Mode: Check console for OTP
                </Text>
              </View>
            )}

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View key={index} style={styles.otpBox}>
                  <TextInput
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                  {digit && (
                    <View style={styles.otpDot} />
                  )}
                </View>
              ))}
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
              <Icon 
                name="time-outline" 
                size={16} 
                color={timer > 60 ? 'rgba(255, 255, 255, 0.6)' : '#FFD700'} 
              />
              <Text style={[styles.timerText, timer <= 60 && styles.timerWarning]}>
                {timer > 0 ? formatTime(timer) : 'Code expired'}
              </Text>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerifyOTP}
              disabled={loading}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}>
                {loading ? (
                  <ActivityIndicator color="#1a1a1a" />
                ) : (
                  <>
                    <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                    <Icon name="arrow-forward" size={20} color="#1a1a1a" style={styles.buttonIcon} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend Section */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?
              </Text>
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={!canResend}
                activeOpacity={0.7}>
                <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Icon name="lock-closed" size={14} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.securityText}>
                Your security is our priority. This code expires in 5 minutes.
              </Text>
            </View>
          </View>
        </View>
      </View>
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
  //   width: 250,
  //   height: 250,
  //   borderRadius: 125,
  //   backgroundColor: 'rgba(255, 215, 0, 0.08)',
  //   top: -50,
  //   left: -100,
  // },
  // decorativeCircle2: {
  //   position: 'absolute',
  //   width: 200,
  //   height: 200,
  //   borderRadius: 100,
  //   backgroundColor: 'rgba(255, 165, 0, 0.06)',
  //   bottom: 50,
  //   right: -80,
  // },
  // decorativeCircle3: {
  //   position: 'absolute',
  //   width: 180,
  //   height: 180,
  //   borderRadius: 90,
  //   backgroundColor: 'rgba(255, 215, 0, 0.04)',
  //   top: height / 2 - 90,
  //   left: -60,
  // },
  // glowEffect1: {
  //   position: 'absolute',
  //   width: 350,
  //   height: 350,
  //   borderRadius: 175,
  //   top: height / 2 - 175,
  //   right: -100,
  //   opacity: 0.3,
  // },
  // glowEffect2: {
  //   position: 'absolute',
  //   width: 300,
  //   height: 300,
  //   borderRadius: 150,
  //   bottom: -100,
  //   left: -50,
  //   opacity: 0.4,
  // },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 48,
    height: 48,
  },
  backButtonInner: {
    width: 48,
    height: 48,
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingBottom: 40,
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
  cardContent: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    top: -10,
    left: -10,
    zIndex: -1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 24,
  },
  devHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  devHint: {
    fontSize: 13,
    color: '#FFD700',
    marginLeft: 6,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
    marginBottom: 24,
    marginRight: 27, // I manually adjusted this as per my phone screen 
  },
  otpBox: {
    position: 'relative',
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
  },
  otpInputFilled: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  otpDot: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 6,
    fontWeight: '500',
  },
  timerWarning: {
    color: '#FFD700',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    elevation: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  resendText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 6,
  },
  resendLink: {
    fontSize: 15,
    color: '#FFD700',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  securityText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 6,
    flex: 1,
    textAlign: 'center',
  },
});

export default OTPScreen;