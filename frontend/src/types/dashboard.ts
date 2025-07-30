/**
 * Dashboard-related types for the JamMatch application
 */

export interface User {
  id: string;
  name: string;
  bio?: string;
  primary_role: "drummer" | "guitarist" | "bassist" | "singer" | "other";
  instruments: string[];
  genres: string[];
  experience: "beginner" | "intermediate" | "advanced" | "professional";
  location?: string;
  avatar_url?: string;
  profile_completed: boolean;
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

export interface Band {
  id: string;
  name?: string;
  drummer_id: string;
  guitarist_id: string;
  bassist_id: string;
  singer_id: string;
  status: "active" | "inactive" | "disbanded";
  compatibility_data: any;
  formation_date: string;
  created_at: string;
  updated_at: string;
  members: User[];
  drummer?: User;
  guitarist?: User;
  bassist?: User;
  singer?: User;
}

export interface Match {
  user: User;
  compatibility_score: number;
  reasoning: string;
  breakdown: {
    locationScore: number;
    genreScore: number;
    experienceScore: number;
  };
}

export interface DashboardData {
  user: User;
  bands: Band[];
  matches: Match[];
  hasCompletedProfile: boolean;
}
