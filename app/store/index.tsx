
import { Merchant, getMerchants } from '@/services/merchant';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function StoreListScreen() {
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
    const [search, setSearch] = useState('');
    const router = useRouter();

    useEffect(() => {
        getMerchants().then(data => {
            setMerchants(data);
            setFilteredMerchants(data);
        });
    }, []);

    const handleSearch = (text: string) => {
        setSearch(text);
        if (text) {
            const filtered = merchants.filter(m => m.name.toLowerCase().includes(text.toLowerCase()));
            setFilteredMerchants(filtered);
        } else {
            setFilteredMerchants(merchants);
        }
    };

    const renderItem = ({ item }: { item: Merchant }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/store/${item.id}` as any)}>
            <View style={styles.cardContent}>
                <Image source={{ uri: item.logoUri }} style={styles.logo} />
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                    <View style={styles.meta}>
                        <FontAwesome name="star" size={14} color="#FFD700" style={{ marginRight: 4 }} />
                        <Text style={styles.rating}>{item.rating}</Text>
                        <Text style={styles.address}> • {item.address}</Text>
                    </View>
                </View>
                <FontAwesome name="chevron-right" size={14} color="#ccc" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Stores' }} />
            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search stores..."
                    value={search}
                    onChangeText={handleSearch}
                />
            </View>
            <FlatList
                data={filteredMerchants}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        margin: 15,
        padding: 10,
        borderRadius: 10
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16 },
    list: { paddingHorizontal: 15 },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
    },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    logo: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', marginRight: 15 },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    desc: { fontSize: 14, color: '#666', marginBottom: 4 },
    meta: { flexDirection: 'row', alignItems: 'center' },
    rating: { fontSize: 12, fontWeight: 'bold', color: '#333' },
    address: { fontSize: 12, color: '#999' }
});
