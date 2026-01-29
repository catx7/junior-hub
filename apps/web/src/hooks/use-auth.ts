'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithEmail,
  signUpWithEmail,
  logout as firebaseLogout,
  resetPassword,
  onAuthChange,
} from '@/lib/firebase';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export function useAuth() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout: clearAuth } = useAuthStore();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await authApi.me();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();

      await authApi.social({
        provider: 'google',
        idToken,
      });

      const userData = await authApi.me();
      setUser(userData);
      toast.success('Welcome back!');
      router.push('/');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router, setUser, setLoading]);

  const loginWithFacebook = useCallback(async () => {
    try {
      setLoading(true);
      const result = await signInWithFacebook();
      const idToken = await result.user.getIdToken();

      await authApi.social({
        provider: 'facebook',
        idToken,
      });

      const userData = await authApi.me();
      setUser(userData);
      toast.success('Welcome back!');
      router.push('/');
    } catch (error) {
      console.error('Facebook login error:', error);
      toast.error('Failed to sign in with Facebook');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router, setUser, setLoading]);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        await signInWithEmail(email, password);
        const userData = await authApi.me();
        setUser(userData);
        toast.success('Welcome back!');
        router.push('/');
      } catch (error) {
        console.error('Email login error:', error);
        toast.error('Invalid email or password');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router, setUser, setLoading]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        setLoading(true);
        await signUpWithEmail(email, password, name);

        await authApi.register({ name, email, password });
        const userData = await authApi.me();
        setUser(userData);
        toast.success('Account created successfully!');
        router.push('/');
      } catch (error) {
        console.error('Registration error:', error);
        toast.error('Failed to create account');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router, setUser, setLoading]
  );

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await resetPassword(email);
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send reset email');
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await firebaseLogout();
      clearAuth();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      throw error;
    }
  }, [clearAuth, router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    register,
    forgotPassword,
    logout,
  };
}
