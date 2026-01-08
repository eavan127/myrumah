
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_ROOMS = [
    { id: '1', uri: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1974' },
    { id: '2', uri: 'https://images.unsplash.com/photo-1616594039964-40891a909d99?q=80&w=1974' },
    { id: '3', uri: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1740' },
    { id: '4', uri: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1932' },
];

const MOCK_PAYMENTS = [
    { id: '1', type: 'Visa', last4: '4242', expiry: '12/26' },
    { id: '2', type: 'Mastercard', last4: '8890', expiry: '09/25' },
];

/* --- Section Views --- */

// Status badge colors based on calculated status
const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Processing':
            return { bg: '#fff3cd', text: '#856404' };   // Yellow
        case 'Shipping':
            return { bg: '#cce5ff', text: '#004085' };   // Blue
        case 'Arrived':
            return { bg: '#d4edda', text: '#155724' };   // Green
        default:
            return { bg: '#f0f0f0', text: '#666' };
    }
};

const OrdersView = () => {
    const [orders, setOrders] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { getOrders } = await import('@/services/order');
                const data = await getOrders();
                setOrders(data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <View style={styles.centerContent}>
                <Text>Loading orders...</Text>
            </View>
        );
    }

    if (orders.length === 0) {
        return (
            <View style={styles.centerContent}>
                <FontAwesome name="shopping-bag" size={60} color="#ddd" />
                <Text style={styles.emptyTitle}>No Orders Yet</Text>
                <Text style={styles.emptyDesc}>Your order history will appear here after you make a purchase.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20 }}
            renderItem={({ item }) => {
                const statusStyle = getStatusStyle(item.calculatedStatus);
                const items = item.items as any[];
                const itemNames = items.map((i: any) => i.title).join(', ');
                const orderDate = new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                });

                return (
                    <View style={styles.card}>
                        <View style={[styles.row, { marginBottom: 10 }]}>
                            <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                    {item.calculatedStatus}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.orderDate}>{orderDate}</Text>
                        <Text style={styles.orderItems} numberOfLines={2}>{itemNames}</Text>
                        <View style={[styles.row, { marginTop: 15, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }]}>
                            <Text style={styles.orderTotalLabel}>Total</Text>
                            <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
                        </View>
                    </View>
                );
            }}
        />
    );
};

const ReturnsView = () => (
    <View style={styles.centerContent}>
        <FontAwesome name="check-circle-o" size={60} color="#ddd" />
        <Text style={styles.emptyTitle}>No Active Returns</Text>
        <Text style={styles.emptyDesc}>You have no items eligible for return at this time.</Text>
        <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Start New Return</Text>
        </TouchableOpacity>
    </View>
);

const RoomsView = () => (
    <FlatList
        data={MOCK_ROOMS}
        numColumns={2}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
            <Image source={{ uri: item.uri }} style={styles.roomGridImage} />
        )}
    />
);

const ListsView = () => (
    <View style={{ padding: 20 }}>
        <TouchableOpacity style={styles.listItem}>
            <View style={styles.folderIcon}><FontAwesome name="heart" size={20} color="#fff" /></View>
            <Text style={styles.listName}>My Wishlist (8)</Text>
            <FontAwesome name="chevron-right" size={14} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem}>
            <View style={[styles.folderIcon, { backgroundColor: '#333' }]}><FontAwesome name="home" size={20} color="#fff" /></View>
            <Text style={styles.listName}>Living Room Ideas (12)</Text>
            <FontAwesome name="chevron-right" size={14} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addListBtn}>
            <FontAwesome name="plus" size={16} color="#111" />
            <Text style={styles.addListText}>Create New List</Text>
        </TouchableOpacity>
    </View>
);

const PersonalView = () => (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value="Kim Hong" />

        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} value="kimmy@season.com" />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value="+1 (555) 012-3456" />

        <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
    </ScrollView>
);

const PaymentView = () => (
    <View style={{ padding: 20 }}>
        {MOCK_PAYMENTS.map(card => (
            <View key={card.id} style={styles.paymentCard}>
                <FontAwesome name={card.type === 'Visa' ? 'cc-visa' : 'cc-mastercard'} size={32} color="#111" />
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.cardLast4}>•••• •••• •••• {card.last4}</Text>
                    <Text style={styles.cardExpiry}>Expires {card.expiry}</Text>
                </View>
                <TouchableOpacity><Text style={styles.editLink}>Edit</Text></TouchableOpacity>
            </View>
        ))}
        <TouchableOpacity style={styles.addPaymentBtn}>
            <FontAwesome name="plus" size={16} color="#fff" />
            <Text style={styles.addPaymentText}>Add New Card</Text>
        </TouchableOpacity>
    </View>
);

const SettingsView = () => {
    const [notifs, setNotifs] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    return (
        <View style={{ padding: 20 }}>
            <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Switch value={notifs} onValueChange={setNotifs} trackColor={{ false: "#767577", true: "#111" }} />
            </View>
            <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: "#767577", true: "#111" }} />
            </View>
            <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Location Services</Text>
                <Text style={styles.settingValue}>While Using</Text>
            </View>
            <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Version</Text>
                <Text style={styles.settingValue}>1.0.0 (Build 42)</Text>
            </View>
        </View>
    );
};

/* --- Main Screen --- */

export default function ProfileSectionScreen() {
    const { section, title } = useLocalSearchParams();
    const router = useRouter();

    const displayTitle = title ? (Array.isArray(title) ? title[0] : title) : 'Details';
    const currentSection = Array.isArray(section) ? section[0] : section;

    const renderContent = () => {
        switch (currentSection) {
            case 'orders': return <OrdersView />;
            case 'returns': return <ReturnsView />;
            case 'rooms': return <RoomsView />;
            case 'lists': return <ListsView />;
            case 'personal': return <PersonalView />;
            case 'payment': return <PaymentView />;
            case 'settings': return <SettingsView />;
            default: return <View style={styles.centerContent}><Text>Section not found</Text></View>;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <FontAwesome name="arrow-left" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{displayTitle}</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
                {renderContent()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff' },
    backBtn: { padding: 10, marginLeft: -10 },
    headerTitle: { fontSize: 16, fontWeight: 'bold', fontFamily: 'SpaceMono' },

    // Common
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#111' },
    emptyDesc: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30 },
    actionBtn: { paddingVertical: 12, paddingHorizontal: 30, backgroundColor: '#111', borderRadius: 25 },
    actionBtnText: { color: '#fff', fontWeight: 'bold' },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    // Orders
    orderId: { fontWeight: 'bold', fontSize: 16 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 12, fontWeight: '600' },
    orderDate: { color: '#666', fontSize: 12, marginBottom: 5 },
    orderItems: { fontSize: 14, color: '#333' },
    orderTotalLabel: { fontSize: 14, fontWeight: '600' },
    orderTotal: { fontSize: 16, fontWeight: 'bold' },

    // Rooms
    roomGridImage: { width: '47%', aspectRatio: 1, borderRadius: 12, margin: '1.5%', backgroundColor: '#eee' },

    // Lists
    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15 },
    folderIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e91e63', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    listName: { flex: 1, fontSize: 16, fontWeight: '600' },
    addListBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 12, borderStyle: 'dashed' },
    addListText: { marginLeft: 10, fontWeight: '600', color: '#111' },

    // Personal
    label: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 8, textTransform: 'uppercase' },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
    saveBtn: { backgroundColor: '#111', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Payment
    paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
    cardLast4: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    cardExpiry: { fontSize: 12, color: '#666' },
    editLink: { color: '#007AFF', fontWeight: '600' },
    addPaymentBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', padding: 18, borderRadius: 12 },
    addPaymentText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },

    // Settings
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    settingLabel: { fontSize: 16 },
    settingValue: { fontSize: 16, color: '#666' }
});
