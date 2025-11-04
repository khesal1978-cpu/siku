import { 
  type User, 
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type SpinRecord,
  type InsertSpinRecord,
  type ScratchCard,
  type InsertScratchCard,
  type Achievement,
  type InsertAchievement,
  type Boost,
  type InsertBoost,
  type MiningSession,
  type InsertMiningSession
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined>;
  
  getSpinRecords(userId: string): Promise<SpinRecord[]>;
  createSpinRecord(record: InsertSpinRecord): Promise<SpinRecord>;
  getLastSpinRecord(userId: string): Promise<SpinRecord | undefined>;
  
  getScratchCards(userId: string): Promise<ScratchCard[]>;
  getScratchCard(cardId: string): Promise<ScratchCard | undefined>;
  createScratchCard(card: InsertScratchCard): Promise<ScratchCard>;
  scratchCard(cardId: string): Promise<ScratchCard | undefined>;
  
  getAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement | undefined>;
  
  getBoosts(userId: string): Promise<Boost[]>;
  createBoost(boost: InsertBoost): Promise<Boost>;
  deactivateBoost(id: string): Promise<void>;
  
  getMiningSession(userId: string): Promise<MiningSession | undefined>;
  createMiningSession(session: InsertMiningSession): Promise<MiningSession>;
  updateMiningSession(id: string, updates: Partial<MiningSession>): Promise<MiningSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userProfiles: Map<string, UserProfile>;
  private spinRecords: Map<string, SpinRecord>;
  private scratchCards: Map<string, ScratchCard>;
  private achievements: Map<string, Achievement>;
  private boosts: Map<string, Boost>;
  private miningSessions: Map<string, MiningSession>;

  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.spinRecords = new Map();
    this.scratchCards = new Map();
    this.achievements = new Map();
    this.boosts = new Map();
    this.miningSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(p => p.userId === userId);
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const id = randomUUID();
    const profile: UserProfile = { 
      id,
      userId: insertProfile.userId,
      balance: insertProfile.balance ?? 0,
      energy: insertProfile.energy ?? 100,
      maxEnergy: insertProfile.maxEnergy ?? 100,
      streak: insertProfile.streak ?? 0,
      lastLogin: insertProfile.lastLogin ?? new Date(),
      miningSpeed: insertProfile.miningSpeed ?? 10,
      miningMultiplier: insertProfile.miningMultiplier ?? 1,
      lastEnergyRefill: insertProfile.lastEnergyRefill ?? new Date(),
      totalMined: insertProfile.totalMined ?? 0
    };
    this.userProfiles.set(id, profile);
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return undefined;
    const updated = { ...profile, ...updates };
    this.userProfiles.set(profile.id, updated);
    return updated;
  }

  async getSpinRecords(userId: string): Promise<SpinRecord[]> {
    return Array.from(this.spinRecords.values()).filter(r => r.userId === userId);
  }

  async createSpinRecord(insertRecord: InsertSpinRecord): Promise<SpinRecord> {
    const id = randomUUID();
    const record: SpinRecord = {
      ...insertRecord,
      id,
      spinDate: new Date()
    };
    this.spinRecords.set(id, record);
    return record;
  }

  async getLastSpinRecord(userId: string): Promise<SpinRecord | undefined> {
    const records = await this.getSpinRecords(userId);
    return records.sort((a, b) => b.spinDate.getTime() - a.spinDate.getTime())[0];
  }

  async getScratchCards(userId: string): Promise<ScratchCard[]> {
    return Array.from(this.scratchCards.values()).filter(c => c.userId === userId);
  }

  async getScratchCard(cardId: string): Promise<ScratchCard | undefined> {
    return this.scratchCards.get(cardId);
  }

  async createScratchCard(insertCard: InsertScratchCard): Promise<ScratchCard> {
    const id = randomUUID();
    const card: ScratchCard = {
      id,
      userId: insertCard.userId,
      reward: insertCard.reward,
      isScratched: insertCard.isScratched ?? false,
      scratchedAt: null,
      cardType: insertCard.cardType
    };
    this.scratchCards.set(id, card);
    return card;
  }

  async scratchCard(cardId: string): Promise<ScratchCard | undefined> {
    const card = this.scratchCards.get(cardId);
    if (!card || card.isScratched) return undefined;
    const updated: ScratchCard = {
      ...card,
      isScratched: true,
      scratchedAt: new Date()
    };
    this.scratchCards.set(cardId, updated);
    return updated;
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(a => a.userId === userId);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const achievement: Achievement = {
      id,
      userId: insertAchievement.userId,
      achievementKey: insertAchievement.achievementKey,
      title: insertAchievement.title,
      description: insertAchievement.description,
      reward: insertAchievement.reward,
      isCompleted: insertAchievement.isCompleted ?? false,
      completedAt: null,
      progress: insertAchievement.progress ?? 0,
      target: insertAchievement.target
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement | undefined> {
    const achievement = this.achievements.get(id);
    if (!achievement) return undefined;
    const updated = { ...achievement, ...updates };
    this.achievements.set(id, updated);
    return updated;
  }

  async getBoosts(userId: string): Promise<Boost[]> {
    return Array.from(this.boosts.values()).filter(b => b.userId === userId);
  }

  async createBoost(insertBoost: InsertBoost): Promise<Boost> {
    const id = randomUUID();
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + insertBoost.duration * 1000);
    const boost: Boost = {
      id,
      userId: insertBoost.userId,
      boostType: insertBoost.boostType,
      multiplier: insertBoost.multiplier,
      duration: insertBoost.duration,
      startedAt,
      expiresAt,
      isActive: insertBoost.isActive ?? true
    };
    this.boosts.set(id, boost);
    return boost;
  }

  async deactivateBoost(id: string): Promise<void> {
    const boost = this.boosts.get(id);
    if (boost) {
      this.boosts.set(id, { ...boost, isActive: false });
    }
  }

  async getMiningSession(userId: string): Promise<MiningSession | undefined> {
    return Array.from(this.miningSessions.values()).find(s => s.userId === userId && s.isActive);
  }

  async createMiningSession(insertSession: InsertMiningSession): Promise<MiningSession> {
    const id = randomUUID();
    const startedAt = new Date();
    const session: MiningSession = {
      id,
      userId: insertSession.userId,
      startedAt,
      endsAt: insertSession.endsAt,
      coinsPerHour: insertSession.coinsPerHour,
      isActive: insertSession.isActive ?? true
    };
    this.miningSessions.set(id, session);
    return session;
  }

  async updateMiningSession(id: string, updates: Partial<MiningSession>): Promise<MiningSession | undefined> {
    const session = this.miningSessions.get(id);
    if (!session) return undefined;
    const updated = { ...session, ...updates };
    this.miningSessions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
