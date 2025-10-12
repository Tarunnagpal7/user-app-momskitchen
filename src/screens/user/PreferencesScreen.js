import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { UserService } from '../../services/userServices';

export default function PreferencesScreen({ navigation }){
  const theme = useTheme();
  const [veg_pref, setVegPref] = useState('both');
  const [authenticity, setAuthenticity] = useState('Any');
  const [fav_dishes, setFavDishes] = useState('');
  const [loading, setLoading] = useState(false);

  const gradientColors = theme.colors?.gradient || ['#FFFFFF', '#F8FDF9'];
  const primaryColor = theme.colors?.primary || '#0C3415';
  const textColor = theme.colors?.text || '#0C3415';
  const subtitleColor = theme.colors?.subtitle || '#666666';
  const surfaceColor = theme.colors?.surface || '#F8FDF9';
  const shadowColor = theme.colors?.shadow || '#0C3415';
  const accentColor = theme.colors?.accent || '#81C784';

  const authenticityOptions = ['North Indian','South Indian','East Indian','West Indian','Fusion','Any'];
  const foodTypeOptions = [
    { value: 'veg', label: 'Vegetarian' },
    { value: 'nonveg', label: 'Non-Vegetarian' },
    { value: 'both', label: 'Both' },
  ];

  const onSubmit = async () => {
    try {
      setLoading(true);
      // Backend expects fav_dishes to be one of allowed strings, we'll only send when provided
      const payload = { veg_pref, authenticity };
      if (fav_dishes && typeof fav_dishes === 'string') payload.fav_dishes = fav_dishes;
      await UserService.addPreferences(payload);
      setLoading(false);
      navigation.navigate('Address')
    } catch(e){
      setLoading(false);
      alert(e?.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar barStyle={'dark-content'} backgroundColor="transparent" translucent />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor }]}>Your Preferences</Text>
          <View style={[styles.titleUnderline, { backgroundColor: primaryColor }]} />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Food Authenticity</Text>
          <View style={styles.chipsContainer}>
            {authenticityOptions.map((opt)=> (
              <TouchableOpacity key={opt} style={[styles.chip, { backgroundColor: authenticity === opt ? primaryColor : surfaceColor, borderColor: authenticity === opt ? primaryColor : '#E0E0E0' }]} onPress={()=>setAuthenticity(opt)} activeOpacity={0.8}>
                <Text style={[styles.chipText, { color: authenticity === opt ? '#FFF' : textColor }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Veg Preference</Text>
          <View style={styles.optionsContainer}>
            {foodTypeOptions.map((opt)=> (
              <TouchableOpacity key={opt.value} style={[styles.optionCard, { backgroundColor: veg_pref === opt.value ? primaryColor + '20' : surfaceColor, borderColor: veg_pref === opt.value ? primaryColor : '#E0E0E0', shadowColor: shadowColor }]} onPress={()=>setVegPref(opt.value)} activeOpacity={0.8}>
                <Text style={[styles.optionTitle, { color: veg_pref === opt.value ? primaryColor : textColor }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: primaryColor, shadowColor: shadowColor }]} onPress={onSubmit} activeOpacity={0.8} disabled={loading}>
          <LinearGradient colors={[primaryColor, accentColor]} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Preferences'}</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { alignItems: 'center', paddingHorizontal: 30, paddingTop: StatusBar.currentHeight || 50, paddingBottom: 30 },
  titleContainer: { alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 32, textAlign: 'center', lineHeight: 40, letterSpacing: 1 },
  titleUnderline: { width: 60, height: 3, marginTop: 8, borderRadius: 2 },
  sectionContainer: { width: '100%', marginBottom: 25 },
  sectionTitle: { fontSize: 18, marginBottom: 15 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 2 },
  chipText: { fontSize: 14 },
  optionsContainer: { width: '100%' },
  optionCard: { width: '100%', borderRadius: 15, padding: 20, marginBottom: 15, borderWidth: 2 },
  optionTitle: { fontSize: 18 },
  button: { borderRadius: 25, marginTop: 10, marginBottom: 20, overflow: 'hidden', width: '75%' },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 40 },
  buttonText: { color: '#FFFFFF', fontSize: 18, marginRight: 8 },
  buttonArrow: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
