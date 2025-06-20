import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, FileText, BarChart3, Presentation as PresentationChart, TrendingUp, Calendar, MoreVertical, Eye, Download, Share2, Trash2 } from 'lucide-react';
import { userAtom } from '../store/auth';
import { Document, DocumentProgress } from '../types/Documents';
import { Button } from '../components/ui/Button-bkp';
import { Input } from '../components/ui/Input-bkp';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/documents/ProgressBar';
import { DocumentViewer } from '../components/documents/DocumentViewer';
import { DocumentGenerator } from '../components/documents/DocumentGenerator';
import { formatDate } from '../lib/utils';

// Mock data for demonstration
const mockDocuments: Document[] = [
  {
    id: '1',
    user_id: 'user-1',
    title: 'TechFlow Business Plan',
    type: 'business_plan',
    status: 'completed',
    content: {
      sections: [
        {
          id: 'exec-summary',
          title: 'Executive Summary',
          content: '<p>TechFlow is a revolutionary B2B SaaS platform that streamlines workflow automation for mid-market companies. Our solution addresses the critical pain point of manual process management that costs businesses an average of $2.3M annually in lost productivity.</p><p>Founded in 2024, we have already secured $500K in pre-seed funding and have 15 pilot customers showing 40% efficiency improvements. We are seeking $2M in Series A funding to accelerate product development and market expansion.</p>',
          order: 1,
          type: 'text'
        },
        {
          id: 'market-analysis',
          title: 'Market Analysis',
          content: '<p>The workflow automation market is experiencing unprecedented growth, valued at $13.2B in 2024 and projected to reach $39.5B by 2030 (CAGR of 20.1%).</p><p><strong>Target Market:</strong></p><ul><li>Mid-market companies (100-1000 employees)</li><li>Technology, Healthcare, and Financial Services sectors</li><li>Companies spending $50K+ annually on manual processes</li></ul><p><strong>Market Opportunity:</strong></p><ul><li>TAM: $39.5B (Total Addressable Market)</li><li>SAM: $8.2B (Serviceable Addressable Market)</li><li>SOM: $420M (Serviceable Obtainable Market)</li></ul>',
          order: 2,
          type: 'text'
        },
        {
          id: 'competitive-landscape',
          title: 'Competitive Landscape',
          content: '<p>The competitive landscape includes established players and emerging startups:</p><p><strong>Direct Competitors:</strong></p><ul><li><strong>Zapier</strong> - Market leader with 5M+ users, but limited enterprise features</li><li><strong>Microsoft Power Automate</strong> - Strong enterprise presence, complex setup</li><li><strong>Nintex</strong> - Enterprise-focused, high price point</li></ul><p><strong>Our Competitive Advantage:</strong></p><ul><li>Industry-specific templates and workflows</li><li>AI-powered process optimization</li><li>50% faster implementation time</li><li>Superior customer support and onboarding</li></ul>',
          order: 3,
          type: 'text'
        },
        {
          id: 'business-model',
          title: 'Business Model',
          content: '<p>TechFlow operates on a SaaS subscription model with multiple tiers:</p><p><strong>Pricing Tiers:</strong></p><ul><li><strong>Starter</strong>: $49/month - Up to 10 workflows, 5 users</li><li><strong>Professional</strong>: $149/month - Unlimited workflows, 25 users</li><li><strong>Enterprise</strong>: $499/month - Advanced features, unlimited users</li></ul><p><strong>Revenue Streams:</strong></p><ul><li>Monthly/Annual subscriptions (85% of revenue)</li><li>Professional services and implementation (10%)</li><li>Training and certification programs (5%)</li></ul><p><strong>Unit Economics:</strong></p><ul><li>Customer Acquisition Cost (CAC): $1,200</li><li>Customer Lifetime Value (LTV): $18,500</li><li>LTV/CAC Ratio: 15.4:1</li><li>Gross Margin: 87%</li></ul>',
          order: 4,
          type: 'text'
        },
        {
          id: 'financial-projections',
          title: 'Financial Projections',
          content: '<p>Our financial projections show strong growth trajectory over the next 5 years:</p><p><strong>Revenue Projections:</strong></p><ul><li><strong>Year 1</strong>: $500K ARR (50 customers)</li><li><strong>Year 2</strong>: $2.1M ARR (180 customers)</li><li><strong>Year 3</strong>: $6.8M ARR (450 customers)</li><li><strong>Year 4</strong>: $15.2M ARR (850 customers)</li><li><strong>Year 5</strong>: $28.7M ARR (1,400 customers)</li></ul><p><strong>Key Metrics:</strong></p><ul><li>Monthly Recurring Revenue (MRR) growth: 15% month-over-month</li><li>Customer churn rate: <5% annually</li><li>Net Revenue Retention: 125%</li><li>Gross margin: 87% (industry-leading)</li></ul><p><strong>Funding Requirements:</strong></p><ul><li>Total funding needed: $2M Series A</li><li>Use of funds: 60% product development, 25% sales & marketing, 15% operations</li><li>Expected runway: 24 months to profitability</li></ul>',
          order: 5,
          type: 'text'
        }
      ],
      metadata: {
        company_name: 'TechFlow',
        industry: 'B2B SaaS',
        stage: 'Series A',
        target_audience: 'Investors',
        total_sections: 5
      }
    },
    progress_data: {
      completed_sections: ['exec-summary', 'market-analysis'],
      last_viewed_section: 'competitive-landscape',
      completion_percentage: 40,
      time_spent: 25,
      last_updated: '2025-01-27T10:30:00Z'
    },
    created_at: '2025-01-25T09:00:00Z',
    updated_at: '2025-01-27T10:30:00Z'
  },
  {
    id: '2',
    user_id: 'user-1',
    title: 'TechFlow Pitch Deck',
    type: 'pitch_deck',
    status: 'completed',
    content: {
      sections: [
        {
          id: 'title-slide',
          title: 'Title Slide',
          content: '<h1>TechFlow</h1><p>Revolutionizing Workflow Automation for Mid-Market Companies</p>',
          order: 1,
          type: 'text'
        },
        {
          id: 'problem',
          title: 'The Problem',
          content: '<p>Mid-market companies lose $2.3M annually due to manual process management</p>',
          order: 2,
          type: 'text'
        }
      ],
      metadata: {
        company_name: 'TechFlow',
        industry: 'B2B SaaS',
        stage: 'Series A',
        total_sections: 2
      }
    },
    progress_data: {
      completed_sections: ['title-slide'],
      completion_percentage: 50,
      time_spent: 10,
      last_updated: '2025-01-26T14:20:00Z'
    },
    created_at: '2025-01-26T09:00:00Z',
    updated_at: '2025-01-26T14:20:00Z'
  }
];

export function Documents() {
  const [user] = useAtom(userAtom);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

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
          <div className="flex flex-col sm:flex-row gap-4">
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
                <option value="financial_projections">Financial Projections</option>
              </select>
            </div>
          </div>
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
        {filteredDocuments.length === 0 && (
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