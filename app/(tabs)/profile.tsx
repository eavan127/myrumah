
import { useAuth } from '@/components/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { signOut, user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.replace('/auth/login');
    };

    const MenuItem = ({ icon, title, subtitle, onPress }: { icon: any, title: string, subtitle?: string, onPress?: () => void }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIconContainer}>
                <FontAwesome name={icon} size={20} color="#111" />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <FontAwesome name="chevron-right" size={14} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <TouchableOpacity>
                        <FontAwesome name="bell-o" size={22} color="#111" />
                    </TouchableOpacity>
                </View>

                {/* User Card */}
                <View style={styles.userCard}>
                    <Image
                        source={{ uri: 'https://randomuser.me/api/portraits/lego/1.jpg' }}
                        style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.email ? user.email.split('@')[0] : 'Guest'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'Not logged in'}</Text>
                        <View style={styles.membershipBadge}>
                            <FontAwesome name="star" size={10} color="#fff" />
                            <Text style={styles.membershipText}>MyRumah Member</Text>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>-</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>-</Text>
                        <Text style={styles.statLabel}>Designs</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Wishlist</Text>
                    </View>
                </View>

                {/* Menu Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Orders</Text>
                    <MenuItem
                        icon="cube"
                        title="Order History"
                        subtitle="Track ongoing orders"
                        onPress={() => router.push({ pathname: '/profile/[section]', params: { section: 'orders', title: 'Order History' } })}
                    />
                    <MenuItem
                        icon="rotate-left"
                        title="Returns"
                        onPress={() => router.push({ pathname: '/profile/[section]', params: { section: 'returns', title: 'Returns' } })}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My AI Designs</Text>
                    <MenuItem
                        icon="image"
                        title="Saved Rooms"
                        subtitle="View your generated concepts"
                        onPress={() => router.push({ pathname: '/profile/[section]', params: { section: 'rooms', title: 'Saved Rooms' } })}
                    />
                    <MenuItem
                        icon="shopping-bag"
                        title="Shopping Lists"
                        onPress={() => router.push({ pathname: '/profile/[section]', params: { section: 'lists', title: 'Shopping Lists' } })}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <MenuItem
                        icon="user-o"
                        title="Personal Details"
                        onPress={() => router.push({ pathname: '/profile/[section]', params: { section: 'personal', title: 'Personal Details' } })}
                    />
                    <MenuItem
                        icon="credit-card"
                        title="Payment Methods"
                        onPress={() => router.push({ pathname: '/profile/[section]', params: { section: 'payment', title: 'Payment Methods' } })}
                    />
                    <MenuItem
                        icon="cog"
                        title="Settings"
                        onPress={() => router.push({ pathname: '/profile/[section]', params: { section: 'settings', title: 'Settings' } })}
                    />
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.version}>MyRumah App v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', fontFamily: 'SpaceMono' },

    userCard: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9', marginHorizontal: 20, borderRadius: 20, marginBottom: 20 },
    avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 15 },
    userInfo: { flex: 1 },
    userName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, textTransform: 'capitalize' },
    userEmail: { fontSize: 14, color: '#666', marginBottom: 8 },
    membershipBadge: { flexDirection: 'row', backgroundColor: '#111', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', alignItems: 'center', gap: 4 },
    membershipText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 20, marginBottom: 30, paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
    statLabel: { fontSize: 12, color: '#999' },
    statDivider: { width: 1, backgroundColor: '#f0f0f0' },

    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 20, marginBottom: 15, color: '#111' },

    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#fff' },
    menuIconContainer: { width: 40, alignItems: 'center' },
    menuTextContainer: { flex: 1 },
    menuTitle: { fontSize: 16, color: '#111' },
    menuSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },

    logoutBtn: { marginHorizontal: 20, paddingVertical: 15, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#e91e63', marginTop: 10 },
    logoutText: { color: '#e91e63', fontWeight: 'bold', fontSize: 16 },

    footer: { alignItems: 'center', marginTop: 30 },
    version: { color: '#ccc', fontSize: 12 }
});
