import { users, usersLegacy, type User, type LegacyUser, type InsertUser, type UpdateUser, 
  type FilterUserParams, type UserStats, type UserActivity, type AppSettings } from "@shared/schema";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY environment variables are required');
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  allowRegistration: true,
  maintenanceMode: false,
  vipFeatures: ["Priority Support", "Extended Expiration", "Premium Content"],
  appVersion: "1.0.0",
  notificationMessage: "",
  activeUserTable: "users2"
};

export interface IStorage {
  // User management
  getUsers(filters: FilterUserParams): Promise<{ data: (User | LegacyUser)[], count: number }>;
  getUser(id: string, table?: string): Promise<User | LegacyUser | null>;
  updateUser(id: string, user: UpdateUser, table?: string): Promise<User | LegacyUser>;
  banUser(id: string, table?: string): Promise<User | LegacyUser>;
  unbanUser(id: string, table?: string): Promise<User | LegacyUser>;
  setVipStatus(id: string, isVip: boolean, table?: string): Promise<User | LegacyUser>;

  // Analytics
  getUserStats(table?: string): Promise<UserStats>;
  getUserActivityTrend(days: number, table?: string): Promise<UserActivity[]>;

  // Settings
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
}

export class SupabaseStorage implements IStorage {
  private supabase;
  private settings: AppSettings = { ...DEFAULT_SETTINGS };

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getUsers(filters: FilterUserParams): Promise<{ data: (User | LegacyUser)[], count: number }> {
    const tableName = filters.table || 'users2';
    let query = this.supabase
      .from(tableName)
      .select("*", { count: "exact" });

    // Apply filters
    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
    }
    if (filters.phone) {
      query = query.ilike("phone", `%${filters.phone}%`);
    }
    if (filters.is_vip === "vip") {
      query = query.eq("is_vip", true);
    } else if (filters.is_vip === "non-vip") {
      query = query.eq("is_vip", false);
    }
    if (filters.is_banned === "banned") {
      query = query.eq("is_banned", true);
    } else if (filters.is_banned === "active") {
      query = query.eq("is_banned", false);
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const start = (page - 1) * limit;

    // Apply sorting
    query = query.order(filters.sortBy || "created_at", { 
      ascending: filters.sortOrder === "asc" 
    });

    // Execute query with pagination
    const { data, error, count } = await query
      .range(start, start + limit - 1);

    if (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }

    return { 
      data: data as (User | LegacyUser)[],
      count: count || 0
    };
  }

  async getUser(id: string, table = 'users2'): Promise<User | LegacyUser | null> {
    const { data, error } = await this.supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data as User | LegacyUser;
  }

  async updateUser(id: string, user: UpdateUser, table = 'users2'): Promise<User | LegacyUser> {
    const userData = { ...user } as any;

    if (userData.expired_at instanceof Date) {
      userData.expired_at = userData.expired_at.toISOString();
    } else if (userData.expired_at === "") {
      userData.expired_at = null;
    }

    const { data, error } = await this.supabase
      .from(table)
      .update(userData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data as User | LegacyUser;
  }

  async banUser(id: string, table = 'users2'): Promise<User | LegacyUser> {
    return this.updateUser(id, { is_banned: true } as UpdateUser, table);
  }

  async unbanUser(id: string, table = 'users2'): Promise<User | LegacyUser> {
    return this.updateUser(id, { is_banned: false } as UpdateUser, table);
  }

  async setVipStatus(id: string, isVip: boolean, table = 'users2'): Promise<User | LegacyUser> {
    return this.updateUser(id, { is_vip: isVip } as UpdateUser, table);
  }

  async getUserStats(table = 'users2'): Promise<UserStats> {
    // Get all stats from the specified table
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: bannedUsers },
      { count: vipUsers },
      { count: newUsers }
    ] = await Promise.all([
      this.supabase.from(table).select('*', { count: 'exact', head: true }),
      this.supabase.from(table).select('*', { count: 'exact', head: true }).eq('is_banned', false),
      this.supabase.from(table).select('*', { count: 'exact', head: true }).eq('is_banned', true),
      this.supabase.from(table).select('*', { count: 'exact', head: true }).eq('is_vip', true),
      this.supabase.from(table).select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      bannedUsers: bannedUsers || 0,
      vipUsers: vipUsers || 0,
      newUsers: newUsers || 0
    };
  }

  async getUserActivityTrend(days: number = 30, table = 'users2'): Promise<UserActivity[]> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const { data } = await this.supabase
      .from(table)
      .select('created_at')
      .gte('created_at', daysAgo.toISOString());

    if (!data) return [];

    const activityByDate = new Map<string, number>();

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      activityByDate.set(dateString, 0);
    }

    data.forEach(user => {
      const dateStr = new Date(user.created_at).toISOString().split('T')[0];
      const count = activityByDate.get(dateStr) || 0;
      activityByDate.set(dateStr, count + 1);
    });

    return Array.from(activityByDate.entries())
      .map(([date, userCount]) => ({ date, userCount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getSettings(): Promise<AppSettings> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
    this.settings = {
      ...this.settings,
      ...newSettings
    };

    return this.settings;
  }
}

export const storage = new SupabaseStorage();