import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Star, MessageSquare, Users, Crown, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { createCheckoutSession } from '../../api/stripe';

interface PricingSectionProps {
  hideSupport?: boolean;
}

export function PricingSection({ hideSupport = false }: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const plans = [
    {
      id: 'prod_SYErznlRJrJHln',
      name: "Founder Essential",
      price: isAnnual ? 79 : 99,
      originalPrice: isAnnual ? 99 : null,
      subtitle: "Perfect for getting started",
      icon: MessageSquare,
      features: [
        "2 video sessions (40 minutes total)",
        "AI mentorship & document generation",
        "Basic analytics & community access",
        "Email support"
      ],
      popular: false,
      gradient: "from-blue-500 to-blue-600",
      priceId: isAnnual ? 'price_1RdT9CD5a0uk1qUEP1jnRYQi' : 'price_1Rd8NVD5a0uk1qUEQSEg8jCp'
    },
    {
      id: 'prod_SYZzwqHSFjVPjm',
      name: "Founder Companion",
      price: isAnnual ? 159 : 199,
      originalPrice: isAnnual ? 199 : null,
      subtitle: "Most popular for growing startups",
      icon: Users,
      features: [
        "3 video sessions (75 minutes total)",
        "Industry-specific AI mentors",
        "Session recordings & AI insights",
        "Priority support & team access"
      ],
      popular: true,
      gradient: "from-primary to-secondary",
      priceId: isAnnual ? 'price_1RdTV9D5a0uk1qUEhqJKCcU8' : 'price_1RdSpQD5a0uk1qUEmESxoySs'
    },
    {
      name: "Enterprise",
      price: "Custom",
      subtitle: "For scaling organizations",
      icon: Crown,
      features: [
        "Unlimited sessions & team access",
        "Custom AI training & white-label",
        "24/7 support & dedicated manager",
        "API access & integrations"
      ],
      popular: false,
      gradient: "from-purple-500 to-purple-600",
      priceId: null,
      isEnterprise: true
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your startup journey. All plans include our core AI mentorship features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary/20 transition-colors"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-primary transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="ml-2 inline-flex items-center rounded-full bg-secondary/20 px-2.5 py-0.5 text-xs font-medium text-secondary">
                Save 20%
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className={`relative h-full bg-card rounded-2xl p-8 border-2 transition-all duration-300 ${
                plan.popular 
                  ? 'border-primary shadow-lg shadow-primary/20 scale-105' 
                  : 'border-border hover:border-primary/50 hover:shadow-lg'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.subtitle}</p>
                </div>

                <div className="text-center mb-8">
                  {plan.isEnterprise ? (
                    <div className="text-4xl font-bold text-foreground">Custom</div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {plan.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through">
                          ${plan.originalPrice}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-foreground">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
                      : plan.isEnterprise
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                      : 'bg-primary hover:bg-primary/90'
                  } text-white group`}
                  disabled={loadingPlan === plan.name}
                  onClick={async () => {
                    if (plan.isEnterprise) {
                      window.location.href = 'mailto:hello@abiah.help';
                    } else {
                      try {
                        setLoadingPlan(plan.name);
                        const result = await createCheckoutSession(plan.priceId, 'subscription', 5, false);
                        
                        if (result.status === 'unauthenticated') {
                          // Store selected plan in session storage to potentially use after login
                          sessionStorage.setItem('selectedPlan', plan.priceId);
                          
                          // Redirect to register page
                          navigate('/register', { 
                            state: { 
                              message: 'Please create an account or sign in to start your free trial.',
                              returnTo: '/pricing' 
                            } 
                          });
                        } else if (result.url) {
                          // User is authenticated, redirect to checkout
                          window.location.href = result.url;
                        }
                      } catch (err) {
                        console.error(err);
                        alert('Could not start checkout session.');
                      } finally {
                        setLoadingPlan(null);
                      }
                    }
                  }}
                >
                  {loadingPlan === plan.name ? 'Redirecting...' : plan.isEnterprise ? 'Contact Sales' : 'Start Free Trial'}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>

                {!plan.isEnterprise && (
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    5-day free trial • No credit card required
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {!hideSupport && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground mb-4">
              Need help choosing the right plan? Our team is here to help.
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = 'mailto:help@abiah.help'}
            >
              Contact Support
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
