import { pgTable, text, serial, uuid, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  phone: true,
  passcode_hash: true,
  imei: true,
  is_vip: true,
  expired_at: true,
  is_banned: true,
});

// Define a custom update schema to handle string and null values properly
export const updateUserSchema = z.object({
  name: z.string(),
  phone: z.string().optional(),
  imei: z.string().optional(),
  is_vip: z.boolean().optional(),
  is_banned: z.boolean().optional(),
  expired_at: z.string().nullable().optional().transform(val => {
    // Convert string to Date or keep null
    if (val === "" || val === null || val === undefined) return null;
    return new Date(val);
  }),
});

export const filterUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  is_vip: z.enum(['all', 'vip', 'non-vip']).optional().default('all'),
  is_banned: z.enum(['all', 'banned', 'active']).optional().default('all'),
  sortBy: z.enum(['name', 'created_at', 'last_login', 'expired_at']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type FilterUserParams = z.infer<typeof filterUserSchema>;
