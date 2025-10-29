import {
  signInWithEmailAndPassword,
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
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );
    return userCredential.user;
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

