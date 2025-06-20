import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Share2,
  ExternalLink,
  BookOpen, 
  CheckCircle2, 
  Circle,
  ChevronRight,
  ChevronDown,
  Eye,
  Clock
} from 'lucide-react';
import { Document, DocumentSection, DocumentProgress } from '../../types/Documents';
import { Button } from '../ui/Button';
import { ProgressBar } from './ProgressBar';
import { ExportOptions } from './ExportOptions';
import { cn } from '../../lib/utils';

interface DocumentViewerProps {
  document: Document;
  onProgressUpdate: (progress: DocumentProgress) => void;
  className?: string;
}

export function DocumentViewer({ document, onProgressUpdate, className }: DocumentViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [completedSections, setCompletedSections] = useState<Set<string>>(
    new Set(document.progress_data?.completed_sections || [])
  );
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(document.progress_data?.time_spent || 0);
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  const sectionRefs = useRef<{ [key: string]: HTMLElement }>({});
  const startTimeRef = useRef<number>(Date.now());
  const timeIntervalRef = useRef<NodeJS.Timeout>();

  // Calculate progress
  const totalSections = document.content.sections.length;
  const completedCount = completedSections.size;
  const progressPercentage = totalSections > 0 ? (completedCount / totalSections) * 100 : 0;

  // Track time spent
  useEffect(() => {
    timeIntervalRef.current = setInterval(() => {
      const newTimeSpent = timeSpent + ((Date.now() - startTimeRef.current) / 60000);
      setTimeSpent(newTimeSpent);
      startTimeRef.current = Date.now();
    }, 30000); // Update every 30 seconds

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [timeSpent]);

  // Auto-save progress
  useEffect(() => {
    const progress: DocumentProgress = {
      completed_sections: Array.from(completedSections),
      last_viewed_section: currentSection || undefined,
      completion_percentage: progressPercentage,
      time_spent: timeSpent,
      last_updated: new Date().toISOString(),
    };

    onProgressUpdate(progress);
  }, [completedSections, currentSection, progressPercentage, timeSpent, onProgressUpdate]);

  // Intersection Observer for section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setCurrentSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [document.content.sections]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const markSectionComplete = (sectionId: string) => {
    const newCompleted = new Set(completedSections);
    if (newCompleted.has(sectionId)) {
      newCompleted.delete(sectionId);
    } else {
      newCompleted.add(sectionId);
    }
    setCompletedSections(newCompleted);
  };

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={cn('max-w-6xl mx-auto', className)}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">{document.title}</h1>
            <div className="flex items-center text-text-secondary text-sm">
              <BookOpen className="w-4 h-4 mr-2" /> 
              <span>{document.content.metadata.company_name}</span>
              <span className="mx-2">•</span>
              <span>{document.content.metadata.industry}</span>
              <span className="mx-2">•</span>
              <span>{totalSections} sections</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportOptions(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          percentage={progressPercentage}
          totalSections={totalSections}
          completedSections={completedCount}
          timeSpent={timeSpent}
          showDetails={true}
        />
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Table of Contents */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-neutral-200 p-4 sticky top-6">
            <h3 className="font-semibold text-primary mb-4 flex items-center"> 
              <BookOpen className="w-4 h-4 mr-2" />
              Table of Contents
            </h3>
            
            <nav className="space-y-2">
              {document.content.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    'w-full text-left p-2 rounded-lg text-sm transition-colors flex items-center justify-between group',
                    currentSection === section.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-neutral-50 hover:text-primary'
                  )}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-neutral-200 text-xs flex items-center justify-center mr-2 group-hover:bg-primary group-hover:text-white transition-colors">
                      {index + 1}
                    </span>
                    <span className="truncate">{section.title}</span>
                  </div>
                  
                  {completedSections.has(section.id) && (
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Document Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-neutral-200">
            {document.content.sections.map((section, index) => (
              <motion.div
                key={section.id}
                id={section.id}
                ref={(el) => {
                  if (el) sectionRefs.current[section.id] = el;
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => window.open('https://investor-deck.abiah.help/', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Investor Deck
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-b border-neutral-200 last:border-b-0"
              >
                <div className="p-6">
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center group"
                    >
                      {expandedSections.has(section.id) ? (
                        <ChevronDown className="w-5 h-5 text-text-secondary mr-2" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-text-secondary mr-2" />
                      )}
                      <h2 className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                        {section.title} 
                      </h2>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {currentSection === section.id && (
                        <div className="flex items-center text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                          <Eye className="w-3 h-3 mr-1" />
                          Viewing
                        </div>
                      )}
                      
                      <button
                        onClick={() => markSectionComplete(section.id)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          completedSections.has(section.id)
                            ? 'text-success hover:text-success/80'
                            : 'text-text-secondary hover:text-success'
                        )}
                        title={completedSections.has(section.id) ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {completedSections.has(section.id) ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Section Content */}
                  {(expandedSections.has(section.id) || expandedSections.size === 0) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="prose prose-lg max-w-none"
                    >
                      <div 
                        dangerouslySetInnerHTML={{ __html: section.content }}
                        className="text-text-primary leading-relaxed"
                      /> 
                      
                      {/* Subsections */}
                      {section.subsections && section.subsections.length > 0 && (
                        <div className="mt-6 space-y-4">
                          {section.subsections.map((subsection) => (
                            <div key={subsection.id} className="border-l-4 border-primary/20 pl-4">
                              <h3 className="text-lg font-medium text-primary mb-2">
                                {subsection.title}
                              </h3>
                              <div 
                                dangerouslySetInnerHTML={{ __html: subsection.content }}
                                className="text-text-secondary"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options Modal */}
      {showExportOptions && (
        <ExportOptions
          document={document}
          onClose={() => setShowExportOptions(false)}
        />
      )}
    </div>
  );
}