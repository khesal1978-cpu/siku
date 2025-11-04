import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext?: string;
  variant?: 'default' | 'highlight';
}

export default function StatsCard({ icon: Icon, label, value, subtext, variant = 'default' }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`p-4 overflow-hidden relative group ${variant === 'highlight' ? 'bg-primary/5 border-primary/20' : ''}`}
        data-testid={`card-stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center gap-3 relative z-10">
          <div 
            className={`p-2 rounded-lg ${variant === 'highlight' ? 'bg-primary/10' : 'bg-muted'}`}
          >
            <Icon className={`w-5 h-5 ${variant === 'highlight' ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground" data-testid="text-stat-label">{label}</p>
            <p className="text-lg font-bold font-['Poppins'] tabular-nums" data-testid="text-stat-value">
              {value}
            </p>
            {subtext && (
              <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-stat-subtext">{subtext}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}