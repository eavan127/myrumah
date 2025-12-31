
import { useAuth } from '@/components/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Minimalist\nFurniture',
        desc: 'Curated pieces for your calm sanctuary.',
        image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=2158&auto=format&fit=crop'
    },
    {
        id: '2',
        title: 'AI Architect\nDesign',
        desc: 'Snap a photo. Let our AI reimagine your space instantly.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: '3',
        title: 'Expert\nManpower',
        desc: 'Hire top-tier designers to bring your vision to life.',
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2666&auto=format&fit=crop'
    },
    {
        id: '4',
        title: 'AR Vision\nReality',
        desc: 'Test furniture in your room before you buy.',
        image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2070&auto=format&fit=crop'
    },
    {
        id: '5',
        title: 'More Merchants\nMore Choice',
        desc: 'Shop from a wide variety of trusted global brands.',
        image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=2158&auto=format&fit=crop'
    }
];

export default function LoginScreen() {
    const { signIn, isLoading } = useAuth();
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleLogin = async () => {
        await signIn('user');
        router.replace('/(tabs)');
    };

    const handleNext = () => {
        if (activeIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
        } else {
            handleLogin();
        }
    };

    const onMomentumScrollEnd = (e: any) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
    };

    const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
        <ImageBackground
            source={{ uri: item.image }}
            style={{ width, height, flex: 1 }}
            resizeMode="cover"
        >
            {/* Dark Gradient Overlay for text visibility */}
            <View style={styles.overlay} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.desc}>{item.desc}</Text>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={item => item.id}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onMomentumScrollEnd}
                bounces={false}
            />

            {/* Floating Bottom Controls */}
            <View style={styles.bottomControls}>
                <View style={styles.pagination}>
                    {SLIDES.map((_, i) => (
                        <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={handleNext}
                    disabled={isLoading}
                >
                    {isLoading && activeIndex === SLIDES.length - 1 ? (
                        <ActivityIndicator color="#111" />
                    ) : (
                        <FontAwesome name={activeIndex === SLIDES.length - 1 ? "check" : "chevron-right"} size={20} color="#111" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },

    safeArea: { flex: 1, justifyContent: 'flex-end', paddingBottom: 120 }, // Leave space for bottom controls

    contentContainer: { paddingHorizontal: 30 },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: 'SpaceMono',
        lineHeight: 50,
        marginBottom: 10,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    desc: {
        fontSize: 18,
        color: '#eee',
        lineHeight: 26,
        maxWidth: '80%',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5,
    },

    bottomControls: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        paddingHorizontal: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    pagination: { flexDirection: 'row', gap: 8 },
    dot: { width: 8, height: 8, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4 },
    dotActive: { width: 24, height: 8, backgroundColor: '#fff', borderRadius: 4 },

    nextBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    }
});
