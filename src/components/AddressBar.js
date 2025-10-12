import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function AddressBar({ address, onChangePress }) {
    const theme = useTheme();
    return (
        <View style={[styles.container]}> 
            <View style={styles.row}> 
                <TouchableOpacity onPress={onChangePress} style={styles.changeAddressBtn} activeOpacity={0.7}>
                    <Text style={[styles.label, { color: theme.colors.primary, fontWeight: 'bold' }]}>Change</Text>
                </TouchableOpacity>
                <Text style={[styles.address, { color: theme.colors.text }]} numberOfLines={1}>
                    {address ? `${address.address_line} , ${address.city} , ${address.state}` : 'Set your delivery address'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' , margin: 2 , padding :5 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',flex: 1, gap: 10 },
    label: { marginLeft: 6, fontSize: 12 },
    address: { marginLeft: 6, fontWeight: '600', fontSize:20 ,flex: 1 },
    changeBtn: { marginLeft: 12 },
});
