import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { wsManager } from "./websocket";
import { verifyToken } from "./firebase-admin";

function generateReferralCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function updateAchievementProgress(userId: string, achievementKey: string, incrementBy: number = 1) {
  try {
    const achievements = await storage.getAchievements(userId);
    const achievement = achievements.find(a => a.achievementKey === achievementKey && !a.isCompleted);
    
    if (achievement) {
      const newProgress = Math.min(achievement.progress + incrementBy, achievement.target);
      await storage.updateAchievement(achievement.id, { progress: newProgress });
      
      if (newProgress >= achievement.target) {
        wsManager.broadcast(userId, 'achievement_ready', { achievement });
      }
    }
  } catch (error) {
    console.error(`Error updating achievement ${achievementKey} for user ${userId}:`, error);
  }
}

async function initializeNewUser(userId: string, username: string, invitationCode?: string) {
  const profile = await storage.createUserProfile({
    userId,
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
      userId,
      achievementKey: 'daily_login',
      title: 'Daily Login',
      description: 'Log in to the app daily',
      reward: 5,
      isCompleted: false,
      progress: 0,
      target: 1
    },
    {
      userId,
      achievementKey: 'mine_coins',
      title: 'Mine 1000 Coins',
      description: 'Mine a total of 1000 CASET coins',
      reward: 100,
      isCompleted: false,
      progress: 0,
      target: 1000
    },
    {
      userId,
      achievementKey: 'invite_friends',
      title: 'Invite 5 Friends',
      description: 'Invite 5 friends to join PingCaset',
      reward: 100,
      isCompleted: false,
      progress: 0,
      target: 5
    },
    {
      userId,
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

  if (invitationCode) {
    const inviter = await storage.getUserByReferralCode(invitationCode);
    if (inviter) {
      await storage.createReferral({
        referrerId: inviter.id,
        referredId: userId,
        referralCode: invitationCode,
        rewardClaimed: false
      });

      await storage.createTransaction({
        userId,
        amount: 400,
        type: 'referral_bonus',
        description: 'Signup bonus from referral'
      });

      await storage.createTransaction({
        userId: inviter.id,
        amount: 200,
        type: 'referral_reward',
        description: `Invited ${username}`
      });

      await storage.updateUserProfile(userId, {
        balance: profile.balance + 400
      });

      const inviterProfile = await storage.getUserProfile(inviter.id);
      if (inviterProfile) {
        await storage.updateUserProfile(inviter.id, {
          balance: inviterProfile.balance + 200,
          miningMultiplier: inviterProfile.miningMultiplier + 0.4
        });
      }

      await updateAchievementProgress(inviter.id, 'invite_friends', 1);
    }
  }

  await updateAchievementProgress(userId, 'daily_login', 1);

  return profile;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header' });
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await verifyToken(token);
      
      if (!decodedToken || !decodedToken.email) {
        return res.status(401).json({ message: 'Invalid or missing token' });
      }

      const { username, email, invitationCode } = req.body;

      if (decodedToken.email !== email) {
        return res.status(403).json({ message: 'Email mismatch with token' });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      const referralCode = generateReferralCode();
      const user = await storage.createUser({
        username,
        email,
        password: null,
        referralCode,
        invitedBy: invitationCode || null
      });

      await initializeNewUser(user.id, username, invitationCode);

      res.json(user);
    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(500).json({ message: error.message || 'Failed to create account' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header' });
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await verifyToken(token);
      
      if (!decodedToken || !decodedToken.email) {
        return res.status(401).json({ message: 'Invalid or missing token' });
      }

      const { email } = req.body;

      if (decodedToken.email !== email) {
        return res.status(403).json({ message: 'Email mismatch with token' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: error.message || 'Failed to login' });
    }
  });

  app.post('/api/auth/google', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header' });
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await verifyToken(token);
      
      if (!decodedToken || !decodedToken.uid) {
        return res.status(401).json({ message: 'Invalid or missing token' });
      }

      const { email, displayName, photoURL, googleId, invitationCode } = req.body;

      if (decodedToken.uid !== googleId) {
        return res.status(403).json({ message: 'Google ID mismatch with token' });
      }

      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        user = await storage.getUserByGoogleId(googleId);
      }

      if (user) {
        return res.json(user);
      }

      const referralCode = generateReferralCode();
      user = await storage.createUser({
        username: displayName || email.split('@')[0],
        email,
        password: null,
        googleId,
        photoURL,
        referralCode,
        invitedBy: invitationCode || null
      });

      await initializeNewUser(user.id, displayName || email.split('@')[0], invitationCode);

      res.json(user);
    } catch (error: any) {
      console.error('Google auth error:', error);
      res.status(500).json({ message: error.message || 'Failed to authenticate with Google' });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header' });
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await verifyToken(token);
      
      if (!decodedToken) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await storage.getUserByEmail(decodedToken.email || '');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ message: error.message || 'Failed to get user' });
    }
  });

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

      await updateAchievementProgress(req.params.userId, 'play_games', 1);

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

      const existingBoosts = await storage.getBoosts(req.params.userId);
      const now = new Date();
      const alreadyActive = existingBoosts.some(b => 
        b.boostType === boostType && 
        b.isActive && 
        new Date(b.expiresAt) > now
      );

      if (alreadyActive) {
        return res.status(400).json({ error: 'This boost is already active' });
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
