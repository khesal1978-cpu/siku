import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Clock, Users } from 'lucide-react';
import MiningButton from '@/components/MiningButton';
import CoinDisplay from '@/components/CoinDisplay';
import StatsCard from '@/components/StatsCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import backgroundImage from '@assets/generated_images/Green_gradient_wave_background_201c0817.png';
import { motion } from 'framer-motion';

export default function Dashboard() {
  //todo: remove mock functionality
  const [isMining, setIsMining] = useState(true);
  const [progress, setProgress] = useState(67);
  const [balance, setBalance] = useState(1234.56);
  const [timeRemaining, setTimeRemaining] = useState('3h 24m');

  useEffect(() => {
    if (isMining) {
      const interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isMining]);

  const handleMine = () => {
    console.log('Mining started');
    setIsMining(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-background pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div 
        className="relative h-56 -mb-8"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="relative h-full flex items-end p-6 pb-12">
          <div>
            <motion.h1 
              className="text-3xl font-bold font-['Poppins'] text-foreground mb-1 drop-shadow-lg"
              variants={itemVariants}
            >
              Mining Dashboard
            </motion.h1>
            <motion.p 
              className="text-sm text-muted-foreground drop-shadow"
              variants={itemVariants}
            >
              Keep mining to earn more rewards
            </motion.p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        <motion.div variants={itemVariants}>
          <CoinDisplay amount={balance} label="Mining Balance" size="xl" />
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-center py-6">
          <MiningButton 
            isActive={isMining} 
            progress={progress} 
            onMine={handleMine}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-3">
          <StatsCard 
            icon={Zap} 
            label="Mining Speed" 
            value="18 CASET/hr"
            subtext="1.8x multiplier active"
            variant="highlight"
          />
          <StatsCard 
            icon={TrendingUp} 
            label="Total Mined" 
            value={balance.toLocaleString()}
          />
          <StatsCard 
            icon={Clock} 
            label="Next Mining" 
            value={timeRemaining}
            subtext="6-hour cycle"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-3">Boost Your Earnings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Invite Friends</p>
                    <p className="text-xs text-muted-foreground">+500 coins per invite</p>
                  </div>
                </div>
                <Button size="sm" data-testid="button-invite-friends">Invite</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}