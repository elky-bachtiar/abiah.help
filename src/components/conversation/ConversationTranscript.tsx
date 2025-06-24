import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Bot, Download, Copy, Search, Clock } from 'lucide-react';
import { Button } from '../ui/Button-bkp';
import { Input } from '../ui/Input-bkp';
import { Card } from '../ui/Card';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface ConversationTranscriptProps {
  messages: ConversationMessage[];
  title?: string;
  date?: string;
  onDownload?: () => void;
  onCopy?: () => void;
  onGenerateDocument?: (documentType: string) => void;
}

export function ConversationTranscript({
  messages,
  title,
  date,
  onDownload,
  onCopy,
  onGenerateDocument
}: ConversationTranscriptProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter messages based on search query
  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;
  
  // Format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };
  
  return (
    <div className="conversation-transcript">
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">{title || 'Conversation Transcript'}</h2>
                {date && (
                  <div className="flex items-center text-text-secondary text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{new Date(date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              
              {onCopy && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopy}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              )}
            </div>
          </div>
          
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <Input
                placeholder="Search transcript..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Messages */}
          <div className="space-y-6">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-text-secondary mx-auto mb-2" />
                <p className="text-text-secondary">No messages found</p>
              </div>
            ) : (
              filteredMessages.map((message, index) => {
                // Skip system messages
                if (message.role === 'system') return null;
                
                const isUser = message.role === 'user';
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isUser ? 'ml-3 bg-primary text-white' : 'mr-3 bg-secondary text-primary'
                      }`}>
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      
                      <div className={`rounded-lg p-4 ${
                        isUser 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-neutral-100 text-text-primary'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        
                        {message.timestamp && (
                          <div className={`text-xs mt-1 ${
                            isUser ? 'text-primary/60' : 'text-text-secondary'
                          }`}>
                            {formatTimestamp(message.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </Card>
      
      {/* Document Generation Suggestions */}
      {onGenerateDocument && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Generate Documents from Conversation</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary/50"
              onClick={() => onGenerateDocument('pitch_deck')}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-green-100 text-green-600">
                    <PresentationChart className="w-5 h-5" />
                  </div>
                  <h4 className="font-medium text-primary mb-1">Generate Pitch Deck</h4>
                  <p className="text-xs text-text-secondary">Create an investor presentation</p>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary/50"
              onClick={() => onGenerateDocument('business_plan')}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-blue-100 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-medium text-primary mb-1">Generate Business Plan</h4>
                  <p className="text-xs text-text-secondary">Create a detailed business plan</p>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary/50"
              onClick={() => onGenerateDocument('market_analysis')}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-orange-100 text-orange-600">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h4 className="font-medium text-primary mb-1">Generate Market Analysis</h4>
                  <p className="text-xs text-text-secondary">Analyze your market and competition</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}