import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Download, Share2, Printer, Copy, BarChart3 } from 'lucide-react';
import { MarketAnalysisContent, MarketAnalysisSection } from '../../types/Documents';
import { Button } from '../ui/Button-bkp';
import { Card } from '../ui/Card';

interface MarketAnalysisRendererProps {
  content: MarketAnalysisContent;
  title: string;
  onDownload?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
}

export function MarketAnalysisRenderer({
  content,
  title,
  onDownload,
  onShare,
  onPrint
}: MarketAnalysisRendererProps) {
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
  
  return (
    <div className="market-analysis-renderer max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
            <p className="text-text-secondary">
              {content.metadata.industry} • {content.metadata.geographic_focus} • {content.metadata.research_depth} Analysis
            </p>
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
      
      {/* Document Overview */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-primary">Market Analysis Overview</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-primary/10 rounded-lg p-4">
              <h3 className="font-medium text-primary mb-1">Industry</h3>
              <p className="text-text-secondary">{content.metadata.industry}</p>
            </div>
            
            <div className="bg-primary/10 rounded-lg p-4">
              <h3 className="font-medium text-primary mb-1">Geographic Focus</h3>
              <p className="text-text-secondary">{content.metadata.geographic_focus}</p>
            </div>
            
            <div className="bg-primary/10 rounded-lg p-4">
              <h3 className="font-medium text-primary mb-1">Research Depth</h3>
              <p className="text-text-secondary capitalize">{content.metadata.research_depth}</p>
            </div>
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
                  
                  {/* Charts (if available) */}
                  {section.charts && section.charts.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.charts.map((chart, index) => (
                        <div key={index} className="bg-neutral-50 p-4 rounded-lg">
                          <div className="text-center text-text-secondary">
                            [Chart visualization would appear here]
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
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