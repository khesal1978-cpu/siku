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
  type InsertMiningSession,
  type Transaction,
  type InsertTransaction,
  type Referral,
  type InsertReferral,
  users as usersTable, 
  userProfiles as userProfilesTable,
  spinRecords as spinRecordsTable,
  scratchCards as scratchCardsTable,
  achievements as achievementsTable,
  boosts as boostsTable,
  miningSession as miningSessionTable,
  transactions as transactionsTable,
  referrals as referralsTable
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, 'referralCode'> & { referralCode: string }): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
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
  
  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  getReferrals(userId: string): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralByCode(code: string): Promise<Referral | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.googleId, googleId));
    return user || undefined;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode));
    return user || undefined;
  }

  async createUser(insertUser: Omit<InsertUser, 'referralCode'> & { referralCode: string }): Promise<User> {
    const [user] = await db
      .insert(usersTable)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfilesTable)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const [profile] = await db
      .update(userProfilesTable)
      .set(updates)
      .where(eq(userProfilesTable.userId, userId))
      .returning();
    return profile || undefined;
  }

  async getSpinRecords(userId: string): Promise<SpinRecord[]> {
    return await db.select().from(spinRecordsTable).where(eq(spinRecordsTable.userId, userId));
  }

  async createSpinRecord(insertRecord: InsertSpinRecord): Promise<SpinRecord> {
    const [record] = await db
      .insert(spinRecordsTable)
      .values(insertRecord)
      .returning();
    return record;
  }

  async getLastSpinRecord(userId: string): Promise<SpinRecord | undefined> {
    const [record] = await db
      .select()
      .from(spinRecordsTable)
      .where(eq(spinRecordsTable.userId, userId))
      .orderBy(desc(spinRecordsTable.spinDate))
      .limit(1);
    return record || undefined;
  }

  async getScratchCards(userId: string): Promise<ScratchCard[]> {
    return await db.select().from(scratchCardsTable).where(eq(scratchCardsTable.userId, userId));
  }

  async getScratchCard(cardId: string): Promise<ScratchCard | undefined> {
    const [card] = await db.select().from(scratchCardsTable).where(eq(scratchCardsTable.id, cardId));
    return card || undefined;
  }

  async createScratchCard(insertCard: InsertScratchCard): Promise<ScratchCard> {
    const [card] = await db
      .insert(scratchCardsTable)
      .values(insertCard)
      .returning();
    return card;
  }

  async scratchCard(cardId: string): Promise<ScratchCard | undefined> {
    const [card] = await db
      .update(scratchCardsTable)
      .set({ isScratched: true, scratchedAt: new Date() })
      .where(eq(scratchCardsTable.id, cardId))
      .returning();
    return card || undefined;
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    return await db.select().from(achievementsTable).where(eq(achievementsTable.userId, userId));
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievementsTable)
      .values(insertAchievement)
      .returning();
    return achievement;
  }

  async updateAchievement(id: string, updates: Partial<Achievement>): Promise<Achievement | undefined> {
    const [achievement] = await db
      .update(achievementsTable)
      .set(updates)
      .where(eq(achievementsTable.id, id))
      .returning();
    return achievement || undefined;
  }

  async getBoosts(userId: string): Promise<Boost[]> {
    return await db.select().from(boostsTable).where(eq(boostsTable.userId, userId));
  }

  async createBoost(insertBoost: InsertBoost): Promise<Boost> {
    const [boost] = await db
      .insert(boostsTable)
      .values(insertBoost)
      .returning();
    return boost;
  }

  async deactivateBoost(id: string): Promise<void> {
    await db
      .update(boostsTable)
      .set({ isActive: false })
      .where(eq(boostsTable.id, id));
  }

  async getMiningSession(userId: string): Promise<MiningSession | undefined> {
    const [session] = await db
      .select()
      .from(miningSessionTable)
      .where(and(eq(miningSessionTable.userId, userId), eq(miningSessionTable.isActive, true)))
      .limit(1);
    return session || undefined;
  }

  async createMiningSession(insertSession: InsertMiningSession): Promise<MiningSession> {
    const [session] = await db
      .insert(miningSessionTable)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateMiningSession(id: string, updates: Partial<MiningSession>): Promise<MiningSession | undefined> {
    const [session] = await db
      .update(miningSessionTable)
      .set(updates)
      .where(eq(miningSessionTable.id, id))
      .returning();
    return session || undefined;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, id))
      .returning();
    return user || undefined;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, userId))
      .orderBy(desc(transactionsTable.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactionsTable)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getReferrals(userId: string): Promise<Referral[]> {
    return await db
      .select()
      .from(referralsTable)
      .where(eq(referralsTable.referrerId, userId));
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db
      .insert(referralsTable)
      .values(insertReferral)
      .returning();
    return referral;
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const [referral] = await db
      .select()
      .from(referralsTable)
      .where(eq(referralsTable.referralCode, code))
      .limit(1);
    return referral || undefined;
  }
}

export const storage = new DatabaseStorage();
