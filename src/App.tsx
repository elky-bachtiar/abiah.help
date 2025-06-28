import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { StripeProvider } from './context/StripeContext';
import { isAuthenticatedAtom, authLoadingAtom } from './store/auth';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { SubscriptionRouteGuard } from './components/guards/SubscriptionRouteGuard';
import { Home } from './pages/Home';
import { Home as Main2Home } from './pages/main2/Home';
import { PitchDeck } from './pages/pitchdeck';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Consultation } from './pages/Consultation';
import { Documents } from './pages/Documents';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { PricingPage } from './pages/PricingPage';
import { TeamPage } from './pages/TeamPage';
import { AboutPage } from './pages/AboutPage';
import { ProfilePage } from './pages/ProfilePage';
import { Settings } from './pages/Settings';
import { CheckoutSuccess } from './pages/CheckoutSuccess';
import { ConversationHistoryPage } from './pages/ConversationHistoryPage';
import { ThemeProvider } from './context/ThemeContext';
import { SubscriptionRouteGuard } from './components/guards/SubscriptionRouteGuard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isLoading] = useAtom(authLoadingAtom);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isLoading] = useAtom(authLoadingAtom);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  // Initialize auth
  useAuth();

  return (
    <Router>
      <ThemeProvider>
        <StripeProvider>
          <Routes>
            {/* Main2 Route - No Header/Footer */}
            <Route path="/main2" element={<Main2Home />} />
            
            {/* Pitch Deck Route - No Header/Footer */}
            <Route path="/pitchdeck" element={<PitchDeck />} />
            
            {/* All other routes with Header/Footer */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col bg-background-primary">
                <Header />
                <main className="flex-1">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } 
                />

                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/consultation" 
                  element={
                    <ProtectedRoute>
                      <SubscriptionRouteGuard actionType="conversation">
                        <Consultation />
                      </SubscriptionRouteGuard>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/documents" 
                  element={
                    <ProtectedRoute>
                      <SubscriptionRouteGuard actionType="document_generation">
                        <Documents />
                      </SubscriptionRouteGuard>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/documents/:id" 
                  element={
                    <ProtectedRoute>
                      <SubscriptionRouteGuard actionType="document_generation">
                        <Documents />
                      </SubscriptionRouteGuard>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/subscription" 
                  element={
                    <ProtectedRoute>
                      <SubscriptionPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/conversation-history" 
                  element={
                    <ProtectedRoute>
                      <ConversationHistoryPage />
                    </ProtectedRoute>
                  } 
                />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                <Footer />
              </div>
            } />
          </Routes>
          
          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#2A2F6D',
                color: '#FFFFFF',
                border: '1px solid #F9B94E',
              },
            }}
          />
        </StripeProvider>
      </ThemeProvider>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;