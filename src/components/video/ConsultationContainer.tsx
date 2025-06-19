import React from 'react';
import { useAtom } from 'jotai';
import { conversationScreenAtom, currentScreenAtom } from '../../store/consultation';
import { IntroScreen } from './IntroScreen';
import { LoadingScreen } from './LoadingScreen';
import { SettingsScreen } from './SettingsScreen';
import { ActiveConsultation } from './ActiveConsultation';
import { SummaryScreen } from './SummaryScreen';
import { ErrorScreen } from './ErrorScreen';

export function ConsultationContainer() {
  const [currentScreen] = useAtom(currentScreenAtom);
  
  if (!currentScreen) {
    return <ErrorScreen message="Invalid consultation screen" />;
  }

  const renderScreen = () => {
    switch (currentScreen.name) {
      case 'intro':
        return <IntroScreen />;
      case 'loading':
        return <LoadingScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'conversation':
        return <ActiveConsultation />;
      case 'summary':
        return <SummaryScreen />;
      case 'error':
        return <ErrorScreen />;
      default:
        return <ErrorScreen message="Unknown screen type" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-800">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-white/20 rounded-full h-2">
            <div 
              className="bg-secondary rounded-full h-2 transition-all duration-500"
              style={{ 
                width: `${((['intro', 'loading', 'settings', 'conversation', 'summary'].indexOf(currentScreen.name) + 1) / 5) * 100}%` 
              }}
            />
          </div>
          <p className="text-white/80 text-sm mt-2 text-center">
            Step {['intro', 'loading', 'settings', 'conversation', 'summary'].indexOf(currentScreen.name) + 1} of 5: {currentScreen.title}
          </p>
        </div>

        {/* Screen Content */}
        {renderScreen()}
      </div>
    </div>
  );
}