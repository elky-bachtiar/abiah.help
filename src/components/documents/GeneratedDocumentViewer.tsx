import React from 'react';
import { GeneratedDocument } from '../../types/Documents';
import { PitchDeckRenderer } from './PitchDeckRenderer';
import { BusinessPlanRenderer } from './BusinessPlanRenderer';
import { MarketAnalysisRenderer } from './MarketAnalysisRenderer';
import { ConsultationSummaryRenderer } from './ConsultationSummaryRenderer';

interface GeneratedDocumentViewerProps {
  document: GeneratedDocument;
  onClose?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
}

export function GeneratedDocumentViewer({
  document,
  onClose,
  onDownload,
  onShare,
  onPrint
}: GeneratedDocumentViewerProps) {
  // Render the appropriate document type
  const renderDocument = () => {
    switch (document.document_type) {
      case 'pitch_deck':
        return (
          <PitchDeckRenderer
            content={document.content}
            title={document.title}
            onClose={onClose}
            onDownload={onDownload}
            onShare={onShare}
          />
        );
      case 'business_plan':
        return (
          <BusinessPlanRenderer
            content={document.content}
            title={document.title}
            onDownload={onDownload}
            onShare={onShare}
            onPrint={onPrint}
          />
        );
      case 'market_analysis':
        return (
          <MarketAnalysisRenderer
            content={document.content}
            title={document.title}
            onDownload={onDownload}
            onShare={onShare}
            onPrint={onPrint}
          />
        );
      case 'consultation_summary':
        return (
          <ConsultationSummaryRenderer
            content={document.content}
            title={document.title}
            consultationDate={document.created_at}
            onDownload={onDownload}
            onShare={onShare}
            onPrint={onPrint}
          />
        );
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Unsupported Document Type</h2>
            <p className="text-text-secondary">
              This document type ({document.document_type}) is not currently supported for viewing.
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="generated-document-viewer">
      {renderDocument()}
    </div>
  );
}