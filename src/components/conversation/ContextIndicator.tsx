import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Clock, Calendar, Info, AlertCircle } from 'lucide-react';
import { ConversationContext, PreviousConversation } from '../../types/Conversation';
import { formatDate } from '../../store/conversationHistory';

interface ContextIndicatorProps {
  conversationContext: ConversationContext;
  isVisible: boolean;
  position?: 'top' | 'bottom' | 'sidebar';
  highContrast?: boolean;
}

export function ContextIndicator({
  conversationContext,
  isVisible,
  position = 'top',
  highContrast = false
}: ContextIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Determine appropriate classes based on position and contrast mode
  const containerClasses = {
    top: 'w-full rounded-lg mb-4',
    bottom: 'w-full rounded-lg mt-4',
    sidebar: 'w-full rounded-lg'
  };
  
  const colorClasses = highContrast
    ? 'bg-primary text-white border-white'
    : 'bg-primary/10 text-primary border-primary/20';
  
  // Render a previous conversation item
  const renderPreviousConversation = (conversation: PreviousConversation, index: number) => {
    return (
      <motion.div
        key={conversation.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * index }}
        className={`p-3 rounded-lg mb-2 ${highContrast ? 'bg-white/20' : 'bg-white'}`}
      >
        <div className="flex justify-between items-start mb-1">
          <h4 className={`font-medium ${highContrast ? 'text-white' : 'text-primary'}`}>
            {conversation.title}
          </h4>
          <span className={`text-xs ${highContrast ? 'text-white/70' : 'text-text-secondary'}`}>
            {formatDate(conversation.date)}
          </span>
        </div>
        
        <div className={`text-sm mb-2 ${highContrast ? 'text-white/80' : 'text-text-secondary'}`}>
          Relevance: {Math.round(conversation.relevance_score * 100)}%
        </div>
        
        <div className="flex flex-wrap gap-1">
          {conversation.key_points.map((point, i) => (
            <span 
              key={i}
              className={`text-xs px-2 py-1 rounded-full ${
                highContrast 
                  ? 'bg-white/30 text-white' 
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {point}
            </span>
          ))}
        </div>
      </motion.div>
    );
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
          transition={{ duration: 0.3 }}
          className={`context-indicator border ${colorClasses} ${containerClasses[position]}`}
          role="complementary"
          aria-label="Conversation context and AI awareness"
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                highContrast ? 'bg-white text-primary' : 'bg-primary/20 text-primary'
              }`}>
                <Brain className="w-5 h-5" />
              </div>
              
              <div>
                <h3 className={`font-medium ${highContrast ? 'text-white' : 'text-primary'}`}>
                  AI Context Awareness
                </h3>
                <p className={`text-sm ${highContrast ? 'text-white/80' : 'text-text-secondary'}`}>
                  {conversationContext.context_summary}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setExpanded(!expanded)}
              className={`p-2 rounded-full ${
                highContrast 
                  ? 'hover:bg-white/20 text-white' 
                  : 'hover:bg-primary/10 text-primary'
              }`}
              aria-expanded={expanded}
              aria-controls="context-details"
              aria-label="Toggle context details"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Expanded Content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                id="context-details"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`px-4 pb-4 ${highContrast ? 'text-white' : 'text-text-primary'}`}
                role="region"
                aria-label="Previous conversation context"
              >
                {/* Context Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${highContrast ? 'bg-white/20' : 'bg-white'}`}>
                    <div className="flex items-center mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      <h4 className="font-medium">Conversation History</h4>
                    </div>
                    <p className={`text-sm ${highContrast ? 'text-white/80' : 'text-text-secondary'}`}>
                      {conversationContext.previous_conversations.length} previous conversations
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${highContrast ? 'bg-white/20' : 'bg-white'}`}>
                    <div className="flex items-center mb-1">
                      <Info className="w-4 h-4 mr-2" />
                      <h4 className="font-medium">Relationship Strength</h4>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full">
                      <div 
                        className="bg-secondary h-2 rounded-full"
                        style={{ width: `${conversationContext.relationship_strength * 100}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${highContrast ? 'text-white/80' : 'text-text-secondary'}`}>
                      {Math.round(conversationContext.relationship_strength * 100)}% - {
                        conversationContext.relationship_strength > 0.8 ? 'Strong' :
                        conversationContext.relationship_strength > 0.5 ? 'Moderate' :
                        'Developing'
                      }
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${highContrast ? 'bg-white/20' : 'bg-white'}`}>
                    <div className="flex items-center mb-1">
                      <Clock className="w-4 h-4 mr-2" />
                      <h4 className="font-medium">Last Updated</h4>
                    </div>
                    <p className={`text-sm ${highContrast ? 'text-white/80' : 'text-text-secondary'}`}>
                      {formatDate(conversationContext.last_updated)}
                    </p>
                  </div>
                </div>
                
                {/* Related Topics */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Related Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {conversationContext.related_topics.map((topic, index) => (
                      <span 
                        key={index}
                        className={`px-2 py-1 text-sm rounded-full ${
                          highContrast 
                            ? 'bg-white/30 text-white' 
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Previous Conversations */}
                <div>
                  <h4 className="font-medium mb-2">Previous Conversations</h4>
                  {conversationContext.previous_conversations.length > 0 ? (
                    <div className="space-y-2">
                      {conversationContext.previous_conversations.map((conversation, index) => 
                        renderPreviousConversation(conversation, index)
                      )}
                    </div>
                  ) : (
                    <div className={`p-4 rounded-lg text-center ${
                      highContrast ? 'bg-white/20 text-white/80' : 'bg-neutral-100 text-text-secondary'
                    }`}>
                      <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                      <p>No previous conversations found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}