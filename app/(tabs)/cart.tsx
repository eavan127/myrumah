
import { CartItem, useCart } from '@/context/CartContext';
import { getMerchants, Merchant } from '@/services/merchant';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
    const { items, updateQuantity, removeFromCart, cartTotal } = useCart();
    const router = useRouter();
    const [merchants, setMerchants] = useState<Record<string, Merchant>>({});

    useEffect(() => {
        getMerchants().then(list => {
            const map: Record<string, Merchant> = {};
            list.forEach(m => map[m.id] = m);
            setMerchants(map);
        });
    }, []);

    // Group items by merchant
    const groupedItems = items.reduce((acc, item) => {
        const mID = item.merchantId || 'unknown';
        if (!acc[mID]) {
            acc[mID] = { merchantId: mID, items: [] };
        }
        acc[mID].items.push(item);
        return acc;
    }, {} as Record<string, { merchantId: string, items: CartItem[] }>);


    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Shopping Bag</Text>
                <Text style={styles.headerCount}>{items.length} items</Text>
            </View>

            {items.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <FontAwesome name="shopping-bag" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>Your bag is empty</Text>
                    <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace('/(tabs)')}>
                        <Text style={styles.shopBtnText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={Object.values(groupedItems)}
                        keyExtractor={group => group.merchantId}
                        renderItem={({ item: group }) => (
                            <View style={styles.merchantSection}>
                                <View style={styles.merchantHeader}>
                                    <FontAwesome name="cube" size={14} color="#111" style={{ marginRight: 8 }} />
                                    <Text style={styles.merchantTitle}>{merchants[group.merchantId]?.name || 'Season Flagship'}</Text>
                                </View>
                                {group.items.map(cartItem => (
                                    <View key={cartItem.id} style={styles.itemCard}>
                                        <Image source={{ uri: cartItem.imageUri }} style={styles.itemImage} />
                                        <View style={styles.details}>
                                            <View>
                                                <Text style={styles.itemTitle} numberOfLines={1}>{cartItem.title}</Text>
                                                <Text style={styles.itemRef}>Ref: {cartItem.id.substring(0, 6).toUpperCase()}</Text>
                                                <Text style={styles.itemPrice}>${cartItem.price}</Text>
                                            </View>

                                            <View style={styles.controls}>
                                                <View style={styles.qtyContainer}>
                                                    <TouchableOpacity onPress={() => updateQuantity(cartItem.id, Math.max(1, cartItem.quantity - 1))} style={styles.qtyBtn}>
                                                        <FontAwesome name="minus" size={10} color="#111" />
                                                    </TouchableOpacity>
                                                    <Text style={styles.qty}>{cartItem.quantity}</Text>
                                                    <TouchableOpacity onPress={() => updateQuantity(cartItem.id, cartItem.quantity + 1)} style={styles.qtyBtn}>
                                                        <FontAwesome name="plus" size={10} color="#111" />
                                                    </TouchableOpacity>
                                                </View>
                                                <TouchableOpacity onPress={() => removeFromCart(cartItem.id)} style={styles.removeBtn}>
                                                    <Text style={styles.removeText}>Remove</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Estimate</Text>
                            <Text style={styles.totalValue}>${cartTotal.toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')}>
                            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    header: { padding: 20, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', fontFamily: 'SpaceMono', color: '#111' },
    headerCount: { fontSize: 14, color: '#666' },

    list: { padding: 20 },
    merchantSection: { marginBottom: 30 },
    merchantHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    merchantTitle: { fontSize: 13, fontWeight: 'bold', color: '#111', textTransform: 'uppercase', letterSpacing: 1 },

    itemCard: { flexDirection: 'row', marginBottom: 20 },
    itemImage: { width: 100, height: 120, backgroundColor: '#f9f9f9', borderRadius: 4, resizeMode: 'cover' },
    details: { flex: 1, marginLeft: 20, justifyContent: 'space-between' },
    itemTitle: { fontSize: 16, fontWeight: '500', color: '#111', marginBottom: 4 },
    itemRef: { fontSize: 11, color: '#999', marginBottom: 8 },
    itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#111' },

    controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 4 },
    qtyBtn: { padding: 8 },
    qty: { marginHorizontal: 10, fontSize: 14, fontWeight: '600' },
    removeBtn: { padding: 5 },
    removeText: { fontSize: 12, color: '#999', textDecorationLine: 'underline' },

    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#f5f5f5', backgroundColor: '#fff' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
    totalLabel: { fontSize: 16, color: '#111', fontWeight: '500' },
    totalValue: { fontSize: 24, fontWeight: 'bold', color: '#111' },
    checkoutBtn: { backgroundColor: '#111', padding: 18, borderRadius: 30, alignItems: 'center' },
    checkoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { marginTop: 20, fontSize: 18, color: '#999', marginBottom: 20 },
    shopBtn: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, backgroundColor: '#111' },
    shopBtnText: { color: '#fff', fontWeight: 'bold' }
});
