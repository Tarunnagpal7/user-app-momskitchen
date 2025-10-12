import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const CartIcon = () => {
  const navigation = useNavigation();
  const { getCartItemCount } = useCart();
  
  const cartCount = getCartItemCount();
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => navigation.navigate('Cart')}
    >
      <Ionicons name="cart-outline" size={24} color="#333" />
      {cartCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cartCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CartIcon;