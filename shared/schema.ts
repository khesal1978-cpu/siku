import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password"),
  googleId: text("google_id").unique(),
  photoURL: text("photo_url"),
  country: text("country"),
  avatar: text("avatar"),
  referralCode: text("referral_code").notNull().unique(),
  invitedBy: text("invited_by"),
  joinedAt: timestamp("joined_at").notNull().default(sql`now()`),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  balance: real("balance").notNull().default(0),
  energy: integer("energy").notNull().default(100),
  maxEnergy: integer("max_energy").notNull().default(100),
  streak: integer("streak").notNull().default(0),
  lastLogin: timestamp("last_login").notNull().default(sql`now()`),
  miningSpeed: real("mining_speed").notNull().default(2),
  miningMultiplier: real("mining_multiplier").notNull().default(1),
  lastEnergyRefill: timestamp("last_energy_refill").notNull().default(sql`now()`),
  totalMined: real("total_mined").notNull().default(0),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull(),
  referredId: varchar("referred_id").notNull(),
  referralCode: text("referral_code").notNull(),
  rewardClaimed: boolean("reward_claimed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const spinRecords = pgTable("spin_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  reward: real("reward").notNull(),
  spinDate: timestamp("spin_date").notNull().default(sql`now()`),
});

export const scratchCards = pgTable("scratch_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  reward: real("reward").notNull(),
  isScratched: boolean("is_scratched").notNull().default(false),
  scratchedAt: timestamp("scratched_at"),
  cardType: text("card_type").notNull(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  achievementKey: text("achievement_key").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: real("reward").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").notNull().default(0),
  target: integer("target").notNull(),
});

export const boosts = pgTable("boosts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  boostType: text("boost_type").notNull(),
  multiplier: real("multiplier").notNull(),
  duration: integer("duration").notNull(),
  startedAt: timestamp("started_at").notNull().default(sql`now()`),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const miningSession = pgTable("mining_session", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  startedAt: timestamp("started_at").notNull().default(sql`now()`),
  endsAt: timestamp("ends_at").notNull(),
  coinsPerHour: real("coins_per_hour").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  joinedAt: true,
  referralCode: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
});

export const insertSpinRecordSchema = createInsertSchema(spinRecords).omit({
  id: true,
  spinDate: true,
});

export const insertScratchCardSchema = createInsertSchema(scratchCards).omit({
  id: true,
  scratchedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  completedAt: true,
});

export const insertBoostSchema = createInsertSchema(boosts).omit({
  id: true,
  startedAt: true,
});

export const insertMiningSessionSchema = createInsertSchema(miningSession).omit({
  id: true,
  startedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type SpinRecord = typeof spinRecords.$inferSelect;
export type InsertSpinRecord = z.infer<typeof insertSpinRecordSchema>;
export type ScratchCard = typeof scratchCards.$inferSelect;
export type InsertScratchCard = z.infer<typeof insertScratchCardSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Boost = typeof boosts.$inferSelect;
export type InsertBoost = z.infer<typeof insertBoostSchema>;
export type MiningSession = typeof miningSession.$inferSelect;
export type InsertMiningSession = z.infer<typeof insertMiningSessionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
