import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Calendar, 
  Filter, 
  Download, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Target,
  Zap,
  BarChart,
  X
} from 'lucide-react';
import { ConversationInsight, Recommendation, InsightFilters } from '../../types/Conversation';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button-bkp';

interface InsightsDashboardProps {
  userId: string;
  insights: ConversationInsight[];
  recommendations: Recommendation[];
  onInsightAction?: (insight: ConversationInsight, action: string) => void;
  onFilterChange?: (filters: InsightFilters) => void;
}

export function InsightsDashboard({
  userId,
  insights,
  recommendations,
  onInsightAction,
  onFilterChange
}: InsightsDashboardProps) {
  // Local state
  const [filters, setFilters] = useState<InsightFilters>({
    timeframe: 'month',
    type: 'all',
    priority: 'all'
  });
  
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  
  // Handle filter changes
  const handleFilterChange = (key: keyof InsightFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };
  
  // Handle insight dismissal
  const handleDismissInsight = (insightId: string) => {
    setDismissedInsights(prev => [...prev, insightId]);
    onInsightAction?.(insights.find(i => i.id === insightId)!, 'dismiss');
  };
  
  // Handle insight action
  const handleInsightAction = (insight: ConversationInsight, action: string) => {
    onInsightAction?.(insight, action);
  };
  
  // Filter insights based on current filters and dismissed state
  const filteredInsights = insights.filter(insight => {
    if (dismissedInsights.includes(insight.id)) return false;
    
    // Apply type filter
    if (filters.type !== 'all' && insight.type !== filters.type) return false;
    
    // Apply priority filter
    if (filters.priority !== 'all' && insight.priority !== filters.priority) return false;
    
    // Apply timeframe filter
    if (filters.timeframe !== 'all') {
      const insightDate = new Date(insight.created_at);
      const now = new Date();
      
      switch (filters.timeframe) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (insightDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          if (insightDate < monthAgo) return false;
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          if (insightDate < quarterAgo) return false;
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          if (insightDate < yearAgo) return false;
          break;
      }
    }
    
    return true;
  });
  
  // Group insights by type
  const insightsByType = filteredInsights.reduce((acc, insight) => {
    acc[insight.type] = acc[insight.type] || [];
    acc[insight.type].push(insight);
    return acc;
  }, {} as Record<string, ConversationInsight[]>);
  
  // Render insight card
  const renderInsightCard = (insight: ConversationInsight) => {
    const typeConfig = {
      goal: { icon: Target, color: 'bg-primary/10 text-primary border-primary/20' },
      challenge: { icon: AlertTriangle, color: 'bg-error/10 text-error border-error/20' },
      progress: { icon: BarChart, color: 'bg-success/10 text-success border-success/20' },
      theme: { icon: Lightbulb, color: 'bg-warning/10 text-warning border-warning/20' }
    };
    
    const IconComponent = typeConfig[insight.type].icon;
    
    return (
      <motion.div
        key={insight.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <Card className={`border ${typeConfig[insight.type].color}`}>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  insight.type === 'goal' ? 'bg-primary/20 text-primary' :
                  insight.type === 'challenge' ? 'bg-error/20 text-error' :
                  insight.type === 'progress' ? 'bg-success/20 text-success' :
                  'bg-warning/20 text-warning'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <h4 className="font-semibold text-text-primary">{insight.title}</h4>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      insight.priority === 'high' ? 'bg-error/10 text-error' :
                      insight.priority === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-neutral-200 text-text-secondary'
                    }`}>
                      {insight.priority} priority
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-3">{insight.description}</p>
                  
                  {insight.action_items && insight.action_items.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-text-primary mb-1">Action Items:</h5>
                      <ul className="text-sm text-text-secondary">
                        {insight.action_items.map((item, index) => (
                          <li key={index} className="flex items-start mb-1">
                            <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center text-xs text-text-secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDismissInsight(insight.id)}
                className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Dismiss insight"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
            
            <div className="flex justify-end mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
                onClick={() => handleInsightAction(insight, 'view')}
              >
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };
  
  // Render recommendation card
  const renderRecommendationCard = (recommendation: Recommendation) => {
    const typeConfig = {
      document: { icon: Download, color: 'bg-primary/10 text-primary' },
      conversation: { icon: Calendar, color: 'bg-success/10 text-success' },
      resource: { icon: Lightbulb, color: 'bg-warning/10 text-warning' },
      action: { icon: Zap, color: 'bg-error/10 text-error' }
    };
    
    const IconComponent = typeConfig[recommendation.type].icon;
    
    return (
      <motion.div
        key={recommendation.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-3"
      >
        <div className="p-3 bg-background-secondary rounded-lg">
          <div className="flex items-start">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${typeConfig[recommendation.type].color}`}>
              <IconComponent className="w-4 h-4" />
            </div>
            
            <div>
              <h5 className="font-medium text-text-primary text-sm">{recommendation.title}</h5>
              <p className="text-xs text-text-secondary mb-2">{recommendation.description}</p>
              
              <div className="flex justify-between items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  recommendation.priority === 'high' ? 'bg-error/10 text-error' :
                  recommendation.priority === 'medium' ? 'bg-warning/10 text-warning' :
                  'bg-neutral-200 text-text-secondary'
                }`}>
                  {recommendation.priority} priority
                </span>
                
                {recommendation.action_url && (
                  <a
                    href={recommendation.action_url}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Take Action
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="insights-dashboard">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="text-xl font-semibold text-primary flex items-center mb-4 md:mb-0">
          <Lightbulb className="w-5 h-5 mr-2" />
          AI-Generated Insights
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {/* Timeframe Filter */}
          <div className="flex items-center bg-background-secondary rounded-lg p-1">
            {(['week', 'month', 'quarter', 'year'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleFilterChange('timeframe', t)}
                className={`px-3 py-1 text-xs rounded-lg ${
                  filters.timeframe === t 
                    ? 'bg-primary text-white' 
                    : 'text-text-secondary hover:bg-neutral-200'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Type Filter */}
          <select
            className="px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="goal">Goals</option>
            <option value="challenge">Challenges</option>
            <option value="progress">Progress</option>
            <option value="theme">Themes</option>
          </select>
          
          {/* Priority Filter */}
          <select
            className="px-3 py-2 border rounded-lg text-sm transition-colors border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>
      
      {/* Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-primary/10 border-primary/20">
          <div className="p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-2">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <h4 className="font-semibold text-primary">Total Insights</h4>
            </div>
            <div className="text-2xl font-bold text-primary">{filteredInsights.length}</div>
          </div>
        </Card>
        
        <Card className="bg-success/10 border-success/20">
          <div className="p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center mr-2">
                <Target className="w-4 h-4 text-success" />
              </div>
              <h4 className="font-semibold text-success">Goal Insights</h4>
            </div>
            <div className="text-2xl font-bold text-success">{insightsByType.goal?.length || 0}</div>
          </div>
        </Card>
        
        <Card className="bg-error/10 border-error/20">
          <div className="p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-error/20 rounded-full flex items-center justify-center mr-2">
                <AlertTriangle className="w-4 h-4 text-error" />
              </div>
              <h4 className="font-semibold text-error">Challenge Insights</h4>
            </div>
            <div className="text-2xl font-bold text-error">{insightsByType.challenge?.length || 0}</div>
          </div>
        </Card>
        
        <Card className="bg-warning/10 border-warning/20">
          <div className="p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center mr-2">
                <BarChart className="w-4 h-4 text-warning" />
              </div>
              <h4 className="font-semibold text-warning">Progress Insights</h4>
            </div>
            <div className="text-2xl font-bold text-warning">{insightsByType.progress?.length || 0}</div>
          </div>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights Column */}
        <div className="lg:col-span-2">
          <h4 className="text-lg font-semibold text-primary mb-4">Recent Insights</h4>
          
          {filteredInsights.length === 0 ? (
            <Card className="p-6 text-center">
              <Lightbulb className="w-12 h-12 text-text-secondary mx-auto mb-2" />
              <h4 className="text-lg font-semibold text-primary mb-1">No insights found</h4>
              <p className="text-text-secondary mb-4">
                {insights.length > 0
                  ? 'Try adjusting your filters to see more insights'
                  : 'Complete more consultations to generate insights'}
              </p>
              {insights.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setFilters({ timeframe: 'month', type: 'all', priority: 'all' })}
                >
                  Reset Filters
                </Button>
              )}
            </Card>
          ) : (
            <div>
              {filteredInsights.map(renderInsightCard)}
              
              {filteredInsights.length > 5 && (
                <div className="text-center mt-4">
                  <Button variant="outline">
                    View All Insights
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Recommendations Column */}
        <div>
          <h4 className="text-lg font-semibold text-primary mb-4">Recommended Actions</h4>
          
          {recommendations.length === 0 ? (
            <Card className="p-6 text-center">
              <Zap className="w-12 h-12 text-text-secondary mx-auto mb-2" />
              <h4 className="text-lg font-semibold text-primary mb-1">No recommendations yet</h4>
              <p className="text-text-secondary">
                Complete more consultations to receive personalized recommendations
              </p>
            </Card>
          ) : (
            <Card>
              <div className="p-4">
                {recommendations.map(renderRecommendationCard)}
                
                {recommendations.length > 5 && (
                  <div className="text-center mt-4">
                    <Button variant="outline" size="sm">
                      View All Recommendations
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
          
          {/* Export Options */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-primary mb-4">Export Options</h4>
            <Card>
              <div className="p-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {/* Export functionality */}}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Insights (PDF)
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {/* Export functionality */}}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Action Items (CSV)
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {/* Export functionality */}}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}