import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { settingsService } from '../../services/userServices';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from 'react-native-paper';
import { useState, useEffect } from 'react';

const CartScreen = ({ navigation }) => {
  const theme = useTheme();
  const gradientColors = ['#effef0', '#effef0'];
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [canCheckout, setCanCheckout] = useState(false);

  const [settings, setSettings] = useState(null);

  const loadSettings = async () => {
    try {
      const res = await settingsService.getSettings();
      const fetchedSettings = res.data?.data?.settings;
      setSettings(fetchedSettings);
      checkOrderingTime(fetchedSettings);
    } catch (e) {
      console.log("Load Settings Error:", e);
    }
  };

  const checkOrderingTime = (currentSettings) => {
    if (!currentSettings?.orderingWindows) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const isTime = currentSettings.orderingWindows.some(window => {
      return currentTimeStr >= window.start && currentTimeStr <= window.end;
    });

    setCanCheckout(isTime);

    // Auto clear cart if time is up and cart has items
    if (!isTime && cartItems.length > 0) {
      clearCart();
      Alert.alert(
        "Kitchen Closed",
        "Sorry, the kitchen is now closed. Your cart has been cleared as we cannot accept orders at this time."
      );
      navigation.goBack();
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (settings) checkOrderingTime(settings);
    }, 60000);
    return () => clearInterval(interval);
  }, [settings, cartItems]);

  const calculateTotal = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to your cart before checkout');
      return;
    }
    // Navigate to checkout or payment screen
    navigation.navigate('Payment');
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyCartContainer}>
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyCartText}>Your cart is empty</Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.browseButtonText}>Browse Menus</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem} key={`cart-item-${item.id}`}>
      <Image
        source={
          item.image && item.image.length > 0
            ? { uri: item.image }
            : require('../../../assets/images/food-platter.png')
        }
        style={styles.itemImage}
      />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
      </View>

      <View style={styles.quantityContainer}>

        <Text style={styles.quantityText}>{item.quantity}</Text>

      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6B35" />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={() => {
            Alert.alert(
              'Clear Cart',
              'Are you sure you want to clear your cart?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', onPress: () => clearCart() }
              ]
            );
          }}>
            <Text style={[styles.clearCartText, { color: theme.colors.primary }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.cartList}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₹{(getCartTotal()).toFixed(2)}</Text>
            </View>

            {!canCheckout && (
              <Text style={styles.closedText}>
                Kitchen Closed. Ordering allowed: 9am-12pm & 5pm-8pm
              </Text>
            )}

            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: theme.colors.primary }, !canCheckout && styles.disabledButton]}
              onPress={calculateTotal}
              disabled={!canCheckout}
            >
              <Text style={styles.checkoutButtonText}>
                {canCheckout ? 'Proceed to Checkout' : 'Kitchen Closed'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        renderEmptyCart()
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearCartText: {
    fontWeight: '600',
  },
  cartList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  closedText: {
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default CartScreen;