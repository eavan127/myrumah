import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const features = [
    {
        id: 'scan',
        title: 'Scene Scanner',
        description: 'Digitize your room',
        icon: 'camera',
        route: '/studio/scan'
    },
    {
        id: 'eraser',
        title: 'Magic Eraser',
        description: 'Clean up objects',
        icon: 'eraser',
        route: '/studio/eraser'
    },
    {
        id: 'place',
        title: 'Virtual Place',
        description: 'Try before you buy',
        icon: 'cube',
        route: '/studio/place'
    },
    {
        id: 'ai',
        title: 'AI Architect',
        description: 'Generate concepts',
        icon: 'magic',
        route: '/studio/ai-design'
    },
    {
        id: 'human',
        title: 'Manpower Design',
        description: 'Hire expert designers',
        icon: 'user',
        route: '/studio/hire'
    }
];


export default function StudioHub() {
    const router = useRouter();

    return (
        <View style={styles.mainContainer}>
            <Stack.Screen options={{
                headerShown: true,
                title: '',
                headerLeft: () => <Text style={styles.headerTitle}>Studio</Text>,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: '#fff' }
            }} />

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerSubtitle}>Studio Tools</Text>
                    <Text style={styles.headerDesc}>Advanced AI & AR tools to visualize your perfect home design.</Text>
                </View>

                <View style={styles.grid}>
                    {features.map((feature) => (
                        <TouchableOpacity
                            key={feature.id}
                            style={styles.card}
                            onPress={() => router.push(feature.route as any)}
                        >
                            <View style={styles.iconContainer}>
                                <FontAwesome name={feature.icon as any} size={28} color="#111" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.cardTitle}>{feature.title}</Text>
                                <Text style={styles.cardDesc}>{feature.description}</Text>
                            </View>
                            <FontAwesome name="arrow-right" size={14} color="#ccc" style={{ marginTop: 15 }} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    scrollContent: { paddingBottom: 20 },

    header: { paddingHorizontal: 20, paddingVertical: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', fontFamily: 'SpaceMono', marginLeft: 10, color: '#111' },
    headerSubtitle: { fontSize: 13, fontWeight: '600', color: '#111', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
    headerDesc: { fontSize: 28, fontWeight: '300', color: '#111', lineHeight: 36 },

    grid: { padding: 15, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: {
        width: '48%',
        backgroundColor: '#F9F9F9',
        marginBottom: 15,
        padding: 20,
        borderRadius: 20,
        height: 180,
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
    },
    textContainer: { marginTop: 10 },
    cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#111', marginBottom: 4 },
    cardDesc: { fontSize: 12, color: '#666', lineHeight: 16 }
});