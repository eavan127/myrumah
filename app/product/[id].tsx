import { useCart } from '@/context/CartContext';
import { getMerchant, Merchant } from '@/services/merchant';
import { getProducts, Product } from '@/services/product';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductDetail() {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState<Product | null>(null);
    const router = useRouter();
    const { addToCart } = useCart();
    const [activeColor, setActiveColor] = useState(0);

    const [merchant, setMerchant] = useState<Merchant | null>(null);

    useEffect(() => {
        getProducts().then(products => {
            const found = products.find(p => p.id === id);
            setProduct(found || null);
            if (found && found.merchantId) {
                getMerchant(found.merchantId).then(setMerchant);
            }
        });
    }, [id]);

    if (!product) return <View style={styles.center}><ActivityIndicator size="large" color="#333" /></View>;

    const colors = ['#FDF1DC', '#333333', '#8B4513']; // Mock colors: Beige, Black, Brown

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header Icons */}
            <SafeAreaView style={styles.headerLayer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <FontAwesome name="arrow-left" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail</Text>
                <TouchableOpacity style={styles.iconBtn}>
                    <FontAwesome name="ellipsis-h" size={20} color="#333" />
                </TouchableOpacity>
            </SafeAreaView>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Hero Image */}
                <Image source={{ uri: product.imageUri }} style={styles.heroImage} resizeMode="cover" />

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{product.title}</Text>
                        <TouchableOpacity style={styles.merchantRow}>
                            <Text style={styles.merchantName}>{product.merchantName || 'Season Flagship'}</Text>
                            <View style={styles.ratingBadge}>
                                <FontAwesome name="star" size={12} color="#fff" />
                                <Text style={styles.ratingText}>4.9</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Specifications */}
                    <View style={styles.specRow}>
                        <View>
                            <Text style={styles.label}>Size</Text>
                            <Text style={styles.value}>{product.dimensions || 'H: 80cm W: 60cm'}</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>Material</Text>
                            <Text style={styles.value}>{product.materials || 'Fabric, Wood'}</Text>
                        </View>
                    </View>

                    {/* Color Selector */}
                    <View style={styles.colorSection}>
                        <Text style={styles.label}>Color</Text>
                        <View style={styles.colorRow}>
                            {colors.map((c, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.colorCircle, { backgroundColor: c }, activeColor === i && styles.colorActive]}
                                    onPress={() => setActiveColor(i)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Description */}
                    <Text style={styles.desc}>{product.description || "Inspired by the footstools found in club spaces and bedrooms at Soho House. This piece brings a touch of classic elegance to your room seasoning."}</Text>

                    {/* Actions */}
                    <View style={styles.actionContainer}>
                        <TouchableOpacity style={styles.arBtn} onPress={() => router.push('/kreativ/place')}>
                            <FontAwesome name="cube" size={20} color="#111" />
                            <Text style={styles.arText}>Test in Room</Text>
                        </TouchableOpacity>

                        <View style={styles.cartRow}>
                            <Text style={styles.price}>${product.price}</Text>
                            <TouchableOpacity
                                style={styles.addToCartBtn}
                                onPress={() => { addToCart(product); router.push('/cart'); }}
                            >
                                <Text style={styles.addToCartText}>Add to Cart</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header
    headerLayer: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 10
    },
    iconBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20 },
    headerTitle: { fontSize: 16, fontWeight: '600', opacity: 0 },

    scroll: { flex: 1 },
    heroImage: { width: '100%', height: 450 },

    content: {
        padding: 25,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -40,
        minHeight: 500
    },

    titleRow: { marginBottom: 20 },
    title: { fontSize: 28, fontWeight: '400', color: '#111', fontFamily: 'SpaceMono', marginBottom: 5 },
    merchantRow: { flexDirection: 'row', alignItems: 'center' },
    merchantName: { fontSize: 14, fontWeight: '600', color: '#666', marginRight: 10 },
    ratingBadge: { flexDirection: 'row', backgroundColor: '#111', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignItems: 'center' },
    ratingText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },

    specRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, paddingBottom: 25, borderBottomWidth: 1, borderBottomColor: '#eee' },
    label: { fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 5, textTransform: 'uppercase' },
    value: { fontSize: 16, fontWeight: '500', color: '#111' },

    colorSection: { marginBottom: 25 },
    colorRow: { flexDirection: 'row' },
    colorCircle: { width: 30, height: 30, borderRadius: 15, marginRight: 15, borderWidth: 1, borderColor: '#eee' },
    colorActive: { borderWidth: 2, borderColor: '#111', width: 34, height: 34, borderRadius: 17, marginTop: -2 },

    desc: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 30 },

    actionContainer: {},
    arBtn: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        padding: 15, borderWidth: 1, borderColor: '#eee', borderRadius: 12, marginBottom: 20
    },
    arText: { marginLeft: 10, fontWeight: '600', fontSize: 14 },

    cartRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    price: { fontSize: 28, fontWeight: 'bold', color: '#111' },
    addToCartBtn: {
        backgroundColor: '#111', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30
    },
    addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
