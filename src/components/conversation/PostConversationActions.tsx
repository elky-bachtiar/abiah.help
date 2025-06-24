import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Presentation as PresentationChart, BarChart3, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button-bkp';
import { Card, CardContent } from '../ui/Card';

interface PostConversationActionsProps {
  transcript: any[] | null;
  documentOpportunities?: {
    pitch_deck?: boolean;
    business_plan?: boolean;
    market_analysis?: boolean;
  };
  onGenerateDocument: (type: string) => void;
  onScheduleFollowUp?: () => void;
}

export function PostConversationActions({
  transcript,
  documentOpportunities = {},
  onGenerateDocument,
  onScheduleFollowUp
}: PostConversationActionsProps) {
  // Determine which document types were mentioned in the conversation
  const { pitch_deck = false, business_plan = false, market_analysis = false } = documentOpportunities;
  
  // Count the number of opportunities
  const opportunityCount = Object.values(documentOpportunities).filter(Boolean).length;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-primary mb-4">
            Next Steps
          </h3>
          
          {opportunityCount > 0 ? (
            <div className="mb-6">
              <p className="text-text-secondary mb-4">
                Based on your conversation, we recommend generating the following documents:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                {pitch_deck && (
                  <div 
                    className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => onGenerateDocument('pitch_deck')}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <PresentationChart className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="font-medium text-green-700">Pitch Deck</h4>
                    </div>
                    <p className="text-sm text-green-600">
                      Create an investor presentation based on your conversation
                    </p>
                  </div>
                )}
                
                {business_plan && (
                  <div 
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => onGenerateDocument('business_plan')}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-blue-700">Business Plan</h4>
                    </div>
                    <p className="text-sm text-blue-600">
                      Generate a comprehensive business plan document
                    </p>
                  </div>
                )}
                
                {market_analysis && (
                  <div 
                    className="bg-orange-50 border border-orange-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => onGenerateDocument('market_analysis')}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                        <BarChart3 className="w-4 h-4 text-orange-600" />
                      </div>
                      <h4 className="font-medium text-orange-700">Market Analysis</h4>
                    </div>
                    <p className="text-sm text-orange-600">
                      Analyze your market and competition
                    </p>
                  </div>
                )}
                
                {/* Always show consultation summary option */}
                <div 
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => onGenerateDocument('consultation_summary')}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-purple-700">Consultation Summary</h4>
                  </div>
                  <p className="text-sm text-purple-600">
                    Generate a summary of this consultation with key points
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-text-secondary mb-4">
                Your conversation has been saved. What would you like to do next?
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div 
                  className="bg-primary/10 border border-primary/20 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => onGenerateDocument('consultation_summary')}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-medium text-primary">Generate Consultation Summary</h4>
                  </div>
                  <p className="text-sm text-primary/80">
                    Create a summary document with key points and action items
                  </p>
                </div>
                
                {onScheduleFollowUp && (
                  <div 
                    className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                    onClick={onScheduleFollowUp}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center mr-2">
                        <Calendar className="w-4 h-4 text-secondary" />
                      </div>
                      <h4 className="font-medium text-secondary">Schedule Follow-Up</h4>
                    </div>
                    <p className="text-sm text-secondary/80">
                      Book your next mentorship session
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/documents'}
              className="group"
            >
              View All Documents
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}