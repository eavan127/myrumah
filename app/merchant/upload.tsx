import { addProduct } from '@/services/product';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function UploadScreen() {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState('https://via.placeholder.com/150');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleUpload = async () => {
        setIsSubmitting(true);
        try {
            await addProduct({
                title,
                price,
                description,
                imageUri,
                merchantId: 'merchant_1' // Mock merchant ID
            });
            router.back();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Add New Item' }} />

            <Text style={styles.label}>Product Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="E.g. STRANDMON" />

            <Text style={styles.label}>Price ($)</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="299" />

            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline placeholder="Describe product..." />

            <Text style={styles.label}>Image URL (Mock)</Text>
            <TextInput style={styles.input} value={imageUri} onChangeText={setImageUri} />

            <TouchableOpacity style={styles.button} onPress={handleUpload} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Upload Item</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    label: { fontWeight: 'bold', marginBottom: 5 },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        fontSize: 16
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    button: {
        backgroundColor: '#0058a3',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center'
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
