import { Merchant, Review, getMerchant, getMerchantReviews } from '@/services/merchant';
import { Product, getMerchantProducts } from '@/services/product';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StoreDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [merchant, setMerchant] = useState<Merchant | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');
    const router = useRouter();

    useEffect(() => {
        if (id) {
            getMerchant(id).then(setMerchant);
            getMerchantProducts(id).then(setProducts);
            getMerchantReviews(id).then(setReviews);
        }
    }, [id]);

    if (!merchant) return <View style={styles.center}><Text>Loading...</Text></View>;

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.profileInfo}>
                <Image source={{ uri: merchant.logoUri }} style={styles.logo} />
                <View style={styles.textInfo}>
                    <Text style={styles.name}>{merchant.name}</Text>
                    <View style={styles.ratingRow}>
                        <FontAwesome name="star" size={14} color="#FFD700" />
                        <Text style={styles.rating}>{merchant.rating} ({reviews.length} reviews)</Text>
                    </View>
                    <Text style={styles.address}>{merchant.address}</Text>
                </View>
            </View>
            <Text style={styles.desc}>{merchant.description}</Text>

            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, activeTab === 'products' && styles.activeTab]} onPress={() => setActiveTab('products')}>
                    <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>Products</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'reviews' && styles.activeTab]} onPress={() => setActiveTab('reviews')}>
                    <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>Reviews</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.productCard} onPress={() => router.push(`/product/${item.id}`)}>
            <Image source={{ uri: item.imageUri }} style={styles.productImage} />
            <Text numberOfLines={1} style={styles.productTitle}>{item.title}</Text>
            <Text style={styles.productPrice}>${item.price}</Text>
        </TouchableOpacity>
    );

    const renderReview = ({ item }: { item: Review }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewUser}>
                    <View style={styles.avatarPlaceholder}><Text style={{ color: '#fff' }}>{item.userName[0]}</Text></View>
                    <Text style={styles.userName}>{item.userName}</Text>
                </View>
                <Text style={styles.reviewDate}>{item.date}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                {[...Array(5)].map((_, i) => (
                    <FontAwesome key={i} name="star" size={12} color={i < item.rating ? "#FFD700" : "#ddd"} />
                ))}
            </View>
            <Text style={styles.reviewComment}>{item.comment}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: merchant.name }} />
            <FlatList
                key={activeTab}
                ListHeaderComponent={renderHeader}
                data={(activeTab === 'products' ? products : reviews) as any[]}
                keyExtractor={item => item.id}
                renderItem={activeTab === 'products' ? renderProduct : renderReview as any}
                numColumns={activeTab === 'products' ? 2 : 1}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 15 },
    header: { marginBottom: 20 },
    profileInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    logo: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0f0f0', marginRight: 15 },
    textInfo: { flex: 1 },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    rating: { marginLeft: 5, fontWeight: 'bold' },
    address: { fontSize: 13, color: '#666' },
    desc: { fontSize: 14, color: '#444', lineHeight: 20 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    productCard: { flex: 1, margin: 5, padding: 10, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
    productImage: { width: '100%', aspectRatio: 1, borderRadius: 8, backgroundColor: '#f9f9f9', marginBottom: 8 },
    productTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    productPrice: { fontSize: 14, color: '#0058a3', fontWeight: 'bold' },

    tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', marginTop: 15 },
    tab: { paddingVertical: 10, marginRight: 20, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#000' },
    tabText: { fontSize: 14, color: '#666', fontWeight: 'bold' },
    activeTabText: { color: '#000' },

    reviewCard: { marginBottom: 15, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 12 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    reviewUser: { flexDirection: 'row', alignItems: 'center' },
    avatarPlaceholder: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    userName: { fontWeight: 'bold', fontSize: 14 },
    reviewDate: { fontSize: 11, color: '#999' },
    reviewComment: { fontSize: 13, color: '#444', lineHeight: 18 },
});
