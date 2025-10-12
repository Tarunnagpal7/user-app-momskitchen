import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

const IMAGES = [
    require('../../assets/images/c_1.png'),
    require('../../assets/images/c_2.png'),
    require('../../assets/images/c_3.png'),
];

export default function OffersCarousel() {
    const listRef = useRef(null);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            const next = (index + 1) % IMAGES.length;
            setIndex(next);
            listRef.current?.scrollToIndex({ index: next, animated: true });
        }, 3000);
        return () => clearInterval(id);
    }, [index]);

    return (
        <View style={styles.container}>
            <FlatList
                ref={listRef}
                data={IMAGES}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => String(i)}
                renderItem={({ item }) => (
                    <Image source={item} style={styles.image} />
                )}
                onMomentumScrollEnd={(e) => {
                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
                    setIndex(newIndex);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { height: 200, borderRadius: 16, overflow: 'hidden' },
    image: { width, height: 200, resizeMode: 'cover' },
});
