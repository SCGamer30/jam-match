/**
 * Profile data models and types for JamMatch application
 */

// Experience levels for musicians
export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "professional";

// Primary roles for band formation
export type PrimaryRole =
  | "drummer"
  | "guitarist"
  | "bassist"
  | "singer"
  | "other";

// Message types for chat system
export type MessageType = "text" | "system";

// Band status types
export type BandStatus = "active" | "inactive" | "disbanded";

/**
 * Core User interface matching the database schema
 */
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

/**
 * Profile data for user creation and updates
 */
export interface ProfileData {
  name: string;
  bio?: string;
  primary_role: PrimaryRole;
  instruments: string[];
  genres: string[];
  experience: ExperienceLevel;
  location?: string;
  avatar_url?: string;
}

/**
 * Profile setup form data structure for multi-step wizard
 */
export interface ProfileSetupData {
  // Step 1: Basic Info
  name: string;
  bio?: string;
  location?: string;
  experience: ExperienceLevel;

  // Step 2: Musical Preferences
  genres: string[];
  primary_role: PrimaryRole;

  // Step 3: Instruments
  instruments: string[];
}

/**
 * Profile validation error structure
 */
export interface ProfileValidationError {
  field: string;
  message: string;
}

/**
 * Profile validation result
 */
export interface ProfileValidationResult {
  isValid: boolean;
  errors: ProfileValidationError[];
}

/**
 * Profile completion status
 */
export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

/**
 * Band interface matching the database schema
 */
export interface Band {
  id: string;
  name?: string;
  drummer_id: string;
  guitarist_id: string;
  bassist_id: string;
  singer_id: string;
  status: BandStatus;
  compatibility_data: Record<string, unknown>;
  formation_date: string;
  created_at: string;
  updated_at: string;
}

/**
 * Band with populated member data
 */
export interface BandWithMembers extends Band {
  drummer: User;
  guitarist: User;
  bassist: User;
  singer: User;
}

/**
 * Message interface for chat system
 */
export interface Message {
  id: string;
  band_id: string;
  user_id: string;
  content: string;
  message_type: MessageType;
  created_at: string;
}

/**
 * Compatibility score interface
 */
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

/**
 * Available musical genres
 */
export const MUSICAL_GENRES = [
  "Rock",
  "Pop",
  "Jazz",
  "Blues",
  "Country",
  "Folk",
  "Classical",
  "Electronic",
  "Hip Hop",
  "R&B",
  "Reggae",
  "Punk",
  "Metal",
  "Alternative",
  "Indie",
  "Funk",
  "Soul",
  "Gospel",
  "World",
  "Experimental",
] as const;

/**
 * Available instruments
 */
export const INSTRUMENTS = [
  "Guitar",
  "Bass Guitar",
  "Drums",
  "Vocals",
  "Piano",
  "Keyboard",
  "Violin",
  "Saxophone",
  "Trumpet",
  "Flute",
  "Clarinet",
  "Cello",
  "Harmonica",
  "Banjo",
  "Mandolin",
  "Ukulele",
  "Accordion",
  "Synthesizer",
  "Percussion",
  "Other",
] as const;

export type MusicalGenre = (typeof MUSICAL_GENRES)[number];
export type Instrument = (typeof INSTRUMENTS)[number];
