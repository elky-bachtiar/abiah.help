import { atom } from 'jotai';
import { User, AuthState } from '../types';

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom<boolean>(false);
export const authLoadingAtom = atom<boolean>(true);
export const authErrorAtom = atom<string | null>(null);

export const authStateAtom = atom<AuthState>((get) => ({
  user: get(userAtom),
  isAuthenticated: get(isAuthenticatedAtom),
  isLoading: get(authLoadingAtom),
  error: get(authErrorAtom),
}));

// Derived atoms
export const userDisplayNameAtom = atom<string>((get) => {
  const user = get(userAtom);
  if (!user) return 'User';
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0];
});

export const userInitialsAtom = atom<string>((get) => {
  const user = get(userAtom);
  if (!user) return 'U';
  const firstName = user.first_name || user.email[0];
  const lastName = user.last_name || '';
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
});