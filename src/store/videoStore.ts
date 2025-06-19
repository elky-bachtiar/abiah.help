import { atom } from 'jotai';

// Video conversation states
export type ConversationState = 'idle' | 'initializing' | 'connecting' | 'connected' | 'active' | 'ended' | 'error';

// Store for video conversation state
export const conversationStateAtom = atom<ConversationState>('idle');

// Store for video token
export const tokenAtom = atom<string | null>(null);

// Conversation URL from the Tavus Vibecode configuration
// This URL was specified in the frontend requirements
export const CONVERSATION_URL = 'https://tavus.daily.co/c0ab74b1eef4b4ab';
export const CONVERSATION_ID = 'c0ab74b1eef4b4ab';
