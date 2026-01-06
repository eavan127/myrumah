import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Role = 'user' | 'merchant';

export interface User {
  id: number;
  email: string;
  role?: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => { },
  clearError: () => { },
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error checking auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: authToken, user: userData } = response.data;

      // Store token and user
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);

      return true;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', { email, password });
      const { token: authToken, user: userData } = response.data;

      // Store token and user
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);

      return true;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, signIn, signUp, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}
