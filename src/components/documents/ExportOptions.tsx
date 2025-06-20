import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, FileText, Image, Share2, Mail, Link, ExternalLink } from 'lucide-react';
import { Document } from '../../types/Documents';
import { Button } from '../ui/Button-bkp';
import { Card } from '../ui/Card';

interface ExportOptionsProps {
  document: Document;
  onClose: () => void;
}

export function ExportOptions({ document, onClose }: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'html'>('pdf');

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate and download the file
      const blob = await generateDocument(document, exportFormat);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.title}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateDocument = async (doc: Document, format: string): Promise<Blob> => {
    // This is a simplified implementation
    // In a real app, you'd use libraries like jsPDF, docx, etc.
    
    if (format === 'pdf') {
      return generatePDF(doc);
    } else if (format === 'html') {
      return generateHTML(doc);
    } else {
      return generateDOCX(doc);
    }
  };

  const generatePDF = async (doc: Document): Promise<Blob> => {
    // Simplified PDF generation
    const content = doc.content.sections
      .map(section => `${section.title}\n\n${section.content}\n\n`)
      .join('');
    
    return new Blob([content], { type: 'application/pdf' });
  };

  const generateHTML = async (doc: Document): Promise<Blob> => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title}</title>
          <style>
            body { font-family: Inter, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #2A2F6D; border-bottom: 2px solid #F9B94E; padding-bottom: 10px; }
            h2 { color: #2A2F6D; margin-top: 30px; }
            .section { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <h1>${doc.title}</h1>
          ${doc.content.sections.map(section => `
            <div class="section">
              <h2>${section.title}</h2>
              <div>${section.content}</div>
            </div>
          `).join('')}
        </body>
      </html>
    `;
    
    return new Blob([html], { type: 'text/html' });
  };

  const generateDOCX = async (doc: Document): Promise<Blob> => {
    // Simplified DOCX generation (would use docx library in real implementation)
    const content = doc.content.sections
      .map(section => `${section.title}\n\n${section.content}\n\n`)
      .join('');
    
    return new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  };

  const handleShare = async (method: 'email' | 'link') => {
    if (method === 'link') {
      // Generate shareable link
      const shareUrl = `${window.location.origin}/documents/${document.id}/shared`;
      await navigator.clipboard.writeText(shareUrl);
      // Show toast notification
    } else {
      // Open email client
      const subject = `Shared Document: ${document.title}`;
      const body = `I'm sharing this business plan document with you: ${document.title}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-primary">Export Document</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'pdf', label: 'PDF', icon: FileText },
                { value: 'html', label: 'HTML', icon: Image },
                { value: 'docx', label: 'DOCX', icon: FileText },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setExportFormat(value as any)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    exportFormat === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-neutral-200 hover:border-primary/50'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            loading={isExporting}
            disabled={isExporting} 
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Generating...' : `Export as ${exportFormat.toUpperCase()}`}
          </Button>

          {/* Sharing Options */}
          <div className="border-t border-neutral-200 pt-6">
            <label className="block text-sm font-medium text-primary mb-3">
              Share Document
            </label> 
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare('link')}
                className="flex items-center justify-center"
              >
                <Link className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('email')}
                className="flex items-center justify-center"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
            
            {/* Investor Deck Link */}
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <Button variant="outline" className="w-full" onClick={() => window.open('https://investor-deck.abiah.help/', '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Investor Deck
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}