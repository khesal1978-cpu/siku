import OnboardingModal from '../OnboardingModal';

export default function OnboardingModalExample() {
  return (
    <div className="min-h-screen bg-background">
      <OnboardingModal 
        onComplete={() => console.log('Onboarding completed')} 
        onSkip={() => console.log('Onboarding skipped')}
      />
    </div>
  );
}
