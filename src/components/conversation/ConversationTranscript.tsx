import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Bot, Download, Copy, Search, Clock, FileText, Share, ExternalLink, Presentation, BarChart3 } from 'lucide-react';
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
  analysis?: {
    keyTopics: string[];
    insights: Array<{
      type: string;
      message: string;
      confidence: number;
    }>;
    sentiment: {
      type: string;
      confidence: number;
    };
    conversationQuality: {
      score: number;
      engagement: string;
      depth: string;
      balance: string;
    };
  };
  onDownload?: () => void;
  onCopy?: () => void;
  onGenerateDocument?: (documentType: string) => void;
  onExportPDF?: () => void;
  onExportWord?: () => void;
  onShare?: () => void;
}

export function ConversationTranscript({
  messages,
  title,
  date,
  analysis,
  onDownload,
  onCopy,
  onGenerateDocument,
  onExportPDF,
  onExportWord,
  onShare
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
  
  // Export conversation as text
  const exportAsText = () => {
    const content = [
      `Conversation Transcript: ${title || 'Untitled'}`,
      `Date: ${date ? new Date(date).toLocaleDateString() : 'Unknown'}`,
      '=' .repeat(50),
      '',
      ...messages.map(msg => {
        if (msg.role === 'system') return '';
        const speaker = msg.role === 'user' ? 'User' : 'AI Assistant';
        const timestamp = msg.timestamp ? ` (${formatTimestamp(msg.timestamp)})` : '';
        return `${speaker}${timestamp}:\n${msg.content}\n`;
      }).filter(Boolean),
      '',
      '=' .repeat(50),
    ];
    
    if (analysis) {
      content.push(
        'Analysis Summary:',
        `Quality Score: ${analysis.conversationQuality.score}%`,
        `Sentiment: ${analysis.sentiment.type} (${Math.round(analysis.sentiment.confidence * 100)}%)`,
        `Key Topics: ${analysis.keyTopics.join(', ')}`,
        ''
      );
      
      if (analysis.insights.length > 0) {
        content.push('Key Insights:');
        analysis.insights.forEach((insight, index) => {
          content.push(`${index + 1}. [${insight.type}] ${insight.message}`);
        });
      }
    }
    
    const blob = new Blob([content.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'transcript'}-${date ? new Date(date).toISOString().split('T')[0] : 'unknown'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Export conversation as JSON
  const exportAsJSON = () => {
    const data = {
      metadata: {
        title: title || 'Untitled Conversation',
        date: date || new Date().toISOString(),
        exportedAt: new Date().toISOString(),
        messageCount: messages.length
      },
      messages,
      analysis,
      statistics: {
        userMessages: messages.filter(m => m.role === 'user').length,
        assistantMessages: messages.filter(m => m.role === 'assistant').length,
        systemMessages: messages.filter(m => m.role === 'system').length
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'transcript'}-${date ? new Date(date).toISOString().split('T')[0] : 'unknown'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Copy conversation to clipboard
  const copyToClipboard = async () => {
    const content = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        const speaker = msg.role === 'user' ? 'User' : 'AI Assistant';
        return `${speaker}: ${msg.content}`;
      })
      .join('\n\n');
    
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
      console.log('Conversation copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };
  
  // Share conversation (basic implementation)
  const shareConversation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Conversation Transcript',
          text: `Check out this AI conversation transcript from ${date ? new Date(date).toLocaleDateString() : 'today'}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        console.log('URL copied to clipboard');
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
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
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={exportAsText}
                title="Export as text file"
              >
                <Download className="w-4 h-4 mr-2" />
                Export TXT
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportAsJSON}
                title="Export as JSON file"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onCopy || copyToClipboard}
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onShare || shareConversation}
                title="Share conversation"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              {onExportPDF && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExportPDF}
                  title="Export as PDF"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              )}
              
              {onExportWord && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExportWord}
                  title="Export as Word document"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Word
                </Button>
              )}
              
              {onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownload}
                  title="Download original format"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
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
      
      {/* Conversation Analysis */}
      {analysis && (
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Conversation Analysis</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Quality Metrics */}
              <div>
                <h4 className="font-medium text-primary mb-3">Quality Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Overall Score</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-neutral-200 rounded-full mr-2">
                        <div 
                          className={`h-full rounded-full ${
                            analysis.conversationQuality.score > 80 ? 'bg-success' :
                            analysis.conversationQuality.score > 60 ? 'bg-warning' :
                            'bg-neutral-400'
                          }`}
                          style={{ width: `${analysis.conversationQuality.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{analysis.conversationQuality.score}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-text-secondary">Engagement</div>
                      <div className={`font-medium ${
                        analysis.conversationQuality.engagement === 'high' ? 'text-success' :
                        analysis.conversationQuality.engagement === 'medium' ? 'text-warning' :
                        'text-neutral-500'
                      }`}>
                        {analysis.conversationQuality.engagement}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-text-secondary">Depth</div>
                      <div className={`font-medium ${
                        analysis.conversationQuality.depth === 'high' ? 'text-success' :
                        analysis.conversationQuality.depth === 'medium' ? 'text-warning' :
                        'text-neutral-500'
                      }`}>
                        {analysis.conversationQuality.depth}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-text-secondary">Balance</div>
                      <div className={`font-medium ${
                        analysis.conversationQuality.balance === 'excellent' ? 'text-success' :
                        analysis.conversationQuality.balance === 'good' ? 'text-warning' :
                        'text-neutral-500'
                      }`}>
                        {analysis.conversationQuality.balance}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sentiment & Topics */}
              <div>
                <h4 className="font-medium text-primary mb-3">Key Insights</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-text-secondary">Sentiment: </span>
                    <span className={`text-sm font-medium ${
                      analysis.sentiment.type === 'positive' ? 'text-success' :
                      analysis.sentiment.type === 'negative' ? 'text-error' :
                      'text-neutral-600'
                    }`}>
                      {analysis.sentiment.type} ({Math.round(analysis.sentiment.confidence * 100)}%)
                    </span>
                  </div>
                  
                  <div>
                    <div className="text-sm text-text-secondary mb-2">Key Topics:</div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.keyTopics.map((topic, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {topic.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Generated Insights */}
            {analysis.insights && analysis.insights.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-primary mb-3">AI Insights</h4>
                <div className="space-y-2">
                  {analysis.insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full mr-2 ${
                            insight.type === 'opportunity' ? 'bg-success/10 text-success' :
                            insight.type === 'engagement' ? 'bg-primary/10 text-primary' :
                            insight.type === 'strategy' ? 'bg-warning/10 text-warning' :
                            'bg-neutral-200 text-neutral-600'
                          }`}>
                            {insight.type}
                          </span>
                          <span className="text-sm text-text-primary">{insight.message}</span>
                        </div>
                        <span className="text-xs text-text-secondary ml-2">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
      
      {/* Document Generation Suggestions */}
      {onGenerateDocument && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Generate Documents from Conversation</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary/50"
              onClick={() => onGenerateDocument?.('pitch_deck')}
            >
              <div className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-green-100 text-green-600">
                    <Presentation className="w-5 h-5" />
                  </div>
                  <h4 className="font-medium text-primary mb-1">Generate Pitch Deck</h4>
                  <p className="text-xs text-text-secondary">Create an investor presentation</p>
                </div>
              </div>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary/50"
              onClick={() => onGenerateDocument?.('business_plan')}
            >
              <div className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-blue-100 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-medium text-primary mb-1">Generate Business Plan</h4>
                  <p className="text-xs text-text-secondary">Create a detailed business plan</p>
                </div>
              </div>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary/50"
              onClick={() => onGenerateDocument?.('market_analysis')}
            >
              <div className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-orange-100 text-orange-600">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h4 className="font-medium text-primary mb-1">Generate Market Analysis</h4>
                  <p className="text-xs text-text-secondary">Analyze your market and competition</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}