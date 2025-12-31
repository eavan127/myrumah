
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Designer = {
    id: string;
    name: string;
    title: string;
    exp: string;
    avatar: string;
    bio: string;
    portfolio: string[];
    rate: string;
    tags: string[];
    priceVal: number; // Hourly rate in number
    expYears: number; // Years of experience
};

const DESIGNERS: Designer[] = [
    {
        id: '1',
        name: 'Sarah Jenkins',
        title: 'Senior Interior Architect',
        exp: '8 Years Experience',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop',
        bio: 'Specializing in minimalist luxury and sustainable living spaces. I believe in calm, functional homes.',
        rate: '$150/hr',
        tags: ['Living Room', 'Bedroom', 'Minimalist'],
        priceVal: 150,
        expYears: 8,
        portfolio: [
            'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1974&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2666&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop'
        ]
    },
    {
        id: '2',
        name: 'David Chen',
        title: 'Modernist Designer',
        exp: '12 Years Experience',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop',
        bio: 'Award-winning designer focused on bold structures and industrial chic aesthetics.',
        rate: '$200/hr',
        tags: ['Office', 'Kitchen', 'Modern'],
        priceVal: 200,
        expYears: 12,
        portfolio: [
            'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1974&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1600566752355-35792bedcfe1?q=80&w=2070&auto=format&fit=crop'
        ]
    },
    {
        id: '3',
        name: 'Elena Rodriguez',
        title: 'Space Planner',
        exp: '5 Years Experience',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop',
        bio: 'Expert in maximizing small spaces and creating cozy, functional studio apartments.',
        rate: '$120/hr',
        tags: ['Studio', 'Bedroom', 'Cozy'],
        priceVal: 120,
        expYears: 5,
        portfolio: [
            'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1595855709915-4deb4be88e94?q=80&w=2656&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop'
        ]
    }
];

const FILTER_TYPES = ['All', 'Living Room', 'Bedroom', 'Kitchen', 'Office', 'Studio'];

export default function HireDesignerScreen() {
    const router = useRouter();
    const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Advanced Filters State
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]); // Max 300
    const [minExp, setMinExp] = useState(0);

    const filteredDesigners = DESIGNERS.filter(d => {
        const matchesType = activeFilter === 'All' || d.tags.includes(activeFilter);
        const matchesPrice = d.priceVal >= priceRange[0] && d.priceVal <= priceRange[1];
        const matchesExp = d.expYears >= minExp;
        return matchesType && matchesPrice && matchesExp;
    });

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <FontAwesome name="arrow-left" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Find a Designer</Text>
                <TouchableOpacity onPress={() => setShowAdvancedFilters(true)} style={styles.filterToggle}>
                    <FontAwesome name="sliders" size={20} color="#111" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.pageTitle}>Expert Manpower</Text>
                <Text style={styles.pageSubtitle}>Hire top-tier talent for your dream home.</Text>

                {/* Filters */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {FILTER_TYPES.map(filter => (
                            <TouchableOpacity
                                key={filter}
                                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Designer List */}
                <View style={styles.list}>
                    {filteredDesigners.length > 0 ? (
                        filteredDesigners.map(d => (
                            <TouchableOpacity key={d.id} style={styles.card} onPress={() => setSelectedDesigner(d)}>
                                <View style={styles.cardHeader}>
                                    <Image source={{ uri: d.avatar }} style={styles.avatar} />
                                    <View style={styles.info}>
                                        <Text style={styles.name}>{d.name}</Text>
                                        <Text style={styles.title}>{d.title}</Text>
                                        <View style={styles.tagRow}>
                                            {d.tags.slice(0, 2).map((t, i) => (
                                                <Text key={i} style={styles.tag}>{t}</Text>
                                            ))}
                                        </View>
                                    </View>
                                    <View style={styles.rateBadge}>
                                        <Text style={styles.rateText}>{d.rate}</Text>
                                    </View>
                                </View>
                                <View style={styles.previewRow}>
                                    {d.portfolio.slice(0, 3).map((img, i) => (
                                        <Image key={i} source={{ uri: img }} style={styles.previewImg} />
                                    ))}
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <FontAwesome name="search-minus" size={40} color="#eee" style={{ marginBottom: 15 }} />
                            <Text style={styles.emptyText}>No designers match your filters.</Text>
                            <TouchableOpacity onPress={() => { setActiveFilter('All'); setPriceRange([0, 300]); setMinExp(0); }}>
                                <Text style={styles.resetText}>Reset All Filters</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Profile Modal */}
            <Modal visible={!!selectedDesigner} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContent}>
                    {selectedDesigner && (
                        <>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setSelectedDesigner(null)} style={styles.closeBtn}>
                                    <FontAwesome name="times" size={20} color="#111" />
                                </TouchableOpacity>
                                <Text style={styles.modalHeaderTitle}>Profile</Text>
                                <View style={{ width: 40 }} />
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.profileHero}>
                                    <Image source={{ uri: selectedDesigner.avatar }} style={styles.heroAvatar} />
                                    <Text style={styles.heroName}>{selectedDesigner.name}</Text>
                                    <Text style={styles.heroTitle}>{selectedDesigner.title} • {selectedDesigner.exp}</Text>
                                    <View style={styles.heroTags}>
                                        {selectedDesigner.tags.map(t => (
                                            <View key={t} style={styles.heroTagBadge}><Text style={styles.heroTagText}>{t}</Text></View>
                                        ))}
                                    </View>
                                    <Text style={styles.heroBio}>{selectedDesigner.bio}</Text>
                                </View>

                                <Text style={styles.sectionTitle}>Past Designs</Text>
                                <View style={styles.portfolioGrid}>
                                    {selectedDesigner.portfolio.map((img, i) => (
                                        <Image key={i} source={{ uri: img }} style={styles.portfolioImg} />
                                    ))}
                                </View>

                                <View style={{ height: 100 }} />
                            </ScrollView>

                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.hireBtn} onPress={() => {
                                    setSelectedDesigner(null);
                                    router.back();
                                }}>
                                    <Text style={styles.hireText}>Contact {selectedDesigner.name.split(' ')[0]}</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </Modal>

            {/* Filter Modal */}
            <Modal visible={showAdvancedFilters} animationType="slide" transparent={true}>
                <View style={styles.filterModalOverlay}>
                    <View style={styles.filterModalBox}>
                        <View style={styles.filterHeader}>
                            <Text style={styles.filterTitle}>Filter Designers</Text>
                            <TouchableOpacity onPress={() => setShowAdvancedFilters(false)}>
                                <FontAwesome name="times" size={20} color="#111" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Hourly Rate (Max: ${priceRange[1]})</Text>
                            <View style={styles.optionRow}>
                                {[100, 150, 200, 300].map(p => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[styles.optionChip, priceRange[1] === p && styles.optionChipActive]}
                                        onPress={() => setPriceRange([0, p])}
                                    >
                                        <Text style={[styles.optionText, priceRange[1] === p && styles.optionTextActive]}>{'< $' + p}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Experience Level</Text>
                            <View style={styles.optionRow}>
                                {[0, 5, 10].map(exp => (
                                    <TouchableOpacity
                                        key={exp}
                                        style={[styles.optionChip, minExp === exp && styles.optionChipActive]}
                                        onPress={() => setMinExp(exp)}
                                    >
                                        <Text style={[styles.optionText, minExp === exp && styles.optionTextActive]}>{exp === 0 ? 'Any' : `${exp}+ Years`}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.applyBtn} onPress={() => setShowAdvancedFilters(false)}>
                            <Text style={styles.applyText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 16, fontWeight: 'bold', fontFamily: 'SpaceMono' },
    filterToggle: { padding: 5 },

    scroll: { paddingHorizontal: 20, paddingBottom: 40 },
    pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 5, fontFamily: 'SpaceMono' },
    pageSubtitle: { fontSize: 16, color: '#666', marginBottom: 20 },

    filterContainer: { marginBottom: 25 },
    filterChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, backgroundColor: '#fff', marginRight: 10, borderWidth: 1, borderColor: '#eee' },
    filterChipActive: { backgroundColor: '#111', borderColor: '#111' },
    filterText: { fontWeight: '600', color: '#666' },
    filterTextActive: { color: '#fff' },

    list: {},
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
    info: { flex: 1 },
    name: { fontSize: 18, fontWeight: 'bold', color: '#111' },
    title: { fontSize: 14, color: '#666' },
    tagRow: { flexDirection: 'row', marginTop: 5 },
    tag: { fontSize: 11, color: '#999', marginRight: 8, backgroundColor: '#f2f2f2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },

    exp: { fontSize: 12, color: '#999', marginTop: 2 },
    rateBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    rateText: { fontWeight: 'bold', fontSize: 12 },

    previewRow: { flexDirection: 'row', justifyContent: 'space-between' },
    previewImg: { width: '31%', height: 80, borderRadius: 10, backgroundColor: '#eee' },

    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#999', fontSize: 16, marginBottom: 10 },
    resetText: { color: '#111', fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' },

    // Modal
    modalContent: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    closeBtn: { padding: 5 },
    modalHeaderTitle: { fontSize: 16, fontWeight: 'bold' },

    profileHero: { padding: 30, alignItems: 'center' },
    heroAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
    heroName: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 5 },
    heroTitle: { fontSize: 14, color: '#666', marginBottom: 15 },
    heroTags: { flexDirection: 'row', marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
    heroTagBadge: { backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, margin: 4 },
    heroTagText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    heroBio: { fontSize: 14, color: '#444', textAlign: 'center', lineHeight: 22 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 15 },
    portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15 },
    portfolioImg: { width: '46%', height: 180, margin: '2%', borderRadius: 15, backgroundColor: '#eee' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    hireBtn: { backgroundColor: '#111', padding: 18, borderRadius: 30, alignItems: 'center' },
    hireText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // Filter Modal
    filterModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    filterModalBox: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, minHeight: 400 },
    filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    filterTitle: { fontSize: 20, fontWeight: 'bold', fontFamily: 'SpaceMono' },
    filterSection: { marginBottom: 25 },
    filterLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap' },
    optionChip: { borderWidth: 1, borderColor: '#eee', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, marginRight: 10, marginBottom: 10 },
    optionChipActive: { backgroundColor: '#111', borderColor: '#111' },
    optionText: { color: '#333' },
    optionTextActive: { color: '#fff' },
    applyBtn: { backgroundColor: '#111', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 10 },
    applyText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});