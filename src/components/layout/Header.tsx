import React from 'react';
import { useAtom } from 'jotai';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Video } from 'lucide-react';
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
  const [displayName] = useAtom(userDisplayNameAtom);
  const [initials] = useAtom(userInitialsAtom);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className={cn(
      'bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-50',
      className
    )}>
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
          <nav className="hidden md:flex items-center space-x-8">
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
          <div className="flex items-center space-x-4">
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
              <div className="flex items-center space-x-3">
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
          </div>
        </div>
      </div>
    </header>
  );
}