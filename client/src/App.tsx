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
import Settings from '@/pages/Settings';
import Terms from '@/pages/Terms';
import HelpCenter from '@/pages/HelpCenter';
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';

function Router() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/games" component={Games} />
        <Route path="/team" component={Team} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route path="/terms" component={Terms} />
        <Route path="/help" component={HelpCenter} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
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
