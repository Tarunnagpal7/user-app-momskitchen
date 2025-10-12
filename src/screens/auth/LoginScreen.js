import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { AuthService } from '../../services/userServices';

export default function LoginScreen({ navigation }) {
  const theme = useTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gradientColors = theme.colors?.gradient || ['#FFFFFF', '#F8FDF9'];
  const primaryColor = theme.colors?.primary || '#0C3415';
  const subtitleColor = theme.colors?.subtitle || '#666666';
  const surfaceColor = theme.colors?.surface || '#F8FDF9';
  const shadowColor = theme.colors?.shadow || '#0C3415';
  const accentColor = theme.colors?.accent || '#10851e';
  const textColor = theme.colors?.text || '#000000';

  const handleSendOtp = async () => {
    setError('');
    if (!phone) return setError('Enter phone number');
    setLoading(true);
    try {
      await AuthService.sendOtp(phone);
      navigation.navigate('Otp', { phone });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar barStyle={'light-content'} backgroundColor="transparent" translucent />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor }]}>Login</Text>
          <View style={[styles.titleUnderline, { backgroundColor: primaryColor }]} />
        </View>
        <View style={[styles.formContainer, { backgroundColor: surfaceColor + '80', shadowColor: shadowColor }]}>
          {!!error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}
          <TextInput
            label="Mobile Number"
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            theme={{ colors: { primary: primaryColor, background: 'transparent' } }}
          />
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: primaryColor, shadowColor: shadowColor }]} onPress={handleSendOtp} activeOpacity={0.8} disabled={loading}>
          <LinearGradient colors={[primaryColor, accentColor]} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate('Signup')}>
          <Text style={[styles.linkText, { color: subtitleColor }]}>New here? Create Account</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingTop: StatusBar.currentHeight || 50 },
  formContainer: { width: '100%', borderRadius: 20, padding: 20, marginBottom: 30 },
  input: { marginBottom: 15, backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#0C3415', color: '#0C3415', margin: 5, padding: 2 },
  button: { borderRadius: 25, marginBottom: 20, overflow: 'hidden', width: '75%' },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 40 },
  buttonText: { color: '#FFFFFF', fontSize: 18, marginRight: 8 },
  buttonArrow: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  linkContainer: { marginBottom: 20 },
  linkText: { fontSize: 14, textAlign: 'center' },
  title: { fontSize: 30, textAlign: 'center', lineHeight: 40, letterSpacing: 1, fontWeight: 20 },
  titleUnderline: { width: 100, height: 3, margin: 8, borderRadius: 2 },
  titleContainer: { alignItems: 'center', marginBottom: 10 },
});
