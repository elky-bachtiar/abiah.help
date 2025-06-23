import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MessageSquare, 
  Award, 
  FileText, 
  Lightbulb, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Filter,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { TimelineItem } from '../../types/Conversation';
import { formatDate } from '../../store/conversationHistory';
import { Button } from '../../components/ui/Button-bkp';
import { Input } from '../../components/ui/Input-bkp';

interface ConversationTimelineProps {
  userId: string;
  timelineItems: TimelineItem[];
  onTimelineItemClick?: (item: TimelineItem) => void;
  compact?: boolean;
}

export function ConversationTimeline({
  userId,
  timelineItems,
  onTimelineItemClick,
  compact = false
}: ConversationTimelineProps) {
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'day' | 'week' | 'month'>('week');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>({
    conversation: true,
    milestone: true,
    document: true,
    insight: true
  });
  
  // Group timeline items by date
  const groupedItems = useMemo(() => {
    // Filter items based on search and type filters
    const filteredItems = timelineItems.filter(item => {
      // Apply search filter
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply type filter
      if (!selectedTypes[item.type]) {
        return false;
      }
      
      return true;
    });
    
    // Group by date
    return filteredItems.reduce((acc, item) => {
      const date = new Date(item.date).toISOString().split('T')[0];
      acc[date] = acc[date] || [];
      acc[date].push(item);
      return acc;
    }, {} as Record<string, TimelineItem[]>);
  }, [timelineItems, searchQuery, selectedTypes]);
  
  // Get sorted dates
  const sortedDates = useMemo(() => {
    return Object.keys(groupedItems).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [groupedItems]);
  
  // Handle type filter toggle
  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };
  
  // Handle zoom level change
  const handleZoomChange = (level: 'day' | 'week' | 'month') => {
    setZoomLevel(level);
  };
  
  // Render timeline item
  const renderTimelineItem = (item: TimelineItem, index: number) => {
    const typeConfig = {
      conversation: { icon: MessageSquare, color: 'bg-primary/10 text-primary border-primary/20' },
      milestone: { icon: Award, color: 'bg-success/10 text-success border-success/20' },
      document: { icon: FileText, color: 'bg-warning/10 text-warning border-warning/20' },
      insight: { icon: Lightbulb, color: 'bg-error/10 text-error border-error/20' }
    };
    
    const IconComponent = typeConfig[item.type].icon;
    
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`relative pl-8 pb-6 ${index !== groupedItems[item.date.split('T')[0]].length - 1 ? 'border-l-2 border-neutral-200' : ''}`}
      >
        {/* Timeline node */}
        <div className={`absolute left-0 w-4 h-4 rounded-full ${typeConfig[item.type].color.split(' ')[0]} border-4 border-white`} />
        
        {/* Content */}
        <div 
          className={`p-3 rounded-lg border ${typeConfig[item.type].color} cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => onTimelineItemClick?.(item)}
        >
          <div className="flex items-start">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              item.type === 'conversation' ? 'bg-primary/20 text-primary' :
              item.type === 'milestone' ? 'bg-success/20 text-success' :
              item.type === 'document' ? 'bg-warning/20 text-warning' :
              'bg-error/20 text-error'
            }`}>
              <IconComponent className="w-4 h-4" />
            </div>
            
            <div>
              <h4 className="font-medium text-text-primary">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-text-secondary">{item.description}</p>
              )}
              <div className="text-xs text-text-secondary mt-1">
                {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="conversation-timeline">
      {/* Header with Search and Filters */}
      {!compact && (
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h3 className="text-xl font-semibold text-primary flex items-center mb-4 md:mb-0">
              <Calendar className="w-5 h-5 mr-2" />
              Your Journey Timeline
            </h3>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <div className="flex items-center bg-background-secondary rounded-lg p-1">
                <button
                  onClick={() => handleZoomChange('day')}
                  className={`px-3 py-1 text-xs rounded-lg ${
                    zoomLevel === 'day' 
                      ? 'bg-primary text-white' 
                      : 'text-text-secondary hover:bg-neutral-200'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => handleZoomChange('week')}
                  className={`px-3 py-1 text-xs rounded-lg ${
                    zoomLevel === 'week' 
                      ? 'bg-primary text-white' 
                      : 'text-text-secondary hover:bg-neutral-200'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => handleZoomChange('month')}
                  className={`px-3 py-1 text-xs rounded-lg ${
                    zoomLevel === 'month' 
                      ? 'bg-primary text-white' 
                      : 'text-text-secondary hover:bg-neutral-200'
                  }`}
                >
                  Month
                </button>
              </div>
              
              <div className="flex items-center">
                <button
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  aria-label="Zoom out"
                  onClick={() => {
                    if (zoomLevel === 'day') handleZoomChange('week');
                    else if (zoomLevel === 'week') handleZoomChange('month');
                  }}
                  disabled={zoomLevel === 'month'}
                >
                  <ZoomOut className="w-4 h-4 text-text-secondary" />
                </button>
                <button
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  aria-label="Zoom in"
                  onClick={() => {
                    if (zoomLevel === 'month') handleZoomChange('week');
                    else if (zoomLevel === 'week') handleZoomChange('day');
                  }}
                  disabled={zoomLevel === 'day'}
                >
                  <ZoomIn className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            </div>
          </div>
          
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <div className="bg-background-secondary p-4 rounded-lg">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-text-primary mb-1">Search Timeline</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                      <Input
                        placeholder="Search timeline items..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Jump to Date</label>
                    <Input
                      type="date"
                      value={selectedDate || ''}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-text-primary mb-2">Item Types</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleTypeToggle('conversation')}
                      className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
                        selectedTypes.conversation
                          ? 'bg-primary/10 text-primary'
                          : 'bg-neutral-200 text-text-secondary'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Conversations
                    </button>
                    
                    <button
                      onClick={() => handleTypeToggle('milestone')}
                      className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
                        selectedTypes.milestone
                          ? 'bg-success/10 text-success'
                          : 'bg-neutral-200 text-text-secondary'
                      }`}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Milestones
                    </button>
                    
                    <button
                      onClick={() => handleTypeToggle('document')}
                      className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
                        selectedTypes.document
                          ? 'bg-warning/10 text-warning'
                          : 'bg-neutral-200 text-text-secondary'
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Documents
                    </button>
                    
                    <button
                      onClick={() => handleTypeToggle('insight')}
                      className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
                        selectedTypes.insight
                          ? 'bg-error/10 text-error'
                          : 'bg-neutral-200 text-text-secondary'
                      }`}
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Insights
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
      
      {/* Timeline Content */}
      <div className="timeline-content">
        {sortedDates.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-text-secondary mx-auto mb-2" />
            <h4 className="text-lg font-semibold text-primary mb-1">No timeline items found</h4>
            <p className="text-text-secondary mb-4">
              {searchQuery || !Object.values(selectedTypes).every(Boolean)
                ? 'Try adjusting your search or filters'
                : 'Complete more consultations to build your timeline'}
            </p>
            {(searchQuery || !Object.values(selectedTypes).every(Boolean)) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTypes({
                    conversation: true,
                    milestone: true,
                    document: true,
                    insight: true
                  });
                }}
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <div>
            {sortedDates.map((date) => (
              <div key={date} className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-primary">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h4>
                </div>
                
                <div className="ml-5">
                  {groupedItems[date].map((item, index) => renderTimelineItem(item, index))}
                </div>
              </div>
            ))}
            
            {/* Navigation */}
            {!compact && sortedDates.length > 3 && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Earlier
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                >
                  Later
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}