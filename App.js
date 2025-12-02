import 'react-native-gesture-handler';
import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { store, persistor } from './src/store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { LightTheme } from './src/constants/Colors';
import UserTabs from './src/navigation/UserTabs';
import PreferencesScreen from './src/screens/user/PreferencesScreen';
import MenuDetailScreen from './src/screens/user/MenuDetailScreen';
import CartScreen from './src/screens/user/CartScreen';
import IntroScreen from './src/screens/auth/IntroScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import OtpScreen from './src/screens/auth/OtpScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import { CartProvider } from './src/context/CartContext';
import PaymentScreen from './src/screens/user/PaymentScreen';
import SuccessScreen from './src/screens/user/SuccessScreen';
import AddressSetUpScreen from './src/screens/user/AddressScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { accessToken, user } = useSelector((state) => state.auth);
  const isAuthenticated = !!accessToken;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            {!user?.is_active && <Stack.Screen name="Preferences" component={PreferencesScreen} />}
            <Stack.Screen
              name="Main"
              component={UserTabs}
            // If user is not active, we might want to redirect, but usually Main handles it or we use initialRouteName logic if we were mounting fresh.
            // Since we are conditionally rendering, the first screen here is 'Main'.
            // If we want 'Preferences' to be first if !is_active, we can reorder or use a wrapper.
            // For now, let's assume Main is fine, and we can navigate to Preferences if needed from there, 
            // OR we can swap the order based on user.is_active.
            />
            {user?.is_active && <Stack.Screen name="Preferences" component={PreferencesScreen} />}

            <Stack.Screen name='Address' component={AddressSetUpScreen} />
            <Stack.Screen name="MenuDetail" component={MenuDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Intro" component={IntroScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={LightTheme}>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
}
