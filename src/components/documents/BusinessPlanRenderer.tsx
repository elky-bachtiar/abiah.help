import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Download, Share2, Printer, Copy, BookOpen } from 'lucide-react';
import { BusinessPlanContent, BusinessPlanSection } from '../../types/Documents';
import { Button } from '../ui/Button-bkp';
import { Card } from '../ui/Card';

interface BusinessPlanRendererProps {
  content: BusinessPlanContent;
  title: string;
  onDownload?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
}

export function BusinessPlanRenderer({
  content,
  title,
  onDownload,
  onShare,
  onPrint
}: BusinessPlanRendererProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [tableOfContentsOpen, setTableOfContentsOpen] = useState(true);
  
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
  
  const toggleTableOfContents = () => {
    setTableOfContentsOpen(!tableOfContentsOpen);
  };
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      
      // Expand the section if it's collapsed
      if (!expandedSections.has(sectionId)) {
        toggleSection(sectionId);
      }
    }
  };
  
  return (
    <div className="business-plan-renderer max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
            <p className="text-text-secondary">
              {content.metadata.business_name} • {content.metadata.plan_type} Plan • {sections.length} sections
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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Table of Contents */}
        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <div className="p-4 border-b border-neutral-200">
              <button
                onClick={toggleTableOfContents}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="font-semibold text-primary">Table of Contents</h3>
                </div>
                {tableOfContentsOpen ? (
                  <ChevronDown className="w-5 h-5 text-text-secondary" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-text-secondary" />
                )}
              </button>
            </div>
            
            {tableOfContentsOpen && (
              <div className="p-4">
                <div className="mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAllSections}
                    className="w-full justify-center"
                  >
                    {expandedSections.size === sections.length ? 'Collapse All' : 'Expand All'}
                  </Button>
                </div>
                
                <nav className="space-y-1">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors flex items-center"
                    >
                      <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs mr-2">
                        {index + 1}
                      </span>
                      <span className="text-text-primary text-sm">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </Card>
        </div>
        
        {/* Content */}
        <div className="md:col-span-3">
          <Card>
            <div className="divide-y divide-neutral-200">
              {sections.map((section) => (
                <div key={section.id} id={section.id} className="section">
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
                        
                        {/* Subsections */}
                        {section.subsections && section.subsections.length > 0 && (
                          <div className="mt-6 space-y-6">
                            {section.subsections.map((subsection) => (
                              <div key={subsection.id} className="pl-4 border-l-4 border-primary/20">
                                <h3 className="text-lg font-medium text-primary mb-2">{subsection.title}</h3>
                                <div 
                                  className="prose prose-primary max-w-none"
                                  dangerouslySetInnerHTML={{ __html: subsection.content }}
                                />
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
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}