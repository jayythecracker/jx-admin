import { users, type User, type InsertUser, type UpdateUser, type FilterUserParams, 
  type UserStats, type UserActivity, type AppSettings } from "@shared/schema";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  allowRegistration: true,
  maintenanceMode: false,
  vipFeatures: ["Priority Support", "Extended Expiration", "Premium Content"],
  appVersion: "1.0.0",
  notificationMessage: ""
};

export interface IStorage {
  // User management
  getUsers(filters: FilterUserParams): Promise<{ data: User[], count: number }>;
  getUser(id: string): Promise<User | null>;
  updateUser(id: string, user: UpdateUser): Promise<User>;
  banUser(id: string): Promise<User>;
  unbanUser(id: string): Promise<User>;
  setVipStatus(id: string, isVip: boolean): Promise<User>;
  
  // Analytics
  getUserStats(): Promise<UserStats>;
  getUserActivityTrend(days: number): Promise<UserActivity[]>;
  
  // Settings
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
}

export class SupabaseStorage implements IStorage {
  private supabase;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getUsers(filters: FilterUserParams): Promise<{ data: User[], count: number }> {
    let query = this.supabase
      .from("users2")
      .select("*", { count: "exact" });

    // Apply name filter
    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
    }

    // Apply phone filter
    if (filters.phone) {
      query = query.ilike("phone", `%${filters.phone}%`);
    }

    // Apply VIP filter
    if (filters.is_vip === "vip") {
      query = query.eq("is_vip", true);
    } else if (filters.is_vip === "non-vip") {
      query = query.eq("is_vip", false);
    }

    // Apply ban filter
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
      data: data as User[],
      count: count || 0
    };
  }

  async getUser(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from("users2")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to get user: ${error.message}`);
    }

    return data as User;
  }

  async updateUser(id: string, user: UpdateUser): Promise<User> {
    // Process expired_at date properly
    const userData = { ...user } as any; // Use any to avoid TypeScript errors during conversion
    
    // Ensure expired_at is properly formatted for Supabase
    if (userData.expired_at instanceof Date) {
      // Format as ISO string for Supabase
      userData.expired_at = userData.expired_at.toISOString();
    } else if (userData.expired_at === "") {
      // Handle empty string by setting to null
      userData.expired_at = null;
    }
    
    const { data, error } = await this.supabase
      .from("users2")
      .update(userData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data as User;
  }

  async banUser(id: string): Promise<User> {
    return this.updateUser(id, { is_banned: true } as UpdateUser);
  }

  async unbanUser(id: string): Promise<User> {
    return this.updateUser(id, { is_banned: false } as UpdateUser);
  }

  async setVipStatus(id: string, isVip: boolean): Promise<User> {
    return this.updateUser(id, { is_vip: isVip } as UpdateUser);
  }

  // Analytics methods
  async getUserStats(): Promise<UserStats> {
    // Get total users
    const { count: totalUsers } = await this.supabase
      .from('users2')
      .select('*', { count: 'exact', head: true });

    // Get active (non-banned) users
    const { count: activeUsers } = await this.supabase
      .from('users2')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', false);

    // Get banned users
    const { count: bannedUsers } = await this.supabase
      .from('users2')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', true);

    // Get VIP users
    const { count: vipUsers } = await this.supabase
      .from('users2')
      .select('*', { count: 'exact', head: true })
      .eq('is_vip', true);

    // Get new users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: newUsers } = await this.supabase
      .from('users2')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      bannedUsers: bannedUsers || 0,
      vipUsers: vipUsers || 0,
      newUsers: newUsers || 0
    };
  }

  async getUserActivityTrend(days: number = 30): Promise<UserActivity[]> {
    // Get signups per day for the last 'days' days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    const { data } = await this.supabase
      .from('users2')
      .select('created_at')
      .gte('created_at', daysAgo.toISOString());
    
    if (!data) return [];

    // Create a map of dates to count
    const activityByDate = new Map<string, number>();
    
    // Initialize all dates in the range
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      activityByDate.set(dateString, 0);
    }
    
    // Count users by date
    data.forEach(user => {
      const dateStr = new Date(user.created_at).toISOString().split('T')[0];
      const count = activityByDate.get(dateStr) || 0;
      activityByDate.set(dateStr, count + 1);
    });
    
    // Convert to array and sort by date
    return Array.from(activityByDate.entries())
      .map(([date, userCount]) => ({ date, userCount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Settings methods
  private settings: AppSettings = { ...DEFAULT_SETTINGS };
  
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
