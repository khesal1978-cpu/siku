import { Zap, TrendingUp, Clock } from 'lucide-react';
import StatsCard from '../StatsCard';

export default function StatsCardExample() {
  return (
    <div className="flex flex-col gap-4 p-8 bg-background max-w-md">
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
        value="1,234.56"
      />
      <StatsCard 
        icon={Clock} 
        label="Next Mining" 
        value="3h 24m"
      />
    </div>
  );
}
