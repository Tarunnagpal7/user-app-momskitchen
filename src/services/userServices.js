import api from './axiosInstance';

export const AuthService = {
  sendOtp: (phone_number) => api.post('/api/auth/send-otp', { phone_number }),
  login: (phone_number, otp) => api.post('/api/auth/login', { phone_number, otp }),
  signup: (payload) => api.post('/api/auth/signup', payload),
  logout: () => api.post('/api/auth/logout'),
};

export const UserService = {
  me: () => api.get('/api/users/me'),
  updateProfile: (payload) => api.put('/api/users/me', payload),
  addAddress: (payload) => api.post('/api/users/addresses', payload),
  updateAddress: (addressId, payload) => api.put(`/api/users/addresses/${addressId}`, payload),
  deleteAddress: (addressId) => api.delete(`/api/users/addresses/${addressId}`),
  addPreferences: (payload) => api.post('/api/users/preferences', payload),
  toggleDefaultAddress: (addressId) => api.patch(`/api/users/addresses/${addressId}`),
};

export const MenuService = {
  list: (params) => api.get('/api/menus', { params }),
  get: (menuId) => api.get(`/api/menus/${menuId}`),
};

export const OrderService = {
  list: (params) => api.get('/api/orders', { params }),
  create: (payload) => api.post('/api/orders', payload),
  get: (orderId) => api.get(`/api/orders/${orderId}`),
  cancel: (orderId) => api.put(`/api/orders/${orderId}/cancel`),
};
