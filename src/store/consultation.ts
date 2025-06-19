import { atom } from 'jotai';
import { Consultation, TavusConversation, VideoControls, SessionTimer, ConsultationScreen } from '../types';

export const currentConsultationAtom = atom<Consultation | null>(null);
export const consultationsAtom = atom<Consultation[]>([]);
export const isInSessionAtom = atom<boolean>(false);
export const consultationLoadingAtom = atom<boolean>(false);
export const consultationErrorAtom = atom<string | null>(null);

// Tavus conversation state
export const tavusConversationAtom = atom<TavusConversation | null>(null);
export const conversationScreenAtom = atom<ConsultationScreen['name']>('intro');

// Video controls state
export const videoControlsAtom = atom<VideoControls>({
  isCameraOn: true,
  isMicOn: true,
  isScreenSharing: false,
  volume: 1,
});

// Session timer state
export const sessionTimerAtom = atom<SessionTimer>({
  startTime: new Date(),
  duration: 0,
  remainingTime: 1800, // 30 minutes default
  isActive: false,
});

// Consultation screens configuration
export const consultationScreensAtom = atom<ConsultationScreen[]>([
  { id: '1', name: 'intro', title: 'Welcome', isActive: true },
  { id: '2', name: 'loading', title: 'Preparing...', isActive: false },
  { id: '3', name: 'settings', title: 'Setup', isActive: false },
  { id: '4', name: 'conversation', title: 'Consultation', isActive: false },
  { id: '5', name: 'summary', title: 'Summary', isActive: false },
  { id: '6', name: 'error', title: 'Error', isActive: false },
]);

// Derived atoms
export const currentScreenAtom = atom<ConsultationScreen | null>((get) => {
  const screens = get(consultationScreensAtom);
  const currentName = get(conversationScreenAtom);
  return screens.find(screen => screen.name === currentName) || null;
});

export const sessionTimeRemainingAtom = atom<string>((get) => {
  const timer = get(sessionTimerAtom);
  const minutes = Math.floor(timer.remainingTime / 60);
  const seconds = timer.remainingTime % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});