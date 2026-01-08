import { useAuth } from '@/components/AuthContext';
import { useCart } from '@/context/CartContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Asset Mappings for Payment
const PAYMENT_METHODS = {
    cards: [
        { id: 'visa', name: 'Visa', icon: require('../assets/Icon/visa.png') },
        { id: 'mastercard', name: 'Mastercard', icon: require('../assets/Icon/mastercard.jpg') },
    ],
    ewallets: [
        { id: 'tng', name: 'Touch n Go', icon: require('../assets/Icon/TnG.png') },
        { id: 'grab', name: 'GrabPay', icon: require('../assets/Icon/grabpay.png') },
        { id: 'shopee', name: 'ShopeePay', icon: require('../assets/Icon/shopeepay.png') },
    ],
    others: [
        { id: 'fpx', name: 'FPX', icon: require('../assets/Icon/Logo-FPX.png') }
    ]
};

export default function CheckoutScreen() {
    const { items, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    // State
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [shippingMethod, setShippingMethod] = useState<'free' | 'express'>('free');

    // Address Form State
    const [isSelf, setIsSelf] = useState(false);
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        address: '', city: '', state: '', zip: ''
    });

    // Voucher State
    const [voucherCode, setVoucherCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const deliveryFee = shippingMethod === 'free' ? 0 : 15;
    const finalTotal = Math.max(0, cartTotal + deliveryFee - discount);

    const toggleSelf = (value: boolean) => {
        setIsSelf(value);
        if (value) {
            // Auto-fill with user data (extract username from email)
            const emailUsername = user?.email?.split('@')[0] || 'Guest';
            setForm({
                firstName: emailUsername,
                lastName: '',
                email: user?.email || 'guest@example.com',
                phone: '+60123456789',
                address: '123 Jalan RoomPlus',
                city: 'Kuala Lumpur',
                state: 'Wilayah Persekutuan',
                zip: '50000'
            });
        } else {
            setForm({
                firstName: '', lastName: '', email: '', phone: '',
                address: '', city: '', state: '', zip: ''
            });
        }
    };

    const applyVoucher = () => {
        if (voucherCode.trim().toUpperCase() === 'ROOM2025') {
            const discAmount = cartTotal * 0.10; // 10% off
            setDiscount(discAmount);
            Alert.alert('Voucher Applied', `Saved $${discAmount.toFixed(2)} with code ROOM2025!`);
        } else {
            setDiscount(0);
            Alert.alert('Invalid Voucher', 'The code you entered is invalid.');
        }
    };

    const handlePay = async () => {
        if (!selectedMethod) {
            Alert.alert('Payment Method', 'Please select a payment method');
            return;
        }

        // Build shipping address object
        const shippingAddress = {
            fullName: `${form.firstName} ${form.lastName}`,
            address: form.address,
            city: form.city,
            state: form.state,
            postalCode: form.zip,
            phone: form.phone,
            email: form.email
        };

        // Build payment details object
        const paymentDetails = {
            method: selectedMethod,
            amount: finalTotal,
            discount: discount,
            shippingMethod: shippingMethod,
            voucherCode: voucherCode || null
        };

        try {
            // Import the order service
            const { createOrder } = await import('@/services/order');

            // Call backend to create order
            await createOrder(shippingAddress, paymentDetails);

            Alert.alert('Success', 'Payment processed successfully! Your order is being prepared.', [
                {
                    text: 'Track Order',
                    onPress: () => {
                        clearCart();
                        router.replace('/(tabs)/profile');
                    }
                }
            ]);
        } catch (error: any) {
            console.error('Payment Error:', error);
            Alert.alert('Payment Failed', error.response?.data?.error || 'Please try again');
        }
    };

    const renderPaymentOption = (method: any) => (
        <TouchableOpacity
            key={method.id}
            style={[styles.paymentCard, selectedMethod === method.id && styles.paymentCardSelected]}
            onPress={() => setSelectedMethod(method.id)}
        >
            <Image source={method.icon} style={styles.paymentIcon} resizeMode="contain" />
            {selectedMethod === method.id && (
                <View style={styles.checkBadge}>
                    <FontAwesome name="check" size={10} color="#fff" />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{ title: 'Checkout', headerStyle: { backgroundColor: '#f9f9f9' }, headerTitleStyle: { fontWeight: '800' }, headerShadowVisible: false }} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Shipping Address */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionHeader}>Shipping Address</Text>
                        <View style={styles.autoFillRow}>
                            <Text style={styles.autoFillLabel}>Buying for myself</Text>
                            <Switch value={isSelf} onValueChange={toggleSelf} trackColor={{ false: '#767577', true: '#0058a3' }} thumbColor={'#f4f3f4'} />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput style={styles.input} placeholder="Divyansh" value={form.firstName} onChangeText={t => setForm({ ...form, firstName: t })} />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput style={styles.input} placeholder="Agarwal" value={form.lastName} onChangeText={t => setForm({ ...form, lastName: t })} />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.input} placeholder="email@example.com" keyboardType="email-address" value={form.email} onChangeText={t => setForm({ ...form, email: t })} />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone</Text>
                        <TextInput style={styles.input} placeholder="+60..." keyboardType="phone-pad" value={form.phone} onChangeText={t => setForm({ ...form, phone: t })} />
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>City</Text>
                            <TextInput style={styles.input} placeholder="Bangalore" value={form.city} onChangeText={t => setForm({ ...form, city: t })} />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>State</Text>
                            <TextInput style={styles.input} placeholder="Karnataka" value={form.state} onChangeText={t => setForm({ ...form, state: t })} />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Zip Code</Text>
                        <TextInput style={styles.input} placeholder="560021" keyboardType="numeric" value={form.zip} onChangeText={t => setForm({ ...form, zip: t })} />
                    </View>
                </View>

                {/* 2. Shipping Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Shipping Method</Text>
                    <View style={styles.shippingOptions}>
                        <TouchableOpacity
                            style={[styles.shippingOption, shippingMethod === 'free' && styles.shippingSelected]}
                            onPress={() => setShippingMethod('free')}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.radio, shippingMethod === 'free' && styles.radioSelected]} />
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={styles.shipTitle}>Free Shipping</Text>
                                    <Text style={styles.shipDesc}>7-20 Days</Text>
                                </View>
                            </View>
                            <Text style={styles.shipPrice}>$0</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.shippingOption, shippingMethod === 'express' && styles.shippingSelected]}
                            onPress={() => setShippingMethod('express')}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={[styles.radio, shippingMethod === 'express' && styles.radioSelected]} />
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={styles.shipTitle}>Express Shipping</Text>
                                    <Text style={styles.shipDesc}>1-3 Days</Text>
                                </View>
                            </View>
                            <Text style={styles.shipPrice}>$15</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. Your Cart / Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Your Cart</Text>
                    <View style={styles.cartPreviewList}>
                        {items.slice(0, 3).map(item => ( // Show first 3 only
                            <View key={item.id} style={styles.miniItem}>
                                <Image source={{ uri: item.imageUri }} style={styles.miniImage} />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.miniTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.miniVariant}>Merchant: {item.merchantId}</Text>
                                </View>
                                <Text style={styles.miniPrice}>${item.price}</Text>
                            </View>
                        ))}
                        {items.length > 3 && (
                            <Text style={styles.moreItemsText}>+ {items.length - 3} more items</Text>
                        )}
                    </View>

                    {/* Voucher Input */}
                    <View style={styles.voucherContainer}>
                        <TextInput
                            style={styles.voucherInput}
                            placeholder="Discount Code"
                            value={voucherCode}
                            onChangeText={setVoucherCode}
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity style={styles.applyBtn} onPress={applyVoucher}>
                            <Text style={styles.applyBtnText}>Apply</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>${deliveryFee}</Text>
                    </View>
                    {discount > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: '#d93025' }]}>Discount</Text>
                            <Text style={[styles.summaryValue, { color: '#d93025' }]}>-${discount.toFixed(2)}</Text>
                        </View>
                    )}
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
                    </View>
                </View>

                {/* 4. Payment */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Payment</Text>

                    <Text style={styles.categoryLabel}>Cards</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paymentScroll}>
                        {PAYMENT_METHODS.cards.map(renderPaymentOption)}
                    </ScrollView>

                    <Text style={styles.categoryLabel}>E-Wallets</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paymentScroll}>
                        {PAYMENT_METHODS.ewallets.map(renderPaymentOption)}
                    </ScrollView>

                    <Text style={styles.categoryLabel}>Others</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paymentScroll}>
                        {PAYMENT_METHODS.others.map(renderPaymentOption)}
                    </ScrollView>
                </View>

            </ScrollView>

            {/* Sticky Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.activatableButton} onPress={handlePay}>
                    <Text style={styles.buttonText}>Pay ${finalTotal.toFixed(2)}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    scrollContent: { padding: 20, paddingBottom: 100 },

    // Sections
    section: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionHeader: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },

    // Auto fill
    autoFillRow: { flexDirection: 'row', alignItems: 'center' },
    autoFillLabel: { fontSize: 12, marginRight: 8, color: '#666' },

    // Forms
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6, textTransform: 'uppercase' },
    input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, fontSize: 16, color: '#333', backgroundColor: '#fcfcfc' },

    // Shipping Options
    shippingOptions: { marginTop: 5 },
    shippingOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: '#eee', borderRadius: 12, marginBottom: 10 },
    shippingSelected: { borderColor: '#000', backgroundColor: '#fafafa' },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', marginRight: 5 },
    radioSelected: { borderColor: '#000', backgroundColor: '#000' },
    shipTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
    shipDesc: { fontSize: 12, color: '#888' },
    shipPrice: { fontSize: 14, fontWeight: '600', color: '#333' },

    // Cart Summary
    cartPreviewList: { marginBottom: 15 },
    miniItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    miniImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#f0f0f0' },
    miniTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
    miniVariant: { fontSize: 12, color: '#888' },
    miniPrice: { fontSize: 14, fontWeight: '600', color: '#333' },
    moreItemsText: { fontSize: 12, color: '#666', textAlign: 'center', fontStyle: 'italic' },

    // Voucher
    voucherContainer: { flexDirection: 'row', marginBottom: 15 },
    voucherInput: { flex: 1, borderWidth: 1, borderColor: '#eee', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, padding: 10, backgroundColor: '#fcfcfc' },
    applyBtn: { backgroundColor: '#000', justifyContent: 'center', paddingHorizontal: 15, borderTopRightRadius: 8, borderBottomRightRadius: 8 },
    applyBtnText: { color: '#fff', fontWeight: 'bold' },

    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#666' },
    summaryValue: { fontSize: 14, fontWeight: '600', color: '#333' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
    totalLabel: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },

    // Payment
    categoryLabel: { fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 10, marginTop: 5 },
    paymentScroll: { flexDirection: 'row', paddingVertical: 5, marginBottom: 10 },
    paymentCard: { width: 80, height: 50, borderRadius: 8, borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center', marginRight: 10, backgroundColor: '#fff' },
    paymentCardSelected: { borderColor: '#000', borderWidth: 2 },
    paymentIcon: { width: 40, height: 25 },
    checkBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#000', borderRadius: 10, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },

    // Footer
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
    activatableButton: { backgroundColor: '#000', padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
