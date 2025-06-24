import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, FileText, PresentationChart, BarChart3, Calendar } from 'lucide-react';
import { DocumentGenerationRequest } from '../../types/Documents';
import { Button } from '../ui/Button-bkp';
import { Card, CardContent } from '../ui/Card';

interface DocumentGenerationStatusProps {
  request: DocumentGenerationRequest;
  onViewDocument?: (documentId: string) => void;
  onRetry?: () => void;
}

export function DocumentGenerationStatus({
  request,
  onViewDocument,
  onRetry
}: DocumentGenerationStatusProps) {
  // Get document type icon
  const getDocumentIcon = () => {
    switch (request.requested_document_type) {
      case 'pitch_deck':
        return PresentationChart;
      case 'business_plan':
        return FileText;
      case 'market_analysis':
        return BarChart3;
      case 'consultation_summary':
        return Calendar;
      default:
        return FileText;
    }
  };
  
  // Get document type label
  const getDocumentTypeLabel = () => {
    switch (request.requested_document_type) {
      case 'pitch_deck':
        return 'Pitch Deck';
      case 'business_plan':
        return 'Business Plan';
      case 'market_analysis':
        return 'Market Analysis';
      case 'consultation_summary':
        return 'Consultation Summary';
      default:
        return 'Document';
    }
  };
  
  // Get status icon
  const getStatusIcon = () => {
    switch (request.status) {
      case 'pending':
      case 'processing':
        return Loader2;
      case 'completed':
        return CheckCircle;
      case 'failed':
        return AlertCircle;
      default:
        return Loader2;
    }
  };
  
  // Get status text
  const getStatusText = () => {
    switch (request.status) {
      case 'pending':
        return 'Preparing to generate...';
      case 'processing':
        return 'Generating document...';
      case 'completed':
        return 'Document generated successfully!';
      case 'failed':
        return 'Document generation failed';
      default:
        return 'Unknown status';
    }
  };
  
  // Get status color
  const getStatusColor = () => {
    switch (request.status) {
      case 'pending':
      case 'processing':
        return 'text-primary';
      case 'completed':
        return 'text-success';
      case 'failed':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };
  
  const IconComponent = getDocumentIcon();
  const StatusIcon = getStatusIcon();
  const documentTypeLabel = getDocumentTypeLabel();
  const statusText = getStatusText();
  const statusColor = getStatusColor();
  const isLoading = request.status === 'pending' || request.status === 'processing';
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Status Bar */}
        <div className={`p-4 ${
          request.status === 'completed' ? 'bg-success/10' :
          request.status === 'failed' ? 'bg-error/10' :
          'bg-primary/10'
        }`}>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              request.status === 'completed' ? 'bg-success/20' :
              request.status === 'failed' ? 'bg-error/20' :
              'bg-primary/20'
            }`}>
              <StatusIcon className={`w-5 h-5 ${statusColor} ${isLoading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className={`font-medium ${statusColor}`}>{statusText}</h3>
              <p className="text-sm text-text-secondary">
                {request.status === 'completed' ? 'View your document below' :
                 request.status === 'failed' ? 'Please try again' :
                 'This may take a minute...'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Document Info */}
        <div className="p-6">
          <div className="flex items-start">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
              request.requested_document_type === 'pitch_deck' ? 'bg-green-100 text-green-600' :
              request.requested_document_type === 'business_plan' ? 'bg-blue-100 text-blue-600' :
              request.requested_document_type === 'market_analysis' ? 'bg-orange-100 text-orange-600' :
              'bg-purple-100 text-purple-600'
            }`}>
              <IconComponent className="w-6 h-6" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-primary mb-1">{documentTypeLabel}</h3>
              
              <div className="text-sm text-text-secondary mb-4">
                {request.parameters.company_name || request.parameters.business_name ? (
                  <div>
                    <span className="font-medium">Company:</span> {request.parameters.company_name || request.parameters.business_name}
                  </div>
                ) : null}
                
                {request.parameters.industry ? (
                  <div>
                    <span className="font-medium">Industry:</span> {request.parameters.industry}
                  </div>
                ) : null}
                
                <div>
                  <span className="font-medium">Requested:</span> {new Date(request.created_at).toLocaleString()}
                </div>
              </div>
              
              {/* Progress Indicator */}
              {isLoading && (
                <div className="mb-4">
                  <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: '5%' }}
                      animate={{ width: request.status === 'pending' ? '15%' : '75%' }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-text-secondary">
                    <span>Preparing</span>
                    <span>Generating</span>
                    <span>Finalizing</span>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3">
                {request.status === 'completed' && request.result_document_id && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onViewDocument?.(request.result_document_id!)}
                  >
                    View Document
                  </Button>
                )}
                
                {request.status === 'failed' && onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}