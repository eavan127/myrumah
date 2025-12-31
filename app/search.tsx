
import { getProducts, Product } from '@/services/product';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [results, setResults] = useState<Product[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [region, setRegion] = useState('All');
    const [onSale, setOnSale] = useState(false);
    const [freeShipping, setFreeShipping] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);

    useEffect(() => {
        getProducts().then(setProducts);
    }, []);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const lowerQ = query.toLowerCase();
        const filtered = products.filter(p =>
            (p.title.toLowerCase().includes(lowerQ) ||
                p.tags?.some(t => t.toLowerCase().includes(lowerQ))) &&
            (region === 'All' ? true : Math.random() > 0.5) // Mock region logic
        );
        setResults(filtered);
    }, [query, region, onSale, freeShipping]);

    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/product/${item.id}`)}>
            <Image source={{ uri: item.imageUri }} style={styles.image} />
            <View style={styles.cardContent}>
                <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>${item.price}</Text>
                <Text style={styles.merchant}>{item.merchantName || 'Season Flagship'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <FontAwesome name="arrow-left" size={20} color="#111" />
                </TouchableOpacity>
                <View style={styles.searchBar}>
                    <FontAwesome name="search" size={16} color="#999" style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Search furniture, lights..."
                        style={styles.input}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <FontAwesome name="times-circle" size={16} color="#ccc" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterBtn}>
                    <FontAwesome name="sliders" size={20} color="#111" />
                </TouchableOpacity>
            </View>

            {/* Results or Empty State */}
            {query.length > 0 ? (
                <FlatList
                    data={results}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No results found.</Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.recentContainer}>
                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                    <View style={styles.chipRow}>
                        {['Sofa', 'Lamp', 'Rattan', 'Office'].map(tag => (
                            <TouchableOpacity key={tag} style={styles.chip} onPress={() => setQuery(tag)}>
                                <Text style={styles.chipText}>{tag}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Filter Modal */}
            <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter & Sort</Text>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <FontAwesome name="times" size={24} color="#111" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        {/* Region */}
                        <Text style={styles.filterLabel}>Region</Text>
                        <View style={styles.optionRow}>
                            {['All', 'Asia', 'Europe', 'North America'].map(r => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.optionChip, region === r && styles.optionChipActive]}
                                    onPress={() => setRegion(r)}
                                >
                                    <Text style={[styles.optionText, region === r && styles.optionTextActive]}>{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.divider} />

                        {/* Toggles */}
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Free Shipping</Text>
                            <TouchableOpacity onPress={() => setFreeShipping(!freeShipping)}>
                                <FontAwesome name={freeShipping ? "toggle-on" : "toggle-off"} size={32} color={freeShipping ? "#111" : "#ccc"} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>On Sale Only</Text>
                            <TouchableOpacity onPress={() => setOnSale(!onSale)}>
                                <FontAwesome name={onSale ? "toggle-on" : "toggle-off"} size={32} color={onSale ? "#111" : "#ccc"} />
                            </TouchableOpacity>
                        </View>

                        {/* Price Range (Mock) */}
                        <View style={styles.divider} />
                        <Text style={styles.filterLabel}>Price Range</Text>
                        <Text style={styles.priceValue}>$0 - $2000+</Text>
                    </ScrollView>

                    <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilters(false)}>
                        <Text style={styles.applyText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    backBtn: { padding: 5, marginRight: 10 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: 8, paddingHorizontal: 10, height: 40, marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: '#111' },
    filterBtn: { padding: 5 },

    list: { padding: 15 },
    card: { width: '48%', marginBottom: 20 },
    image: { width: '100%', height: 160, borderRadius: 12, backgroundColor: '#f9f9f9', marginBottom: 8 },
    cardContent: { paddingHorizontal: 4 },
    title: { fontSize: 14, fontWeight: '600', color: '#111' },
    price: { fontSize: 13, color: '#333', fontWeight: 'bold' },
    merchant: { fontSize: 10, color: '#999', marginTop: 2 },

    center: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#999', fontSize: 16 },

    recentContainer: { padding: 20 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 15 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: { backgroundColor: '#f2f2f2', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 10 },
    chipText: { fontSize: 14, color: '#333' },

    // Modal
    modalContent: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', fontFamily: 'SpaceMono' },
    filterLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap' },
    optionChip: { borderWidth: 1, borderColor: '#eee', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, marginRight: 10, marginBottom: 10 },
    optionChipActive: { backgroundColor: '#111', borderColor: '#111' },
    optionText: { color: '#333' },
    optionTextActive: { color: '#fff' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    toggleLabel: { fontSize: 16, color: '#333' },
    priceValue: { fontSize: 18, fontWeight: 'bold', color: '#0058a3' },
    applyBtn: { backgroundColor: '#111', padding: 18, borderRadius: 30, alignItems: 'center', marginBottom: 20 },
    applyText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
