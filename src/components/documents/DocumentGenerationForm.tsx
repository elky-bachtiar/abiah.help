import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PresentationChart, FileText, BarChart3, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button-bkp';
import { Input } from '../ui/Input-bkp';
import { Card, CardContent } from '../ui/Card';

interface DocumentGenerationFormProps {
  consultationId: string;
  onSubmit: (documentType: string, parameters: any) => Promise<void>;
  isGenerating: boolean;
}

export function DocumentGenerationForm({
  consultationId,
  onSubmit,
  isGenerating
}: DocumentGenerationFormProps) {
  const [documentType, setDocumentType] = useState<string>('');
  const [formData, setFormData] = useState({
    // Pitch Deck fields
    company_name: '',
    business_idea: '',
    target_market: '',
    funding_amount: '',
    industry: '',
    stage: 'mvp',
    
    // Business Plan fields
    business_name: '',
    business_model: '',
    target_customers: '',
    competitive_advantage: '',
    plan_type: 'standard',
    
    // Market Analysis fields
    geographic_focus: '',
    research_depth: 'detailed'
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare parameters based on document type
    let parameters: any = {};
    
    switch (documentType) {
      case 'pitch_deck':
        parameters = {
          company_name: formData.company_name,
          business_idea: formData.business_idea,
          target_market: formData.target_market,
          funding_amount: formData.funding_amount,
          industry: formData.industry,
          stage: formData.stage
        };
        break;
      case 'business_plan':
        parameters = {
          business_name: formData.business_name || formData.company_name,
          business_model: formData.business_model,
          target_customers: formData.target_customers || formData.target_market,
          competitive_advantage: formData.competitive_advantage,
          plan_type: formData.plan_type
        };
        break;
      case 'market_analysis':
        parameters = {
          industry: formData.industry,
          geographic_focus: formData.geographic_focus,
          research_depth: formData.research_depth
        };
        break;
    }
    
    await onSubmit(documentType, parameters);
  };
  
  // Determine if form is valid based on document type
  const isFormValid = () => {
    switch (documentType) {
      case 'pitch_deck':
        return formData.company_name && formData.business_idea && formData.target_market && 
               formData.funding_amount && formData.industry;
      case 'business_plan':
        return (formData.business_name || formData.company_name) && formData.business_model && 
               (formData.target_customers || formData.target_market);
      case 'market_analysis':
        return formData.industry && formData.geographic_focus;
      default:
        return false;
    }
  };
  
  // Document type options
  const documentTypes = [
    {
      id: 'pitch_deck',
      title: 'Pitch Deck',
      description: 'Create a professional investor presentation',
      icon: PresentationChart,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'business_plan',
      title: 'Business Plan',
      description: 'Generate a comprehensive business plan',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'market_analysis',
      title: 'Market Analysis',
      description: 'Analyze your target market and competition',
      icon: BarChart3,
      color: 'bg-orange-100 text-orange-600'
    }
  ];
  
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-primary mb-2">Generate Document</h2>
        <p className="text-text-secondary">
          Create professional documents based on your consultation
        </p>
      </motion.div>
      
      {/* Document Type Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-primary mb-4">Select Document Type</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {documentTypes.map((type) => {
            const IconComponent = type.icon;
            const isSelected = documentType === type.id;
            
            return (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setDocumentType(type.id)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${type.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-primary mb-1">{type.title}</h3>
                    <p className="text-sm text-text-secondary">{type.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Document Parameters Form */}
      {documentType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">
                {documentType === 'pitch_deck' && 'Pitch Deck Details'}
                {documentType === 'business_plan' && 'Business Plan Details'}
                {documentType === 'market_analysis' && 'Market Analysis Details'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Pitch Deck Fields */}
                {documentType === 'pitch_deck' && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Company Name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        placeholder="e.g., TechFlow Inc."
                        required
                      />
                      
                      <Input
                        label="Industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        placeholder="e.g., SaaS, FinTech, HealthTech"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        Business Idea
                      </label>
                      <textarea
                        name="business_idea"
                        value={formData.business_idea}
                        onChange={handleInputChange}
                        placeholder="Briefly describe your business concept..."
                        className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-24 resize-none"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        Target Market
                      </label>
                      <textarea
                        name="target_market"
                        value={formData.target_market}
                        onChange={handleInputChange}
                        placeholder="Describe your target customers and market..."
                        className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-24 resize-none"
                        required
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Funding Amount"
                        name="funding_amount"
                        value={formData.funding_amount}
                        onChange={handleInputChange}
                        placeholder="e.g., $500K, $2M"
                        required
                      />
                      
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                          Stage
                        </label>
                        <select
                          name="stage"
                          value={formData.stage}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        >
                          <option value="idea">Idea Stage</option>
                          <option value="prototype">Prototype</option>
                          <option value="mvp">Minimum Viable Product</option>
                          <option value="growth">Growth Stage</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Business Plan Fields */}
                {documentType === 'business_plan' && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Business Name"
                        name="business_name"
                        value={formData.business_name || formData.company_name}
                        onChange={handleInputChange}
                        placeholder="e.g., TechFlow Inc."
                        required
                      />
                      
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                          Plan Type
                        </label>
                        <select
                          name="plan_type"
                          value={formData.plan_type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        >
                          <option value="executive_summary">Executive Summary</option>
                          <option value="standard">Standard Plan</option>
                          <option value="comprehensive">Comprehensive Plan</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        Business Model
                      </label>
                      <textarea
                        name="business_model"
                        value={formData.business_model}
                        onChange={handleInputChange}
                        placeholder="Describe how your business makes money..."
                        className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-24 resize-none"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        Target Customers
                      </label>
                      <textarea
                        name="target_customers"
                        value={formData.target_customers || formData.target_market}
                        onChange={handleInputChange}
                        placeholder="Describe your ideal customers..."
                        className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-24 resize-none"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        Competitive Advantage
                      </label>
                      <textarea
                        name="competitive_advantage"
                        value={formData.competitive_advantage}
                        onChange={handleInputChange}
                        placeholder="What makes your business unique compared to competitors..."
                        className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-24 resize-none"
                        required
                      />
                    </div>
                  </>
                )}
                
                {/* Market Analysis Fields */}
                {documentType === 'market_analysis' && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        placeholder="e.g., SaaS, FinTech, HealthTech"
                        required
                      />
                      
                      <Input
                        label="Geographic Focus"
                        name="geographic_focus"
                        value={formData.geographic_focus}
                        onChange={handleInputChange}
                        placeholder="e.g., North America, Global, Europe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        Research Depth
                      </label>
                      <select
                        name="research_depth"
                        value={formData.research_depth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="overview">Overview (Brief analysis)</option>
                        <option value="detailed">Detailed (Standard depth)</option>
                        <option value="comprehensive">Comprehensive (In-depth analysis)</option>
                      </select>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isGenerating}
                    className="group"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Document
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}