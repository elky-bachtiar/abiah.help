import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Download, Share2, Printer, Copy, MessageSquare, Calendar, Clock } from 'lucide-react';
import { ConsultationSummaryContent, ConsultationSummarySection } from '../../types/Documents';
import { Button } from '../ui/Button-bkp';
import { Card } from '../ui/Card';

interface ConsultationSummaryRendererProps {
  content: ConsultationSummaryContent;
  title: string;
  consultationDate?: string;
  onDownload?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
}

export function ConsultationSummaryRenderer({
  content,
  title,
  consultationDate,
  onDownload,
  onShare,
  onPrint
}: ConsultationSummaryRendererProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  const sections = content.sections || [];
  
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };
  
  const toggleAllSections = () => {
    if (expandedSections.size === sections.length) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set(sections.map(section => section.id)));
    }
  };
  
  const formattedDate = consultationDate 
    ? new Date(consultationDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown date';
  
  return (
    <div className="consultation-summary-renderer max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
            <div className="flex items-center text-text-secondary">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="mr-4">{formattedDate}</span>
              <MessageSquare className="w-4 h-4 mr-1" />
              <span>{content.metadata.session_type} Session</span>
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
            
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            
            {onPrint && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Key Topics */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-primary">Key Topics Discussed</h2>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {content.metadata.key_topics.map((topic, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
          
          <div className="mt-4 text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAllSections}
            >
              {expandedSections.size === sections.length ? 'Collapse All' : 'Expand All'}
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Content Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.id}>
            <div className="p-6">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex items-center justify-between w-full text-left mb-4"
              >
                <h2 className="text-xl font-semibold text-primary">{section.title}</h2>
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="w-5 h-5 text-text-secondary" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-text-secondary" />
                )}
              </button>
              
              {expandedSections.has(section.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className="prose prose-primary max-w-none"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                  
                  {/* Copy Section Button */}
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(section.content);
                      }}
                      className="text-text-secondary hover:text-primary"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Section
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}