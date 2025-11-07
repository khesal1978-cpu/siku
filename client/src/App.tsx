import { useState, useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion } from 'framer-motion';
import SplashScreen from '@/components/SplashScreen';
import OnboardingModal from '@/components/OnboardingModal';
import BottomNav from '@/components/BottomNav';
import AnimatedBackground from '@/components/AnimatedBackground';
import Dashboard from '@/pages/Dashboard';
import Games from '@/pages/Games';
import Team from '@/pages/Team';
import Wallet from '@/pages/Wallet';
import Leaderboard from '@/pages/Leaderboard';
import Profile from '@/pages/Profile';
import Terms from '@/pages/Terms';
import HelpCenter from '@/pages/HelpCenter';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { Redirect } from 'wouter';

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { loading, currentUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  const { currentUser, loading } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Switch>
        <Route path="/login">
          {() => !loading && currentUser ? <Redirect to="/" /> : <Login />}
        </Route>
        <Route path="/signup">
          {() => !loading && currentUser ? <Redirect to="/" /> : <Signup />}
        </Route>
        <Route path="/">{() => <ProtectedRoute component={Dashboard} />}</Route>
        <Route path="/games">{() => <ProtectedRoute component={Games} />}</Route>
        <Route path="/team">{() => <ProtectedRoute component={Team} />}</Route>
        <Route path="/wallet">{() => <ProtectedRoute component={Wallet} />}</Route>
        <Route path="/leaderboard">{() => <ProtectedRoute component={Leaderboard} />}</Route>
        <Route path="/profile">{() => <ProtectedRoute component={Profile} />}</Route>
        <Route path="/terms">{() => <ProtectedRoute component={Terms} />}</Route>
        <Route path="/help">{() => <ProtectedRoute component={HelpCenter} />}</Route>
        <Route component={NotFound} />
      </Switch>
      {currentUser && <BottomNav />}
    </motion.div>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="relative z-10">
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <>
          <Router />
          {showOnboarding && (
            <OnboardingModal 
              onComplete={handleOnboardingComplete}
              onSkip={handleOnboardingSkip}
            />
          )}
        </>
      )}
      <Toaster />
    </div>
  );
}

function AppWithProviders() {
  return (
    <AuthProvider>
      <AppWithWebSocket />
    </AuthProvider>
  );
}

function AppWithWebSocket() {
  const { userId } = useAuth();
  
  return (
    <WebSocketProvider userId={userId}>
      <AnimatedBackground />
      <AppContent />
    </WebSocketProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppWithProviders />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
