// Debug utility to help troubleshoot token issues
import { getDefaultStore } from 'jotai';
import { apiTokenAtom, setApiTokenAtom } from '@/store/tokens';

// Backend integration would normally retrieve the token securely from Supabase
// For development, we're using a temporary token for testing

// Note: For a real Tavus API key, you need to obtain it from platform.tavus.io/api-keys
// This is just a placeholder - it won't actually work!
const DEMO_API_KEY = "";

/**
 * Sets a development Tavus API key for testing
 * In production, this would be retrieved from backend which gets it from Supabase
 */
export function debugSetDummyToken() {
  // Only set if we have a valid demo key
  if (!DEMO_API_KEY) {
    console.log('No demo API key available - user input required');
    return null;
  }
  
  console.log('Setting development Tavus API key for testing');
  
  // Using the action atom to properly set the API key
  getDefaultStore().set(setApiTokenAtom, DEMO_API_KEY);
  
  // Verify API key was set correctly
  const apiKey = getDefaultStore().get(apiTokenAtom);
  console.log('Tavus API key set successfully:', !!apiKey);
  
  // Also store in localStorage for persistence
  if (apiKey) {
    localStorage.setItem('tavus-token', apiKey);
  }
  
  return apiKey;
}

/**
 * For production use - would fetch token from backend route 
 * that securely retrieves it from Supabase
 */
export async function fetchProductionToken() {
  // This would be implemented when backend integration is ready
  // For now, fall back to debug token in development
  console.log('Production token fetch not implemented - using debug token');
  return debugSetDummyToken();
}
