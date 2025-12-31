
import { CartItem, useCart } from '@/context/CartContext';
import { Product } from '@/services/product';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { GoogleGenAI } from "@google/genai";
// @ts-ignore
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* Mock "My House" Images */
const MY_ROOMS = [
    { id: '1', title: 'Living Room', uri: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1974&auto=format&fit=crop' },
    { id: '2', title: 'Master Bedroom', uri: 'https://images.unsplash.com/photo-1616594039964-40891a909d99?q=80&w=1974&auto=format&fit=crop' },
    { id: '3', title: 'Kitchen', uri: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1740&auto=format&fit=crop' },
    { id: '4', title: 'Dining Room', uri: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1932&auto=format&fit=crop' },
    { id: '5', title: 'Home Office', uri: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?q=80&w=1740&auto=format&fit=crop' },
    { id: '6', title: 'Bathroom', uri: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=1740&auto=format&fit=crop' },
    { id: '7', title: 'Balcony', uri: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=1740&auto=format&fit=crop' },
    { id: '8', title: 'Kids Room', uri: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=1740&auto=format&fit=crop' },
    { id: '9', title: 'Floor Plan', uri: 'https://images.unsplash.com/photo-1580820267682-426da823b514?q=80&w=1974&auto=format&fit=crop' },
];

/* Extended Product Type for Hotspots */
interface SuggestedProduct extends Product {
    x?: number;
    y?: number;
}

/* Mock Suggested Products */
const mockSuggestedItems: SuggestedProduct[] = [
    {
        id: '1',
        title: 'STRANDMON',
        price: '299',
        imageUri: 'https://www.ikea.com/ext/ingkadam/m/51e3328fccbc5692/original/PH170562-crop001.jpg?f=xs',
        merchantId: 'merchant_1',
        description: 'Wing chair',
        merchantName: 'Season Flagship',
        x: 35, // 35% from left
        y: 60  // 60% from top
    },
    {
        id: '2',
        title: 'BILLY',
        price: '49',
        imageUri: 'https://www.ikea.com/ext/ingkadam/m/17a7e32d3d0f048d/original/PH196720-crop001.jpg?f=xs',
        merchantId: 'merchant_1',
        description: 'Bookcase',
        merchantName: 'Season Flagship',
        x: 75,
        y: 40
    },
];

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    imageUri?: string;
    suggestedItems?: SuggestedProduct[];
    cartDetails?: { items: CartItem[], total: number };
    isLoading?: boolean;
}

/* Mock History Data */
const MOCK_HISTORY: { id: string; date: string; title: string; preview: string; messages: Message[] }[] = [
    {
        id: 'h1', date: 'Today, 10:23 AM', title: 'Modern Living Room Refresh', preview: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=200&auto=format&fit=crop',
        messages: [
            { id: '1', text: 'I want to make my living room look more modern. Can you help?', sender: 'user' },
            { id: '2', text: 'Absolutely! Do you have a photo of your current space?', sender: 'ai' },
            { id: '3', text: 'Here it is.', sender: 'user', imageUri: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=200' },
            { id: '4', text: 'Here is a bold new concept for your space.', sender: 'ai', imageUri: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=500', suggestedItems: mockSuggestedItems }
        ]
    },
    {
        id: 'h2', date: 'Yesterday', title: 'Cozy Bedroom Idea', preview: 'https://images.unsplash.com/photo-1616594039964-40891a909d99?q=80&w=200&auto=format&fit=crop',
        messages: [
            { id: '1', text: 'I need ideas for a cozy bedroom.', sender: 'user' },
            { id: '2', text: 'I can help with that. What colors do you like?', sender: 'ai' }
        ]
    },
    {
        id: 'h3', date: 'Dec 18', title: 'Kitchen Renovation', preview: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=200&auto=format&fit=crop',
        messages: [
            { id: '1', text: 'Planning a kitchen renovation.', sender: 'user' },
            { id: '2', text: 'Exciting!', sender: 'ai' }
        ]
    },
    {
        id: 'h4', date: 'Dec 15', title: 'Balcony Greenery', preview: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=200&auto=format&fit=crop',
        messages: [
            { id: '1', text: 'How do I add more plants to my balcony?', sender: 'user' },
            { id: '2', text: 'Vertical gardens are a great option.', sender: 'ai' }
        ]
    },
];

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export default function AIDesignScreen() {
    const { addToCart, itemCount, items: currentCartItems } = useCart();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'I am your AI Architect. Share a photo of your room, and I will redesign it.', sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    const [showRoomPicker, setShowRoomPicker] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const handleShare = async () => {
        if (!fullScreenImage) return;
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Sharing not available", "Sharing is not available on this device");
            return;
        }
        await Sharing.shareAsync(fullScreenImage);
    };

    const pickImage = async () => {
        // @ts-ignore - MediaType.Images is correct per warning, but types might be outdated
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fallback to Options if MediaType fails type check, but let's heed warning
            allowsEditing: true,
            quality: 0.5,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const loadSession = (sessionMessages: Message[]) => {
        setMessages(sessionMessages);
        setShowHistory(false);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    };

    const handleAddCart = (product: SuggestedProduct) => {
        // 1. Add to context
        addToCart(product);

        // 2. Calculate new totals (Estimating locally as context update is async)
        // Check if item already exists to update quantity vs adding new item logic
        // For simplicity in this mock/demo, assuming we just add price to total and increment count
        // In a real app, reading directly from Updated Context via a callback would be better, 
        // but here we estimate for immediate UI feedback.

        let currentTotal = currentCartItems.reduce((sum, item) => sum + (itemsPrice(item)), 0);
        const productPrice = parseFloat(product.price.replace('$', ''));

        // Helper to handle string price issues if any
        function itemsPrice(item: CartItem) {
            const p = parseFloat(item.price.replace('$', ''));
            return p * item.quantity;
        }

        const newTotal = currentTotal + productPrice;
        const newCount = itemCount + 1;

        // 3. Add AI Response
        const feedbackMsg: Message = {
            id: Date.now().toString(),
            text: `Added ${product.title}`,
            sender: 'ai',
            imageUri: product.imageUri,
            cartDetails: { items: [], total: newTotal }
        };

        setMessages(prev => [...prev, feedbackMsg]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    };

    const sendMessage = async () => {
        if (!input.trim() && !selectedImage) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            imageUri: selectedImage || undefined
        };

        const loadingMsg: Message = {
            id: 'loading',
            text: '',
            sender: 'ai',
            isLoading: true
        };

        setMessages(prev => [...prev, userMsg, loadingMsg]);
        setInput('');
        setSelectedImage(null);
        setIsGenerating(true);

        // Scroll to bottom immediately
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

        try {
            let content: any = [{ text: input || "Redesign this room" }];

            if (userMsg.imageUri) {
                let base64;
                if (userMsg.imageUri!.startsWith('http')) {
                    // Download remote image first
                    const fileUri = FileSystem.cacheDirectory + 'temp_image.jpg';
                    await FileSystem.downloadAsync(userMsg.imageUri!, fileUri);
                    base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
                } else {
                    // Local file
                    base64 = await FileSystem.readAsStringAsync(userMsg.imageUri!, { encoding: 'base64' });
                }

                content.push({
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64
                    }
                });
            }

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-image",
                contents: content,
            });

            let imageUri = null;
            // @ts-ignore
            if (response.candidates?.[0]?.content?.parts) {
                // @ts-ignore
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64 = part.inlineData.data;
                        const filename = `gen_${Date.now()}.png`;
                        if (FileSystem.documentDirectory) {
                            const uri = FileSystem.documentDirectory + filename;
                            await FileSystem.writeAsStringAsync(uri, base64!, { encoding: 'base64' });
                            imageUri = uri;
                        }
                    }
                }
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: imageUri ? "Here is a bold new concept for your space." : "I couldn't generate an image. Try again?",
                sender: 'ai',
                imageUri: imageUri || undefined,
                suggestedItems: imageUri ? mockSuggestedItems : undefined
            };

            // Remove loading message and add AI message
            setMessages(prev => prev.filter(m => m.id !== 'loading').concat(aiMsg));

        } catch (error: any) {
            console.error(error);
            setMessages(prev => prev.filter(m => m.id !== 'loading').concat({ id: Date.now().toString(), text: `Sorry, error: ${error.message}`, sender: 'ai' }));
        } finally {
            setIsGenerating(false);
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        }
    };

    const renderItem = ({ item }: { item: Message }) => {
        // Specialized render for Cart Feedback
        if (item.cartDetails && item.imageUri && item.sender === 'ai') {
            return (
                <View style={[styles.bubbleWrapper, { alignItems: 'flex-start' }]}>
                    <View style={[styles.bubble, styles.aiBubble, styles.cartFeedbackBubble]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <Image source={{ uri: item.imageUri || undefined }} style={styles.cartThumb} />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.cartTitleText}>{item.text}</Text>
                                <Text style={styles.cartTotalText}>Cart Total: ${item.cartDetails.total.toFixed(2)}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.viewCartBtn} onPress={() => router.push('/cart')}>
                            <Text style={styles.viewCartText}>View Cart</Text>
                            <FontAwesome name="arrow-right" size={12} color="#fff" style={{ marginLeft: 5 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.bubbleWrapper, item.sender === 'user' ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
                <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                    {item.isLoading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <ActivityIndicator size="small" color="#666" />
                            <Text style={{ color: '#666', fontStyle: 'italic' }}>Designing...</Text>
                        </View>
                    ) : (
                        <>
                            {item.imageUri && item.sender === 'user' && (
                                <Image source={{ uri: item.imageUri || undefined }} style={styles.userImage} />
                            )}
                            {item.text ? <Text style={[styles.text, item.sender === 'user' ? styles.userText : styles.aiText]}>{item.text}</Text> : null}

                            {/* AI Result Image */}
                            {item.sender === 'ai' && item.imageUri && (
                                <View>
                                    <TouchableOpacity onPress={() => setFullScreenImage(item.imageUri!)} style={styles.resultContainer}>
                                        <Image source={{ uri: item.imageUri }} style={styles.resultImage} />
                                        <View style={styles.resultBadge}>
                                            <FontAwesome name="magic" size={12} color="#fff" />
                                            <Text style={styles.resultBadgeText}>AI Generated</Text>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Hotspots */}
                                    {item.suggestedItems?.map((prod, i) => (
                                        prod.x && prod.y ? (
                                            <View
                                                key={`hotspot-${i}`}
                                                style={[styles.hotspot, { left: `${prod.x}%`, top: `${prod.y}%` }]}
                                            >
                                                <View style={styles.hotspotInner} />
                                            </View>
                                        ) : null
                                    ))}
                                </View>
                            )}

                            {/* Suggestions */}
                            {item.suggestedItems && (
                                <View style={styles.suggestions}>
                                    <Text style={styles.suggestionTitle}>Shop the Look</Text>
                                    <View style={{ height: 180 }}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {item.suggestedItems.map(prod => (
                                                <TouchableOpacity key={prod.id} style={styles.prodCard} onPress={() => router.push(`/product/${prod.id}` as any)}>
                                                    <Image source={{ uri: prod.imageUri }} style={styles.prodImage} />
                                                    <View>
                                                        <Text style={styles.prodPrice}>${prod.price}</Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={styles.addCartBtn}
                                                        onPress={(e) => {
                                                            e.stopPropagation(); // Prevent card tap
                                                            handleAddCart(prod);
                                                        }}
                                                    >
                                                        <FontAwesome name="plus" size={10} color="#fff" />
                                                    </TouchableOpacity>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </View>
        );

    }; // End renderItem

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <FontAwesome name="arrow-left" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI Architect</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setShowHistory(true)} style={{ marginRight: 5 }}>
                        <FontAwesome name="history" size={20} color="#111" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            {/* Image Preview */}
            {selectedImage && (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: selectedImage || undefined }} style={styles.miniPreview} />
                    <TouchableOpacity style={styles.closePreview} onPress={() => setSelectedImage(null)}>
                        <FontAwesome name="times" size={12} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Input */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <TouchableOpacity style={styles.attachBtn} onPress={() => setShowRoomPicker(true)}>
                        <FontAwesome name="home" size={20} color="#111" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
                        <FontAwesome name="image" size={20} color="#666" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Describe changes..."
                        placeholderTextColor="#999"
                        value={input}
                        onChangeText={setInput}
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={isGenerating}>
                        <FontAwesome name="arrow-up" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* My Rooms Modal */}
            <Modal visible={showRoomPicker} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select from My House</Text>
                            <TouchableOpacity onPress={() => setShowRoomPicker(false)}>
                                <FontAwesome name="times" size={20} color="#111" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomsScroll}>
                            {MY_ROOMS.map(room => (
                                <TouchableOpacity key={room.id} style={styles.roomCard} onPress={() => {
                                    setSelectedImage(room.uri);
                                    setShowRoomPicker(false);
                                }}>
                                    <Image source={{ uri: room.uri }} style={styles.roomImage} />
                                    <Text style={styles.roomTitle}>{room.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* History Modal */}
            <Modal visible={showHistory} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Design History</Text>
                            <TouchableOpacity onPress={() => setShowHistory(false)}>
                                <FontAwesome name="times" size={20} color="#111" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {MOCK_HISTORY.map(session => (
                                <TouchableOpacity key={session.id} style={styles.historyItem} onPress={() => loadSession(session.messages)}>
                                    <Image source={{ uri: session.preview }} style={styles.historyImage} />
                                    <View style={styles.historyInfo}>
                                        <Text style={styles.historyTitle}>{session.title}</Text>
                                        <Text style={styles.historyDate}>{session.date}</Text>
                                    </View>
                                    <FontAwesome name="chevron-right" size={12} color="#ccc" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Full Screen Image Modal */}
            <Modal visible={!!fullScreenImage} transparent={true} animationType="fade">
                <View style={styles.fullScreenContainer}>
                    <TouchableOpacity style={styles.fsClose} onPress={() => setFullScreenImage(null)}>
                        <FontAwesome name="times" size={24} color="#fff" />
                    </TouchableOpacity>
                    {fullScreenImage && <Image source={{ uri: fullScreenImage }} style={styles.fsImage} resizeMode="contain" />}
                    <TouchableOpacity style={styles.fsShare} onPress={handleShare}>
                        <Text style={styles.fsShareText}>Share Design</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 16, fontWeight: 'bold', fontFamily: 'SpaceMono' },
    badge: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red' },

    list: { padding: 20 },
    bubbleWrapper: { marginBottom: 20, width: '100%' },
    bubble: { maxWidth: '85%', padding: 15, borderRadius: 20 },
    userBubble: { backgroundColor: '#111', borderBottomRightRadius: 4 },
    aiBubble: { backgroundColor: '#f5f5f5', borderBottomLeftRadius: 4 },
    text: { fontSize: 15, lineHeight: 22, flexShrink: 1 }, // Added flexShrink to text
    userText: { color: '#fff' },
    aiText: { color: '#111' },
    userImage: { width: 200, height: 150, borderRadius: 10, marginBottom: 10, backgroundColor: '#333' },

    resultContainer: { marginTop: 10, borderRadius: 15, overflow: 'hidden', position: 'relative' },
    resultImage: { width: 240, height: 240, backgroundColor: '#ddd' },
    resultBadge: { position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, alignItems: 'center' },
    resultBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 5 },

    // Hotspots
    hotspot: {
        position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4,
        elevation: 5, marginLeft: -10, marginTop: -10,
    },
    hotspotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#111' },

    suggestions: { marginTop: 15 },
    suggestionTitle: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 10 },
    prodCard: { width: 140, height: 160, marginRight: 10, backgroundColor: '#fff', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
    prodImage: { width: 120, height: 100, borderRadius: 8, backgroundColor: '#f5f5f5', marginBottom: 8 },
    prodPrice: { fontSize: 13, fontWeight: 'bold', color: '#111' },
    addCartBtn: { position: 'absolute', bottom: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },

    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, borderTopWidth: 1, borderTopColor: '#f5f5f5', backgroundColor: '#fff' },
    attachBtn: { padding: 10, marginRight: 5 },
    input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, fontSize: 16, marginRight: 10 },
    sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },

    previewContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#fff' },
    miniPreview: { width: 50, height: 50, borderRadius: 8 },
    closePreview: { position: 'absolute', top: 5, left: 65, backgroundColor: '#000', borderRadius: 10, padding: 2 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, minHeight: 250 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', fontFamily: 'SpaceMono' },
    roomsScroll: { flexDirection: 'row' },
    roomCard: { marginRight: 15, width: 140 },
    roomImage: { width: 140, height: 100, borderRadius: 12, backgroundColor: '#eee', marginBottom: 8 },
    roomTitle: { fontSize: 14, fontWeight: '500', color: '#111' },

    // History Items
    historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    historyImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
    historyInfo: { flex: 1 },
    historyTitle: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 4 },
    historyDate: { fontSize: 12, color: '#999' },

    // Full Screen
    fullScreenContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
    fsImage: { width: '100%', height: '80%' },
    fsClose: { position: 'absolute', top: 60, right: 30, padding: 10, zIndex: 10 },
    fsShare: { position: 'absolute', bottom: 60, alignSelf: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30 },
    fsShareText: { fontWeight: 'bold', fontSize: 16 },

    // Cart Feedback
    cartFeedbackBubble: { padding: 12, width: 220 }, // Fixed width for nice card look
    cartThumb: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#eee' },
    cartTitleText: { fontSize: 13, fontWeight: 'bold', color: '#111', marginBottom: 2 },
    cartTotalText: { fontSize: 12, color: '#666' },
    viewCartBtn: { backgroundColor: '#111', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, marginTop: 5 },
    viewCartText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});