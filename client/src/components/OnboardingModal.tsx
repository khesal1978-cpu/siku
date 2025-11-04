import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OnboardingStep {
  title: string;
  description: string;
  highlight: string;
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to PingCaset!',
    description: 'Start mining Caset coins every 6 hours. Earn 10 coins per hour with our automated mining system.',
    highlight: 'Tap the mining button to start'
  },
  {
    title: 'Invite & Earn More',
    description: 'Invite friends to boost your earnings! You get 500 coins and your friend gets 900 coins instantly.',
    highlight: '1.8x multiplier on referrals'
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-testid="modal-onboarding">
      <Card className="w-full max-w-md p-6 relative">
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4"
          onClick={onSkip}
          data-testid="button-skip-onboarding"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold font-['Poppins'] mb-2" data-testid="text-onboarding-title">
            {steps[currentStep].title}
          </h2>
          <p className="text-muted-foreground" data-testid="text-onboarding-description">
            {steps[currentStep].description}
          </p>
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-semibold text-primary" data-testid="text-onboarding-highlight">
              {steps[currentStep].highlight}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        <Button 
          onClick={handleNext} 
          className="w-full"
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
      </Card>
    </div>
  );
}
