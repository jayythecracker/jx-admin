import { pgTable, text, serial, uuid, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Legacy users table
export const usersLegacy = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  passcode_hash: text("passcode_hash").notNull(),
  imei: text("imei").notNull(),
  is_vip: boolean("is_vip").default(false),
  created_at: timestamp("created_at").defaultNow(),
  expired_at: timestamp("expired_at"),
  last_login: timestamp("last_login"),
  current_device: text("current_device"),
  is_banned: boolean("is_banned").default(false)
});

// New users table (users2)
export const users = pgTable("users2", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  passcode_hash: text("passcode_hash").notNull(),
  imei: text("imei").notNull(),
  is_vip: boolean("is_vip").default(false),
  created_at: timestamp("created_at").defaultNow(),
  expired_at: timestamp("expired_at"),
  last_login: timestamp("last_login"),
  current_device: text("current_device"),
  is_banned: boolean("is_banned").default(false)
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  phone: true,
  passcode_hash: true,
  imei: true,
  is_vip: true,
  expired_at: true,
  is_banned: true,
});

export const insertLegacyUserSchema = createInsertSchema(usersLegacy).pick({
  name: true,
  phone: true,
  passcode_hash: true,
  imei: true,
  is_vip: true,
  expired_at: true,
  is_banned: true,
});

// Update schema
export const updateUserSchema = z.object({
  name: z.string(),
  phone: z.string().optional(),
  imei: z.string().optional(),
  is_vip: z.boolean().optional(),
  is_banned: z.boolean().optional(),
  expired_at: z.string().nullable().optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    return new Date(val);
  }),
});

// Filter schema
export const filterUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  is_vip: z.enum(['all', 'vip', 'non-vip']).optional().default('all'),
  is_banned: z.enum(['all', 'banned', 'active']).optional().default('all'),
  sortBy: z.enum(['name', 'created_at', 'last_login', 'expired_at']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
  table: z.enum(['users', 'users2']).optional().default('users2'),
});

// Analytics and settings types
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  vipUsers: number;
  newUsers: number; // Last 7 days
}

export interface UserActivity {
  date: string;
  userCount: number;
}

export interface AppSettings {
  allowRegistration: boolean;
  maintenanceMode: boolean;
  vipFeatures: string[];
  appVersion: string;
  notificationMessage: string;
  activeUserTable: 'users' | 'users2';
}

export type User = typeof users.$inferSelect;
export type LegacyUser = typeof usersLegacy.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLegacyUser = z.infer<typeof insertLegacyUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type FilterUserParams = z.infer<typeof filterUserSchema>;