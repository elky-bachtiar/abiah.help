import React from 'react';
import { useAtom } from 'jotai';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, Video, Menu, X } from 'lucide-react';
import { userAtom, isAuthenticatedAtom, userDisplayNameAtom, userInitialsAtom } from '../../store/auth';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

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
              <>
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
              </>
            ) : null}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-text-secondary hidden sm:block">
                  Welcome, {displayName}
                </span>
                
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
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-primary" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-4 border-t border-neutral-200">
            {isAuthenticated ? (
              <div className="space-y-3">
                <Link 
                  to="/dashboard" 
                  className="block py-2 px-3 rounded-lg hover:bg-neutral-100 text-text-secondary hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/consultation" 
                  className="block py-2 px-3 rounded-lg hover:bg-neutral-100 text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Video className="w-4 h-4" />
                  Consultation
                </Link>
                <Link 
                  to="/documents" 
                  className="block py-2 px-3 rounded-lg hover:bg-neutral-100 text-text-secondary hover:text-primary transition-colors"
                >
                  Documents
                </Link>
                <hr className="border-neutral-200 my-2" />
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left py-2 px-3 rounded-lg hover:bg-neutral-100 text-error hover:text-error/80 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link 
                  to="/login" 
                  className="block py-2 px-3 rounded-lg hover:bg-neutral-100 text-text-secondary hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="block py-2 px-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-center"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}