// ===== src/screens/OTPScreen.js =====
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../styles/colors';
import api from '../services/api';
import websocket from '../services/websocket';

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
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.gradient}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Icon name="shield-checkmark" size={80} color={colors.white} />
          
          <Text style={styles.title}>Verify Phone Number</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to{'\n'}
            <Text style={styles.phoneNumber}>{countryCode} {phone}</Text>
          </Text>

          {__DEV__ && showHint && (
            <Text style={styles.devHint}>
              Development Mode: Check console for OTP
            </Text>
          )}

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
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
            ))}
          </View>

          <Text style={styles.timerText}>
            {timer > 0 ? `Resend code in ${formatTime(timer)}` : 'You can resend code now'}
          </Text>

          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.gradientStart} />
            ) : (
              <Text style={styles.verifyButtonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
            onPress={handleResendOTP}
            disabled={!canResend}>
            <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
              Didn't receive code? Resend
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 10,
  },
  phoneNumber: {
    fontWeight: '600',
    color: colors.white,
  },
  devHint: {
    fontSize: 14,
    color: colors.warning,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    marginTop: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: colors.white,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  otpInputFilled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  timerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 30,
  },
  verifyButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: colors.gradientStart,
    fontSize: 18,
    fontWeight: '600',
  },
  resendButton: {
    padding: 10,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: colors.white,
    fontSize: 16,
  },
  resendTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default OTPScreen;