import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { userAtom, isAuthenticatedAtom, authLoadingAtom, authErrorAtom } from '../store/auth';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useAtom(userAtom);
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isLoading, setIsLoading] = useAtom(authLoadingAtom);
  const [error, setError] = useAtom(authErrorAtom);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email!,
            first_name: session.user.user_metadata?.first_name,
            last_name: session.user.user_metadata?.last_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at!,
            updated_at: session.user.updated_at!,
            user_metadata: session.user.user_metadata,
          };
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setError(error instanceof Error ? error.message : 'Authentication error');
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const userData: User = {
              id: session.user.id,
              email: session.user.email!,
              first_name: session.user.user_metadata?.first_name,
              last_name: session.user.user_metadata?.last_name,
              avatar_url: session.user.user_metadata?.avatar_url,
              created_at: session.user.created_at!,
              updated_at: session.user.updated_at!,
              user_metadata: session.user.user_metadata,
            };
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
          setError(null);
        } catch (error) {
          console.error('Auth state change error:', error);
          setError(error instanceof Error ? error.message : 'Authentication error');
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setIsAuthenticated, setIsLoading, setError]);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle specific error cases
      if (error?.message?.includes('Database error saving new user')) {
        setError('Our registration system is temporarily unavailable. Please try again later or contact support for assistance.');
      } else if (error?.status === 500) {
        setError('An unexpected error occurred with our service. Please try again later or contact support for assistance.');
      } else if (error?.message?.includes('User already registered')) {
        setError('This email is already registered. Please log in or use a different email address.');
      } else {
        const message = error instanceof Error ? error.message : 'Sign up failed';
        setError(message);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific error cases
      if (error?.message?.includes('Email not confirmed') || error?.code === 'email_not_confirmed') {
        const message = 'Please confirm your email address before signing in. Check your inbox for a confirmation email.';
        setError(message);
        toast.error('Email Not Confirmed', {
          description: message,
          duration: 6000,
          action: {
            label: 'Resend',
            onClick: () => resetPassword(email)
          }
        });
      } else if (error?.message?.includes('Invalid login credentials')) {
        const message = 'Incorrect email or password. Please try again.';
        setError(message);
        toast.error('Sign In Failed', {
          description: message
        });
      } else {
        const message = error instanceof Error ? error.message : 'Sign in failed';
        setError(message);
        toast.error('Authentication Error', {
          description: message
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithProvider = async (provider: 'google' | 'linkedin_oidc') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Social sign in failed';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updateProfile,
  };
}