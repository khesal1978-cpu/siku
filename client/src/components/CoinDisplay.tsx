import { useEffect, useState } from 'react';
import logoImage from '@assets/generated_images/PingCaset_crypto_logo_icon_e52ce570.png';

interface CoinDisplayProps {
  amount: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAnimation?: boolean;
}

export default function CoinDisplay({ amount, label = 'Balance', size = 'lg', showAnimation = false }: CoinDisplayProps) {
  const [displayAmount, setDisplayAmount] = useState(amount);

  useEffect(() => {
    if (showAnimation) {
      const duration = 1000;
      const steps = 30;
      const increment = (amount - displayAmount) / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayAmount(amount);
          clearInterval(timer);
        } else {
          setDisplayAmount(prev => prev + increment);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayAmount(amount);
    }
  }, [amount, showAnimation]);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl md:text-6xl'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="text-center" data-testid="coin-display">
      <p className="text-sm text-muted-foreground mb-2" data-testid="text-coin-label">{label}</p>
      <div className="flex items-center justify-center gap-3">
        <img src={logoImage} alt="Caset Coin" className={`${iconSizes[size]} animate-float`} />
        <span 
          className={`${sizeClasses[size]} font-bold font-['Poppins'] tabular-nums ${showAnimation ? 'animate-count-up' : ''}`}
          data-testid="text-coin-amount"
        >
          {displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">CASET</p>
    </div>
  );
}
