import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EraserScreen() {
    const params = useLocalSearchParams();
    const imageUri = params.image as string;
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: 'Magic Eraser', headerRight: () => (
                    <TouchableOpacity onPress={() => router.push('/studio/place' as any)}>
                        <Text style={styles.nextParams}>Next</Text>
                    </TouchableOpacity>
                )
            }} />

            {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
            ) : (
                <View style={[styles.image, styles.placeholder]}>
                    <Text>No image selected</Text>
                </View>
            )}

            <View style={styles.tools}>
                <Text style={styles.hint}>Touch area to remove furniture (Mock)</Text>
                <TouchableOpacity style={styles.eraseBtn}>
                    <Text style={styles.btnText}>Erase Selection</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#333' },
    image: { flex: 1, width: '100%' },
    placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' },
    tools: { height: 100, backgroundColor: '#fff', padding: 20, alignItems: 'center' },
    hint: { marginBottom: 10, color: '#666' },
    eraseBtn: { backgroundColor: '#d93025', padding: 10, borderRadius: 20, width: 200, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' },
    nextParams: { color: '#0058a3', fontSize: 16, fontWeight: 'bold', marginRight: 10 }
});