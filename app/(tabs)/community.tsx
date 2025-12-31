import { useCart } from '@/context/CartContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface CommunityPost {
    id: string;
    user: {
        name: string;
        avatar: string;
    };
    image: string;
    description: string;
    likes: number;
    liked?: boolean;
    products: {
        id: string;
        name: string;
        price: string;
        image: string;
        x: number; // Percentage 0-100
        y: number; // Percentage 0-100
    }[];
}

interface UserProfile {
    id: string;
    name: string; // e.g., "Nordic Home" or "Sarah J."
    avatar: string;
    role: 'Seller' | 'Designer';
    rating: number;
}

const MOCK_POSTS: CommunityPost[] = [
    {
        id: '1',
        user: { name: 'Sarah J.', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop',
        description: 'Loving my new minimal living room setup! The STRANDMON chair is so comfy.',
        likes: 124,
        products: [
            { id: '1', name: 'STRANDMON', price: '299', image: 'https://www.ikea.com/ext/ingkadam/m/51e3328fccbc5692/original/PH170562-crop001.jpg?f=xs', x: 25, y: 60 },
            { id: 'f3', name: 'HEKTAR', price: '69', image: 'https://www.ikea.com/ext/ingkadam/m/26a9e0f607186981/original/PH157835-crop001.jpg?f=xs', x: 80, y: 30 }
        ]
    },
    {
        id: '2',
        user: { name: 'Mike T.', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
        image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2070&auto=format&fit=crop',
        description: 'Industrial vibes for the home office. productivity 📈',
        likes: 85,
        products: [
            { id: '2', name: 'BILLY', price: '49', image: 'https://www.ikea.com/ext/ingkadam/m/17a7e32d3d0f048d/original/PH196720-crop001.jpg?f=xs', x: 70, y: 40 }
        ]
    },
    {
        id: '3',
        user: { name: 'Jessica L.', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop',
        description: 'Cozy weekend corner using the new lamp!',
        likes: 210,
        products: [
            { id: 'f3', name: 'HEKTAR', price: '69', image: 'https://www.ikea.com/ext/ingkadam/m/26a9e0f607186981/original/PH157835-crop001.jpg?f=xs', x: 50, y: 20 }
        ]
    }
];

const MOCK_EXPLORE = [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=2071&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540932296774-3ed6d53f056f?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=2074&auto=format&fit=crop',
];

const MOCK_USERS: UserProfile[] = [
    { id: 'd1', name: 'Artemis Design', avatar: 'https://randomuser.me/api/portraits/women/22.jpg', role: 'Designer', rating: 4.9 },
    { id: 's1', name: 'Urban Wood', avatar: 'https://images.unsplash.com/photo-1572177812156-58036aae439c?w=500&auto=format&fit=crop&q=60', role: 'Seller', rating: 4.8 },
    { id: 'd2', name: 'Eco Living', avatar: 'https://randomuser.me/api/portraits/men/11.jpg', role: 'Designer', rating: 4.7 },
    { id: 's2', name: 'Modern Light', avatar: 'https://images.unsplash.com/photo-1513506003013-195c911703ff?w=500&auto=format&fit=crop&q=60', role: 'Seller', rating: 4.6 },
    { id: 'd3', name: 'Zen Spaces', avatar: 'https://randomuser.me/api/portraits/women/55.jpg', role: 'Designer', rating: 5.0 },
];

const TABS = ['follow', 'explore', 'marketplace'] as const;

export default function CommunityScreen() {
    const router = useRouter();
    const { addToCart } = useCart();
    const [posts, setPosts] = useState(MOCK_POSTS);
    const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('marketplace');
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const toggleLike = (id: string) => {
        setPosts(prev => prev.map(p =>
            p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
        ));
    };

    // Filter Logic
    const filteredPosts = posts.filter(p => p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredUsers = MOCK_USERS.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleTabPress = (index: number) => {
        setActiveTab(TABS[index]);
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };

    const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        if (index >= 0 && index < TABS.length) {
            setActiveTab(TABS[index]);
        }
    };

    // --- Render Functions ---

    const renderFollowTab = () => (
        <View style={{ width, flex: 1 }}>
            <FlatList
                data={filteredPosts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {/* Header */}
                        <View style={styles.cardHeader}>
                            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                            <View>
                                <Text style={styles.username}>{item.user.name}</Text>
                                <Text style={styles.userRole}>Shared an update</Text>
                            </View>
                            <TouchableOpacity style={{ marginLeft: 'auto' }}>
                                <FontAwesome name="ellipsis-h" size={20} color="#999" />
                            </TouchableOpacity>
                        </View>

                        {/* Main Image Container */}
                        <View>
                            <Image source={{ uri: item.image }} style={styles.postImage} />
                            {/* Hotspots */}
                            {item.products.map(prod => (
                                <TouchableOpacity
                                    key={prod.id}
                                    style={[styles.hotspot, { left: `${prod.x}%`, top: `${prod.y}%` }]}
                                    onPress={() => router.push(`/product/${prod.id}` as any)}
                                >
                                    <View style={styles.hotspotInner} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Actions */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.actionBtn}>
                                <FontAwesome name={item.liked ? "heart" : "heart-o"} size={22} color={item.liked ? "#e91e63" : "#333"} />
                                <Text style={styles.likesText}>{item.likes}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn}>
                                <FontAwesome name="comment-o" size={22} color="#333" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn}>
                                <FontAwesome name="share-square-o" size={22} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Description */}
                        <Text style={styles.description}>
                            <Text style={styles.boldName}>{item.user.name} </Text>
                            {item.description}
                        </Text>

                        {/* Shop The Look */}
                        {item.products.length > 0 && (
                            <View style={styles.shopContainer}>
                                <Text style={styles.shopTitle}>Shop this look</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shopScroll}>
                                    {item.products.map(prod => (
                                        <TouchableOpacity key={prod.id} style={styles.productChip} onPress={() => router.push(`/product/${prod.id}` as any)}>
                                            <Image source={{ uri: prod.image }} style={styles.prodImage} />
                                            <View>
                                                <Text style={styles.prodName}>{prod.name}</Text>
                                                <Text style={styles.prodPrice}>${prod.price}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.addCartBtn}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    addToCart({
                                                        id: prod.id,
                                                        title: prod.name,
                                                        price: prod.price,
                                                        imageUri: prod.image,
                                                        description: '',
                                                        merchantId: 'm1',
                                                        merchantName: 'IKEA'
                                                    });
                                                }}
                                            >
                                                <FontAwesome name="plus" size={10} color="#fff" />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );

    const renderExploreTab = () => (
        <View style={{ width, flex: 1 }}>
            <ScrollView contentContainerStyle={styles.exploreContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.masonryRow}>
                    <View style={styles.masonryCol}>
                        {MOCK_EXPLORE.filter((_, i) => i % 2 === 0).map((img, i) => (
                            <TouchableOpacity key={`l-${i}`} style={styles.exploreItem}>
                                <Image source={{ uri: img }} style={[styles.exploreImage, { height: i % 2 === 0 ? 200 : 260 }]} />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.masonryCol}>
                        {MOCK_EXPLORE.filter((_, i) => i % 2 !== 0).map((img, i) => (
                            <TouchableOpacity key={`r-${i}`} style={styles.exploreItem}>
                                <Image source={{ uri: img }} style={[styles.exploreImage, { height: i % 2 === 0 ? 250 : 180 }]} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );

    const renderMarketplaceTab = () => (
        <View style={{ width, flex: 1 }}>
            <ScrollView contentContainerStyle={styles.marketplaceContainer} showsVerticalScrollIndicator={false}>
                {/* Featured Section */}
                <View style={styles.mpSection}>
                    <View style={styles.mpSectionHeader}>
                        <Text style={styles.mpSectionTitle}>Top Designers</Text>
                        <TouchableOpacity><Text style={styles.mpSeeAll}>See All</Text></TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                        {filteredUsers.filter(u => u.role === 'Designer').map(user => (
                            <View key={user.id} style={styles.userCard}>
                                <Image source={{ uri: user.avatar }} style={styles.userAvatarLarge} />
                                <Text style={styles.userNameLarge}>{user.name}</Text>
                                <View style={styles.ratingBadge}>
                                    <FontAwesome name="star" size={10} color="#FFD700" />
                                    <Text style={styles.ratingText}>{user.rating}</Text>
                                </View>
                                <TouchableOpacity style={styles.followBtnSm}>
                                    <Text style={styles.followBtnText}>Follow</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Sellers Section */}
                <View style={styles.mpSection}>
                    <View style={styles.mpSectionHeader}>
                        <Text style={styles.mpSectionTitle}>Verified Sellers</Text>
                        <TouchableOpacity><Text style={styles.mpSeeAll}>See All</Text></TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                        {filteredUsers.filter(u => u.role === 'Seller').map(user => (
                            <View key={user.id} style={styles.sellerCard}>
                                <Image source={{ uri: user.avatar }} style={styles.sellerCover} />
                                <View style={styles.sellerInfo}>
                                    <Text style={styles.sellerName}>{user.name}</Text>
                                    <Text style={styles.sellerType}>Furniture & Decor</Text>
                                    <TouchableOpacity style={styles.visitBtn}>
                                        <Text style={styles.visitBtnText}>Visit Store</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Categories */}
                <View style={styles.mpSection}>
                    <Text style={styles.mpSectionTitle}>Categories</Text>
                    <View style={styles.catGrid}>
                        {['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Outdoor', 'Lighting'].map((cat, i) => (
                            <TouchableOpacity key={i} style={styles.catCard}>
                                <View style={styles.catIconCircle}>
                                    <FontAwesome name="circle" size={10} color="#333" />
                                </View>
                                <Text style={styles.catName}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                headerLeft: () => null, // Explicitly hide left header to prevent phantom text
                headerTitle: () => (
                    isSearching ? (
                        <View style={styles.searchHeader}>
                            <FontAwesome name="search" size={16} color="#999" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search community..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                        </View>
                    ) : (
                        <Text style={styles.headerTitle}>Community</Text>
                    )
                ),
                headerTitleAlign: 'left',
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => {
                            if (isSearching) {
                                setIsSearching(false);
                                setSearchQuery('');
                            } else {
                                setIsSearching(true);
                            }
                        }}
                        style={{ marginRight: 15 }}
                    >
                        <FontAwesome name={isSearching ? "times" : "search"} size={22} color="#111" />
                    </TouchableOpacity>
                ),
                headerShadowVisible: false,
                headerStyle: { backgroundColor: '#fff' }
            }} />

            {/* Custom Tab Bar */}
            <View style={styles.tabBar}>
                {TABS.map((tab, index) => {
                    const isActive = activeTab === tab;
                    return (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabItem, isActive && styles.tabItemActive]}
                            onPress={() => handleTabPress(index)}
                        >
                            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                            {isActive && <View style={styles.activeIndicator} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Swipeable Content Area */}
            <FlatList
                ref={flatListRef}
                data={TABS}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item}
                renderItem={({ item }) => {
                    if (item === 'follow') return renderFollowTab();
                    if (item === 'explore') return renderExploreTab();
                    return renderMarketplaceTab();
                }}
                onMomentumScrollEnd={onMomentumScrollEnd}
                scrollEventThrottle={16}
                initialScrollIndex={TABS.indexOf(activeTab)} // Note: This might need onLayout workaround if initial index is not 0
                getItemLayout={(data, index) => (
                    { length: width, offset: width * index, index }
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111', fontFamily: 'SpaceMono', marginLeft: 10 },

    // Search Header
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 36,
        width: Platform.OS === 'ios' ? width * 0.78 : width * 0.75, // Adjust width based on OS/Space
        marginBottom: 2
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#111' },

    // Tabs
    tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
    tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
    tabItemActive: {},
    tabText: { fontSize: 14, fontWeight: '600', color: '#999' },
    tabTextActive: { color: '#111' },
    activeIndicator: { position: 'absolute', bottom: 0, height: 2, width: 40, backgroundColor: '#111' },

    // Feed / Follow Styles
    list: { paddingBottom: 20 },
    card: { backgroundColor: '#fff', marginBottom: 15, paddingBottom: 10 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    username: { fontWeight: '700', fontSize: 15, color: '#111' },
    userRole: { fontSize: 11, color: '#666' },
    postImage: { width: '100%', height: 400, backgroundColor: '#eee' },

    // Hotspots
    hotspot: {
        position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4,
        elevation: 5, marginLeft: -12, marginTop: -12,
    },
    hotspotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#111' },

    actionRow: { flexDirection: 'row', padding: 12, alignItems: 'center' },
    actionBtn: { flexDirection: 'row', marginRight: 20, alignItems: 'center' },
    likesText: { marginLeft: 6, fontWeight: '600', fontSize: 13 },
    description: { paddingHorizontal: 15, paddingBottom: 15, lineHeight: 20, fontSize: 13, color: '#333' },
    boldName: { fontWeight: '700', color: '#111' },

    shopContainer: { paddingHorizontal: 15, marginBottom: 5 },
    shopTitle: { fontSize: 11, fontWeight: '700', color: '#111', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
    shopScroll: { paddingRight: 10 },
    productChip: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8,
        padding: 6, marginRight: 10, borderWidth: 1, borderColor: '#eee'
    },
    prodImage: { width: 30, height: 30, borderRadius: 4, marginRight: 8 },
    prodName: { fontSize: 12, fontWeight: '600' },
    prodPrice: { fontSize: 11, color: '#666' },
    addCartBtn: {
        marginLeft: 10, backgroundColor: '#111', width: 22, height: 22, borderRadius: 11,
        alignItems: 'center', justifyContent: 'center'
    },

    // Explore Styles
    exploreContainer: { padding: 5 },
    masonryRow: { flexDirection: 'row' },
    masonryCol: { flex: 1, paddingHorizontal: 5 },
    exploreItem: { marginBottom: 10, borderRadius: 12, overflow: 'hidden' },
    exploreImage: { width: '100%', backgroundColor: '#eee' },

    // Marketplace Styles
    marketplaceContainer: { paddingBottom: 30 },
    mpSection: { marginTop: 20, paddingHorizontal: 15 },
    mpSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    mpSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
    mpSeeAll: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
    horizontalList: { paddingRight: 15 },

    // User Card (Designers)
    userCard: { alignItems: 'center', marginRight: 20, width: 100 },
    userAvatarLarge: { width: 70, height: 70, borderRadius: 35, marginBottom: 8 },
    userNameLarge: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
    ratingText: { fontSize: 10, marginLeft: 3, fontWeight: 'bold' },
    followBtnSm: { backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    followBtnText: { color: '#fff', fontSize: 10, fontWeight: '600' },

    // Seller Card
    sellerCard: { width: 200, height: 160, marginRight: 15, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
    sellerCover: { width: '100%', height: 100, backgroundColor: '#eee' },
    sellerInfo: { padding: 10 },
    sellerName: { fontSize: 14, fontWeight: 'bold', color: '#111' },
    sellerType: { fontSize: 11, color: '#666', marginBottom: 5 },
    visitBtn: { alignSelf: 'flex-start' },
    visitBtnText: { fontSize: 11, fontWeight: '600', color: '#111', textDecorationLine: 'underline' },

    // Category Grid
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
    catCard: { width: (width - 40) / 2, backgroundColor: '#fff', padding: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
    catIconCircle: { width: 8, height: 8 }, // Just aesthetic dot
    catName: { marginLeft: 10, fontWeight: '600', color: '#333' },

    // Top Right Badge
    badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#000', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});
