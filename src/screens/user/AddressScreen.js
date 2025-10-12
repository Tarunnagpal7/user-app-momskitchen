import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { UserService } from '../../services/userServices';

export default function AddressSetUpScreen({navigation} ) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const accessToken = useSelector((state)=>state.auth.accessToken);
    // Address form fields
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    const dispatch = useDispatch();

    // Fallback colors in case theme is not fully loaded
    const gradientColors = theme.colors?.gradient || ['#FFFFFF', '#F8FDF9'];
    const primaryColor = theme.colors?.primary || '#0C3415';
    const textColor = theme.colors?.text || '#0C3415';
    const subtitleColor = theme.colors?.subtitle || '#666666';
    const surfaceColor = theme.colors?.surface || '#F8FDF9';
    const shadowColor = theme.colors?.shadow || '#0C3415';
    const decorativeColor = theme.colors?.decorative || '#0C341510';
    const accentColor = theme.colors?.accent || '#81C784';

    const handleSubmit = async() => {

        try{

        
        // Form validation
        if (!address.trim()) {
            alert('Please enter your address');
            return;
        }
        if (!city.trim()) {
            alert('Please enter your city');
            return;
        }
        if (!state.trim()) {
            alert('Please enter your state');
            return;
        }
        if (!/^\d{6}$/.test(pincode)) {
            alert('Please enter a valid 6-digit pincode');
            return;
        }

        setLoading(true);
        const response = await UserService.addAddress({address_line : address, city ,state,pincode})
        if(response.data.status === 'success'){
            const data = response.data.data
            console.log(data)
            
            setTimeout(() => {
                setLoading(false);
                navigation.navigate('Success');
            }, 600);
        }
    }catch(error){
        console.log("Address : ", error);
        alert(error.response.data.message);
        setLoading(false);
    }
    };

    return (
        <LinearGradient
            colors={gradientColors}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <StatusBar 
                barStyle="dark-content" 
                backgroundColor="transparent" 
                translucent 
            />
            
            {/* Decorative circles */}
            <View style={[styles.decorativeCircle, styles.circle1, { 
                backgroundColor: decorativeColor 
            }]} />
            <View style={[styles.decorativeCircle, styles.circle2, { 
                backgroundColor: decorativeColor 
            }]} />
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Logo with shadow */}
                    <View style={[styles.logoContainer, {
                        backgroundColor: surfaceColor,
                        shadowColor: shadowColor,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 20,
                        elevation: 10,
                    }]}>
                        <Image 
                            source={require('../../../assets/icon_.png')} 
                            style={styles.logo} 
                        />
                    </View>
                    
                    {/* Title */}
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { 
                            color: textColor,
                            fontFamily: theme.fonts?.titleLarge?.fontFamily || 'Poppins_700Bold'
                        }]}>
                            Delivery Address
                        </Text>
                        <View style={[styles.titleUnderline, { 
                            backgroundColor: primaryColor 
                        }]} />
                    </View>
                    
                    <Text style={[styles.subtitle, { 
                        color: subtitleColor,
                        fontFamily: theme.fonts?.labelLarge?.fontFamily || 'Poppins_500Medium'
                    }]}>
                        Where should we deliver your food?
                    </Text>

                    {/* Address Form Container */}
                    <View style={[styles.formContainer, {
                        backgroundColor: surfaceColor + '80',
                        shadowColor: shadowColor,
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.1,
                        shadowRadius: 25,
                        elevation: 8,
                    }]}>
                        <TextInput
                            label="Full Address"
                            value={address}
                            onChangeText={setAddress}
                            style={styles.input}
                            multiline
                            numberOfLines={3}
                            theme={{
                                colors: {
                                    primary: primaryColor,
                                    background: 'transparent',
                                }
                            }}
                        />
                        <TextInput
                            label="City"
                            value={city}
                            onChangeText={setCity}
                            style={styles.input}
                            theme={{
                                colors: {
                                    primary: primaryColor,
                                    background: 'transparent',
                                }
                            }}
                        />
                        <TextInput
                            label="State"
                            value={state}
                            onChangeText={setState}
                            style={styles.input}
                            theme={{
                                colors: {
                                    primary: primaryColor,
                                    background: 'transparent',
                                }
                            }}
                        />
                        <TextInput
                            label="Pincode"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={pincode}
                            onChangeText={setPincode}
                            style={styles.input}
                            theme={{
                                colors: {
                                    primary: primaryColor,
                                    background: 'transparent',
                                }
                            }}
                        />
                    </View>

                    {/* Map Placeholder */}
                    <View style={[styles.mapContainer, {
                        backgroundColor: surfaceColor,
                        borderColor: '#E0E0E0',
                        shadowColor: shadowColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 4,
                    }]}>
                        <View style={styles.mapPlaceholder}>
                            <Image 
                                source={require('../../../assets/icon_.png')} 
                                style={styles.mapIcon} 
                            />
                            <Text style={[styles.mapText, {
                                color: subtitleColor,
                                fontFamily: theme.fonts?.bodyMedium?.fontFamily || 'Poppins_400Regular',
                            }]}>
                                Map view will be available soon
                            </Text>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity 
                        style={[styles.button, { 
                            backgroundColor: primaryColor,
                            shadowColor: shadowColor,
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.2,
                            shadowRadius: 15,
                            elevation: 8,
                        }]} 
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={[primaryColor, accentColor]}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={[styles.buttonText, {
                                fontFamily: theme.fonts?.titleMedium?.fontFamily || 'Poppins_600SemiBold'
                            }]}>
                                {loading ? 'Processing...' : 'Continue'}
                            </Text>
                            <Text style={styles.buttonArrow}>→</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: StatusBar.currentHeight || 50,
    },
    decorativeCircle: {
        position: 'absolute',
        borderRadius: 200,
    },
    circle1: {
        width: 300,
        height: 300,
        top: -150,
        right: -100,
    },
    circle2: {
        width: 200,
        height: 200,
        bottom: -100,
        left: -50,
    },
    logoContainer: {
        marginBottom: 20,
        borderRadius: 50,
        padding: 15,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 32,
        textAlign: 'center',
        lineHeight: 40,
        letterSpacing: 1,
    },
    titleUnderline: {
        width: 60,
        height: 3,
        marginTop: 8,
        borderRadius: 2,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    formContainer: {
        width: '100%',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    input: {
        marginBottom: 15,
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '#0C3415',
        color: '#0C3415',
        margin: 5,
        padding: 2,
    },
    mapContainer: {
        width: '100%',
        height: 150,
        borderRadius: 15,
        borderWidth: 1,
        marginBottom: 30,
        overflow: 'hidden',
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    mapIcon: {
        width: 40,
        height: 40,
        marginBottom: 10,
        opacity: 0.6,
    },
    mapText: {
        fontSize: 14,
    },
    button: {
        borderRadius: 25,
        marginBottom: 20,
        overflow: 'hidden',
        width: '75%',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 40,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        marginRight: 8,
    },
    buttonArrow: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});