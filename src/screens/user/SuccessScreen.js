import React, { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function SuccessScreen({ navigation }) {
    const theme = useTheme();

    // Animation values
    const checkmarkScale = new Animated.Value(0);
    const checkmarkOpacity = new Animated.Value(0);
    
    useEffect(() => {
        // Start animations when component mounts
        Animated.sequence([
            Animated.timing(checkmarkScale, {
                toValue: 1.2,
                duration: 400,
                easing: Easing.out(Easing.back()),
                useNativeDriver: true,
            }),
            Animated.timing(checkmarkScale, {
                toValue: 1,
                duration: 200,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
        
        Animated.timing(checkmarkOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleFindFoods = () => {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    };

    return (
        <LinearGradient
            colors={
                [ '#91D991','#FFFFFF']
            }
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <StatusBar 
                backgroundColor="transparent" 
                translucent 
            />
            {/* Main Content Area */}
            <View style={styles.contentArea}>
                {/* Animated checkmark */}
                <View style={styles.checkmarkContainer}>
                    <Animated.View style={[
                        styles.checkCircle,
                        { 
                            transform: [{ scale: checkmarkScale }],
                            opacity: checkmarkOpacity
                        }
                    ]}>
                        <Ionicons name="checkmark" size={60} color="white" />
                    </Animated.View>
                </View>
                
                {/* Title */}
                <Text style={[styles.title, { 
                    color: '#0C3415',
                    fontFamily: theme.fonts?.titleLarge?.fontFamily || 'Poppins_700Bold'
                }]}>
                    Yeay! Completed
                </Text>
                
                <Text style={styles.subtitle}>Your order has been placed successfully</Text>
               
                {/* Find Foods Button */}
                <TouchableOpacity 
                    style={[styles.button, { 
                        backgroundColor: '#0C3415',
                        shadowColor: '#0C3415',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 6,
                    }]} 
                    onPress={handleFindFoods}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.buttonText, {
                        fontFamily: theme.fonts?.titleMedium?.fontFamily || 'Poppins_600SemiBold'
                    }]}>
                        Find Foods
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Food Image Section */}
            <View style={styles.foodImageContainer}>
                <Image 
                    source={require('../../../assets/images/food-platter.png')} 
                    style={styles.foodImage}
                    resizeMode="cover"
                    />
                {/* 
                To add the actual food platter image:
                1. Add food-platter.jpg to assets/images/
                2. Replace the source above with: require('../assets/images/food-platter.jpg')
                */}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentArea: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: StatusBar.currentHeight || 50,
    },
    checkmarkContainer: {
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 36,
        textAlign: 'center',
        lineHeight: 44,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    summaryContainer: {
        width: '100%',
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
    },
    summaryTitle: {
        fontSize: 18,
        marginBottom: 15,
        textAlign: 'center',
    },
    preferencesRow: {
        marginBottom: 10,
    },
    preferencesLabel: {
        fontSize: 14,
        marginBottom: 2,
    },
    preferencesValue: {
        fontSize: 15,
        marginBottom: 8,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 40,
        minWidth: 200,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600',
    },
    foodImageContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    foodImage: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
});
