import { useAuth } from '@/components/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// ==================== ONBOARDING SLIDES ====================
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
    }
];

export default function LoginScreen() {
    const { signIn, signUp, isLoading, error, clearError } = useAuth();
    const router = useRouter();

    // State for Onboarding vs Login
    const [showLogin, setShowLogin] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current; // For login fade-in

    // Login Form State
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    // ==================== ONBOARDING LOGIC ====================
    const handleNextSlide = () => {
        if (activeIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
        } else {
            // Transition to Login
            setShowLogin(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
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
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
                style={styles.slideOverlay}
            />
            <SafeAreaView style={styles.slideSafeArea}>
                <View style={styles.slideContent}>
                    <Text style={styles.slideTitle}>{item.title}</Text>
                    <Text style={styles.slideDesc}>{item.desc}</Text>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );

    // ==================== LOGIN LOGIC ====================
    const validateForm = () => {
        if (!email.trim()) { setLocalError('Email is required'); return false; }
        if (!email.includes('@')) { setLocalError('Please enter a valid email'); return false; }
        if (!password) { setLocalError('Password is required'); return false; }
        if (password.length < 6) { setLocalError('Password must be at least 6 characters'); return false; }
        if (!isLogin && password !== confirmPassword) { setLocalError('Passwords do not match'); return false; }
        setLocalError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        clearError();
        const success = isLogin ? await signIn(email, password) : await signUp(email, password);
        if (success) router.replace('/(tabs)');
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setLocalError('');
        clearError();
        setConfirmPassword('');
    };

    const displayError = localError || error;

    // ==================== RENDER ====================
    if (!showLogin) {
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
                        onPress={handleNextSlide}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#fff', '#e0e0e0']}
                            style={styles.nextBtnGradient}
                        >
                            <FontAwesome name={activeIndex === SLIDES.length - 1 ? "arrow-right" : "chevron-right"} size={20} color="#111" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // LOGIN FORM VIEW
    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={StyleSheet.absoluteFillObject} />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        {/* Back to Slides Button */}
                        <TouchableOpacity onPress={() => setShowLogin(false)} style={styles.backButton}>
                            <FontAwesome name="arrow-left" size={20} color="#fff" />
                        </TouchableOpacity>

                        <View style={styles.logoSection}>
                            <View style={styles.logoContainer}>
                                <FontAwesome name="home" size={48} color="#fff" />
                            </View>
                            <Text style={styles.appName}>MyRumah</Text>
                            <Text style={styles.tagline}>Your Perfect Home Awaits</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.formTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
                            <Text style={styles.formSubtitle}>{isLogin ? 'Sign in to continue shopping' : 'Join us to start your journey'}</Text>

                            {displayError ? (
                                <View style={styles.errorContainer}>
                                    <FontAwesome name="exclamation-circle" size={16} color="#ff6b6b" />
                                    <Text style={styles.errorText}>{displayError}</Text>
                                </View>
                            ) : null}

                            <View style={styles.inputContainer}>
                                <FontAwesome name="envelope" size={18} color="#8892b0" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email address"
                                    placeholderTextColor="#8892b0"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <FontAwesome name="lock" size={20} color="#8892b0" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#8892b0"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={18} color="#8892b0" />
                                </Pressable>
                            </View>

                            {!isLogin && (
                                <View style={styles.inputContainer}>
                                    <FontAwesome name="lock" size={20} color="#8892b0" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm Password"
                                        placeholderTextColor="#8892b0"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                </View>
                            )}

                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
                                <LinearGradient colors={['#667eea', '#764ba2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
                                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>}
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.toggleContainer}>
                                <Text style={styles.toggleText}>{isLogin ? "Don't have an account? " : 'Already have an account? '}</Text>
                                <TouchableOpacity onPress={toggleMode}>
                                    <Text style={styles.toggleLink}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a1a2e' },
    safeArea: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

    // Slide Styles
    slideOverlay: { ...StyleSheet.absoluteFillObject },
    slideSafeArea: { flex: 1, justifyContent: 'flex-end', paddingBottom: 120, paddingHorizontal: 30 },
    slideContent: { marginBottom: 20 },
    slideTitle: { fontSize: 42, fontWeight: 'bold', color: '#fff', fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif', lineHeight: 50, marginBottom: 10, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
    slideDesc: { fontSize: 18, color: '#eee', lineHeight: 26, maxWidth: '85%', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 },
    bottomControls: { position: 'absolute', bottom: 50, left: 0, right: 0, paddingHorizontal: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    pagination: { flexDirection: 'row', gap: 8 },
    dot: { width: 8, height: 8, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4 },
    dotActive: { width: 24, height: 8, backgroundColor: '#fff', borderRadius: 4 },
    nextBtn: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    nextBtnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Login Styles
    backButton: { marginTop: 20, marginBottom: 10, padding: 10 },
    logoSection: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
    logoContainer: { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(102, 126, 234, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    appName: { fontSize: 28, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
    tagline: { fontSize: 13, color: '#8892b0', marginTop: 4 },
    formContainer: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    formTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    formSubtitle: { fontSize: 14, color: '#8892b0', marginBottom: 24 },
    errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 107, 107, 0.1)', padding: 12, borderRadius: 12, marginBottom: 16, gap: 8 },
    errorText: { color: '#ff6b6b', fontSize: 14, flex: 1 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    inputIcon: { paddingHorizontal: 16 },
    input: { flex: 1, paddingVertical: 16, color: '#fff', fontSize: 16 },
    eyeIcon: { padding: 16 },
    submitButton: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
    submitGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    toggleText: { color: '#8892b0', fontSize: 14 },
    toggleLink: { color: '#667eea', fontSize: 14, fontWeight: 'bold' },
});
