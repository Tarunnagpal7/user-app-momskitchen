import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { AuthService } from '../../services/userServices';
import { loginSuccess } from '../../store/store';

export default function OtpScreen({ route, navigation }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const phone = route.params?.phone || '';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gradientColors = theme.colors?.gradient || ['#FFFFFF', '#F8FDF9'];
  const primaryColor = theme.colors?.primary || '#0C3415';
  const subtitleColor = theme.colors?.subtitle || '#666666';
  const surfaceColor = theme.colors?.surface || '#F8FDF9';
  const shadowColor = theme.colors?.shadow || '#0C3415';
  const accentColor = theme.colors?.accent || '#81C784';

  const setDigit = (index, value) => {
    const onlyNum = value.replace(/[^0-9]/g, '');
    const next = [...digits];
    next[index] = onlyNum.slice(-1);
    setDigits(next);
    if (onlyNum && index < 5) inputs[index + 1].current?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (!/^\d{6}$/.test(code)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      console.log('Verifying OTP for:', phone, 'Code:', code);
      const res = await AuthService.login(phone, code);
      console.log('OTP Verify Response:', res.data);

      const { accessToken, refreshToken } = res.data.data;
      dispatch(loginSuccess({ accessToken, refreshToken, user: res.data.data.user }));
      // await persistAuth({ accessToken, refreshToken, user: res.data.data.user }); // Removed as redux-persist handles it

      if (res.data.data.user.is_active) {
        // navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        // navigation.reset({ index: 0, routes: [{ name: 'Preferences' }] });
      }
    } catch (e) {
      console.error('OTP Verify Error:', e);
      if (e.response) {
        console.error('Error Response Data:', e.response.data);
        console.error('Error Status:', e.response.status);
      }
      setError(e?.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar barStyle={'dark-content'} backgroundColor="transparent" translucent />
      <View style={styles.content}>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
        <Text style={[styles.mobileNumber, { color: primaryColor }]}>+91 {phone || ''}</Text>
        {!!error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}
        <View style={[styles.otpContainer, { backgroundColor: surfaceColor + '80', shadowColor: shadowColor }]}>
          <View style={styles.otpRow}>
            {digits.map((d, i) => (
              <RNTextInput
                ref={inputs[i]}
                key={i}
                style={[styles.otpBox, { borderColor: primaryColor, color: '#0C3415', backgroundColor: surfaceColor }]}
                keyboardType="number-pad"
                maxLength={1}
                value={d}
                onChangeText={(v) => setDigit(i, v)}
                returnKeyType={i === 5 ? 'done' : 'next'}
                selectTextOnFocus
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
              />
            ))}
          </View>
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: primaryColor, shadowColor: shadowColor }]} onPress={handleVerify} activeOpacity={0.8} disabled={loading}>
          <LinearGradient colors={[primaryColor, accentColor]} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingTop: StatusBar.currentHeight || 50 },
  subtitle: { fontSize: 22, textAlign: 'center', marginBottom: 5 },
  mobileNumber: { fontSize: 22, textAlign: 'center', marginBottom: 30 },
  otpContainer: { width: '100%', borderRadius: 20, padding: 20, marginBottom: 20 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5, marginTop: 10 },
  otpBox: { width: 45, height: 55, borderWidth: 2, borderRadius: 12, textAlign: 'center', fontSize: 24, fontWeight: 'bold' },
  button: { borderRadius: 25, marginBottom: 20, overflow: 'hidden', width: '75%' },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 40 },
  buttonText: { color: '#FFFFFF', fontSize: 18, marginRight: 8 },
  buttonArrow: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
