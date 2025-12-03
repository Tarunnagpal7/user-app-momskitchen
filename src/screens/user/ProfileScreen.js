import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch } from 'react-redux';
import { UserService } from '../../services/userServices';
import { logout } from '../../store/store';
import { Ionicons } from '@expo/vector-icons';

export default function UserProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();

  const loadProfile = async () => {
    try {
      const res = await UserService.me();
      const data = res.data?.data || {};
      setUser(data.user);
      setFormData({
        name: data.user?.name || '',
        authenticity: data?.preferences?.authenticity || '',
        food_type: data?.preferences?.veg_pref || '',
      });

    } catch (e) {
      console.error('Profile load error:', e);
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn('Logout API error', e);
    }
    dispatch(logout());
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        name: formData.name,
        preferences: {
          authenticity: formData.authenticity,
          food_type: formData.food_type,
        },
      };
      await UserService.updateProfile(payload);
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
      loadProfile();
    } catch (e) {
      console.error('Update error:', e);
      Alert.alert('Error', 'Failed to update profile');
    }
  };


  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>{user.phone_number}</Text>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.menuSection}>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="ribbon-outline" size={22} color="#0C3415" />
              </View>
              <Text style={styles.menuItemText}>Authenticity</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{formData.authenticity || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="restaurant-outline" size={22} color="#0C3415" />
              </View>
              <Text style={styles.menuItemText}>Food Type</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>{formData.food_type || 'Not set'}</Text>
            </View>
          </View>
        </View>



        <View style={styles.divider} />

        {/* Logout */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="log-out-outline" size={22} color="#B00020" />
              </View>
              <Text style={[styles.menuItemText, { color: '#B00020' }]}>Log Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editing}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditing(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditing(false)}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleUpdate}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Authenticity</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.authenticity}
                  onValueChange={(val) => setFormData({ ...formData, authenticity: val })}
                  style={styles.picker}
                >
                  <Picker.Item label="Select authenticity" value="" />
                  <Picker.Item label="North Indian" value="North Indian" />
                  <Picker.Item label="South Indian" value="South Indian" />
                  <Picker.Item label="East Indian" value="East Indian" />
                  <Picker.Item label="West Indian" value="West Indian" />
                  <Picker.Item label="Fusion" value="Fusion" />
                  <Picker.Item label="Any" value="Any" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Food Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.food_type}
                  onValueChange={(val) => setFormData({ ...formData, food_type: val })}
                  style={styles.picker}
                >
                  <Picker.Item label="Select food type" value="" />
                  <Picker.Item label="Veg" value="veg" />
                  <Picker.Item label="Non-Veg" value="nonveg" />
                  <Picker.Item label="Both" value="both" />
                </Picker>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0C3415',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 4 },
  userPhone: { fontSize: 14, color: '#666', marginBottom: 16 },
  editProfileButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  menuSection: { backgroundColor: '#fff', marginTop: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FDF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: { fontSize: 16, color: '#000', fontWeight: '500' },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', maxWidth: '50%' },
  menuItemValue: { fontSize: 18, color: '#666', marginRight: 8 },
  divider: { height: 8, backgroundColor: '#F8F8F8' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  saveText: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
  modalContent: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: { height: 50 },
});
