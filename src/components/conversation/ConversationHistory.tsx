import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, Calendar, Clock, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  conversationHistoryAtom, 
  conversationFiltersAtom, 
  conversationSearchAtom, 
  paginatedConversationsAtom,
  paginationAtom,
  conversationSortAtom,
  loadingStateAtom,
  errorStateAtom,
  debounce
} from '../../store/conversationHistory';
import { getConversationsForUser } from '../../api/conversationApi';
import { ConversationSummary, ConversationFilters } from '../../types/Conversation';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button-bkp'; 
import { Input } from '../../components/ui/Input-bkp'; 
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface ConversationHistoryProps {
  userId: string;
  onConversationSelect?: (conversation: ConversationSummary) => void;
  showFilters?: boolean;
  compact?: boolean;
  refreshTrigger?: number;
}

export function ConversationHistory({
  userId,
  onConversationSelect,
  showFilters = true,
  compact = false,
  refreshTrigger = 0
}: ConversationHistoryProps) {
  const { user } = useAuth();
  
  // Global state
  const [conversations] = useAtom(paginatedConversationsAtom);
  const [allConversations, setAllConversations] = useAtom(conversationHistoryAtom);
  const [filters, setFilters] = useAtom(conversationFiltersAtom);
  const [searchQuery, setSearchQuery] = useAtom(conversationSearchAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);
  const [sort, setSort] = useAtom(conversationSortAtom);
  const [isLoading, setIsLoading] = useAtom(loadingStateAtom);
  const [error, setError] = useAtom(errorStateAtom);
  
  // Local state
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  // Load conversations from API
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const fetchedConversations = await getConversationsForUser(user.id);
      setAllConversations(fetchedConversations);
      
      // Update pagination info
      setPagination(prev => ({
        ...prev,
        totalItems: fetchedConversations.length,
        totalPages: Math.ceil(fetchedConversations.length / prev.pageSize)
      }));
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, setAllConversations, setPagination, setIsLoading, setError]);
  
  // Load conversations on mount and user change
  useEffect(() => {
    loadConversations();
  }, [loadConversations, refreshTrigger]);
  
  // Set up real-time subscriptions for conversation updates
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('Setting up real-time subscription for user:', user.id);
    
    // Subscribe to conversation updates
    const conversationChannel = supabase
      .channel(`user-${user.id}`)
      .on('broadcast', { event: 'conversation_update' }, (payload) => {
        console.log('Received conversation update:', payload);
        
        // Handle different types of updates
        const { type, conversationId, status } = payload.payload;
        
        if (type === 'conversation_started' || type === 'conversation_ended' || type === 'conversation_completed') {
          // Reload conversations to get updated data
          loadConversations();
        }
      })
      .subscribe();
    
    // Subscribe to conversation table changes
    const tableChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Database conversation change:', payload);
        
        // Reload conversations to get latest data
        loadConversations();
      })
      .subscribe();
    
    return () => {
      console.log('Cleaning up real-time subscriptions');
      conversationChannel.unsubscribe();
      tableChannel.unsubscribe();
    };
  }, [user?.id, loadConversations]);
  
  // Handle search input with debounce
  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
    }, 300),
    [setSearchQuery, setPagination]
  );
  
  // Handle filter changes
  const handleFilterChange = (key: keyof ConversationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };
  
  // Handle sort changes
  const handleSortChange = (sortBy: 'date' | 'duration' | 'relevance') => {
    setSort(prev => ({
      sortBy,
      sortOrder: prev.sortBy === sortBy ? (prev.sortOrder === 'asc' ? 'desc' : 'asc') : 'desc'
    }));
  };
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
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
          onClick={() => onConversationSelect?.(conversation)}
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
                {conversation.key_topics.map((topic, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {topic}
                  </span>
                ))}
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
          </div>
        </Card>
      </motion.div>
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
  
  return (
    <div className="conversation-history">
      {/* Search and Filters */}
      {showFilters && (
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                onChange={(e) => handleSearchChange(e.target.value)}
                defaultValue={searchQuery}
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
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextSortBy = sort.sortBy === 'date' 
                    ? 'duration' 
                    : sort.sortBy === 'duration' 
                      ? 'relevance' 
                      : 'date';
                  handleSortChange(nextSortBy);
                }}
                className="flex items-center"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Sort: {sort.sortBy === 'date' ? 'Date' : sort.sortBy === 'duration' ? 'Duration' : 'Relevance'}
                {sort.sortOrder === 'asc' ? ' (Asc)' : ' (Desc)'}
              </Button>
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
                  <label className="block text-sm font-medium text-text-primary mb-1">Date Range</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Mentor Persona</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={filters.persona || 'all'}
                    onChange={(e) => handleFilterChange('persona', e.target.value === 'all' ? undefined : e.target.value)}
                  >
                    <option value="all">All Personas</option>
                    <option value="general">General</option>
                    <option value="fintech">FinTech</option>
                    <option value="healthtech">HealthTech</option>
                    <option value="b2b-saas">B2B SaaS</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={filters.status || 'all'}
                    onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-text-primary mb-1">Minimum Duration (minutes)</label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={filters.minDuration || 0}
                  onChange={(e) => handleFilterChange('minDuration', parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                  <span>0 min</span>
                  <span>{filters.minDuration || 0} min</span>
                  <span>60+ min</span>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      dateRange: 'all',
                      persona: undefined,
                      topics: [],
                      minDuration: 0,
                      status: 'all'
                    });
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
      )}
      
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
              onClick={() => {
                // Reload conversations
              }}
            >
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          renderSkeleton()
        ) : conversations.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="w-12 h-12 text-text-secondary mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-primary mb-1">No conversations found</h3>
            <p className="text-text-secondary mb-4">
              {searchQuery || Object.values(filters).some(v => v !== undefined && v !== 'all' && v !== 0 && v?.length !== 0)
                ? 'Try adjusting your search or filters'
                : 'Start a new conversation to begin your mentorship journey'}
            </p>
            <Button
              variant="primary"
              onClick={() => {
                // Navigate to new conversation
              }}
            >
              Start New Consultation
            </Button>
          </div>
        ) : (
          <div>
            {conversations.map(renderConversationCard)}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {!compact && !isLoading && conversations.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-text-secondary">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} conversations
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}