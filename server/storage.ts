import { users, type User, type InsertUser, type UpdateUser, type FilterUserParams } from "@shared/schema";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

export interface IStorage {
  getUsers(filters: FilterUserParams): Promise<{ data: User[], count: number }>;
  getUser(id: string): Promise<User | null>;
  updateUser(id: string, user: UpdateUser): Promise<User>;
  banUser(id: string): Promise<User>;
  unbanUser(id: string): Promise<User>;
  setVipStatus(id: string, isVip: boolean): Promise<User>;
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
    const { data, error } = await this.supabase
      .from("users2")
      .update(user)
      .eq("id", id)
      .select()
      .single();

    if (error) {
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
}

export const storage = new SupabaseStorage();
