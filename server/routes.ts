import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/profile/:userId', async (req, res) => {
    try {
      let profile = await storage.getUserProfile(req.params.userId);
      
      if (!profile) {
        profile = await storage.createUserProfile({
          userId: req.params.userId,
          balance: 1234.56,
          energy: 100,
          maxEnergy: 100,
          streak: 5,
          lastLogin: new Date(),
          miningSpeed: 10,
          miningMultiplier: 1,
          lastEnergyRefill: new Date(),
          totalMined: 1234.56
        });

        const defaultAchievements = [
          {
            userId: req.params.userId,
            achievementKey: 'daily_login',
            title: 'Daily Login',
            description: 'Log in to the app daily',
            reward: 100,
            isCompleted: false,
            progress: 1,
            target: 1
          },
          {
            userId: req.params.userId,
            achievementKey: 'mine_coins',
            title: 'Mine 1000 Coins',
            description: 'Mine a total of 1000 CASET coins',
            reward: 500,
            isCompleted: false,
            progress: 234,
            target: 1000
          },
          {
            userId: req.params.userId,
            achievementKey: 'invite_friends',
            title: 'Invite 5 Friends',
            description: 'Invite 5 friends to join PingCaset',
            reward: 1000,
            isCompleted: false,
            progress: 0,
            target: 5
          },
          {
            userId: req.params.userId,
            achievementKey: 'play_games',
            title: 'Play 10 Games',
            description: 'Play mini-games 10 times',
            reward: 250,
            isCompleted: false,
            progress: 3,
            target: 10
          }
        ];

        for (const achievement of defaultAchievements) {
          await storage.createAchievement(achievement);
        }
      }

      const now = new Date();
      const lastRefill = new Date(profile.lastEnergyRefill);
      const minutesPassed = Math.floor((now.getTime() - lastRefill.getTime()) / 60000);
      const energyUnitsToAdd = Math.floor(minutesPassed / 5);
      
      if (energyUnitsToAdd > 0 && profile.energy < profile.maxEnergy) {
        const actualEnergyToAdd = Math.min(energyUnitsToAdd, profile.maxEnergy - profile.energy);
        const minutesToAdvance = energyUnitsToAdd * 5;
        profile = await storage.updateUserProfile(req.params.userId, {
          energy: profile.energy + actualEnergyToAdd,
          lastEnergyRefill: new Date(lastRefill.getTime() + minutesToAdvance * 60000)
        }) || profile;
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.get('/api/spin/can-spin/:userId', async (req, res) => {
    try {
      const lastSpin = await storage.getLastSpinRecord(req.params.userId);
      
      if (!lastSpin) {
        return res.json({ canSpin: true });
      }

      const now = new Date();
      const lastSpinDate = new Date(lastSpin.spinDate);
      const hoursSinceLastSpin = (now.getTime() - lastSpinDate.getTime()) / (1000 * 60 * 60);
      
      const canSpin = hoursSinceLastSpin >= 24;
      const nextSpinTime = canSpin ? undefined : new Date(lastSpinDate.getTime() + 24 * 60 * 60 * 1000).toLocaleString();

      res.json({ canSpin, nextSpinTime });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check spin status' });
    }
  });

  app.post('/api/spin/:userId', async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      
      if (!profile || profile.energy < 15) {
        return res.status(400).json({ error: 'Not enough energy. Need 15 energy to spin.' });
      }

      const lastSpin = await storage.getLastSpinRecord(req.params.userId);
      
      if (lastSpin) {
        const now = new Date();
        const lastSpinDate = new Date(lastSpin.spinDate);
        const hoursSinceLastSpin = (now.getTime() - lastSpinDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastSpin < 24) {
          return res.status(400).json({ error: 'Can only spin once per day' });
        }
      }

      const rewards = [50, 100, 25, 200, 75, 500, 150, 1000];
      const reward = rewards[Math.floor(Math.random() * rewards.length)];

      await storage.createSpinRecord({
        userId: req.params.userId,
        reward
      });

      await storage.updateUserProfile(req.params.userId, {
        balance: profile.balance + reward,
        energy: profile.energy - 15
      });

      res.json({ reward });
    } catch (error) {
      res.status(500).json({ error: 'Failed to spin wheel' });
    }
  });

  app.get('/api/scratch-cards/:userId', async (req, res) => {
    try {
      const cards = await storage.getScratchCards(req.params.userId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch scratch cards' });
    }
  });

  app.post('/api/scratch-card/new/:userId', async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      
      if (!profile || profile.energy < 10) {
        return res.status(400).json({ error: 'Not enough energy' });
      }

      const rewards = [25, 50, 100, 150, 200, 500];
      const reward = rewards[Math.floor(Math.random() * rewards.length)];

      const card = await storage.createScratchCard({
        userId: req.params.userId,
        reward,
        isScratched: false,
        cardType: 'basic'
      });

      await storage.updateUserProfile(req.params.userId, {
        energy: profile.energy - 10
      });

      res.json(card);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create scratch card' });
    }
  });

  app.post('/api/scratch-card/:cardId', async (req, res) => {
    try {
      const card = await storage.getScratchCard(req.params.cardId);
      
      if (!card || card.isScratched) {
        return res.status(400).json({ error: 'Card not found or already scratched' });
      }

      const profile = await storage.getUserProfile(card.userId);
      
      if (!profile || profile.energy < 5) {
        return res.status(400).json({ error: 'Not enough energy. Need 5 energy to scratch.' });
      }

      const scratchedCard = await storage.scratchCard(req.params.cardId);
      
      if (!scratchedCard) {
        return res.status(400).json({ error: 'Failed to scratch card' });
      }

      await storage.updateUserProfile(card.userId, {
        balance: profile.balance + scratchedCard.reward,
        energy: profile.energy - 5
      });

      res.json(scratchedCard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to scratch card' });
    }
  });

  app.get('/api/achievements/:userId', async (req, res) => {
    try {
      const achievements = await storage.getAchievements(req.params.userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch achievements' });
    }
  });

  app.post('/api/achievement/:achievementId/claim', async (req, res) => {
    try {
      const achievement = await storage.updateAchievement(req.params.achievementId, {
        isCompleted: true,
        completedAt: new Date()
      });

      if (!achievement) {
        return res.status(404).json({ error: 'Achievement not found' });
      }

      const profile = await storage.getUserProfile(achievement.userId);
      if (profile) {
        await storage.updateUserProfile(achievement.userId, {
          balance: profile.balance + achievement.reward
        });
      }

      res.json(achievement);
    } catch (error) {
      res.status(500).json({ error: 'Failed to claim achievement' });
    }
  });

  app.get('/api/boosts/:userId', async (req, res) => {
    try {
      const boosts = await storage.getBoosts(req.params.userId);
      const now = new Date();
      
      const activeBoosts = boosts.filter(boost => {
        if (!boost.isActive) return false;
        if (new Date(boost.expiresAt) <= now) {
          storage.deactivateBoost(boost.id);
          return false;
        }
        return true;
      });

      res.json(activeBoosts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch boosts' });
    }
  });

  app.post('/api/boost/activate/:userId', async (req, res) => {
    try {
      const { boostType } = req.body;
      const profile = await storage.getUserProfile(req.params.userId);

      const boostConfig: Record<string, { multiplier: number; duration: number; cost: number; energyCost: number }> = {
        '2x_speed': { multiplier: 2, duration: 3600, cost: 100, energyCost: 20 },
        '3x_speed': { multiplier: 3, duration: 1800, cost: 200, energyCost: 30 },
        '5x_speed': { multiplier: 5, duration: 900, cost: 500, energyCost: 50 }
      };

      const config = boostConfig[boostType];
      if (!config) {
        return res.status(400).json({ error: 'Invalid boost type' });
      }

      if (!profile || profile.balance < config.cost) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      if (profile.energy < config.energyCost) {
        return res.status(400).json({ error: `Not enough energy. Need ${config.energyCost} energy to activate this boost.` });
      }

      const boost = await storage.createBoost({
        userId: req.params.userId,
        boostType,
        multiplier: config.multiplier,
        duration: config.duration,
        expiresAt: new Date(Date.now() + config.duration * 1000),
        isActive: true
      });

      await storage.updateUserProfile(req.params.userId, {
        balance: profile.balance - config.cost,
        energy: profile.energy - config.energyCost,
        miningMultiplier: profile.miningMultiplier * config.multiplier
      });

      res.json(boost);
    } catch (error) {
      res.status(500).json({ error: 'Failed to activate boost' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
