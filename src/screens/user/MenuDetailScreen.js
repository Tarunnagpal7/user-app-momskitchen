import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../../context/CartContext';

export default function MenuDetailScreen({ route, navigation }) {
  const { menu } = route.params || {};
  const [quantity, setQuantity] = useState(1);
  const { addToCart, cartItems } = useCart();

  if (!menu) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // ✅ Safe menu data mapping (fixed for your current API structure)
  const menuData = {
    id: menu.id || menu._id,
    name: menu.name || 'Special Menu',
    description: menu.description || 'Delicious homemade food.',
    mom_name: menu.mom_name || menu.mom_id?.name || 'Unknown Mom',
    mom_description: menu.mom_description || menu.mom_details?.description || 'Specialized in delicious homemade food.',
    mom_business_name: menu.mom_business_name || menu.mom_details?.business_name || 'Unknown Business',
    mom_rating: menu.mom_rating || menu.mom_details?.rating || { average: 0, count: 0 },
    price: menu.price || `₹${menu.total_cost || 0}`,
    totalCost: menu.total_cost || (menu.price ? parseInt(menu.price.replace(/[₹,]/g, '')) : 0),
    remaining_orders: menu.remaining_orders || menu.max_orders || 0,
    menuImage: typeof menu.menuImage === 'number'
      ? menu.menuImage
      : require('../../../assets/images/food_1.png'),
    items: menu.items || [],
  };

  const handleAddToCart = () => {
    const currentCartQuantity = cartItems.find(item => item.id === menuData.id)?.quantity || 0;
    const totalQuantity = currentCartQuantity + quantity;

    if (totalQuantity > menuData.remaining_orders) {
      Alert.alert(
        'Order Limit Exceeded',
        `You can only order up to ${menuData.remaining_orders} items. Currently ${menuData.remaining_orders - currentCartQuantity} available.`,
        [{ text: 'OK' }]
      );
      return;
    }

    addToCart({
      id: menuData.id,
      name: menuData.name,
      price: `₹${menuData.totalCost}`,
      image: menuData.menuImage,
      remaining_orders: menuData.remaining_orders
    }, quantity);

    Alert.alert(
      'Added to Cart',
      `${quantity} x ${menuData.name} added to cart`,
      [{ text: 'OK' }]
    );

    // ✅ Fixed syntax issue (removed stray line)
    navigation.goBack();
  };

  const incrementQuantity = () => {
    if (quantity < menuData.remaining_orders) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#effef0', '#effef0']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={menuData.menuImage} 
              style={styles.menuImage} 
            />
          </View>

          {/* Remaining Orders */}
          <View style={styles.ordersInfo}>
            <Text style={styles.ordersText}>
              {menuData.remaining_orders} orders remaining
            </Text>
          </View>

          {/* Menu Info */}
          <View style={styles.menuInfo}>
            <Text style={styles.menuName}>{menuData.name}</Text>
            <Text style={styles.businessName}>By {menuData.mom_name}</Text>
            {menuData.description && (
              <Text style={styles.menuDescription}>{menuData.description}</Text>
            )}
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {menuData.mom_rating.average || '4.5'}</Text>
              <Text style={styles.price}>{menuData.price}</Text>
            </View>
          </View>

          {/* Menu Items */}
          {menuData.items.length > 0 && (
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Menu Items</Text>
              {menuData.items
                .filter(item => item?.item_name)
                .map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.item_name}</Text>
                      {item.description && (
                        <Text style={styles.itemDescription}>{item.description}</Text>
                      )}
                    </View>
                    {/* <View style={styles.vegIndicator}>
                      <Text
                        style={[
                          styles.vegText,
                          { color: item.veg ? '#4CAF50' : '#F44336' },
                        ]}
                      >
                        {item.veg ? 'VEG' : 'NON-VEG'}
                      </Text> */}
                    {/* </View> */}
                  </View>
              ))}
            </View>
          )}

          {/* Mom Details */}
          {menuData.mom_name !== 'Unknown Chef' && (
            <View style={styles.momSection}>
              <Text style={styles.sectionTitle}>About the Chef</Text>
              <View style={styles.momCard}>
                <Image source={require('../../../assets/images/chef.png')} style={styles.chefImage} />
                <View style={styles.momInfo}>
                  <Text style={styles.momName}>{menuData.mom_name}</Text>
                  <Text style={styles.momName}> {menuData.mom_business_name}</Text>
                  <Text style={styles.momDescription}>{menuData.mom_description}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.stickyBar}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity onPress={decrementQuantity} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity onPress={incrementQuantity} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleAddToCart} style={styles.addToCartButton}>
            <Text style={styles.addToCartText}>
              Add to Cart - {quantity} x ₹{menuData.totalCost}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 140 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  backButton: { padding: 10 },
  backButtonText: { fontSize: 18, color: '#333', fontWeight: '600' },
  imageContainer: { alignItems: 'center', marginVertical: 20 },
  menuImage: { width: 200, height: 200, borderRadius: 100 },
  menuInfo: { paddingHorizontal: 20, marginBottom: 20 },
  menuName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  businessName: { fontSize: 18, color: '#666', marginBottom: 10 },
  menuDescription: { fontSize: 16, color: '#888', lineHeight: 24, marginBottom: 15 },
  ratingContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rating: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
  ordersInfo: { backgroundColor: '#FFF3E0', padding: 10, borderRadius: 8, marginHorizontal: 20, marginBottom: 16 },
  ordersText: { fontSize: 14, color: '#E65100', textAlign: 'center', fontWeight: '600' },
  momSection: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  momCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  chefImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  momInfo: { flex: 1 },
  momName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  momDescription: { fontSize: 14, color: '#666', lineHeight: 20 },
  itemsSection: { paddingHorizontal: 20, marginBottom: 20 },
  itemCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  itemDescription: { fontSize: 14, color: '#666', marginBottom: 5 },
  vegIndicator: { justifyContent: 'center' },
  vegText: { fontSize: 12, fontWeight: 'bold' },
  stickyBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, backgroundColor: 'white' },
  quantitySelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  quantityButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' },
  quantityButtonText: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  quantityText: { fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, color: '#333' },
  addToCartButton: { backgroundColor: '#FF6B35', paddingVertical: 15, borderRadius: 25, alignItems: 'center' },
  addToCartText: { fontSize: 18, fontWeight: 'bold', color: 'white' },
});
