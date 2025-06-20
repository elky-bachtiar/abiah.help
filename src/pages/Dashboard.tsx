import React from 'react';
import { useAtom } from 'jotai';
import { motion } from 'framer-motion';
import { Video, FileText, BarChart3, Calendar, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { userDisplayNameAtom } from '../store/auth'; 
import { Button } from '../components/ui/Button-bkp';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export function Dashboard() {
  const [displayName] = useAtom(userDisplayNameAtom);

  const quickActions = [
    {
      title: 'Start AI Consultation',
      description: 'Get personalized mentorship from your AI startup advisor',
      icon: Video,
      color: 'bg-blue-500',
      href: '/consultation',
    },
    {
      title: 'Generate Documents',
      description: 'Create pitch decks, business plans, and financial projections',
      icon: FileText,
      color: 'bg-green-500',
      href: '/documents',
    },
    {
      title: 'View Analytics',
      description: 'Track your funding readiness and progress metrics',
      icon: BarChart3,
      color: 'bg-purple-500',
      href: '/analytics',
    },
    {
      title: 'Schedule Session',
      description: 'Book your next mentorship consultation',
      icon: Calendar,
      color: 'bg-orange-500',
      href: '/schedule',
    },
  ];

  const recentActivity = [
    {
      type: 'consultation',
      title: 'AI Consultation Completed',
      description: 'Discussed market validation strategies',
      time: '2 hours ago',
      status: 'completed',
    },
    {
      type: 'document',
      title: 'Pitch Deck Generated',
      description: 'Series A funding presentation created',
      time: '1 day ago',
      status: 'completed',
    },
    {
      type: 'consultation',
      title: 'Follow-up Session Scheduled',
      description: 'Financial projections review',
      time: '2 days ago',
      status: 'scheduled',
    },
  ];

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Welcome back, {displayName}!
          </h1>
          <p className="text-text-secondary text-lg"> 
            Ready to accelerate your startup's growth? Let's continue building your success.
          </p>
        </motion.div>

        {/* Funding Readiness Score */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }} 
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-primary to-primary-800 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Funding Readiness Score</h3>
                  <p className="text-white/80">Your startup is 78% ready for Series A funding</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-secondary">78%</div>
                  <div className="text-white/80 text-sm">+12% this week</div>
                </div>
              </div>
              <div className="mt-4 bg-white/20 rounded-full h-2">
                <div className="bg-secondary rounded-full h-2 w-3/4 transition-all duration-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <h2 className="text-2xl font-bold text-primary mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <CardContent className="p-6">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${action.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-primary mb-2 group-hover:text-primary/80 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-text-secondary mb-4">{action.description}</p>
                        <Button variant="ghost" size="sm" className="group-hover:bg-primary/10">
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-primary mb-6">Recent Activity</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      className="flex items-start space-x-3 pb-4 border-b border-neutral-200 last:border-b-0 last:pb-0"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {activity.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-primary">{activity.title}</h4>
                        <p className="text-text-secondary text-sm">{activity.description}</p>
                        <p className="text-text-secondary text-xs mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <Button variant="ghost" size="sm" className="w-full mt-4">
                  View All Activity
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-primary mb-6">Your Progress</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: 'Consultations', value: '12', change: '+3 this month' },
              { label: 'Documents Created', value: '8', change: '+2 this week' },
              { label: 'Hours of Mentorship', value: '6.5', change: '+1.5 this month' },
              { label: 'Action Items Completed', value: '24', change: '+8 this week' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-text-primary font-medium mb-1">{stat.label}</div>
                    <div className="text-success text-sm">{stat.change}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}