// @ts-ignore
import { useCart } from '@/context/CartContext';
import { getProducts } from '@/services/product';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { OrbitControls } from '@react-three/drei/native';
import { Canvas, useLoader } from '@react-three/fiber';
import { Asset } from 'expo-asset';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import React, { Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as THREE from 'three';
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

const { width, height } = Dimensions.get('window');

// --- 3D Components ---

const MODEL_ASSETS: Record<string, any> = {
    'chair': require('../../assets/models/chair.obj'),
    'bed': require('../../assets/models/chair.obj'), // Placeholder (Bed.obj missing)
    'drawer': require('../../assets/models/chair.obj'), // Placeholder (Drawer.obj missing)
    // 'couch': require('../../assets/models/couch.obj'), // TOO LARGE (175MB) - Causes OOM
    'couch': require('../../assets/models/chair.obj'), // Temporary placeholder
    'table': require('../../assets/models/chair.obj'), // Placeholder (table.obj missing)
};

function FurnitureModel({ item, isSelected, onClick, onDragStart, onDrag, onDragEnd }: any) {
    const modelKey = item.model || 'chair';
    const modelAsset = Asset.fromModule(MODEL_ASSETS[modelKey] || MODEL_ASSETS['chair']);
    const obj = useLoader(OBJLoader, modelAsset.uri);

    useLayoutEffect(() => {
        obj.traverse((child: any) => {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
                    color: '#fdf1dc',
                    roughness: 0.6,
                    metalness: 0,
                });
                (child as THREE.Mesh).castShadow = true;
                (child as THREE.Mesh).receiveShadow = true;
            }
        });
    }, [obj]);

    const clonedObj = useMemo(() => obj.clone(), [obj]);

    // Determine scale based on model type if needed, or use a default
    // Using 0.05 as baseline from previous chair
    const scale = item.scale || 0.05;

    return (
        <group position={[item.x, 0, item.z]} rotation={[0, item.rotation, 0]} onClick={onClick}>
            <primitive object={clonedObj} scale={scale} />
            {isSelected && (
                <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[2, 2.1, 32]} />
                    <meshBasicMaterial color="#ffdb00" toneMapped={false} />
                </mesh>
            )}
        </group>
    );
}

function BillboardItem({ position, isSelected, onClick, imageUri }: any) {
    // Note: detailed implementation would use TextureLoader for specific imageUri
    // For prototype we keep generic white/yellow plane
    return (
        <mesh position={position} onClick={onClick}>
            <planeGeometry args={[2, 2]} />
            {isSelected ? (
                <meshBasicMaterial color="#ffbd00" side={THREE.DoubleSide} />
            ) : (
                <meshStandardMaterial color="#ddd" />
            )}
        </mesh>
    );
}

const DraggablePlane = ({ onMove, onUp }: { onMove: (pt: THREE.Vector3) => void, onUp: () => void }) => {
    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            visible={false}
            onPointerMove={(e) => onMove(e.point)}
            onPointerUp={onUp}
        >
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial transparent opacity={0} />
        </mesh>
    );
}

// --- Marketplace Data ---
const MARKETPLACE_DATA = [
    { id: 'm1', name: 'SKRUVBY', price: '69.99', desc: 'Side table, black-blue', image: 'https://www.ikea.com/ext/ingkadam/m/df91530939527063/original/PH188448-crop001.jpg?f=xs', type: '3d', model: 'table', scale: 0.05 },
    { id: 'm2', name: 'KALLAX', price: '109.99', desc: 'Shelving unit, black', image: 'https://www.ikea.com/ext/ingkadam/m/726673256958444f/original/PH192666-crop001.jpg?f=xs', type: '3d', model: 'drawer', scale: 0.05 },
    { id: 'm3', name: 'MORABO', price: '400.00', desc: 'Chaise, light green', image: 'https://www.ikea.com/ext/ingkadam/m/7d04e5a9538a7988/original/PH170364-crop001.jpg?f=xs', type: '3d', model: 'couch', scale: 0.02 },
    { id: 'm4', name: 'STRANDMON', price: '399.00', desc: 'Wing chair, yellow', image: 'https://www.ikea.com/ext/ingkadam/m/51e3328fccbc5692/original/PH170562-crop001.jpg?f=xs', type: '3d', model: 'chair', scale: 0.05 },
    { id: 'm5', name: 'MALM', price: '299.00', desc: 'Bed frame, high, white', image: 'https://www.ikea.com/global/assets/navigation/images/beds-bm003.jpeg?imwidth=300', type: '3d', model: 'bed', scale: 0.04 },
];

const CATEGORIES = [
    { id: 'cat1', name: 'Storage & organization' },
    { id: 'cat2', name: 'Kitchen, appliances & supplies' },
    { id: 'cat3', name: 'Beds & mattresses' },
    { id: 'cat4', name: 'Lighting' },
];

// --- Main Screen ---

interface PlacedItem {
    id: string;
    name: string;
    desc: string;
    type: '3d' | '2d';
    price: string;
    x: number;
    z: number;
    rotation: number;
    originalProduct?: any;
    model?: string;
    scale?: number;
    // Extra details
    dimensions?: string;
    materials?: string;
    tags?: string[];
    stock?: number;
    merchantName?: string;
    rating?: number;
    reviewCount?: number;
}

export default function PlaceScreen() {
    // --- UI State ---
    const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
    const [isARMode, setIsARMode] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    // --- Core State ---
    const [items, setItems] = useState<PlacedItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Data
    const [marketplaceItems, setMarketplaceItems] = useState<any[]>(MARKETPLACE_DATA);
    const { addToCart } = useCart();
    const router = useRouter();

    useEffect(() => {
        // Load real products
        getProducts().then(products => {
            const mapped = products.map(p => ({
                id: p.id,
                name: p.title,
                price: p.price,
                desc: p.description,
                image: p.imageUri,
                type: '3d', // Default to 3D
                model: 'chair', // Default to chair for fetched items unless we have metadata
                scale: 0.05,
                originalProduct: p
            }));
            // Merge local fake data with real data or just use local + real
            setMarketplaceItems(prev => [...MARKETPLACE_DATA, ...mapped]);
        });
    }, []);

    const selectedItem = items.find(i => i.id === selectedId);

    const addItem = (item: any) => {
        const newItem: PlacedItem = {
            id: Date.now().toString(),
            name: item.name,
            desc: item.desc,
            type: '3d',
            price: item.price,
            x: 0,
            z: 0,
            rotation: 0,
            model: item.model || 'chair',
            scale: item.scale || 0.05,
            // @ts-ignore
            originalProduct: item.originalProduct
        };
        setItems(prev => [...prev, newItem]);
        setSelectedId(newItem.id);
        setIsMarketplaceOpen(false); // Auto close marketplace
    };

    const handleContextMenu = (action: 'rotate' | 'duplicate' | 'remove') => {
        if (!selectedId) return;
        if (action === 'remove') {
            setItems(prev => prev.filter(i => i.id !== selectedId));
            setSelectedId(null);
        } else if (action === 'rotate') {
            setItems(prev => prev.map(item =>
                item.id === selectedId ? { ...item, rotation: item.rotation + Math.PI / 2 } : item
            ));
        } else if (action === 'duplicate') {
            const original = items.find(i => i.id === selectedId);
            if (original) {
                const copy = { ...original, id: Date.now().toString(), x: original.x + 2, z: original.z + 2 };
                setItems(prev => [...prev, copy]);
                setSelectedId(copy.id);
            }
        }
    };

    const handleDragMove = (point: THREE.Vector3) => {
        if (selectedId && isDragging) {
            setItems(prev => prev.map(item =>
                item.id === selectedId ? { ...item, x: point.x, z: point.z } : item
            ));
        }
    };

    const handleAddToCart = () => {
        if (selectedItem) {
            // @ts-ignore
            if (selectedItem.originalProduct) {
                // @ts-ignore
                addToCart(selectedItem.originalProduct);
                Alert.alert('Added to Cart', `${selectedItem.name} has been added to your cart.`);
            }
        }
    };

    const toggleARMode = async () => {
        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                Alert.alert('Permission Required', 'Camera permission is needed for AR mode.', [
                    { text: 'Cancel' },
                    { text: 'Settings', onPress: () => Linking.openSettings() }
                ]);
                return;
            }
        }
        setIsARMode(prev => !prev);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Fullscreen 3D Canvas */}
            <View style={styles.fullscreenCanvas}>
                {isARMode && <CameraView style={StyleSheet.absoluteFill} facing="back" />}
                <Canvas shadows camera={{ position: [0, 15, 15], fov: 45 }} style={{ backgroundColor: isARMode ? 'transparent' : '#f5f5f5' }}>
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                    {!isARMode && <gridHelper args={[30, 30, 0x888888, 0xeeeeee]} />}
                    <OrbitControls makeDefault enabled={!isDragging} />
                    {isDragging && <DraggablePlane onMove={handleDragMove} onUp={() => setIsDragging(false)} />}
                    <Suspense fallback={null}>
                        {items.map(item => (
                            item.type === '3d' ? (
                                <FurnitureModel
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedId === item.id}
                                    onClick={(e: any) => {
                                        e.stopPropagation();
                                        setSelectedId(item.id);
                                        setIsDragging(true);
                                    }}
                                />
                            ) : (
                                <BillboardItem
                                    key={item.id}
                                    position={[item.x, 0.1, item.z]}
                                    isSelected={selectedId === item.id}
                                    onClick={(e: any) => {
                                        e.stopPropagation();
                                        setSelectedId(item.id);
                                        setIsDragging(true);
                                    }}
                                />
                            )
                        ))}
                    </Suspense>
                </Canvas>
            </View>

            {/* Floating Header */}
            <SafeAreaView style={styles.topLayer} pointerEvents="box-none" edges={['top']}>
                <View style={styles.floatingHeader}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
                        <FontAwesome name="close" size={18} color="#333" />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>{isARMode ? 'AR Mode' : 'Living Room'}</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity style={[styles.circleBtn, { marginRight: 10 }]}>
                            <FontAwesome name="camera" size={16} color="#333" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.circleBtn}>
                            <FontAwesome name="save" size={16} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* Middle HUD Controls */}
            {!isMarketplaceOpen && (
                <View style={styles.hudLayer} pointerEvents="box-none">
                    <View style={styles.hudLeft}>
                        <TouchableOpacity style={[styles.hudBtn, isARMode && { backgroundColor: '#0058a3' }]} onPress={toggleARMode}>
                            <Text style={[styles.hudBtnText, isARMode && { color: '#fff' }]}>{isARMode ? '2D' : 'AR'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.hudBtn}>
                            <FontAwesome name="arrows-alt" size={16} color="#333" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.hudBtn}>
                            <FontAwesome name="cog" size={16} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.hudRight}>
                        <TouchableOpacity style={[styles.hudBtn, { marginRight: 10 }]}>
                            <FontAwesome name="undo" size={16} color="#333" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.hudBtn}>
                            <FontAwesome name="repeat" size={16} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Bottom Action Bar */}
            {!isMarketplaceOpen && (
                <SafeAreaView style={styles.bottomLayer} pointerEvents="box-none" edges={['bottom']}>
                    <View style={styles.actionBar}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => setIsMarketplaceOpen(true)}>
                            <View style={styles.actionIconContainer}>
                                <FontAwesome name="bed" size={20} color="#0058a3" />
                            </View>
                            <Text style={styles.actionLabel}>Furnish</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={styles.actionIconContainer}>
                                <FontAwesome name="home" size={20} color="#333" />
                            </View>
                            <Text style={styles.actionLabel}>Build</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={styles.actionIconContainer}>
                                <FontAwesome name="arrows-v" size={20} color="#333" />
                            </View>
                            <Text style={styles.actionLabel}>Height</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )}

            {/* Marketplace Sheet / Detail View Overlay */}
            {(isMarketplaceOpen || selectedItem) && (
                <View style={styles.bottomSheetOverlay}>
                    {selectedItem ? (
                        // Edit Item Mode
                        <View style={styles.detailPanel}>
                            <View style={styles.detailHeader}>
                                <View>
                                    <Text style={styles.detailName}>{selectedItem.name}</Text>
                                    <Text style={styles.detailPrice}>${selectedItem.price}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setSelectedId(null)} style={styles.closeDetailBtn}>
                                    <FontAwesome name="close" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.editControls}>
                                <TouchableOpacity style={styles.toolBtn} onPress={() => handleContextMenu('rotate')}>
                                    <FontAwesome name="rotate-right" size={16} color="#333" />
                                    <Text style={styles.toolText}>Rotate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolBtn} onPress={() => handleContextMenu('duplicate')}>
                                    <FontAwesome name="copy" size={16} color="#333" />
                                    <Text style={styles.toolText}>Copy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolBtn} onPress={() => handleContextMenu('remove')}>
                                    <FontAwesome name="trash" size={16} color="#d93025" />
                                    <Text style={[styles.toolText, { color: '#d93025' }]}>Remove</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.descScroll} showsVerticalScrollIndicator={true}>
                                <Text style={styles.detailDesc}>{selectedItem.desc || 'No description available.'}</Text>
                            </ScrollView>

                            <TouchableOpacity style={styles.addToBagBtn} onPress={handleAddToCart}>
                                <Text style={styles.addToBagText}>Add to bag</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Marketplace Browser
                        <View style={styles.marketplacePanel}>
                            <View style={styles.marketplaceHeader}>
                                <TouchableOpacity onPress={() => setIsMarketplaceOpen(false)} style={styles.closeBtn}>
                                    <FontAwesome name="chevron-down" size={16} color="#333" />
                                </TouchableOpacity>
                                <Text style={styles.marketplaceTitle}>Add Furniture</Text>
                                <View style={{ width: 20 }} />
                            </View>

                            <View style={styles.searchContainer}>
                                <FontAwesome name="search" size={16} color="#666" style={{ marginRight: 10 }} />
                                <TextInput placeholder="Search..." style={styles.searchInput} placeholderTextColor="#999" />
                            </View>

                            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: 5 }}>
                                    {CATEGORIES.map(cat => (
                                        <TouchableOpacity key={cat.id} style={styles.catPill}>
                                            <Text style={styles.catPillText}>{cat.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <View style={styles.grid}>
                                    {marketplaceItems.map(item => (
                                        <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => {
                                            addItem(item);
                                            setIsMarketplaceOpen(false); // Close after adding
                                        }}>
                                            <Image source={{ uri: item.image }} style={styles.gridImage} />
                                            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                            <Text style={styles.itemPrice}>${item.price}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },

    // Layers
    fullscreenCanvas: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 },
    topLayer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    hudLayer: { position: 'absolute', bottom: 120, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
    bottomLayer: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, backgroundColor: 'transparent' },

    // Floating Header
    floatingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
    circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    headerTitleContainer: { backgroundColor: 'transparent' }, // Or a pill if needed
    headerTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' }, // Or white if bg is dark, but ref suggests light clean UI
    headerRight: { flexDirection: 'row' },

    // HUD Utils
    hudLeft: { flexDirection: 'row', alignItems: 'center' },
    hudRight: { flexDirection: 'row', alignItems: 'center' },
    hudBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    hudBtnText: { fontSize: 12, fontWeight: 'bold', color: '#0058a3' },

    // Bottom Action Bar
    actionBar: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, paddingBottom: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 10, marginHorizontal: 0 },
    actionBtn: { alignItems: 'center' },
    actionIconContainer: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#eff4f9', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    actionLabel: { fontSize: 12, fontWeight: '500', color: '#333' },

    // Overlay / Sheets
    bottomSheetOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', zIndex: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
    marketplacePanel: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
    marketplaceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    closeBtn: { padding: 8 },
    marketplaceTitle: { fontSize: 18, fontWeight: 'bold' },

    // Marketplace Styles
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 12, borderRadius: 12, marginBottom: 15 },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },
    catScroll: { marginBottom: 20, maxHeight: 40 },
    catPill: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 10 },
    catPillText: { fontSize: 12, fontWeight: '600', color: '#333' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '31%', marginBottom: 15 },
    gridImage: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#f9f9f9', marginBottom: 6, resizeMode: 'contain', borderWidth: 1, borderColor: '#f0f0f0' },
    itemName: { fontSize: 12, fontWeight: '600', color: '#333' },
    itemPrice: { fontSize: 12, color: '#666' },

    // Details Panel (Edit Mode)
    detailPanel: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
    detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    detailName: { fontSize: 20, fontWeight: 'bold', color: '#111' },
    detailPrice: { fontSize: 16, fontWeight: '600', color: '#0058a3', marginTop: 2 },
    closeDetailBtn: { padding: 5 },
    editControls: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    toolBtn: { alignItems: 'center', justifyContent: 'center' },
    toolText: { color: '#333', fontSize: 11, marginTop: 4 },
    descScroll: { marginBottom: 15 },
    detailDesc: { fontSize: 14, color: '#666', lineHeight: 20 },
    addToBagBtn: { backgroundColor: '#0058a3', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
    addToBagText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});