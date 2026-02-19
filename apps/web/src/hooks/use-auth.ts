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

// Helper function to get user-friendly error messages
function getAuthErrorMessage(error: any): string {
  const errorCode = error?.code || '';

  // Firebase Auth error codes
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address format';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in method';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    default:
      // Check for API errors
      if (error?.response?.status === 409) {
        return 'An account with this email already exists';
      }
      if (error?.response?.status === 401) {
        return 'Authentication failed. Please try again';
      }
      if (error?.message && typeof error.message === 'string') {
        return error.message;
      }
      return 'An unexpected error occurred. Please try again';
  }
}

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isLoading,
    isAuthenticated,
    setUser,
    setLoading,
    logout: clearAuth,
  } = useAuthStore();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Try to get user data - if it fails, sync the user first
          let userData;
          try {
            userData = await authApi.me();
          } catch (error: any) {
            if (error?.status === 401) {
              // User exists in Firebase but not in our DB, sync them
              await authApi.email();
              userData = await authApi.me();
            } else {
              throw error;
            }
          }
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
      const message = getAuthErrorMessage(error);
      toast.error(message);
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
      const message = getAuthErrorMessage(error);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router, setUser, setLoading]);

  const loginWithEmail = useCallback(
    async (email: string, password: string, verifyCaptcha?: (action: string) => Promise<void>) => {
      try {
        setLoading(true);

        // Verify CAPTCHA before Firebase auth
        if (verifyCaptcha) {
          await verifyCaptcha('login');
        }

        await signInWithEmail(email, password);

        // Sync user with database (creates if not exists)
        await authApi.email();

        const userData = await authApi.me();
        setUser(userData);
        toast.success('Welcome back!');
        router.push('/');
      } catch (error) {
        console.error('Email login error:', error);
        const message = getAuthErrorMessage(error);
        toast.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router, setUser, setLoading]
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      verifyCaptcha?: (action: string) => Promise<void>
    ) => {
      try {
        setLoading(true);

        // Verify CAPTCHA before Firebase auth
        if (verifyCaptcha) {
          await verifyCaptcha('register');
        }

        const result = await signUpWithEmail(email, password, name);
        const idToken = await result.user.getIdToken();

        // Register in database with Firebase token
        // 409 is OK — the onAuthChange listener may have already created the user
        try {
          await authApi.register({ name, email, password });
        } catch (err: any) {
          if (err?.status !== 409) throw err;
        }

        // Fetch user data
        const userData = await authApi.me();
        setUser(userData);
        toast.success('Account created successfully!');
        router.push('/');
      } catch (error) {
        console.error('Registration error:', error);
        const message = getAuthErrorMessage(error);
        toast.error(message);
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
      const message = getAuthErrorMessage(error);
      toast.error(message);
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
