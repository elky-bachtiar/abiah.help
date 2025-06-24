import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, FileText, BarChart3, Presentation as PresentationChart, TrendingUp, Calendar, MoreVertical, Eye, Download, Share2, Trash2, MessageSquare } from 'lucide-react';
import { userAtom } from '../store/auth';
import { Document, DocumentProgress, GeneratedDocument, DocumentGenerationRequest } from '../types/Documents';
import { Button } from '../components/ui/Button-bkp';
import { Input } from '../components/ui/Input-bkp'; 
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/documents/ProgressBar';
import { DocumentViewer } from '../components/documents/DocumentViewer';
import { GeneratedDocumentViewer } from '../components/documents/GeneratedDocumentViewer';
import { DocumentGenerator } from '../components/documents/DocumentGenerator';
import { DocumentGenerationForm } from '../components/documents/DocumentGenerationForm';
import { DocumentGenerationStatus } from '../components/documents/DocumentGenerationStatus';
import { GeneratedDocumentCard } from '../components/documents/GeneratedDocumentCard';
import { formatDate } from '../lib/utils';
import mockDocumentData from './mockDocument.json';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';

// Use imported mock data
const mockDocuments: Document[] = mockDocumentData.mockDocuments;

export function Documents() {
  const [user] = useAtom(userAtom);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedGeneratedDocument, setSelectedGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showGenerationForm, setShowGenerationForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [filterType, setFilterType] = useState<string>('all');
  const [activeConsultationId, setActiveConsultationId] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string | null>(null);
  
  // Get document generation capabilities
  const {
    generatedDocuments,
    fetchGeneratedDocuments,
    requestGeneration,
    generationStatus,
    activeGenerations,
    isLoading: isDocumentsLoading
  } = useDocuments();
  
  // Check URL parameters for document generation
  useEffect(() => {
    const type = searchParams.get('type');
    const conversation = searchParams.get('conversation');
    
    if (type && conversation) {
      setDocumentType(type);
      setActiveConsultationId(conversation);
      setShowGenerationForm(true);
    }
  }, [searchParams]);
  
  // Fetch generated documents when consultation ID changes
  useEffect(() => {
    if (activeConsultationId) {
      fetchGeneratedDocuments(activeConsultationId);
    }
  }, [activeConsultationId, fetchGeneratedDocuments]);

  // Filter documents based on search and type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content.metadata.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleProgressUpdate = (documentId: string, progress: DocumentProgress) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, progress_data: progress, updated_at: new Date().toISOString() }
        : doc
    ));
  };

  // Handle document generation form submission
  const handleGenerateDocument = async (documentType: string, parameters: any) => {
    if (!activeConsultationId) return;
    
    try {
      await requestGeneration(activeConsultationId, documentType, parameters);
      setShowGenerationForm(false);
    } catch (error) {
      console.error('Error generating document:', error);
    }
  };
  
  // Handle viewing a generated document
  const handleViewGeneratedDocument = (document: GeneratedDocument) => {
    setSelectedGeneratedDocument(document);
  };
  
  // Handle regenerating a document
  const handleRegenerateDocument = (document: GeneratedDocument) => {
    setActiveConsultationId(document.consultation_id);
    setDocumentType(document.document_type);
    setShowGenerationForm(true);
  };
  
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'business_plan': return FileText;
      case 'pitch_deck': return PresentationChart;
      case 'financial_projections': return BarChart3;
      case 'market_analysis': return TrendingUp;
      default: return FileText;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'business_plan': return 'Business Plan';
      case 'pitch_deck': return 'Pitch Deck'; 
      case 'financial_projections': return 'Financial Projections';
      case 'market_analysis': return 'Market Analysis';
      case 'executive_summary': return 'Executive Summary';
      default: return 'Document';
    }
  };

  if (selectedGeneratedDocument) {
    return (
      <div className="min-h-screen bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedGeneratedDocument(null)}
              className="mb-4"
            >
              ← Back to Documents
            </Button>
          </div>
          
          <GeneratedDocumentViewer
            document={selectedGeneratedDocument}
            onClose={() => setSelectedGeneratedDocument(null)}
            onDownload={() => {
              // Simulate download
              alert('Download functionality would be implemented here');
            }}
            onShare={() => {
              // Simulate share
              alert('Share functionality would be implemented here');
            }}
            onPrint={() => {
              window.print();
            }}
          />
        </div>
      </div>
    );
  }

  if (selectedDocument) {
    return (
      <div className="min-h-screen bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedDocument(null)}
              className="mb-4"
            >
              ← Back to Documents
            </Button>
          </div>
          
          <DocumentViewer
            document={selectedDocument}
            onProgressUpdate={(progress) => handleProgressUpdate(selectedDocument.id, progress)}
          />
        </div>
      </div>
    );
  }

  if (showGenerationForm) {
    return (
      <div className="min-h-screen bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                setShowGenerationForm(false);
                navigate('/documents');
              }}
              className="mb-4"
            >
              ← Back to Documents
            </Button>
          </div>
          
          <DocumentGenerationForm
            consultationId={activeConsultationId!}
            onSubmit={(documentType, parameters) => handleGenerateDocument(documentType, parameters)}
            isGenerating={generationStatus === 'generating'}
          />
          
          {/* Show active generation requests */}
          {activeGenerations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-primary mb-4">Generation Status</h3>
              
              <div className="space-y-4">
                {activeGenerations.map((request) => (
                  <DocumentGenerationStatus
                    key={request.id}
                    request={request}
                    onViewDocument={(documentId) => {
                      // Find the document and view it
                      const document = generatedDocuments.find(doc => doc.id === documentId);
                      if (document) {
                        setSelectedGeneratedDocument(document);
                      }
                    }}
                    onRetry={() => {
                      // Set up for regeneration
                      setDocumentType(request.requested_document_type);
                      setShowGenerationForm(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showGenerator) {
    return (
      <div className="min-h-screen bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowGenerator(false)}
              className="mb-4"
            >
              ← Back to Documents
            </Button>
          </div>
          
          <DocumentGenerator
            onDocumentGenerated={(doc) => {
              setDocuments(prev => [...prev, doc]);
              setShowGenerator(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                Document Library
              </h1>
              <p className="text-text-secondary text-lg">
                Manage your business documents and track reading progress
              </p>
            </div>
            
            <Button
              onClick={() => setShowGenerator(true)}
              className="group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Generate Document
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-text-secondary" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="business_plan">Business Plan</option>
                <option value="pitch_deck">Pitch Deck</option>
                <option value="executive_summary">Executive Summary</option>
                <option value="market_analysis">Market Analysis</option>
                <option value="consultation_summary">Consultation Summary</option>
                <option value="generated">AI Generated</option>
              </select>
            </div>
          </div>
          
          {/* Generated Documents Section */}
          {generatedDocuments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Generated from Conversations
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedDocuments
                  .filter(doc => filterType === 'all' || filterType === 'generated' || doc.document_type === filterType)
                  .filter(doc => !searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((document, index) => (
                    <GeneratedDocumentCard
                      key={document.id}
                      document={document}
                      onView={handleViewGeneratedDocument}
                      onRegenerate={handleRegenerateDocument}
                      onDownload={() => {
                        // Simulate download
                        alert('Download functionality would be implemented here');
                      }}
                      onShare={() => {
                        // Simulate share
                        alert('Share functionality would be implemented here');
                      }}
                    />
                  ))
                }
              </div>
            </div>
          )}

          {/* Regular Documents Grid */}
          <h2 className="text-xl font-semibold text-primary mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Your Documents
          </h2>
          
        </motion.div>

        {/* Document Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document, index) => {
            const IconComponent = getDocumentIcon(document.type);
            const progress = document.progress_data?.completion_percentage || 0;
            const completedSections = document.progress_data?.completed_sections?.length || 0;
            const totalSections = document.content.metadata.total_sections;
            
            return (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          document.type === 'business_plan' ? 'bg-blue-100 text-blue-600' :
                          document.type === 'pitch_deck' ? 'bg-green-100 text-green-600' :
                          document.type === 'executive_summary' ? 'bg-purple-100 text-purple-600' :
                          document.type === 'market_analysis' ? 'bg-orange-100 text-orange-600' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="ml-3">
                          <CardTitle className="text-lg">{document.title}</CardTitle>
                          <div className="text-xs text-text-secondary mt-1">
                            {getDocumentTypeLabel(document.type)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-text-secondary" />
                        </button>
                        {/* Dropdown menu would go here */}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <div className="text-sm text-text-secondary mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span>Company:</span>
                        <span className="font-medium text-text-primary">{document.content.metadata.company_name}</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span>Industry:</span>
                        <span className="font-medium text-text-primary">{document.content.metadata.industry}</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span>Created:</span>
                        <span className="font-medium text-text-primary">{formatDate(document.created_at)}</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-text-secondary">Reading Progress</span>
                        <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
                      </div>
                      <div className="bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        {completedSections} of {totalSections} sections completed
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-auto pt-4 border-t border-neutral-200 flex items-center justify-between">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedDocument(document)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-text-secondary" />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Share2 className="w-4 h-4 text-text-secondary" />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-error">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && generatedDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">No documents found</h3>
            <p className="text-text-secondary mb-6">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Generate your first document to get started'}
            </p>
            <Button
              onClick={() => setShowGenerator(true)}
              className="group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Generate Document
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}