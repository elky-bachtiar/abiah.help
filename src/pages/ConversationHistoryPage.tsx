import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Calendar, Search, Filter, ArrowUpDown,
  ChevronDown, ChevronUp, Clock, Tag, CheckCircle, 
  ArrowRight, ChevronLeft, ChevronRight, Eye,
  Download, Share2, AlertCircle
} from 'lucide-react';
import { 
  conversationHistoryAtom,
  conversationDetailAtom,
  selectedConversationIdAtom
} from '../store/conversationHistory';
import { ConversationSummary } from '../types/Conversation';
import { Button } from '../components/ui/Button-bkp';
import { Input } from '../components/ui/Input-bkp';
import { Card } from '../components/ui/Card';
import { getConversationsForUser, getConversationDetails } from '../api/conversationApi';
import { userAtom } from '../store/auth';
import { useSubscriptionCheck } from '../hooks/useSubscriptionCheck';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ContextIndicator } from '../components/conversation/ContextIndicator';

const ITEMS_PER_PAGE = 10;
const REFRESH_INTERVAL = 30000; // 30 seconds

export function ConversationHistoryPage() {
  // Global state
  const [conversations, setConversations] = useAtom(conversationHistoryAtom);
  const [selectedConversationId, setSelectedConversationId] = useAtom(selectedConversationIdAtom);
  const [conversationDetail, setConversationDetail] = useAtom(conversationDetailAtom);
  const [user] = useAtom(userAtom);
  
  // Navigation
  const navigate = useNavigate();
  const { navigateWithSubscriptionCheck } = useSubscriptionCheck();
  
  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [sortField, setSortField] = useState<'date' | 'title' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'scheduled'>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Use real user ID if available, otherwise fallback to mock
  const userId = user?.id || 'user-1';
  
  // Load conversations when component mounts
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the real API if user is logged in
      if (user) {
        const userConversations = await getConversationsForUser(userId);
        setConversations(userConversations);
      } else {
        // Otherwise use mock data (already loaded in the atom)
        console.log('Using mock conversation data');
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, user, setConversations]);
  
  // Load conversations on mount and set up refresh interval
  useEffect(() => {
    loadConversations();
    
    // Set up auto-refresh
    const refreshInterval = setInterval(() => {
      loadConversations();
      setLastRefresh(new Date());
    }, REFRESH_INTERVAL);
    
    return () => clearInterval(refreshInterval);
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
          // Mock data handling would go here
          setConversationDetail(null);
        }
      } catch (err) {
        console.error('Error loading conversation detail:', err);
        setError('Failed to load conversation details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversationDetail();
  }, [selectedConversationId, setConversationDetail, user]);
  
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
  
  // Handle sort change
  const handleSortChange = (field: 'date' | 'title' | 'status') => {
    if (sortField === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Otherwise, sort by the new field in descending order
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Filter and sort conversations
  const filteredAndSortedConversations = React.useMemo(() => {
    let result = [...conversations];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(conv => conv.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(conv => 
        conv.title.toLowerCase().includes(query) || 
        conv.key_topics.some(topic => topic.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [conversations, statusFilter, searchQuery, sortField, sortDirection]);
  
  // Paginate conversations
  const paginatedConversations = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedConversations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedConversations, currentPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedConversations.length / ITEMS_PER_PAGE);
  
  // Render conversation card
  const renderConversationCard = (conversation: ConversationSummary) => {
    return (
      <motion.div
        key={conversation.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <Card 
          className="conversation-card hover:shadow-md transition-all cursor-pointer"
          onClick={() => handleConversationSelect(conversation)}
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-primary">{conversation.title}</h3>
              <div className="flex items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  conversation.status === 'completed' ? 'bg-success/10 text-success' :
                  conversation.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                  'bg-primary/10 text-primary'
                }`}>
                  {conversation.status === 'completed' ? 'Completed' :
                   conversation.status === 'in_progress' ? 'In Progress' :
                   'Scheduled'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center text-text-secondary text-sm mb-3">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="mr-4">{new Date(conversation.created_at).toLocaleDateString()}</span>
              <Clock className="w-4 h-4 mr-1" />
              <span>{conversation.duration_minutes} min</span>
            </div>
            
            {/* Context Summary (if available) */}
            {conversation.context_data && Object.keys(conversation.context_data).length > 0 && (
              <div className="mb-3 text-sm text-text-secondary">
                <div className="line-clamp-2 italic">
                  {conversation.context_data.focus_area ? 
                    `Focus: ${conversation.context_data.focus_area}` : 
                    conversation.context_data.startup_context?.company_name ? 
                      `Company: ${conversation.context_data.startup_context.company_name}` : 
                      'AI mentorship conversation'}
                </div>
              </div>
            )}
            
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {conversation.key_topics.slice(0, 3).map((topic, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {topic}
                  </span>
                ))}
                {conversation.key_topics.length > 3 && (
                  <span className="px-2 py-1 bg-neutral-100 text-text-secondary text-xs rounded-full">
                    +{conversation.key_topics.length - 3} more
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-4">
                <div className="text-text-secondary">
                  <span className="font-medium">{conversation.insights_count}</span> insights generated
                </div>
                {/* Show quality indicators if available */}
                {conversation.quality_score && (
                  <div className="flex items-center text-xs">
                    <div className={`w-2 h-2 rounded-full mr-1 ${
                      conversation.quality_score > 80 ? 'bg-success' :
                      conversation.quality_score > 60 ? 'bg-warning' :
                      'bg-neutral-400'
                    }`}></div>
                    <span className="text-text-secondary">
                      {conversation.quality_score > 80 ? 'High quality' :
                       conversation.quality_score > 60 ? 'Good quality' :
                       'Basic quality'}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-text-secondary">
                {conversation.mentor_persona} mentor
              </div>
            </div>
            
            {/* Message History Preview (if available) */}
            {conversation.message_history && conversation.message_history.length > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <div className="text-xs text-text-secondary mb-1">
                  {conversation.message_history.length} messages exchanged
                </div>
                <div className="text-sm text-text-primary line-clamp-1">
                  {conversation.message_history[conversation.message_history.length - 1].content}
                </div>
              </div>
            )}
            
            {/* View Button */}
            <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
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
            <ChevronLeft className="w-4 h-4 mr-2" />
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
                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Conversation Transcript
                </h3>
                
                <div className="flex gap-2 mb-4">
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
                
                {hasTranscript ? (
                  <div className="space-y-4">
                    {conversationDetail.transcript?.segments.map((segment) => (
                      <div 
                        key={segment.id}
                        className={`p-3 rounded-lg ${
                          segment.speaker === 'user' 
                            ? 'bg-primary/10 ml-12' 
                            : 'bg-neutral-100 mr-12'
                        }`}
                      >
                        <div className="font-medium text-text-primary mb-1">
                          {segment.speaker === 'user' ? 'You' : 'AI Mentor'}
                        </div>
                        <div className="text-text-secondary">
                          {segment.text}
                        </div>
                        <div className="text-xs text-text-secondary mt-1 text-right">
                          {new Date(conversationDetail.created_at).getTime() + segment.timestamp > new Date().getTime()
                            ? '...'
                            : new Date(new Date(conversationDetail.created_at).getTime() + segment.timestamp)
                                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-text-secondary mx-auto mb-2" />
                    <p className="text-text-secondary">No transcript available for this conversation</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Conversation Details */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Conversation Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-1">Status</h4>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                      conversationDetail.status === 'completed' ? 'bg-success/10 text-success' :
                      conversationDetail.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                      'bg-primary/10 text-primary'
                    }`}>
                      <span className="w-2 h-2 rounded-full mr-2 bg-current"></span>
                      {conversationDetail.status === 'completed' ? 'Completed' :
                       conversationDetail.status === 'in_progress' ? 'In Progress' :
                       'Scheduled'}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-1">Mentor Persona</h4>
                    <p className="text-text-primary">{conversationDetail.mentor_persona}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-1">Duration</h4>
                    <p className="text-text-primary">{conversationDetail.duration_minutes} minutes</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-text-secondary mb-1">Created</h4>
                    <p className="text-text-primary">{new Date(conversationDetail.created_at).toLocaleString()}</p>
                  </div>
                  
                  {conversationDetail.updated_at && (
                    <div>
                      <h4 className="text-sm font-medium text-text-secondary mb-1">Last Updated</h4>
                      <p className="text-text-primary">{new Date(conversationDetail.updated_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Key Topics */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Key Topics</h3>
                
                {conversationDetail.key_topics && conversationDetail.key_topics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {conversationDetail.key_topics.map((topic, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary">No key topics identified</p>
                )}
              </div>
            </Card>
            
            {/* Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Actions</h3>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigateWithSubscriptionCheck(
                      `/consultation?continue=${conversationDetail.id}`,
                      'conversation',
                      { estimatedDuration: 30 }
                    )}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Continue Conversation
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate(`/documents/generate?type=consultation_summary&conversation=${conversationDetail.id}`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate Summary
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {/* Share functionality */}}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Conversation
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };
  
  // Render loading skeleton
  const renderSkeleton = () => {
    return Array(3).fill(0).map((_, index) => (
      <div key={index} className="mb-4">
        <Card className="p-4">
          <div className="animate-pulse">
            <div className="flex justify-between items-start mb-2">
              <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-6 w-20 bg-neutral-200 rounded-full"></div>
            </div>
            
            <div className="flex items-center mb-3">
              <div className="h-4 bg-neutral-200 rounded w-32 mr-4"></div>
              <div className="h-4 bg-neutral-200 rounded w-20"></div>
            </div>
            
            <div className="mb-3 flex gap-2">
              <div className="h-6 bg-neutral-200 rounded-full w-20"></div>
              <div className="h-6 bg-neutral-200 rounded-full w-24"></div>
              <div className="h-6 bg-neutral-200 rounded-full w-16"></div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="h-4 bg-neutral-200 rounded w-32"></div>
              <div className="h-4 bg-neutral-200 rounded w-24"></div>
            </div>
          </div>
        </Card>
      </div>
    ));
  };
  
  // If viewing conversation detail
  if (selectedConversationId && conversationDetail) {
    return (
      <div className="min-h-screen bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderConversationDetail()}
        </div>
      </div>
    );
  }
  
  // Main conversation history view
  return (
    <div className="min-h-screen bg-background-secondary">
      <ErrorBoundary>
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
        
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {filtersExpanded ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSortChange('date')}
                  className="flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Date
                  {sortField === 'date' && (
                    <ArrowUpDown className="w-3 h-3 ml-1" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSortChange('title')}
                  className="flex items-center"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Title
                  {sortField === 'title' && (
                    <ArrowUpDown className="w-3 h-3 ml-1" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSortChange('status')}
                  className="flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Status
                  {sortField === 'status' && (
                    <ArrowUpDown className="w-3 h-3 ml-1" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Expanded Filters */}
          {filtersExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-background-secondary p-4 rounded-lg mb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                    setSortField('date');
                    setSortDirection('desc');
                  }}
                  className="mr-2"
                >
                  Reset Filters
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setFiltersExpanded(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Conversation List */}
        <div className="mb-6">
          {error ? (
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-center">
              <p className="font-medium">Error loading conversations</p>
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={loadConversations}
              >
                Try Again
              </Button>
            </div>
          ) : isLoading ? (
            renderSkeleton()
          ) : filteredAndSortedConversations.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-text-secondary mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-primary mb-1">No conversations found</h3>
              <p className="text-text-secondary mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start a new conversation to begin your mentorship journey'}
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/consultation')}
              >
                Start New Consultation
              </Button>
            </div>
          ) : (
            <div>
              {paginatedConversations.map(renderConversationCard)}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {!isLoading && filteredAndSortedConversations.length > 0 && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-text-secondary">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedConversations.length)} of {filteredAndSortedConversations.length} conversations
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
      </ErrorBoundary>
    </div>
  );
}