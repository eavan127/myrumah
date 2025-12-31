import { PerspectiveCamera } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

function Scene() {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 10, 10]} fov={50} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            {/* Grid: size 100, 100 divisions. Colors: dark grey center, lighter grey grid */}
            <gridHelper args={[100, 100, '#888888', '#e0e0e0']} />
            {/* Floor plane to catch shadows or just provide base color if needed */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial color="#f9f9f9" />
            </mesh>
            {/* Fog to fade out the grid in local distance */}
            <fog attach="fog" args={['#f9f9f9', 5, 40]} />
        </>
    );
}

export default function DimensionalBackground() {
    return (
        <View style={styles.container} pointerEvents="none">
            <Canvas>
                <Scene />
            </Canvas>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
        backgroundColor: '#f9f9f9',
    },
});
