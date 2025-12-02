import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function MenuDetailScreen({ route, navigation }) {
  const { menu } = route.params || {};
  const [quantity, setQuantity] = useState(1);
  const { addToCart, cartItems } = useCart();
  const insets = useSafeAreaInsets();

  if (!menu) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Safe menu data mapping
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
    menuImage: menu.menuImage || (menu.image?.url ? { uri: menu.image.url } : require('../../../assets/images/food_1.png')),
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

    navigation.goBack();
  };

  const incrementQuantity = () => {
    if (quantity < menuData.remaining_orders) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} bounces={false}>
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <Image source={menuData.menuImage} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={[styles.gradientOverlay, { paddingTop: insets.top }]}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Header Info */}
          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.menuName}>{menuData.name}</Text>
              <View style={styles.ratingBadge}>
                <MaterialCommunityIcons name="star" size={16} color="#fff" />
                <Text style={styles.ratingText}>{menuData.mom_rating.average}</Text>
              </View>
            </View>

            <Text style={styles.price}>{menuData.price}</Text>

            {menuData.description && (
              <Text style={styles.description}>{menuData.description}</Text>
            )}

            <View style={styles.ordersBadge}>
              <MaterialCommunityIcons name="fire" size={16} color="#E65100" />
              <Text style={styles.ordersText}>Only {menuData.remaining_orders} orders left!</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Chef Profile */}
          <View style={styles.chefSection}>
            <Text style={styles.sectionTitle}>Prepared by</Text>
            <View style={styles.chefCard}>
              <Image source={require('../../../assets/images/chef.png')} style={styles.chefAvatar} />
              <View style={styles.chefInfo}>
                <Text style={styles.chefName}>{menuData.mom_name}</Text>
                <Text style={styles.businessName}>{menuData.mom_business_name}</Text>
                <Text style={styles.chefBio} numberOfLines={2}>{menuData.mom_description}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Menu Items */}
          {menuData.items.length > 0 && (
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>What's Included</Text>
              {menuData.items
                .filter(item => item?.item_name)
                .map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.bulletPoint} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.item_name}</Text>
                      {item.description && (
                        <Text style={styles.itemDesc}>{item.description}</Text>
                      )}
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 20 }]}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={decrementQuantity} style={styles.qtyBtn}>
            <MaterialCommunityIcons name="minus" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity onPress={incrementQuantity} style={styles.qtyBtn}>
            <MaterialCommunityIcons name="plus" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleAddToCart} style={styles.addToCartBtn}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
          <Text style={styles.totalPrice}>₹{menuData.totalCost * quantity}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  headerInfo: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  menuName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  ordersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  ordersText: {
    color: '#E65100',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  chefCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 16,
  },
  chefAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  chefInfo: {
    flex: 1,
  },
  chefName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  businessName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  chefBio: {
    fontSize: 12,
    color: '#888',
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginTop: 8,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 13,
    color: '#888',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 24,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginRight: 16,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 16,
    color: '#1a1a1a',
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  totalPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.9,
  },
});
