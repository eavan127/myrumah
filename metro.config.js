const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
    'obj',
    'mtl',
    'glb',
    'gltf'
);

module.exports = config;
