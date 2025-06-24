import React from 'react';
import { useAtom } from 'jotai';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, History, ArrowRight, Plus } from 'lucide-react';
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
import { useDocuments } from '../hooks/useDocuments';
 
export function Consultation() {
  const [user] = useAtom(userAtom);
  const [activeConversationId, setActiveConversationId] = useAtom(activeConversationIdAtom);
  const [, setCurrentScreen] = useAtom(conversationScreenAtom);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [recentConversations, setRecentConversations] = React.useState<ConversationSummary[]>([]);
  const [showSelection, setShowSelection] = React.useState(true);
  const [showTranscript, setShowTranscript] = React.useState(false);
  
  // Get conversation completion status
  const { 
    isCompleted, 
    transcript, 
    completionTime,
    documentOpportunities,
    error: completionError 
  } = useConversationCompletion(activeConversationId, user?.id);
  
  // Get document generation capabilities
  const { 
    requestGeneration,
    generationStatus,
    activeGenerations,
    subscribeToGenerationUpdates,
    subscribeToConversationEvents
  } = useDocuments();
  
  // Check if we're continuing a specific conversation
  const continueId = searchParams.get('continue');
  
  React.useEffect(() => {
    // If continueId is provided, set it as active and skip selection
    if (continueId) {
      setActiveConversationId(continueId);
      setShowSelection(false);
    } else if (searchParams.get('new') === 'true') {
      // If new=true parameter is present, start a new conversation
      setActiveConversationId(null);
      setShowSelection(false);
    } else {
      // Otherwise, load recent conversations for selection
      loadRecentConversations();
    }
  }, [continueId, searchParams, setActiveConversationId]);
  
  const loadRecentConversations = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const conversations = await getConversationsForUser(user.id);
      
      // Filter to show only recent and completed conversations
      const recentCompleted = conversations
        .filter(c => c.status === 'completed')
        .slice(0, 5); // Show only the 5 most recent
      
      setRecentConversations(recentCompleted);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load recent conversations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartNew = () => {
    setActiveConversationId(null);
    setShowSelection(false);
  };
  
  const handleContinue = (conversation: ConversationSummary) => {
    setActiveConversationId(conversation.id);
    setShowSelection(false);
  };
  
  // Handle document generation request
  const handleGenerateDocument = async (documentType: string) => {
    if (!activeConversationId) return;
    
    // Show document generation form
    navigate(`/documents/generate?type=${documentType}&conversation=${activeConversationId}`);
  };
  
  // Subscribe to real-time updates
  React.useEffect(() => {
    if (!activeConversationId || !user) return;
    
    // Subscribe to document generation updates
    const unsubscribeDocuments = subscribeToGenerationUpdates(activeConversationId);
    
    // Subscribe to conversation events
    const unsubscribeConversation = subscribeToConversationEvents(activeConversationId);
    
    return () => {
      unsubscribeDocuments();
      unsubscribeConversation();
    };
  }, [activeConversationId, user, subscribeToGenerationUpdates, subscribeToConversationEvents]);
  
  // If we're showing the consultation container, render it
  if (!showSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-800">
        <div className="container mx-auto px-4 py-8">
          {/* Conversation Status */}
          <ConversationStatusBar 
            isCompleted={isCompleted}
            completionTime={completionTime}
            hasTranscript={!!transcript}
            onViewTranscript={() => setShowTranscript(true)}
            error={completionError}
          />
          
          {/* Show transcript if requested */}
          {showTranscript && transcript ? (
            <ConversationTranscript
              messages={transcript}
              title="Conversation Transcript"
              date={completionTime || undefined}
              onGenerateDocument={handleGenerateDocument}
            />
          ) : (
            <ConsultationContainer />
          )}
          
          {/* Post-conversation actions */}
          {isCompleted && !showTranscript && (
            <PostConversationActions
              transcript={transcript}
              documentOpportunities={documentOpportunities}
              onGenerateDocument={handleGenerateDocument}
              onScheduleFollowUp={() => {
                // Reset conversation state and start a new one
                setActiveConversationId(null);
                setCurrentScreen('intro');
              }}
            />
          )}
        </div>
      </div>
    );
  }
  
  // Otherwise, show the selection screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-800">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Video className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI Consultation
          </h1>
          
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Choose to start a new consultation or continue from a previous conversation
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
          
          {/* Continue Previous Conversation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-6">
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <History className="w-5 h-5 mr-2" />
                  <h2 className="text-2xl font-semibold">Continue Previous Conversation</h2>
                </div>
                <p className="text-white/70">
                  Pick up where you left off with a previous AI mentor session
                </p>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <div className="bg-error/20 border border-error/30 rounded-lg p-4 text-center">
                  <p className="text-white mb-2">{error}</p>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-primary"
                    onClick={loadRecentConversations}
                  >
                    Try Again
                  </Button>
                </div>
              ) : recentConversations.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-white/70 mb-4">
                    You don't have any previous conversations yet.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={handleStartNew}
                    className="group"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Start Your First Consultation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentConversations.map(conversation => (
                    <div 
                      key={conversation.id}
                      className="border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => handleContinue(conversation)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold mb-1">{conversation.title}</h3>
                          <div className="text-sm text-white/70 mb-2">
                            {new Date(conversation.created_at).toLocaleDateString()} • {conversation.duration_minutes} min • {conversation.mentor_persona} mentor
                          </div>
                          
                          {conversation.key_topics.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {conversation.key_topics.slice(0, 3).map((topic, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                  {topic}
                                </span>
                              ))}
                              {conversation.key_topics.length > 3 && (
                                <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                                  +{conversation.key_topics.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-primary"
                      onClick={() => navigate('/conversation-history')}
                    >
                      View All Conversations
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}