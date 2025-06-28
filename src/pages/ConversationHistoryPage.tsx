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

const REFRESH_INTERVAL = 10000;

export function ConversationHistoryPage() {
  const [conversations, setConversations] = useAtom(conversationHistoryAtom);
  const [selectedConversationId, setSelectedConversationId] = useAtom(selectedConversationIdAtom);
  const [conversationDetail, setConversationDetail] = useAtom(conversationDetailAtom);
  const [goals] = useAtom(goalsAtom);
  const [progressData] = useAtom(userProgressAtom);
  const [insights] = useAtom(conversationInsightsAtom);
  const [recommendations] = useAtom(recommendationsAtom);
  const [timelineItems] = useAtom(timelineItemsAtom);
  const [user] = useAtom(userAtom);

  const navigate = useNavigate();
  const { navigateWithSubscriptionCheck } = useSubscriptionCheck();

  const [activeTab, setActiveTab] = useState<'history' | 'insights' | 'progress' | 'timeline'>('history');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

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

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const refreshTimer = setInterval(() => {
      console.log('Refreshing conversation history...');
      loadConversations();
      setLastRefresh(new Date());
    }, REFRESH_INTERVAL);

    return () => clearInterval(refreshTimer);
  }, [loadConversations]);

  useEffect(() => {
    const loadConversationDetail = async () => {
      if (!selectedConversationId) {
        setConversationDetail(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        if (user) {
          const detail = await getConversationDetails(selectedConversationId);
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

  const handleConversationSelect = async (conversation: ConversationSummary) => {
    if (conversation.status === 'completed') {
      await navigateWithSubscriptionCheck(
        `/consultation?continue=${conversation.id}`,
        'conversation',
        { estimatedDuration: 30 }
      );
    } else {
      setSelectedConversationId(conversation.id);
    }
  };

  const handleBackClick = () => {
    setSelectedConversationId(null);
  };

  const renderMainContent = () => {
    if (selectedConversationId) {
      return <div>Conversation detail view goes here</div>; // Placeholder for actual detail rendering
    }

    switch (activeTab) {
      case 'history':
        return <ConversationHistory userId={userId} onConversationSelect={handleConversationSelect} />;
      case 'insights':
        return <InsightsDashboard userId={userId} insights={insights} recommendations={recommendations} onInsightAction={(insight, action) => console.log('Insight action:', action, insight)} />;
      case 'progress':
        return <ProgressTracker userId={userId} goals={goals} progressData={progressData} onGoalUpdate={(goalId, updates) => console.log('Goal update:', goalId, updates)} />;
      case 'timeline':
        return <ConversationTimeline userId={userId} timelineItems={timelineItems} onTimelineItemClick={(item) => {
          if (item.type === 'conversation') {
            setSelectedConversationId(item.data.id);
          }
        }} />;
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

        {!selectedConversationId && (
          <div className="mb-8 border-b border-neutral-200">
            <div className="flex space-x-8">
              {['history', 'insights', 'progress', 'timeline'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`pb-4 relative ${
                    activeTab === tab
                      ? 'text-primary font-medium'
                      : 'text-text-secondary hover:text-primary'
                  }`}
                >
                  <div className="flex items-center">
                    {tab === 'history' && <MessageSquare className="w-5 h-5 mr-2" />}
                    {tab === 'insights' && <Lightbulb className="w-5 h-5 mr-2" />}
                    {tab === 'progress' && <Target className="w-5 h-5 mr-2" />}
                    {tab === 'timeline' && <Calendar className="w-5 h-5 mr-2" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </div>
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
}
