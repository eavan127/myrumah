import { getMerchantProducts, Product } from '@/services/product';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MerchantDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadData = async () => {
        setLoading(true);
        const data = await getMerchantProducts('merchant_1');
        setProducts(data);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.imageUri }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>${item.price}</Text>
                <Text numberOfLines={1} style={styles.desc}>{item.description}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
                ListEmptyComponent={<Text style={styles.empty}>No items yet. Start selling!</Text>}
            />

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/merchant/upload')}>
                <FontAwesome name="plus" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    list: { padding: 10 },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        padding: 10,
        elevation: 2,
    },
    image: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' },
    info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    title: { fontSize: 16, fontWeight: 'bold' },
    price: { fontSize: 16, color: '#0058a3', marginTop: 4 },
    desc: { fontSize: 14, color: '#666', marginTop: 2 },
    empty: { textAlign: 'center', marginTop: 50, color: '#999' },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#0058a3',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5
    }
});
