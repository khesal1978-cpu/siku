import { useEffect, useState } from 'react';
import logoImage from '@assets/generated_images/PingCaset_crypto_logo_icon_e52ce570.png';
import { motion, useSpring, useTransform } from 'framer-motion';

interface CoinDisplayProps {
  amount: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAnimation?: boolean;
}

export default function CoinDisplay({ amount, label = 'Balance', size = 'lg', showAnimation = false }: CoinDisplayProps) {
  const [displayAmount, setDisplayAmount] = useState(amount);

  const spring = useSpring(0, { stiffness: 300, damping: 30 });
  const animatedAmount = useTransform(spring, (current) => Math.floor(current).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  useEffect(() => {
    spring.set(amount);
  }, [amount, spring]);

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

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div 
      className="text-center relative" 
      data-testid="coin-display"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <p className="text-sm text-muted-foreground mb-2" data-testid="text-coin-label">{label}</p>
      <div className="flex items-center justify-center gap-3 relative">
        <motion.img 
          src={logoImage} 
          alt="Caset Coin" 
          className={`${iconSizes[size]}`}
          animate={{ 
            rotate: [0, 5, -5, 0],
            y: [0, -5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.span 
          className={`${sizeClasses[size]} font-bold font-['Poppins'] tabular-nums gradient-text-primary drop-shadow-lg animate-text-shimmer`}
          data-testid="text-coin-amount"
        >
          {animatedAmount}
        </motion.span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">CASET</p>
    </motion.div>
  );
}