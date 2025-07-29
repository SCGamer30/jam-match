import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types matching the schema
export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  instruments: string[];
  genres: string[];
  experience: "beginner" | "intermediate" | "advanced" | "professional";
  location?: string;
  avatar_url?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Band {
  id: string;
  name?: string;
  member_ids: string[];
  status: "active" | "inactive" | "disbanded";
  compatibility_data: Record<string, unknown>;
  formation_date: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  band_id: string;
  user_id: string;
  content: string;
  message_type: "text" | "system";
  created_at: string;
}

export interface CompatibilityScore {
  id: string;
  user1_id: string;
  user2_id: string;
  algorithmic_score: number;
  ai_score?: number;
  final_score: number;
  ai_reasoning?: string;
  location_score: number;
  genre_score: number;
  experience_score: number;
  calculated_at: string;
}

// Database table names for type safety
export const Tables = {
  USERS: "users",
  BANDS: "bands",
  MESSAGES: "messages",
  COMPATIBILITY_SCORES: "compatibility_scores",
} as const;
