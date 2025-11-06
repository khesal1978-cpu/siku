import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface OnboardingStep {
  title: string;
  description: string;
  highlight: string;
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to PingCaset!',
    description: 'Start mining Caset coins every 6 hours. Earn 2 coins per hour with our automated mining system.',
    highlight: 'Tap the mining button to start'
  },
  {
    title: 'Invite & Earn More',
    description: 'Invite friends to boost your earnings! You get 200 coins and your friend gets 400 coins instantly.',
    highlight: '1.4x multiplier per referral'
  },
  {
    title: 'Track Your Progress',
    description: 'Monitor your mining stats, team growth, and climb the global leaderboard to become a top miner!',
    highlight: 'Compete globally'
  }
];

interface OnboardingModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4" 
      data-testid="modal-onboarding"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md p-6 relative glass-modal dark:glass-modal-dark shadow-2xl">
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 hover:bg-primary/10"
            onClick={onSkip}
            data-testid="button-skip-onboarding"
          >
            <X className="w-4 h-4" />
          </Button>

          <motion.div 
            className="mb-6"
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold font-['Poppins'] mb-2" data-testid="text-onboarding-title">
              {steps[currentStep].title}
            </h2>
            <p className="text-muted-foreground" data-testid="text-onboarding-description">
              {steps[currentStep].description}
            </p>
            <motion.div 
              className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm font-semibold text-primary" data-testid="text-onboarding-highlight">
                {steps[currentStep].highlight}
              </p>
            </motion.div>
          </motion.div>

          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full ${
                  index === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted'
                }`}
                initial={false}
                animate={{
                  width: index === currentStep ? 32 : 8,
                  backgroundColor: index === currentStep ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleNext} 
              className="w-full shadow-lg"
              data-testid="button-onboarding-next"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
