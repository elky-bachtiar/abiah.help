import React from 'react';
import { useAtom } from 'jotai';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, History, ArrowRight, Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import { userAtom } from '../store/auth';
import { activeConversationIdAtom, conversationScreenAtom } from '../store/consultation';
import { ConsultationContainer } from '../components/video/ConsultationContainer';
import { Button } from '../components/ui/Button-bkp';
import { Card } from '../components/ui/Card';
import { getConversationsForUser } from '../api/conversationApi';
import { ConversationSummary } from '../types/Conversation';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useConversationCompletion } from '../hooks/useConversationCompletion';
import { ConversationStatusBar } from '../components/conversation/ConversationStatusBar';
import { ConversationTranscript } from '../components/conversation/ConversationTranscript';
import { PostConversationActions } from '../components/conversation/PostConversationActions';
import { ConversationHistory } from '../components/conversation/ConversationHistory';
import { useDocuments } from '../hooks/useDocuments';

type ViewState = 'history' | 'active-consultation' | 'transcript';

export function Consultation() {
  const [user] = useAtom(userAtom);
  const [activeConversationId, setActiveConversationId] = useAtom(activeConversationIdAtom);
  const [, setCurrentScreen] = useAtom(conversationScreenAtom);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Simplified state management
  const [currentView, setCurrentView] = React.useState<ViewState>('history');
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  
  // STABLE userId - memoized to prevent unnecessary re-renders
  const userId = React.useMemo(() => user?.id || '', [user?.id]);
  
  // Get conversation completion status
  const { 
    isCompleted, 
    transcript, 
    completionTime,
    documentOpportunities,
    error: completionError 
  } = useConversationCompletion(activeConversationId, userId);
  
  // Get document generation capabilities
  const { 
    requestGeneration,
    generationStatus,
    activeGenerations,
    subscribeToGenerationUpdates,
    subscribeToConversationEvents
  } = useDocuments();
  
  // Handle URL parameters and initial view
  React.useEffect(() => {
    const continueId = searchParams.get('continue');
    const newConversation = searchParams.get('new') === 'true';
    
    if (continueId) {
      setActiveConversationId(continueId);
      setCurrentView('active-consultation');
    } else if (newConversation) {
      setActiveConversationId(null);
      setCurrentView('active-consultation');
    } else {
      setCurrentView('history');
    }
  }, [searchParams, setActiveConversationId]);
  
  // STABLE CALLBACKS - properly memoized to prevent re-renders
  const handleStartNew = React.useCallback(() => {
    setActiveConversationId(null);
    setCurrentView('active-consultation');
    navigate('/consultation?new=true');
  }, [navigate, setActiveConversationId]);
  
  const handleContinueConversation = React.useCallback((conversation: ConversationSummary) => {
    setActiveConversationId(conversation.id);
    setCurrentView('active-consultation');
    navigate(`/consultation?continue=${conversation.id}`);
  }, [navigate, setActiveConversationId]);
  
  const handleBackToHistory = React.useCallback(() => {
    setCurrentView('history');
    navigate('/consultation');
  }, [navigate]);
  
  const handleViewTranscript = React.useCallback(() => {
    setCurrentView('transcript');
  }, []);
  
  const handleBackFromTranscript = React.useCallback(() => {
    setCurrentView('active-consultation');
  }, []);
  
  // Handle document generation request
  const handleGenerateDocument = React.useCallback(async (documentType: string) => {
    if (!activeConversationId) return;
    navigate(`/documents/generate?type=${documentType}&conversation=${activeConversationId}`);
  }, [activeConversationId, navigate]);
  
  // Handle schedule follow up
  const handleScheduleFollowUp = React.useCallback(() => {
    setActiveConversationId(null);
    setCurrentScreen('intro');
    handleStartNew();
  }, [setActiveConversationId, setCurrentScreen, handleStartNew]);
  
  // Subscribe to real-time updates
  React.useEffect(() => {
    if (!activeConversationId || !userId) return;
    
    const unsubscribeDocuments = subscribeToGenerationUpdates(activeConversationId);
    const unsubscribeConversation = subscribeToConversationEvents(activeConversationId);
    
    return () => {
      unsubscribeDocuments();
      unsubscribeConversation();
    };
  }, [activeConversationId, userId, subscribeToGenerationUpdates, subscribeToConversationEvents]);
  
  // Don't render anything if we don't have a user ID
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // FIXED: Render all views and control visibility with CSS
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-800">
      <div className="container mx-auto px-4 py-8">
        
        {/* History View */}
        <div className={`${currentView === 'history' ? 'block' : 'hidden'}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI Consultations
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Review your past conversations or start a new consultation
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            {/* Start New Consultation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Start New Consultation</h2>
                    <p className="text-white/70">
                      Begin a fresh conversation with your AI mentor
                    </p>
                  </div>
                  
                  <Button
                    variant="secondary"
                    onClick={handleStartNew}
                    className="group"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Start New
                  </Button>
                </div>
              </Card>
            </motion.div>
            
            {/* Conversation History */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-6">
                <div className="mb-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    <h2 className="text-2xl font-semibold">Previous Conversations</h2>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white text-white hover:bg-white/20"
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                {/* ConversationHistory renders once and stays mounted */}
                <ConversationHistory
                  userId={userId}
                  onConversationSelect={handleContinueConversation}
                  showFilters={true}
                  refreshTrigger={refreshTrigger}
                />
              </Card>
            </motion.div>
          </div>
        </div>
        
        {/* Transcript View */}
        <div className={`${currentView === 'transcript' ? 'block' : 'hidden'}`}>
          {/* Navigation */}
          <div className="mb-6">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/20"
              onClick={handleBackFromTranscript}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Consultation
            </Button>
          </div>
          
          {/* Transcript */}
          {transcript && (
            <ConversationTranscript
              messages={transcript}
              title="Conversation Transcript"
              date={completionTime || undefined}
              onGenerateDocument={handleGenerateDocument}
            />
          )}
        </div>
        
        {/* Active Consultation View */}
        <div className={`${currentView === 'active-consultation' ? 'block' : 'hidden'}`}>
          {/* Navigation */}
          <div className="mb-6">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/20"
              onClick={handleBackToHistory}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
          </div>
          
          {/* Conversation Status */}
          <ConversationStatusBar 
            isCompleted={isCompleted}
            completionTime={completionTime}
            hasTranscript={!!transcript}
            onViewTranscript={handleViewTranscript}
            error={completionError}
          />
          
          {/* Consultation Container */}
          <ConsultationContainer />
          
          {/* Post-conversation actions */}
          {isCompleted && (
            <PostConversationActions
              transcript={transcript}
              documentOpportunities={documentOpportunities}
              onGenerateDocument={handleGenerateDocument}
              onScheduleFollowUp={handleScheduleFollowUp}
            />
          )}
        </div>
        
      </div>
    </div>
  );
}