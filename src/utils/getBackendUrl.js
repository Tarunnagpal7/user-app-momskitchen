import { Platform } from 'react-native';

export function getBackendUrl() {
  const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/$/, '');
  }

  const defaultPort = '8000';
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${defaultPort}`;
  }
  if (Platform.OS === 'ios') {
    return `http://127.0.0.1:${defaultPort}`;
  }
  return `http://localhost:${defaultPort}`;
}
