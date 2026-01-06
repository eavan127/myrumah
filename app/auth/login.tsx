import { useAuth } from '@/components/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
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

export default function LoginScreen() {
    const { signIn, signUp, isLoading, error, clearError } = useAuth();
    const router = useRouter();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const validateForm = () => {
        if (!email.trim()) {
            setLocalError('Email is required');
            return false;
        }
        if (!email.includes('@')) {
            setLocalError('Please enter a valid email');
            return false;
        }
        if (!password) {
            setLocalError('Password is required');
            return false;
        }
        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return false;
        }
        if (!isLogin && password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return false;
        }
        setLocalError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        clearError();
        const success = isLogin
            ? await signIn(email, password)
            : await signUp(email, password);

        if (success) {
            router.replace('/(tabs)');
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setLocalError('');
        clearError();
        setConfirmPassword('');
    };

    const displayError = localError || error;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Logo Section */}
                        <View style={styles.logoSection}>
                            <View style={styles.logoContainer}>
                                <FontAwesome name="home" size={48} color="#fff" />
                            </View>
                            <Text style={styles.appName}>MyRumah</Text>
                            <Text style={styles.tagline}>Your Perfect Home Awaits</Text>
                        </View>

                        {/* Form Section */}
                        <View style={styles.formContainer}>
                            <Text style={styles.formTitle}>
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </Text>
                            <Text style={styles.formSubtitle}>
                                {isLogin
                                    ? 'Sign in to continue shopping'
                                    : 'Join us to start your journey'}
                            </Text>

                            {/* Error Message */}
                            {displayError ? (
                                <View style={styles.errorContainer}>
                                    <FontAwesome name="exclamation-circle" size={16} color="#ff6b6b" />
                                    <Text style={styles.errorText}>{displayError}</Text>
                                </View>
                            ) : null}

                            {/* Email Input */}
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

                            {/* Password Input */}
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
                                    <FontAwesome
                                        name={showPassword ? 'eye' : 'eye-slash'}
                                        size={18}
                                        color="#8892b0"
                                    />
                                </Pressable>
                            </View>

                            {/* Confirm Password (Sign Up only) */}
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

                            {/* Forgot Password (Login only) */}
                            {isLogin && (
                                <TouchableOpacity style={styles.forgotPassword}>
                                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            )}

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                                onPress={handleSubmit}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.submitGradient}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>
                                            {isLogin ? 'Sign In' : 'Create Account'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or continue with</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Social Buttons */}
                            <View style={styles.socialContainer}>
                                <TouchableOpacity style={styles.socialButton}>
                                    <FontAwesome name="google" size={20} color="#EA4335" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}>
                                    <FontAwesome name="apple" size={20} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}>
                                    <FontAwesome name="facebook" size={20} color="#4267B2" />
                                </TouchableOpacity>
                            </View>

                            {/* Toggle Login/Register */}
                            <View style={styles.toggleContainer}>
                                <Text style={styles.toggleText}>
                                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                </Text>
                                <TouchableOpacity onPress={toggleMode}>
                                    <Text style={styles.toggleLink}>
                                        {isLogin ? 'Sign Up' : 'Sign In'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    // Logo Section
    logoSection: {
        alignItems: 'center',
        marginTop: height * 0.08,
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 25,
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 14,
        color: '#8892b0',
        marginTop: 8,
    },

    // Form
    formContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#8892b0',
        marginBottom: 24,
    },

    // Error
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        flex: 1,
    },

    // Inputs
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputIcon: {
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        color: '#fff',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 16,
    },

    // Forgot Password
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#667eea',
        fontSize: 14,
    },

    // Submit Button
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: '#8892b0',
        paddingHorizontal: 16,
        fontSize: 12,
    },

    // Social Buttons
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },

    // Toggle
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    toggleText: {
        color: '#8892b0',
        fontSize: 14,
    },
    toggleLink: {
        color: '#667eea',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
