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
      async (_event, session) => {
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

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });
      
      if (error) throw error;
      
      // Show success toast
      toast.success('Registration Successful', {
        description: 'Please check your email to confirm your account.'
      });
      
      return data;
    } catch (error: any) {
      console.error('Error during signup:', error);
      
      // Handle common database errors with friendly messages
      if (error.message?.includes('duplicate key value violates unique constraint')) {
        const message = 'An account with this email already exists. Please sign in instead.';
        setError(message);
        toast.error('Account Already Exists', {
          description: message
        });
      } else if (error.message?.includes('Database error saving new user')) {
        const message = 'We encountered an issue creating your account. Please try again or contact support.';
        setError(message);
        toast.error('Account Creation Failed', {
          description: message
        });
      } else {
        const message = error instanceof Error ? error.message : 'Sign up failed';
        setError(message);
        toast.error('Registration Error', {
          description: message
        });
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
      toast.error('Social Sign In Failed', {
        description: message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Signed Out Successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      const message = error instanceof Error ? error.message : 'Sign out failed';
      setError(message);
      toast.error('Sign Out Failed', {
        description: message
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      toast.success('Password Reset Email Sent', {
        description: 'Please check your inbox for instructions to reset your password.'
      });
      
    } catch (error: any) {
      console.error('Error resetting password:', error);
      const message = error instanceof Error ? error.message : 'Password reset failed';
      setError(message);
      
      toast.error('Password Reset Failed', {
        description: message
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      toast.success('Password Updated Successfully', {
        description: 'Your password has been changed.'
      });
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      const message = error instanceof Error ? error.message : 'Password update failed';
      setError(message);
      
      toast.error('Password Update Failed', {
        description: message
      });
      
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
      toast.error('Profile Update Failed', {
        description: message
      });
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
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
  };
}
