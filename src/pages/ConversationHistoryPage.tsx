import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Calendar, Lightbulb, Target, ArrowLeft, Download, Share2 } from 'lucide-react';
import { 
  conversationHistoryAtom, 
  conversationContextAPI,
  conversationDetailAtom,
  selectedConversationIdAtom,
  goalsAtom,
  userProgressAtom,
  conversationInsightsAtom,
  recommendationsAtom,
  timelineItemsAtom
} from '../store/conversationHistory';
import { ConversationSummary } from '../types/Conversation';
import { ConversationHistory } from '../components/conversation/ConversationHistory';
import { ContextIndicator } from '../components/conversation/ContextIndicator';
import { ProgressTracker } from '../components/progress/ProgressTracker';
import { InsightsDashboard } from '../components/insights/InsightsDashboard';
import { ConversationTimeline } from '../components/conversation/ConversationTimeline';
import { Button } from '../components/ui/Button-bkp';
import { Card } from '../components/ui/Card';
import { getConversationsForUser, getConversationDetails } from '../api/conversationApi';
import { userAtom } from '../store/auth';
import { useSubscriptionCheck } from '../hooks/useSubscriptionCheck';

// Refresh interval in milliseconds
const REFRESH_INTERVAL = 10000; // 10 seconds

export function ConversationHistoryPage() {
  // Global state
  const [conversations, setConversations] = useAtom(conversationHistoryAtom);
  const [selectedConversationId, setSelectedConversationId] = useAtom(selectedConversationIdAtom);
  const [conversationDetail, setConversationDetail] = useAtom(conversationDetailAtom);
  const [goals] = useAtom(goalsAtom);
  const [progressData] = useAtom(userProgressAtom);
  const [insights] = useAtom(conversationInsightsAtom);
  const [recommendations] = useAtom(recommendationsAtom);
  const [timelineItems] = useAtom(timelineItemsAtom);
  const [user] = useAtom(userAtom);
  
  // Hooks
  const navigate = useNavigate();
  const { navigateWithSubscriptionCheck } = useSubscriptionCheck();
  
  // Local state
  const [activeTab, setActiveTab] = useState<'history' | 'insights' | 'progress' | 'timeline'>('history');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add refresh timer
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Use real user ID if available, otherwise fallback to mock
  const userId = user?.id || 'user-1';
  
  const loadConversations = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      if (user) {
        const userConversations = await getConversationsForUser(userId);
        setConversations(userConversations);
      } else {
        console.log('Using mock conversation data');
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, user, setConversations]);
  
  // Set up periodic refresh
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      console.log('Refreshing conversation history...');
      loadConversations();
      setLastRefresh(new Date());
    }, REFRESH_INTERVAL);
    
    return () => clearInterval(refreshTimer);
  }, [loadConversations]);
  
  // Load conversation detail when selected
  useEffect(() => {
    const loadConversationDetail = async () => {
      if (!selectedConversationId) {
        setConversationDetail(null);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the real API if user is logged in
        if (user) {
          const detail = await getConversationDetails(selectedConversationId);
          
          // Convert to ConversationDetail format expected by the UI
          // This is a temporary solution until we fully migrate the UI
          const enhancedDetail = {
            ...detail,
            transcript: detail.message_history ? {
              segments: detail.message_history.map((msg, index) => ({
                id: msg.id || `msg-${index}`,
                speaker: msg.role === 'assistant' ? 'ai' : msg.role,
                text: msg.content,
                timestamp: new Date(msg.timestamp).getTime() - new Date(detail.created_at).getTime()
              })),
              summary: 'Conversation transcript',
              key_points: detail.key_topics || []
            } : undefined,
            insights: [],
            context_data: {
              context_summary: detail.context_data?.focus_area || 'AI mentorship conversation',
              previous_conversations: detail.context_data?.previous_conversations || [],
              related_topics: detail.key_topics || [],
              user_preferences: detail.context_data?.user_preferences || {},
              relationship_strength: 0.5,
              context_awareness_level: 'intermediate',
              last_updated: detail.updated_at
            },
            related_documents: [],
            follow_ups: []
          };
          
          setConversationDetail(enhancedDetail);
        } else {
          // Otherwise use mock data
          const detail = await conversationContextAPI.getConversationDetail(selectedConversationId);
          setConversationDetail(detail);
        }
      } catch (err) {
        console.error('Error loading conversation detail:', err);
        setError('Failed to load conversation details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversationDetail();
  }, [selectedConversationId, setConversationDetail]);
  
  // Load timeline items
  useEffect(() => {
    const loadTimelineItems = async () => {
      try {
        await conversationContextAPI.getTimelineItems(userId);
      } catch (err) {
        console.error('Error loading timeline items:', err);
      }
    };
    
    loadTimelineItems();
  }, [userId]);
  
  // Handle conversation selection
  const handleConversationSelect = async (conversation: ConversationSummary) => {
    // If conversation is completed and user wants to continue, check subscription
    if (conversation.status === 'completed') {
      // Navigate to consultation page with continue parameter, subscription will be checked there
      await navigateWithSubscriptionCheck(
        `/consultation?continue=${conversation.id}`,
        'conversation',
        { estimatedDuration: 30 }
      );
    } else {
      // For viewing details, just set the selected conversation
      setSelectedConversationId(conversation.id);
    }
  };
  
  // Handle back button click
  const handleBackClick = () => {
    setSelectedConversationId(null);
  };
  
  // Render conversation detail view
  const renderConversationDetail = () => {
    if (!conversationDetail) return null;
    
    // Determine if we have a transcript from message history
    const hasTranscript = conversationDetail.transcript?.segments && 
                         conversationDetail.transcript.segments.length > 0;
    
    return (
      <div>
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="mb-4 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Conversations
          </Button>
          
          <h2 className="text-2xl font-bold text-primary mb-2">{conversationDetail.title}</h2>
          
          <div className="flex items-center text-text-secondary text-sm mb-4">
            <Calendar className="w-4 h-4 mr-1" />
            <span className="mr-4">{new Date(conversationDetail.created_at).toLocaleDateString()}</span>
            <MessageSquare className="w-4 h-4 mr-1" />
            <span>{conversationDetail.duration_minutes} min conversation</span>
          </div>
          
          {/* Context Indicator */}
          <ContextIndicator
            conversationContext={conversationDetail.context_data}
            isVisible={true}
          />
        </div>
        
        {/* Conversation Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transcript */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Conversation Transcript</h3>
                
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                {hasTranscript ? conversationDetail.transcript?.segments.map((segment) => (
                  <div 
                    key={segment.id}
                    className={`mb-4 ${
                      segment.speaker === 'user' ? 'pl-4' : 'pl-4 border-l-4 border-primary/20'
                    }`}
                  >
                    <div className="font-medium text-text-primary mb-1">
                      {segment.speaker === 'user' ? 'You' : 'AI Mentor'}
                    </div>
                    <div className="text-text-secondary">
                      {segment.text}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {new Date(conversationDetail.created_at).getTime() + segment.timestamp * 1000 > new Date().getTime()
                        ? '...'
                        : new Date(new Date(conversationDetail.created_at).getTime() + segment.timestamp * 1000)
                            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-text-secondary mx-auto mb-2" />
                    <p className="text-text-secondary">No transcript available for this conversation</p>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Insights */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Conversation Insights</h3>
                
                {conversationDetail.insights.length === 0 ? (
                  <div className="text-center py-4">
                    <Lightbulb className="w-12 h-12 text-text-secondary mx-auto mb-2" />
                    <p className="text-text-secondary">No insights generated for this conversation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversationDetail.insights.map((insight) => (
                      <div 
                        key={insight.id}
                        className={`p-4 rounded-lg ${
                          insight.type === 'goal' ? 'bg-primary/10' :
                          insight.type === 'challenge' ? 'bg-error/10' :
                          insight.type === 'progress' ? 'bg-success/10' :
                          'bg-warning/10'
                        }`}
                      >
                        <h4 className="font-medium text-text-primary mb-1">{insight.title}</h4>
                        <p className="text-sm text-text-secondary mb-2">{insight.description}</p>
                        
                        {insight.action_items && insight.action_items.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-text-primary mb-1">Action Items:</h5>
                            <ul className="text-sm text-text-secondary">
                              {insight.action_items.map((item, index) => (
                                <li key={index} className="flex items-start mb-1">
                                  <span className="mr-2">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Related Documents */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Related Documents</h3>
                
                {conversationDetail.related_documents.length === 0 ? (
                  <div className="text-center py-4">
                    <FileText className="w-12 h-12 text-text-secondary mx-auto mb-2" />
                    <p className="text-text-secondary">No related documents found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversationDetail.related_documents.map((document) => (
                      <div 
                        key={document.id}
                        className="p-3 bg-background-secondary rounded-lg flex items-start"
                      >
                        <FileText className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-text-primary">{document.title}</div>
                          <div className="text-xs text-text-secondary">
                            {document.type} • {new Date(document.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
            
            {/* Follow-Up Items */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Follow-Up Items</h3>
                
                {conversationDetail.follow_ups.length === 0 ? (
                  <div className="text-center py-4">
                    <Calendar className="w-12 h-12 text-text-secondary mx-auto mb-2" />
                    <p className="text-text-secondary">No follow-up items</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversationDetail.follow_ups.map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 bg-background-secondary rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-text-primary">{item.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          }`}>
                            {item.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-text-secondary mb-1">{item.description}</p>
                        
                        {item.due_date && (
                          <div className="text-xs text-text-secondary flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {new Date(item.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };
  
  // Render main content based on active tab
  const renderMainContent = () => {
    if (selectedConversationId) {
      return renderConversationDetail();
    }
    
    switch (activeTab) {
      case 'history':
        return (
          <ConversationHistory
            userId={userId}
            onConversationSelect={handleConversationSelect}
          />
        );
      case 'insights':
        return (
          <InsightsDashboard
            userId={userId}
            insights={insights}
            recommendations={recommendations}
            onInsightAction={(insight, action) => {
              console.log('Insight action:', action, insight);
            }}
          />
        );
      case 'progress':
        return (
          <ProgressTracker
            userId={userId}
            goals={goals}
            progressData={progressData}
            onGoalUpdate={async (goalId, updates) => {
              console.log('Goal update:', goalId, updates);
              // In a real implementation, this would call an API
            }}
          />
        );
      case 'timeline':
        return (
          <ConversationTimeline
            userId={userId}
            timelineItems={timelineItems}
            onTimelineItemClick={(item) => {
              console.log('Timeline item clicked:', item);
              if (item.type === 'conversation') {
                setSelectedConversationId(item.data.id);
              }
            }}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Conversation History
          </h1>
          <p className="text-text-secondary text-lg mb-2">
            Review your mentorship journey, track progress, and discover insights
          </p>
          <p className="text-xs text-text-secondary">
            Last updated: {lastRefresh.toLocaleTimeString()}
            <button 
              onClick={() => {
                loadConversations();
                setLastRefresh(new Date());
              }}
              className="ml-2 text-primary hover:text-primary/80 underline"
            >
              Refresh now
            </button>
          </p>
        </motion.div>
        
        {/* Tabs */}
        {!selectedConversationId && (
          <div className="mb-8 border-b border-neutral-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-4 relative ${
                  activeTab === 'history'
                    ? 'text-primary font-medium'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Conversations
                </div>
                {activeTab === 'history' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('insights')}
                className={`pb-4 relative ${
                  activeTab === 'insights'
                    ? 'text-primary font-medium'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                <div className="flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Insights
                </div>
                {activeTab === 'insights' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('progress')}
                className={`pb-4 relative ${
                  activeTab === 'progress'
                    ? 'text-primary font-medium'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Progress
                </div>
                {activeTab === 'progress' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('timeline')}
                className={`pb-4 relative ${
                  activeTab === 'timeline'
                    ? 'text-primary font-medium'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Timeline
                </div>
                {activeTab === 'timeline' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div>
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
}