import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useCart } from '../../context/CartContext';
import { useSelector } from 'react-redux';
import { OrderService,UserService } from '../../services/userServices';

export default function PaymentScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const gradientColors = ['#effef0', '#effef0'];
  
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  // Get cart data and functions from context
  const { cartItems, clearCart } = useCart();

  // Get user data from Redux store
  const user = useSelector((state) => state.auth.user);
  const [address,setAddress] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await UserService.me();
        let addresses = me?.data?.data?.addresses || [];
  
        // filter only active addresses
        addresses = addresses.filter((adr) => adr.is_default);
  
        setAddress(addresses);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchUser();
  }, []);

  const addressId = address[0]?._id; // Safe access

  // Calculate costs
  const subtotal = cartItems.reduce(
    (total, item) => total + parseFloat(item.price.replace('₹', '')) * item.quantity,
    0
  );
  const deliveryFee = 20;
  const tax = subtotal * 0.1;
  const total = subtotal + deliveryFee + tax;

  // Payment selection
  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!addressId) {
      Alert.alert('Missing Address', 'Please select a delivery address.');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Cart is Empty', 'Please add items to your cart.');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload for backend
      const orders = cartItems.map((item) => ({
        menu_id: item.id,
        items: item.quantity,
      }));

      const payload = {
        orders,
        delivery_address_id: addressId,
        special_instructions: specialInstructions,
      };

      console.log(payload)

      const response = await OrderService.create(payload);

      if (response?.data?.status === 'success') {
        clearCart();
        Alert.alert(
          'Order Confirmed 🎉',
          selectedPayment === 'cod'
            ? 'Your order has been placed successfully! Pay on delivery.'
            : 'Payment successful and your order is confirmed!',
          [{ text: 'OK', onPress: () => navigation.replace('Success') }]
        );
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Order Creation Error:',  error );
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (selectedPayment === 'cod') {
      handlePlaceOrder();
    } else if (selectedPayment === 'online') {
      Alert.alert('Online Payment (Coming Soon)', 'Online payments will be available in future updates.');
    }
  };

  // Get first restaurant name
  const restaurantName = cartItems.length > 0 ? cartItems[0].name : 'Food Order';

  return (
    <ScrollView>
      <LinearGradient colors={gradientColors} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Payment</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.subtitle}>You deserve better meal</Text>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {cartItems.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image
                source={
                  item?.image && typeof item.image === 'string'
                    ? { uri: item.image }
                    : item?.image?.url
                    ? { uri: item.image.url }
                    : require('../../../assets/images/food-platter.png')
                }
                style={styles.itemImage}
                onError={() => console.warn('Image failed to load for item:', item.name)}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{parseFloat(item.price.replace('₹', '')).toFixed(2)}</Text>
              </View>
              <Text style={styles.itemCount}>{item.quantity} pcs</Text>
            </View>
          ))}
        </View>

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details Transaction</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fix Thali</Text>
            <Text style={styles.detailValue}>INR {subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Driver</Text>
            <Text style={styles.detailValue}>INR {deliveryFee.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tax 10%</Text>
            <Text style={styles.detailValue}>INR {tax.toFixed(2)}</Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalValue}>INR {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deliver to:</Text>
          {address ?(
            <>
              <View style={styles.addressRow}>
                <Text style={styles.addressLabel}>Name</Text>
                <Text style={styles.addressValue}>{user?.name}</Text>
              </View>
              <View style={styles.addressRow}>
                <Text style={styles.addressLabel}>Phone</Text>
                <Text style={styles.addressValue}>{user?.phone_number}</Text>
              </View>
              <View style={styles.addressRow}>
                <Text style={styles.addressLabel}>Address</Text>
                <Text style={styles.addressValue}>
                  {address[0].address_line}, {address[0].city}, {address[0].state} - {address[0].pincode}
                </Text>
              </View>
            </>
          ) : (
            <Text>No active address found</Text>
          )}
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. No onions, extra spicy, etc."
            multiline
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
          />
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[styles.paymentOption, selectedPayment === 'cod' && styles.selectedPayment]}
            onPress={() => handlePaymentSelect('cod')}
          >
            <MaterialCommunityIcons name="cash" size={24} color={theme.colors.primary} />
            <Text style={styles.paymentText}>Cash on Delivery</Text>
            {selectedPayment === 'cod' && (
              <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, selectedPayment === 'online' && styles.selectedPayment]}
            onPress={() => handlePaymentSelect('online')}
          >
            <MaterialCommunityIcons name="credit-card" size={24} color={theme.colors.primary} />
            <Text style={styles.paymentText}>Online Payment</Text>
            {selectedPayment === 'online' && (
              <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text style={styles.checkoutButtonText}>
            {loading ? 'Processing...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    elevation: 3,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  orderItem: { flexDirection: 'row', alignItems: 'center' },
  itemImage: { width: 60, height: 60, borderRadius: 10 },
  itemDetails: { flex: 1, marginLeft: 15 },
  restaurantName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemPrice: { fontSize: 14, color: '#666', marginTop: 4 },
  itemCount: { fontSize: 14, color: '#666' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  detailLabel: { fontSize: 14, color: '#666' },
  detailValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 5, paddingTop: 10 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  addressRow: { flexDirection: 'row', paddingVertical: 6 },
  addressLabel: { width: 80, fontSize: 14, color: '#666' },
  addressValue: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500' },
  paymentSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  paymentTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedPayment: { borderColor: '#4CAF50', backgroundColor: '#F1FBF2' },
  paymentText: { fontSize: 14, color: '#333', marginLeft: 10, flex: 1 },
  checkoutButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
