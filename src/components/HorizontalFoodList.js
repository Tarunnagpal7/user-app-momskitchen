import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 0.55 * width



export default function HorizontalFoodList({ 
    data, 
    onLongPressStart, 
    onLongPressEnd, 
    onPress, 
    loading = false 
}) {
    const handleLongPressStart = (item) => {
        if (onLongPressStart) onLongPressStart(item);
    };

    const handleLongPressEnd = () => {
        if (onLongPressEnd) onLongPressEnd();
    };

    const handlePress = (item) => {
        if (onPress) onPress(item)
        else{
            navigation.navigate('MenuDetail', { menu: item });
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Loading menus...</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            renderItem={({ item }) => (
                <TouchableOpacity 
                    onPress={() => handlePress(item)} 
                    onLongPress={() => handleLongPressStart(item)}
                    onPressOut={handleLongPressEnd}
                    activeOpacity={0.9}
                    delayLongPress={500}
                    style={styles.itemContainer}
                >
                    <View style={styles.card}>
                        {/* Image Section with Gradient Overlay */}
                        <View style={styles.imageSection}>
                            <Image 
                                source={item.menuImage || require('../../assets/images/food_1.png')} 
                                style={styles.menuImage} 
                            />
                            {/* Badge for remaining orders */}
                            {item.remaining_orders <= 10 && (
                                <View style={styles.urgencyBadge}>
                                    <MaterialCommunityIcons name="fire" size={12} color="#fff" />
                                    <Text style={styles.urgencyText}>Only {item.remaining_orders} left</Text>
                                </View>
                            )}
                        </View>

                        {/* Content Section */}
                        <View style={styles.contentSection}>

                            {/* Business Info & Price */}
                            <View style={styles.businessRow}>
                                <View style={styles.businessInfo}>
                                    <Text style={styles.businessName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.descriptionText} numberOfLines={1}>{item.description}</Text>
                                    {item.remaining_orders > 10 && (
                                        <View style={styles.availabilityRow}>
                                            <MaterialCommunityIcons name="check-circle" size={11} color="#4CAF50" />
                                            <Text style={styles.availabilityText}>{item.remaining_orders} available</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceLabel}>Price</Text>
                                    <Text style={styles.price}>{item.price}</Text>
                                    <Text style={styles.perTiffin}>per tiffin</Text>
                                </View>
                            </View>
                            {/* Divider */}
                                <View style={styles.divider} />
                            {/* Menu By Label */}
                            <Text style={styles.menuByText}>MENU BY</Text>

                            {/* Chef Info */}
                            <View style={styles.chefRow}>
                                <Image 
                                    source={require('../../assets/images/chef.png')} 
                                    style={styles.chefImage} 
                                />
                                <View style={styles.chefInfo}>
                                    <Text style={styles.chefName}>{item.mom_name}</Text>
                                    <View style={styles.experienceRow}>
                                        <Text style={styles.experienceText}>{item.mom_description}</Text>
                                        <Text style={styles.experienceText}>{item.mom_rating.average} rating</Text>
                                    </View>
                                </View>
                            </View>

                        </View>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    itemContainer: {
        width: CARD_WIDTH,
        marginRight: 16,
    },
    card: { 
        width: CARD_WIDTH,
        borderRadius: 20, 
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
    },
    imageSection: {
        height: 140,
        width: '100%',
        backgroundColor: '#f5f5f5',
        position: 'relative',
    },
    menuImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    urgencyBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255, 59, 48, 0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    urgencyText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    contentSection: {
        backgroundColor: '#fff',
        padding: 16,
    },
    menuByText: {
        fontSize: 10,
        color: '#999',
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 10,
    },
    chefRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    chefImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#f0f0f0',
        borderWidth: 2,
        borderColor: '#fff',
    },
    chefInfo: {
        flex: 1,
    },
    chefName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#222',
        marginBottom: 3,
    },
    experienceRow: {
        flexDirection: 'column',
    },
    experienceText: {
        fontSize: 11,
        color: '#999',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 6,
    },
    businessRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    businessInfo: {
        flex: 1,
        marginRight: 12,
    },
    businessName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 11,
        color: '#999',
        fontWeight: '500',
        marginBottom: 4,
    },
    availabilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    availabilityText: {
        fontSize: 11,
        color: '#4CAF50',
        fontWeight: '600',
    },
    priceContainer: {
        alignItems: 'flex-end',
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    priceLabel: {
        fontSize: 10,
        color: '#999',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    price: {
        fontSize: 18,
        color: '#FF6B35',
        fontWeight: '800',
        marginVertical: 2,
    },
    perTiffin: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#666',
    },
});