import 'react-native-gesture-handler';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
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

export default function App(){
  return (
    <Provider store={store}>
      <PaperProvider theme={LightTheme}>
        <CartProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown:false }} initialRouteName="Intro">
              <Stack.Screen name="Intro" component={IntroScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Otp" component={OtpScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Main" component={UserTabs} />
              <Stack.Screen name="Preferences" component={PreferencesScreen} />
              <Stack.Screen name='Address' component={AddressSetUpScreen} />
              <Stack.Screen name="MenuDetail" component={MenuDetailScreen} />
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen name="Payment" component={PaymentScreen} />
              <Stack.Screen name="Success" component={SuccessScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </CartProvider>
      </PaperProvider>
    </Provider>
  );
}
