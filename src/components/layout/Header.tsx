import React from 'react';
import { useAtom } from 'jotai';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, Video, Menu, X, ChevronRight, Users, Info, DollarSign, CreditCard } from 'lucide-react';
import { useStripe } from '../../context/StripeContext';
import { products } from '../../stripe-config';
import { motion, AnimatePresence } from 'framer-motion';
import { userAtom, isAuthenticatedAtom, userDisplayNameAtom, userInitialsAtom, authErrorAtom } from '../../store/auth';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { getUserSubscription } from '../../api/stripe';
import { useEffect, useState } from 'react';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [displayName] = useAtom(userDisplayNameAtom);
  const [initials] = useAtom(userInitialsAtom);
  const { signOut } = useAuth();
  const { subscription } = useStripe();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = React.useState(false);

  // Add handleSignOut function
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };


  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-neutral-200 shadow-sm transition-colors duration-500',
        scrolled ? 'bg-white' : 'bg-transparent',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-primary">Abiah.help</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <Link 
                  to="/dashboard" 
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/consultation" 
                  className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Video className="w-4 h-4" />
                  Consultation
                </Link>
                <Link 
                  to="/documents" 
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Documents
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link 
                  to="/team" 
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Team
                </Link>
                <Link 
                  to="/about" 
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  About
                </Link>
                <Link 
                  to="/pricing" 
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </div>
            )}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-text-secondary hidden sm:block">
                  Welcome, {displayName}
                </span>
                {subscription?.subscription_status === 'active' && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-success/10 text-success rounded-full">
                    {subscription.price_id ? 
                      products.find(p => p.priceId === subscription.price_id)?.name || 'Subscribed' 
                      : 'Subscribed'}
                  </span>
                )}
                
                {/* User Avatar */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-neutral-100 transition-colors">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {initials}
                      </div>
                    )}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link 
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-text-secondary hover:bg-neutral-50 hover:text-primary transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      <Link 
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-text-secondary hover:bg-neutral-50 hover:text-primary transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                      <hr className="my-1 border-neutral-200" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-text-secondary hover:bg-neutral-50 hover:text-error transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors relative z-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-primary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden fixed inset-0 z-40 bg-white">
              <div className="pt-20 px-6 pb-6 h-full overflow-y-auto">
                <div className="space-y-6">
                  {isAuthenticated ? (
                    <>
                      <div className="bg-background-secondary p-4 rounded-lg mb-6">
                        <div className="flex items-center space-x-3 mb-2">
                          {user?.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={displayName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-medium">
                              {initials}
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-primary">{displayName}</h3>
                            <p className="text-sm text-text-secondary">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <nav className="space-y-1">
                        <Link 
                          to="/dashboard" 
                          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-neutral-50 text-text-primary hover:text-primary transition-colors"
                        >
                          <span className="text-base font-medium">Dashboard</span>
                          <ChevronRight className="w-5 h-5 text-text-secondary" />
                        </Link>
                        <Link 
                          to="/consultation" 
                          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-neutral-50 text-text-primary hover:text-primary transition-colors"
                        >
                          <div className="flex items-center">
                            <Video className="w-5 h-5 mr-3 text-primary" />
                            <span className="text-base font-medium">Consultation</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-secondary" />
                        </Link>
                        <Link 
                          to="/documents" 
                          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-neutral-50 text-text-primary hover:text-primary transition-colors"
                        >
                          <span className="text-base font-medium">Documents</span>
                          <ChevronRight className="w-5 h-5 text-text-secondary" />
                        </Link>
                      </nav>

                      <hr className="border-neutral-200 my-4" />
                      
                      <div className="space-y-1">
                        <Link 
                          to="/profile"
                          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-neutral-50 text-text-primary hover:text-primary transition-colors"
                        >
                          <div className="flex items-center">
                            <User className="w-5 h-5 mr-3 text-text-secondary" />
                            <span className="text-base">Profile</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-secondary" />
                        </Link>
                        <Link 
                          to="/settings"
                          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-neutral-50 text-text-primary hover:text-primary transition-colors"
                        >
                          <div className="flex items-center">
                            <Settings className="w-5 h-5 mr-3 text-text-secondary" />
                            <span className="text-base">Settings</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-secondary" />
                        </Link>
                        <Link 
                          to="/team" 
                          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-neutral-50 text-text-primary hover:text-primary transition-colors"
                        >
                          <div className="flex items-center">
                            <Users className="w-5 h-5 mr-3 text-text-secondary" />
                            <span className="text-base">Team</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-secondary" />
                        </Link>
                        <Link 
                          to="/about" 
                          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-neutral-50 text-text-primary hover:text-primary transition-colors"
                        >
                          <div className="flex items-center">
                            <Info className="w-5 h-5 mr-3 text-text-secondary" />
                            <span className="text-base">About</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-secondary" />
                        </Link>
                        <Link 
                          to="/pricing" 
                          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-neutral-50 text-text-primary hover:text-primary transition-colors"
                        >
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 mr-3 text-text-secondary" />
                            <span className="text-base">Pricing</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-secondary" />
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full py-3 px-4 rounded-lg hover:bg-neutral-50 text-error transition-colors"
                        >
                          <LogOut className="w-5 h-5 mr-3" />
                          <span className="text-base">Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <nav className="space-y-1">
                        <Link 
                          to="/team" 
                          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-neutral-50 text-text-primary hover:text-primary transition-colors"
                        >
                          <div className="flex items-center">
                            <Users className="w-5 h-5 mr-3 text-text-secondary" />
                            <span className="text-base font-medium">Team</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-secondary" />
                        </Link>
                        <Link 
                          to="/about" 
                          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-neutral-50 text-text-primary hover:text-primary transition-colors"
                        >
                          <div className="flex items-center">
                            <Info className="w-5 h-5 mr-3 text-text-secondary" />
                            <span className="text-base font-medium">About</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-secondary" />
                        </Link>
                        <Link 
                          to="/pricing" 
                          className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-neutral-50 text-text-primary hover:text-primary transition-colors"
                        >
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 mr-3 text-text-secondary" />
                            <span className="text-base font-medium">Pricing</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-secondary" />
                        </Link>
                      </nav>
                      
                      <div className="space-y-4 pt-6 mt-6 border-t border-neutral-200">
                        <Link 
                          to="/login" 
                          className="block py-3 px-4 rounded-lg border border-neutral-200 text-center text-text-primary hover:bg-neutral-50 transition-colors w-full"
                        >
                          Sign In
                        </Link>
                        <Link 
                          to="/register" 
                          className="block py-3 px-4 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-center w-full"
                        >
                          Get Started
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}