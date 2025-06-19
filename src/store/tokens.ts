import { atom } from "jotai";

// Get initial token value from localStorage
const getInitialToken = (): string | null => {
  const savedToken = localStorage.getItem('tavus-token');
  return savedToken || null;
};

// Atom to store the Tavus API key (which is used for API calls)
export const apiTokenAtom = atom<string | null>(getInitialToken());

// Derived atom to check if token exists
export const hasTokenAtom = atom((get) => get(apiTokenAtom) !== null);

// Atom to track if token is being validated
export const isValidatingTokenAtom = atom(false);

// Action atoms to set or clear the token
export const setApiTokenAtom = atom(
  null,
  (_get, set, token: string) => {
    set(apiTokenAtom, token);
    localStorage.setItem('tavus-token', token);
  }
);

export const clearApiTokenAtom = atom(
  null,
  (_get, set) => {
    set(apiTokenAtom, null);
    localStorage.removeItem('tavus-token');
  }
);
