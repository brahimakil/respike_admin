import {
  signInWithCustomToken,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData): Promise<User> {
    try {
      console.log('🔵 Calling backend API to register admin...', data);
      
      // Call backend API to register admin
      const response = await api.post('/auth/register', data);
      console.log('✅ Backend response:', response.data);
      
      const { token } = response.data;
      
      if (!token) {
        throw new Error('No token received from backend');
      }
      
      console.log('🔵 Signing in with custom token...');
      // Sign in with the custom token from backend
      const userCredential = await signInWithCustomToken(auth, token);
      console.log('✅ Successfully signed in:', userCredential.user.uid);
      
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error message:', error.message);
      throw error;
    }
  },

  async login(data: LoginData): Promise<User> {
    try {
      console.log('🔵 Calling backend API to login admin...', data.email);
      
      // Call backend API to verify admin login
      const response = await api.post('/auth/admin/login', data);
      console.log('✅ Backend response:', response.data);
      
      const { token } = response.data;
      
      if (!token) {
        throw new Error('No token received from backend');
      }
      
      console.log('🔵 Signing in with custom token...');
      // Sign in with the custom token from backend
      const userCredential = await signInWithCustomToken(auth, token);
      console.log('✅ Successfully signed in as admin:', userCredential.user.uid);
      
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      
      // Handle specific error messages
      if (error.response?.status === 401) {
        throw new Error('Invalid credentials or insufficient permissions. Admin accounts only.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to login');
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async getCurrentToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  },
};

