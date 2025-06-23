import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, CheckCircle, Clock, ChevronRight, Award, AlertCircle } from 'lucide-react';
import { Goal, ProgressData, ProgressInsight, Milestone } from '../../types/Conversation';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button-bkp';

interface ProgressTrackerProps {
  userId: string;
  goals: Goal[];
  progressData: ProgressData;
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
  onTimeframeChange?: (timeframe: 'week' | 'month' | 'quarter' | 'year') => void;
  onGoalUpdate?: (goalId: string, updates: Partial<Goal>) => Promise<void>;
}

export function ProgressTracker({
  userId,
  goals,
  progressData,
  timeframe = 'month',
  onTimeframeChange,
  onGoalUpdate
}: ProgressTrackerProps) {
  const [hoveredGoal, setHoveredGoal] = useState<string | null>(null);
  
  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: 'week' | 'month' | 'quarter' | 'year') => {
    onTimeframeChange?.(newTimeframe);
  };
  
  // Handle milestone toggle
  const handleMilestoneToggle = async (goalId: string, milestoneId: string, completed: boolean) => {
    if (!onGoalUpdate) return;
    
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;
      
      const updatedMilestones = goal.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed, completed_at: completed ? new Date().toISOString() : undefined } : m
      );
      
      // Calculate new progress percentage
      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const totalCount = updatedMilestones.length;
      const progress = Math.round((completedCount / totalCount) * 100);
      
      // Update goal with new milestones and progress
      await onGoalUpdate(goalId, {
        milestones: updatedMilestones,
        progress,
        status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };
  
  // Render progress ring
  const ProgressRing = ({ percentage, size = 120, strokeWidth = 8, color = 'primary' }: { 
    percentage: number, 
    size?: number, 
    strokeWidth?: number,
    color?: 'primary' | 'success' | 'warning' | 'error'
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    const colorClasses = {
      primary: 'stroke-primary',
      success: 'stroke-success',
      warning: 'stroke-warning',
      error: 'stroke-error'
    };
    
    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={colorClasses[color]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">{percentage}%</span>
        </div>
      </div>
    );
  };
  
  // Render goal card
  const renderGoalCard = (goal: Goal) => {
    const isHovered = hoveredGoal === goal.id;
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    const totalMilestones = goal.milestones.length;
    
    return (
      <motion.div
        key={goal.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
        onMouseEnter={() => setHoveredGoal(goal.id)}
        onMouseLeave={() => setHoveredGoal(null)}
      >
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-primary">{goal.title}</h4>
              <div className={`px-2 py-1 text-xs rounded-full ${
                goal.status === 'completed' ? 'bg-success/10 text-success' :
                goal.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                'bg-neutral-200 text-text-secondary'
              }`}>
                {goal.status === 'completed' ? 'Completed' :
                 goal.status === 'in_progress' ? 'In Progress' :
                 'Not Started'}
              </div>
            </div>
            
            <p className="text-sm text-text-secondary mb-3">{goal.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-sm text-text-secondary">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>{completedMilestones}/{totalMilestones} milestones</span>
              </div>
              
              {goal.target_date && (
                <div className="flex items-center text-sm text-text-secondary">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Due {new Date(goal.target_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <div className="mb-3">
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className={`rounded-full h-2 ${
                    goal.status === 'completed' ? 'bg-success' :
                    'bg-primary'
                  }`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>{goal.progress}% complete</span>
                {goal.target_date && (
                  <span>
                    {new Date(goal.target_date) > new Date() 
                      ? `${Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left` 
                      : 'Overdue'}
                  </span>
                )}
              </div>
            </div>
            
            {/* Milestones (shown on hover or mobile) */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2"
                >
                  <h5 className="font-medium text-sm text-primary mb-2">Milestones</h5>
                  <div className="space-y-2">
                    {goal.milestones.map((milestone) => (
                      <div 
                        key={milestone.id}
                        className="flex items-start"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={milestone.completed}
                            onChange={(e) => handleMilestoneToggle(goal.id, milestone.id, e.target.checked)}
                            className="rounded border-neutral-300 text-primary focus:ring-primary"
                          />
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-text-primary">{milestone.title}</div>
                          {milestone.description && (
                            <div className="text-xs text-text-secondary">{milestone.description}</div>
                          )}
                          {milestone.completed && milestone.completed_at && (
                            <div className="text-xs text-success flex items-center mt-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed {new Date(milestone.completed_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex justify-end mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
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
  
  // Render progress insight
  const renderProgressInsight = (insight: ProgressInsight, index: number) => {
    return (
      <motion.div
        key={insight.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`p-3 rounded-lg mb-2 ${
          insight.type === 'improvement' ? 'bg-success/10 border-l-4 border-success' :
          insight.type === 'milestone' ? 'bg-primary/10 border-l-4 border-primary' :
          'bg-warning/10 border-l-4 border-warning'
        }`}
      >
        <div className="flex items-start">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            insight.type === 'improvement' ? 'bg-success/20 text-success' :
            insight.type === 'milestone' ? 'bg-primary/20 text-primary' :
            'bg-warning/20 text-warning'
          }`}>
            {insight.type === 'improvement' ? (
              <Target className="w-4 h-4" />
            ) : insight.type === 'milestone' ? (
              <Award className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>
          
          <div className="ml-3">
            <h5 className="font-medium text-text-primary">{insight.title}</h5>
            <p className="text-sm text-text-secondary">{insight.description}</p>
            <div className="text-xs text-text-secondary mt-1">
              {new Date(insight.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="progress-tracker">
      {/* Header with Timeframe Selector */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-primary flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Your Progress
        </h3>
        
        <div className="flex items-center bg-background-secondary rounded-lg p-1">
          {(['week', 'month', 'quarter', 'year'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTimeframeChange(t)}
              className={`px-3 py-1 text-sm rounded-lg ${
                timeframe === t 
                  ? 'bg-primary text-white' 
                  : 'text-text-secondary hover:bg-neutral-200'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Overall Progress */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Progress Ring */}
            <div className="flex flex-col items-center justify-center">
              <ProgressRing 
                percentage={progressData.overallProgress} 
                color={
                  progressData.overallProgress >= 75 ? 'success' :
                  progressData.overallProgress >= 50 ? 'primary' :
                  progressData.overallProgress >= 25 ? 'warning' :
                  'error'
                }
              />
              <h4 className="text-lg font-semibold text-primary mt-2">Overall Progress</h4>
            </div>
            
            {/* Stats */}
            <div className="col-span-2">
              <h4 className="text-lg font-semibold text-primary mb-4">Progress Stats</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-secondary p-3 rounded-lg">
                  <div className="flex items-center text-text-secondary mb-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">Goals</span>
                  </div>
                  <div className="text-xl font-semibold text-primary">
                    {progressData.stats.completed_goals}/{progressData.stats.total_goals}
                  </div>
                </div>
                
                <div className="bg-background-secondary p-3 rounded-lg">
                  <div className="flex items-center text-text-secondary mb-1">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">Consultation Time</span>
                  </div>
                  <div className="text-xl font-semibold text-primary">
                    {progressData.stats.total_duration_minutes} min
                  </div>
                </div>
                
                <div className="bg-background-secondary p-3 rounded-lg">
                  <div className="flex items-center text-text-secondary mb-1">
                    <Target className="w-4 h-4 mr-1" />
                    <span className="text-sm">Insights Generated</span>
                  </div>
                  <div className="text-xl font-semibold text-primary">
                    {progressData.stats.insights_generated}
                  </div>
                </div>
                
                <div className="bg-background-secondary p-3 rounded-lg">
                  <div className="flex items-center text-text-secondary mb-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="text-sm">Documents Created</span>
                  </div>
                  <div className="text-xl font-semibold text-primary">
                    {progressData.stats.documents_created}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Goals Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-primary">Goals & Milestones</h3>
          <Button
            variant="outline"
            size="sm"
          >
            Add New Goal
          </Button>
        </div>
        
        {goals.length === 0 ? (
          <Card className="p-6 text-center">
            <Target className="w-12 h-12 text-text-secondary mx-auto mb-2" />
            <h4 className="text-lg font-semibold text-primary mb-1">No goals yet</h4>
            <p className="text-text-secondary mb-4">
              Set goals to track your progress and achieve your startup milestones
            </p>
            <Button variant="primary">Create Your First Goal</Button>
          </Card>
        ) : (
          <div>
            {goals.map(renderGoalCard)}
          </div>
        )}
      </div>
      
      {/* Progress Insights */}
      <div>
        <h3 className="text-lg font-semibold text-primary mb-4">Progress Insights</h3>
        
        {progressData.insights.length === 0 ? (
          <Card className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-text-secondary mx-auto mb-2" />
            <h4 className="text-lg font-semibold text-primary mb-1">No insights yet</h4>
            <p className="text-text-secondary">
              Complete more consultations to generate progress insights
            </p>
          </Card>
        ) : (
          <div>
            {progressData.insights.map(renderProgressInsight)}
          </div>
        )}
      </div>
    </div>
  );
}