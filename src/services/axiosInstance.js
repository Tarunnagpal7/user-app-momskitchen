import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store/store';
import { refreshTokenSuccess, logout } from '../store/store';
import { getBackendUrl } from '../utils/getBackendUrl';

const api = axios.create({ baseURL: getBackendUrl() });

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.headers['x-user-role'] = 'customer';
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken } = store.getState().auth;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!refreshToken) {
        await AsyncStorage.clear();
        store.dispatch(logout());
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${getBackendUrl()}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = res.data.data.accessToken;
        store.dispatch(refreshTokenSuccess(newAccessToken));

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await AsyncStorage.clear();
        store.dispatch(logout());
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
