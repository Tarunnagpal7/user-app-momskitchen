import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { Button, TextInput, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { MenuService, UserService } from '../../services/userServices';
import AppHeader from '../../components/AppHeader';
import AddressBar from '../../components/AddressBar';
import OffersCarousel from '../../components/OffersCarousel';
import SearchBar from '../../components/SearchBar';
import HorizontalFoodList from '../../components/HorizontalFoodList';
import CartIcon from '../../components/CartIcon';

export default function DashboardScreen({ navigation }) {
  const theme = useTheme();
  const gradientColors = ['#effef0', '#effef0'];

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [addressModal, setAddressModal] = useState(false);
  const [addForm, setAddForm] = useState(false);
  const [form, setForm] = useState({ address_line: '', city: '', state: '', pincode: '' });

  // Mom details modal
  const [showMomDetails, setShowMomDetails] = useState(false);
  const [selectedMom, setSelectedMom] = useState(null);

  useEffect(() => {
    loadMenus();
  }, [navigation]);

  const loadMenus = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await MenuService.list({ limit: 20 });
      const payload = res?.data?.data ?? res?.data;

      const todayMenus = Array.isArray(payload?.menus) ? payload.menus : [];

      setMenus(todayMenus);

      const me = await UserService.me();
      console.log('me', me?.data?.data?.addresses);
      setAddresses(me?.data?.data?.addresses || []);
    } catch (e) {
      console.log('Menu Load Error:', e);
      setError(e?.response?.data?.message || 'Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeDefault = async (addressId) => {
    try {
      setLoading(true);
      await UserService.toggleDefaultAddress(addressId);

      // Refresh addresses
      const me = await UserService.me();
      setAddresses(me?.data?.data?.addresses || []);
      setLoading(false);
      setError('');
    } catch (e) {
      console.log('Update Address Error:', e);
      setError(e?.response?.data?.message || 'Failed to update address');
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    try {
      if (!form.address_line || !form.city || !form.state || !form.pincode) {
        setError('All fields are required');
        return;
      }

      if (form.pincode.length !== 6 || isNaN(form.pincode)) {
        setError('Please enter a valid 6-digit pincode');
        return;
      }

      setLoading(true);

      const isDefault = addresses.length === 0 ? true : false;

      await UserService.addAddress({
        ...form,
        is_default: isDefault
      });

      setForm({ address_line: '', city: '', state: '', pincode: '' });
      setAddForm(false);

      const me = await UserService.me();
      setAddresses(me?.data?.data?.addresses || []);
      
      setError('');
      setLoading(false);
    } catch (e) {
      console.log('Add Address Error:', e);
      setError(e?.response?.data?.message || 'Failed to add address');
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const addressToDelete = addresses.find(a => a._id === addressId);

      if (addresses.length === 1) {
        setError('Cannot delete the only address. At least one address must be present.');
        return;
      }

      if (addressToDelete?.is_default) {
        setError('Cannot delete the active address. Please activate another address first.');
        return;
      }

      setLoading(true);
      await UserService.deleteAddress(addressId);

      const me = await UserService.me();
      setAddresses(me?.data?.data?.addresses || []);
      setError('');
      setLoading(false);
    } catch (e) {
      console.log('Delete Address Error:', e);
      setError(e?.response?.data?.message || 'Failed to delete address');
      setLoading(false);
    }
  };

  const transformMenuData = (menuData) =>
    menuData.map((menu) => ({
      id: menu._id,
      name: menu.name || 'Special Menu',
      description: menu.description || 'Delicious homemade food.',
      mom_name: menu.mom_id?.name || 'Unknown Mom',
      mom_description: menu.mom_details?.description || 'Specialized in delicious homemade food.',
      mom_business_name: menu.mom_details?.business_name || 'Unknown Business',
      mom_rating: menu.mom_details?.rating || 0,
      price: `₹${menu.total_cost}`,
      remaining_orders: menu.max_orders || 0,
      menuImage: require('../../../assets/images/food_1.png'),
      items: menu.items || [],
    }));

  const todaysMenus = transformMenuData(menus).filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.mom_name.toLowerCase().includes(q) ||
      item.mom_description?.toLowerCase().includes(q)
    );
  });

  const handleLongPressStart = (item) => {
    setSelectedMom(item);
    setShowMomDetails(true);
  };

  const handleLongPressEnd = () => {
    setShowMomDetails(false);
    setSelectedMom(null);
  };

  const handleMenuPress = (item) => {
    navigation.navigate('MenuDetail', { menu: item });
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AppHeader title="MomsKitchen" subtitle="Delivering happiness" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: 20, paddingHorizontal: 10 }}>
          <AddressBar
            address={addresses.find((a) => a.is_default) || addresses[0]}
            onChangePress={() => setAddressModal(true)}
          />

          <SearchBar value={query} onChangeText={setQuery} />
          <View style={{ height: 16 }} />

          <OffersCarousel />

          <View style={{ marginVertical: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Today's Menu</Text>
            <Text style={{ fontSize: 16, color: '#666' }}>
              Get your favorite mom's menu delivered to your doorstep
            </Text>
          </View>

          <View style={{ marginVertical: 8 }}>
            {todaysMenus.length > 0 ? (
              <HorizontalFoodList
                data={todaysMenus}
                onLongPressStart={handleLongPressStart}
                onLongPressEnd={handleLongPressEnd}
                onPress={handleMenuPress}
                loading={loading}
              />
            ) : (
              !loading && <Text style={styles.noMenuText}>No menus available today 🍱</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Mom Details Modal */}
      <Modal
        visible={showMomDetails}
        transparent
        animationType="fade"
        onRequestClose={handleLongPressEnd}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.momDetailsCard}>
            {selectedMom && (
              <>
                <Image source={require('../../../assets/images/chef.png')} style={styles.chefImage} />
                <Text style={styles.momName}>{selectedMom.mom_name}</Text>
                <Text style={styles.momDescription}>{selectedMom.mom_business_name}</Text>
                <Text style={styles.momDescription}>{selectedMom.mom_description}</Text>
                <Text style={styles.momDescription}>{selectedMom.mom_rating.average} rating</Text>
                <Text style={styles.remainingOrdersModal}>
                  {selectedMom.remaining_orders} orders remaining
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Address Modal */}
      <Modal visible={addressModal} transparent animationType="slide">
        <View style={styles.modalWrap}>
          <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.modalTitle}>Your addresses</Text>
            {!!error && <Text style={{ color: 'red', marginVertical: 8 }}>{error}</Text>}

            {addresses.map((a) => (
              <View key={a._id} style={styles.addrRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: a.is_default ? '700' : '400' }}>
                    {a.address_line}, {a.city} {a.pincode}
                  </Text>
                  {a.is_default && <Text style={{ color: theme.colors.primary, fontSize: 12 }}>Active</Text>}
                </View>

                {!a.is_default && (
                  <Button
                    compact
                    mode="contained"
                    onPress={() => handleMakeDefault(a._id)}
                    style={{ marginRight: 8 }}
                  >
                    Activate
                  </Button>
                )}

                <Button
                  compact
                  textColor="#B00020"
                  onPress={() => handleDeleteAddress(a._id)}
                  disabled={a.is_default || addresses.length === 1}
                >
                  Delete
                </Button>
              </View>
            ))}

            {!addForm && (
              <Button mode="contained" onPress={() => setAddForm(true)} style={{ marginTop: 8 }}>
                Add Address
              </Button>
            )}

            {addForm && (
              <View>
                <TextInput
                  label="Address Line"
                  value={form.address_line}
                  onChangeText={(v) => setForm({ ...form, address_line: v })}
                  style={styles.input}
                />
                <TextInput
                  label="City"
                  value={form.city}
                  onChangeText={(v) => setForm({ ...form, city: v })}
                  style={styles.input}
                />
                <TextInput
                  label="State"
                  value={form.state}
                  onChangeText={(v) => setForm({ ...form, state: v })}
                  style={styles.input}
                />
                <TextInput
                  label="Pincode"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={form.pincode}
                  onChangeText={(v) => setForm({ ...form, pincode: v })}
                  style={styles.input}
                />
                <Button mode="contained" onPress={handleAddAddress}>
                  Save
                </Button>
              </View>
            )}

            <Button onPress={() => { setAddressModal(false); setAddForm(false); }}>Close</Button>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  noMenuText: { textAlign: 'center', fontSize: 16, color: '#777', marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  momDetailsCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, margin: 20, alignItems: 'center' },
  chefImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  momName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  businessName: { fontSize: 16, color: '#666', marginBottom: 10 },
  momDescription: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 15 },
  remainingOrdersModal: { fontSize: 14, color: '#666' },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modal: { padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  addrRow: { paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
  input: { marginBottom: 10 },
});
