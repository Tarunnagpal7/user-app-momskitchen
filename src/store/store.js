import { configureStore, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialAuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    loginSuccess(state, action) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    },
    refreshTokenSuccess(state, action) {
      state.accessToken = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
    },
  },
});

export const { loginSuccess, refreshTokenSuccess, logout, setUser } = authSlice.actions;

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addToCart(state, action){
      const { menu, qty } = action.payload;
      const existing = state.items.find(i=> (i.menu._id||i.menu.id) === (menu._id||menu.id));
      if(existing){ existing.qty += qty; }
      else { state.items.push({ menu, qty }); }
    },
    updateQty(state, action){
      const { menuId, qty } = action.payload;
      const item = state.items.find(i=> (i.menu._id||i.menu.id) === menuId);
      if(item){ item.qty = Math.max(1, qty); }
    },
    clearCart(state){ state.items = []; }
  }
});

export const { addToCart, updateQty, clearCart } = cartSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartSlice.reducer,
  },
});

export async function persistAuth(auth) {
  await AsyncStorage.setItem('auth', JSON.stringify(auth));
}

export async function loadAuth() {
  const raw = await AsyncStorage.getItem('auth');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
