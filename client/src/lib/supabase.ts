import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not found. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_KEY are set in the environment.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
