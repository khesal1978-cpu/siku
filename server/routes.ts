import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { wsManager } from "./websocket";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/profile/:userId', async (req, res) => {
    try {
      let profile = await storage.getUserProfile(req.params.userId);
      
      if (!profile) {
        profile = await storage.createUserProfile({
          userId: req.params.userId,
          balance: 0,
          energy: 100,
          maxEnergy: 100,
          streak: 0,
          lastLogin: new Date(),
          miningSpeed: 2,
          miningMultiplier: 1,
          lastEnergyRefill: new Date(),
          totalMined: 0
        });

        const defaultAchievements = [
          {
            userId: req.params.userId,
            achievementKey: 'daily_login',
            title: 'Daily Login',
            description: 'Log in to the app daily',
            reward: 5,
            isCompleted: false,
            progress: 0,
            target: 1
          },
          {
            userId: req.params.userId,
            achievementKey: 'mine_coins',
            title: 'Mine 1000 Coins',
            description: 'Mine a total of 1000 CASET coins',
            reward: 100,
            isCompleted: false,
            progress: 0,
            target: 1000
          },
          {
            userId: req.params.userId,
            achievementKey: 'invite_friends',
            title: 'Invite 5 Friends',
            description: 'Invite 5 friends to join PingCaset',
            reward: 100,
            isCompleted: false,
            progress: 0,
            target: 5
          },
          {
            userId: req.params.userId,
            achievementKey: 'play_games',
            title: 'Play 10 Games',
            description: 'Play mini-games 10 times',
            reward: 50,
            isCompleted: false,
            progress: 0,
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

      const rewardOptions = [
        { value: 0, weight: 20, label: 'Unlucky' },
        { value: 30, weight: 30, label: '30' },
        { value: 60, weight: 30, label: '60' },
        { value: 100, weight: 12, label: '100' },
        { value: 400, weight: 6, label: '400' },
        { value: 1000, weight: 2, label: '1000' }
      ];
      
      const totalWeight = rewardOptions.reduce((sum, opt) => sum + opt.weight, 0);
      let random = Math.random() * totalWeight;
      let reward = 0;
      
      for (const option of rewardOptions) {
        random -= option.weight;
        if (random <= 0) {
          reward = option.value;
          break;
        }
      }

      await storage.createSpinRecord({
        userId: req.params.userId,
        reward
      });

      const updatedProfile = await storage.updateUserProfile(req.params.userId, {
        balance: profile.balance + reward,
        energy: profile.energy - 15
      });

      await storage.createTransaction({
        userId: req.params.userId,
        amount: reward,
        type: 'spin_wheel',
        description: 'Spin wheel reward'
      });

      res.json({ reward });
      wsManager.broadcast(req.params.userId, 'profile_updated', updatedProfile);
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

      const updatedProfile = await storage.updateUserProfile(req.params.userId, {
        energy: profile.energy - 10
      });

      res.json(card);
      wsManager.broadcast(req.params.userId, 'profile_updated', updatedProfile);
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

      const updatedProfile = await storage.updateUserProfile(card.userId, {
        balance: profile.balance + scratchedCard.reward,
        energy: profile.energy - 5
      });

      await storage.createTransaction({
        userId: card.userId,
        amount: scratchedCard.reward,
        type: 'scratch_card',
        description: 'Scratch card reward'
      });

      res.json(scratchedCard);
      wsManager.broadcast(card.userId, 'profile_updated', updatedProfile);
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
        const updatedProfile = await storage.updateUserProfile(achievement.userId, {
          balance: profile.balance + achievement.reward
        });
        
        await storage.createTransaction({
          userId: achievement.userId,
          amount: achievement.reward,
          type: 'achievement',
          description: `Achievement claimed: ${achievement.title}`
        });

        wsManager.broadcast(achievement.userId, 'achievement_claimed', { achievement, profile: updatedProfile });
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

      const updatedProfile = await storage.updateUserProfile(req.params.userId, {
        balance: profile.balance - config.cost,
        energy: profile.energy - config.energyCost,
        miningMultiplier: profile.miningMultiplier * config.multiplier
      });

      await storage.createTransaction({
        userId: req.params.userId,
        amount: -config.cost,
        type: 'boost_purchase',
        description: `Activated ${boostType} boost`
      });

      res.json(boost);
      wsManager.broadcast(req.params.userId, 'boost_activated', { boost, profile: updatedProfile });
    } catch (error) {
      res.status(500).json({ error: 'Failed to activate boost' });
    }
  });

  app.get('/api/mining/:userId', async (req, res) => {
    try {
      const session = await storage.getMiningSession(req.params.userId);
      res.json(session || null);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch mining session' });
    }
  });

  app.post('/api/mining/start/:userId', async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      const existingSession = await storage.getMiningSession(req.params.userId);
      if (existingSession) {
        return res.status(400).json({ error: 'Mining session already active' });
      }

      const now = new Date();
      const endsAt = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      
      const session = await storage.createMiningSession({
        userId: req.params.userId,
        endsAt,
        coinsPerHour: profile.miningSpeed * profile.miningMultiplier,
        isActive: true
      });

      res.json(session);
      wsManager.broadcast(req.params.userId, 'mining_started', session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to start mining' });
    }
  });

  app.post('/api/mining/claim/:userId', async (req, res) => {
    try {
      const session = await storage.getMiningSession(req.params.userId);
      if (!session) {
        return res.status(404).json({ error: 'No active mining session' });
      }

      const now = new Date();
      const startedAt = new Date(session.startedAt);
      const hoursElapsed = Math.min(6, (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60));
      const coinsEarned = hoursElapsed * session.coinsPerHour;

      const profile = await storage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      await storage.updateMiningSession(session.id, { isActive: false });
      const updatedProfile = await storage.updateUserProfile(req.params.userId, {
        balance: profile.balance + coinsEarned,
        totalMined: profile.totalMined + coinsEarned
      });

      await storage.createTransaction({
        userId: req.params.userId,
        amount: coinsEarned,
        type: 'mining',
        description: 'Mining reward claimed'
      });

      res.json({ coinsEarned, profile: updatedProfile });
      wsManager.broadcast(req.params.userId, 'mining_claimed', { coinsEarned, profile: updatedProfile });
    } catch (error) {
      res.status(500).json({ error: 'Failed to claim mining' });
    }
  });

  app.get('/api/transactions/:userId', async (req, res) => {
    try {
      const transactions = await storage.getTransactions(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  app.get('/api/referrals/:userId', async (req, res) => {
    try {
      const referrals = await storage.getReferrals(req.params.userId);
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch referrals' });
    }
  });

  app.post('/api/referrals/create/:userId', async (req, res) => {
    try {
      const { referralCode } = req.body;
      const profile = await storage.getUserProfile(req.params.userId);
      
      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      const referral = await storage.createReferral({
        referrerId: req.params.userId,
        referredId: '',
        referralCode,
        rewardClaimed: false
      });

      res.json(referral);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create referral' });
    }
  });

  app.post('/api/referrals/use/:userId', async (req, res) => {
    try {
      const { referralCode } = req.body;
      
      const existingReferral = await storage.getReferralByCode(referralCode);
      if (!existingReferral) {
        return res.status(404).json({ error: 'Invalid referral code' });
      }

      const referrerProfile = await storage.getUserProfile(existingReferral.referrerId);
      const referredProfile = await storage.getUserProfile(req.params.userId);

      if (!referrerProfile || !referredProfile) {
        return res.status(404).json({ error: 'User not found' });
      }

      const referrals = await storage.getReferrals(existingReferral.referrerId);
      const newMultiplier = 1 + (referrals.length * 0.4);

      const updatedReferrerProfile = await storage.updateUserProfile(existingReferral.referrerId, {
        balance: referrerProfile.balance + 200,
        miningMultiplier: newMultiplier
      });

      const updatedReferredProfile = await storage.updateUserProfile(req.params.userId, {
        balance: referredProfile.balance + 400
      });

      await storage.createReferral({
        referrerId: existingReferral.referrerId,
        referredId: req.params.userId,
        referralCode,
        rewardClaimed: true
      });

      await storage.createTransaction({
        userId: existingReferral.referrerId,
        amount: 200,
        type: 'referral',
        description: 'Referral bonus - inviter reward'
      });

      await storage.createTransaction({
        userId: req.params.userId,
        amount: 400,
        type: 'referral',
        description: 'Referral bonus - welcome reward'
      });

      const inviteFriendsAchievement = (await storage.getAchievements(existingReferral.referrerId))
        .find(a => a.achievementKey === 'invite_friends');
      
      if (inviteFriendsAchievement && !inviteFriendsAchievement.isCompleted) {
        await storage.updateAchievement(inviteFriendsAchievement.id, {
          progress: inviteFriendsAchievement.progress + 1
        });
      }

      wsManager.broadcast(existingReferral.referrerId, 'profile_updated', updatedReferrerProfile);
      wsManager.broadcast(req.params.userId, 'profile_updated', updatedReferredProfile);

      res.json({ 
        referrer: updatedReferrerProfile, 
        referred: updatedReferredProfile 
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to use referral code' });
    }
  });

  app.get('/api/leaderboard', async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  app.put('/api/user/:userId', async (req, res) => {
    try {
      const { username, country, avatar } = req.body;
      const updates: any = {};
      if (username) updates.username = username;
      if (country) updates.country = country;
      if (avatar) updates.avatar = avatar;

      const user = await storage.updateUser(req.params.userId, updates);
      res.json(user);
      wsManager.broadcast(req.params.userId, 'user_updated', user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  app.get('/api/user/:userId', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
