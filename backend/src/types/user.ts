/**
 * User types for backend services
 */

export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "professional";
export type PrimaryRole =
  | "drummer"
  | "guitarist"
  | "bassist"
  | "singer"
  | "other";

export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  primary_role: PrimaryRole;
  instruments: string[];
  genres: string[];
  experience: ExperienceLevel;
  location?: string;
  avatar_url?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
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
