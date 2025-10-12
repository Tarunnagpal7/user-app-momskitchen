import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

// Create the cart context
const CartContext = createContext();

// Storage key for cart items
const CART_STORAGE_KEY = '@mom_user_app_cart';

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart provider component
export const CartProvider = ({ children }) => {
  // State for cart items
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart items from AsyncStorage on component mount
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        const storedCartItems = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCartItems) {
          setCartItems(JSON.parse(storedCartItems));
        }
      } catch (error) {
        console.error('Error loading cart items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCartItems();
  }, []);

  // Save cart items to AsyncStorage whenever they change
  useEffect(() => {
    const saveCartItems = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart items:', error);
      }
    };

    if (!loading) {
      saveCartItems();
    }
  }, [cartItems, loading]);

  // Add item to cart
  const addToCart = (item, quantity = 1) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.id === item.id
      );

      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, { ...item, quantity }];
      }
    });
  };

  // Update item quantity in cart
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get total number of items in cart
  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total price of items in cart
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Extract numeric price from string like 'INR 120.00'
      const priceString = typeof item.price === 'string' ? item.price : String(item.price);
      const numericPrice = parseFloat(priceString.replace(/[^0-9.]/g, ''));
      return total + (numericPrice * item.quantity);
    }, 0);
  };

  // Context value
  const value = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartItemCount,
    getCartTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};