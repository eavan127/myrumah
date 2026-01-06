import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ==============================================================================
// 🔧 BACKEND CONFIGURATION
// Use your computer's local IP address so your phone can connect!
// Your detected IP is: 192.168.1.19
// ==============================================================================

const API_BASE_URL = __DEV__
  ? 'http://192.168.1.19:3000/api'  // Your local IP works for both Phone & Emulator
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log helpful error messages for connection issues
    if (error.code === 'ERR_NETWORK') {
      console.error(`❌ Network Error: Could not connect to ${API_BASE_URL}`);
      console.error('👉 Make sure backend is running: npm run dev');
      console.error('👉 Make sure your phone is on the same Wi-Fi as your PC');
    }

    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      console.log('Unauthorized - please login');
    }
    return Promise.reject(error);
  }
);

export default api;