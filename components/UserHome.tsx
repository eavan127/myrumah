
import { getProducts, Product } from '@/services/product';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserHome() {
    const [products, setProducts] = useState<Product[]>([]);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [searchStore, setSearchStore] = useState('');
    const router = useRouter();

    useEffect(() => {
        getProducts().then(setProducts);
    }, []);

    const categories = ['ALL', 'CHAIR', 'TABLE', 'LIGHTING', 'DECOR'];

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'ALL' || (p.tags && p.tags.some(t => t.toUpperCase() === activeCategory));
        const matchesStore = !searchStore || (p.merchantName && p.merchantName.toLowerCase().includes(searchStore.toLowerCase()));
        return matchesCategory && matchesStore;
    });

    const renderHeader = () => (
        <View>
            {/* Header Title Bar */}
            <View style={styles.topBar}>
                <Text style={styles.headerTitle}>MyRumah</Text>
                <TouchableOpacity onPress={() => router.push('/search' as any)}><FontAwesome name="search" size={24} color="#111" /></TouchableOpacity>
            </View>

            {/* Store Search */}
            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={16} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by store..."
                    value={searchStore}
                    onChangeText={setSearchStore}
                    placeholderTextColor="#999"
                />
            </View>

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.catTab, activeCategory === cat && styles.catTabActive]}
                        onPress={() => setActiveCategory(cat)}
                    >
                        <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Promo Hero */}
            <View style={styles.hero}>
                <View style={styles.heroContent}>
                    <Text style={styles.heroLabel}>Promo for first purchase</Text>
                    <Text style={styles.heroSub}>Special Offers</Text>
                    <Text style={styles.heroTitle}>40% Off Prices</Text>
                </View>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1780&auto=format&fit=crop' }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />
            </View>
        </View>
    );

    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/product/${item.id}`)}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
                <Text style={styles.priceTag}>${item.price}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.merchantText}>{item.merchantName || 'Season Flagship'}</Text>
                <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <FlatList
                ListHeaderComponent={renderHeader}
                data={filteredProducts}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    list: { padding: 20 },

    // Top Bar
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111', fontFamily: 'SpaceMono' },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 44,
        marginBottom: 20
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 14, color: '#333' },

    // Categories
    categories: { marginBottom: 25 },
    catTab: { marginRight: 25, paddingVertical: 5 },
    catTabActive: { borderBottomWidth: 2, borderBottomColor: '#333' },
    catText: { fontSize: 13, color: '#999', fontWeight: '600', letterSpacing: 0.5 },
    catTextActive: { color: '#333' },

    // Hero - Beige Card
    hero: {
        backgroundColor: '#EFE8D8',
        borderRadius: 20,
        height: 200,
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: 30,
        padding: 20,
        alignItems: 'center'
    },
    heroContent: { flex: 1, zIndex: 1, justifyContent: 'center' },
    heroLabel: { fontSize: 18, fontWeight: '500', color: '#333', marginBottom: 5 },
    heroSub: { fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
    heroTitle: { fontSize: 26, fontWeight: 'bold', color: '#111' },
    heroImage: { width: 180, height: 220, position: 'absolute', right: -30, bottom: -30, transform: [{ rotate: '-5deg' }] },

    // Product Card
    card: { width: '48%', marginBottom: 25 },
    imageWrapper: {
        height: 200,
        backgroundColor: '#F9F9F9',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 12,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
    },
    image: { width: '100%', height: '100%' },
    priceTag: {
        position: 'absolute', top: 10, right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 12, overflow: 'hidden',
        fontSize: 12, fontWeight: 'bold', color: '#333'
    },

    cardContent: { paddingHorizontal: 5 },
    merchantText: { fontSize: 10, color: '#999', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold' },
    title: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 4 },
    subtitle: { fontSize: 12, color: '#888' }
});
