import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, Circle, Zap, Users, Coins, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Achievement } from '@shared/schema';

interface DailyTasksProps {
  achievements: Achievement[];
  onClaimReward: (achievementId: string) => Promise<void>;
}

const taskIcons: Record<string, any> = {
  daily_login: Calendar,
  mine_coins: Coins,
  invite_friends: Users,
  play_games: Zap,
  streak: Trophy,
};

export default function DailyTasks({ achievements, onClaimReward }: DailyTasksProps) {
  const completedCount = achievements.filter(a => a.isCompleted).length;
  const totalCount = achievements.length;

  return (
    <Card className="p-6" data-testid="card-daily-tasks">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-['Poppins']">Daily Tasks</h2>
            <p className="text-sm text-muted-foreground">
              Complete tasks to earn bonus coins
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {completedCount}/{totalCount}
          </div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
      </div>

      <div className="mb-6">
        <Progress value={(completedCount / totalCount) * 100} className="h-2" />
      </div>

      <div className="space-y-3">
        {achievements.map((achievement, index) => {
          const Icon = taskIcons[achievement.achievementKey] || Circle;
          const progressPercentage = (achievement.progress / achievement.target) * 100;
          const canClaim = achievement.progress >= achievement.target && !achievement.isCompleted;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`p-4 ${achievement.isCompleted ? 'bg-primary/5 border-primary/20' : 'hover:shadow-md transition-shadow'}`}
                data-testid={`task-${achievement.achievementKey}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    achievement.isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {achievement.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Coins className="w-4 h-4" />
                        +{achievement.reward}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    
                    {!achievement.isCompleted && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Progress: {achievement.progress}/{achievement.target}
                          </span>
                          <span className="font-semibold text-primary">
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {canClaim && (
                    <Button 
                      onClick={() => onClaimReward(achievement.id)}
                      size="sm"
                      className="whitespace-nowrap"
                      data-testid={`button-claim-${achievement.achievementKey}`}
                    >
                      Claim
                    </Button>
                  )}

                  {achievement.isCompleted && (
                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      Completed
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {completedCount === totalCount && totalCount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-6 p-4 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-center"
        >
          <Trophy className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold text-lg">All Tasks Completed!</p>
          <p className="text-sm opacity-90">Come back tomorrow for new tasks</p>
        </motion.div>
      )}
    </Card>
  );
}
