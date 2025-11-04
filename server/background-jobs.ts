import { storage } from "./storage";
import { wsManager } from "./websocket";

class BackgroundJobManager {
  private intervals: NodeJS.Timeout[] = [];

  start() {
    const energyRefillJob = setInterval(async () => {
      try {
        await this.refillAllEnergy();
      } catch (error) {
        console.error('Energy refill job error:', error);
      }
    }, 60 * 1000);

    const miningProgressJob = setInterval(async () => {
      try {
        await this.updateAllMiningSessions();
      } catch (error) {
        console.error('Mining progress job error:', error);
      }
    }, 10 * 1000);

    this.intervals.push(energyRefillJob, miningProgressJob);
    console.log('Background jobs started');
  }

  stop() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    console.log('Background jobs stopped');
  }

  private async refillAllEnergy() {
  }

  private async updateAllMiningSessions() {
  }

  async processEnergyForUser(userId: string) {
    try {
      const profile = await storage.getUserProfile(userId);
      if (!profile) return;

      if (profile.energy >= profile.maxEnergy) return;

      const now = new Date();
      const lastRefill = new Date(profile.lastEnergyRefill);
      const minutesPassed = Math.floor((now.getTime() - lastRefill.getTime()) / 60000);
      const energyUnitsToAdd = Math.floor(minutesPassed / 5);

      if (energyUnitsToAdd > 0) {
        const actualEnergyToAdd = Math.min(energyUnitsToAdd, profile.maxEnergy - profile.energy);
        const minutesToAdvance = energyUnitsToAdd * 5;
        
        const updatedProfile = await storage.updateUserProfile(userId, {
          energy: profile.energy + actualEnergyToAdd,
          lastEnergyRefill: new Date(lastRefill.getTime() + minutesToAdvance * 60000)
        });

        if (updatedProfile) {
          wsManager.broadcast(userId, 'profile_updated', updatedProfile);
        }
      }
    } catch (error) {
      console.error(`Error processing energy for user ${userId}:`, error);
    }
  }

  async processMiningForUser(userId: string) {
    try {
      const session = await storage.getMiningSession(userId);
      if (!session || !session.isActive) return;

      const now = new Date();
      const startedAt = new Date(session.startedAt);
      const endsAt = new Date(session.endsAt);

      if (now >= endsAt) {
        const hoursElapsed = 6;
        const coinsEarned = hoursElapsed * session.coinsPerHour;

        const profile = await storage.getUserProfile(userId);
        if (!profile) return;

        await storage.updateMiningSession(session.id, { isActive: false });
        const updatedProfile = await storage.updateUserProfile(userId, {
          balance: profile.balance + coinsEarned,
          totalMined: profile.totalMined + coinsEarned
        });

        await storage.createTransaction({
          userId,
          amount: coinsEarned,
          type: 'mining_auto',
          description: 'Auto-claimed mining reward'
        });

        if (updatedProfile) {
          wsManager.broadcast(userId, 'mining_auto_claimed', { 
            coinsEarned, 
            profile: updatedProfile,
            session
          });
        }
      } else {
        const hoursElapsed = (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60);
        const currentCoins = hoursElapsed * session.coinsPerHour;
        const progress = Math.min((hoursElapsed / 6) * 100, 100);

        wsManager.broadcast(userId, 'mining_progress', {
          progress,
          currentCoins,
          session
        });
      }
    } catch (error) {
      console.error(`Error processing mining for user ${userId}:`, error);
    }
  }
}

export const backgroundJobManager = new BackgroundJobManager();
