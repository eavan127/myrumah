import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScanScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);
    const router = useRouter();

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Scanner Permission' }} />
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    async function takePicture() {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setPhoto(photo?.uri ?? null);
        }
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Scene Scanner', headerShown: false }} />
            {photo ? (
                <View style={styles.preview}>
                    <Image source={{ uri: photo }} style={styles.previewImage} />
                    <View style={styles.previewControls}>
                        <TouchableOpacity style={styles.button} onPress={() => setPhoto(null)}>
                            <Text style={styles.text}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.useButton]} onPress={() => {
                            // Navigate to eraser with photo
                            router.push({ pathname: '/studio/eraser', params: { image: photo } } as any);
                        }}>
                            <Text style={[styles.text, { color: '#fff' }]}>Use Scan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
            )}
            {!photo && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
                        <FontAwesome name="refresh" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                    <View style={{ width: 50 }} />
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: '#fff',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 50,
        left: 30,
        right: 30,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    controlButton: {
        padding: 10,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    button: {
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#eee',
        borderRadius: 8,
        minWidth: 100,
    },
    useButton: {
        backgroundColor: '#0058a3'
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    captureButton: {
        width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center', alignItems: 'center'
    },
    captureInner: {
        width: 60, height: 60, borderRadius: 30, backgroundColor: 'white'
    },
    preview: { flex: 1, backgroundColor: '#000' },
    previewImage: { flex: 1, resizeMode: 'contain' },
    previewControls: {
        flexDirection: 'row', justifyContent: 'space-around', padding: 30, backgroundColor: '#fff'
    }
});