/**
 * Profile Management API Routes
 *
 * This module provides endpoints for managing user profiles in the JamMatch application.
 * All endpoints require authentication and provide comprehensive validation.
 *
 * Endpoints:
 * - GET /users/profile - Retrieve current user's profile
 * - PUT /users/profile - Update user profile
 * - POST /users/profile/setup - Complete initial profile setup
 */

import { Router, Request, Response } from "express";
import { supabase } from "../config/supabase";
import { authenticateToken } from "../middleware/auth";
import { calculateCompatibilityScore } from "../services/matchingService";

const router = Router();

// Validation schemas
interface ProfileData {
  name: string;
  bio?: string;
  primary_role: "drummer" | "guitarist" | "bassist" | "singer" | "other";
  instruments: string[];
  genres: string[];
  experience: "beginner" | "intermediate" | "advanced" | "professional";
  location?: string;
  avatar_url?: string;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Available instruments and genres for validation
const VALID_INSTRUMENTS = [
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
];

const VALID_GENRES = [
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
];

// Validation helper
function validateProfileData(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Name validation
  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push("Name is required");
  } else if (data.name.length > 100) {
    errors.push("Name must be less than 100 characters");
  }

  // Bio validation
  if (data.bio && typeof data.bio === "string" && data.bio.length > 500) {
    errors.push("Bio must be less than 500 characters");
  }

  // Primary role validation
  if (
    !data.primary_role ||
    !["drummer", "guitarist", "bassist", "singer", "other"].includes(
      data.primary_role
    )
  ) {
    errors.push("Valid primary role is required");
  }

  // Instruments validation
  if (!Array.isArray(data.instruments)) {
    errors.push("Instruments must be an array");
  } else if (data.instruments.length === 0) {
    errors.push("At least one instrument is required");
  } else if (data.instruments.length > 10) {
    errors.push("Maximum 10 instruments allowed");
  } else {
    // Validate each instrument
    const invalidInstruments = data.instruments.filter(
      (instrument: any) =>
        typeof instrument !== "string" ||
        !VALID_INSTRUMENTS.includes(instrument)
    );
    if (invalidInstruments.length > 0) {
      errors.push("Invalid instruments provided");
    }
  }

  // Genres validation
  if (!Array.isArray(data.genres)) {
    errors.push("Genres must be an array");
  } else if (data.genres.length === 0) {
    errors.push("At least one genre is required");
  } else if (data.genres.length > 10) {
    errors.push("Maximum 10 genres allowed");
  } else {
    // Validate each genre
    const invalidGenres = data.genres.filter(
      (genre: any) => typeof genre !== "string" || !VALID_GENRES.includes(genre)
    );
    if (invalidGenres.length > 0) {
      errors.push("Invalid genres provided");
    }
  }

  // Experience validation
  if (
    !data.experience ||
    !["beginner", "intermediate", "advanced", "professional"].includes(
      data.experience
    )
  ) {
    errors.push("Valid experience level is required");
  }

  // Location validation
  if (
    data.location &&
    (typeof data.location !== "string" || data.location.length > 100)
  ) {
    errors.push("Location must be a string with less than 100 characters");
  }

  // Avatar URL validation
  if (data.avatar_url) {
    if (typeof data.avatar_url !== "string") {
      errors.push("Avatar URL must be a string");
    } else {
      try {
        new URL(data.avatar_url);
      } catch {
        errors.push("Invalid avatar URL format");
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper function to update band compatibility data when a user's profile changes
async function updateBandCompatibilityData(userId: string): Promise<void> {
  try {
    // Get all bands where this user is a member
    const { data: userBands, error: bandsError } = await supabase
      .from("bands")
      .select("id, drummer_id, guitarist_id, bassist_id, singer_id")
      .or(
        `drummer_id.eq.${userId},guitarist_id.eq.${userId},bassist_id.eq.${userId},singer_id.eq.${userId}`
      )
      .eq("status", "active");

    if (bandsError) {
      console.error("Error fetching user bands:", bandsError);
      return;
    }

    if (!userBands || userBands.length === 0) {
      return; // User is not in any bands
    }

    // For each band, recalculate compatibility scores between all members
    for (const band of userBands) {
      const memberIds = [
        band.drummer_id,
        band.guitarist_id,
        band.bassist_id,
        band.singer_id,
      ].filter(Boolean);

      // Get all member profiles
      const { data: members, error: membersError } = await supabase
        .from("users")
        .select(
          "id, name, primary_role, instruments, genres, experience, location"
        )
        .in("id", memberIds);

      if (membersError || !members) {
        console.error("Error fetching band members:", membersError);
        continue;
      }

      // Recalculate compatibility scores between all pairs
      const compatibilityUpdates = [];
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const user1 = members[i];
          const user2 = members[j];

          try {
            const compatibilityScore = calculateCompatibilityScore(
              user1 as any,
              user2 as any
            );

            // Update or insert compatibility score
            const { error: scoreError } = await supabase
              .from("compatibility_scores")
              .upsert(
                {
                  user1_id: user1.id < user2.id ? user1.id : user2.id,
                  user2_id: user1.id < user2.id ? user2.id : user1.id,
                  algorithmic_score: compatibilityScore.score,
                  location_score: compatibilityScore.breakdown.locationScore,
                  genre_score: compatibilityScore.breakdown.genreScore,
                  experience_score:
                    compatibilityScore.breakdown.experienceScore,
                  final_score: compatibilityScore.score,
                  calculated_at: new Date().toISOString(),
                },
                {
                  onConflict: "user1_id,user2_id",
                }
              );

            if (scoreError) {
              console.error("Error updating compatibility score:", scoreError);
            }
          } catch (scoreError) {
            console.error("Error calculating compatibility score:", scoreError);
          }
        }
      }

      // Update band's compatibility_data with average scores
      const avgCompatibility = await calculateBandAverageCompatibility(
        memberIds
      );
      const { error: bandUpdateError } = await supabase
        .from("bands")
        .update({
          compatibility_data: avgCompatibility,
          updated_at: new Date().toISOString(),
        })
        .eq("id", band.id);

      if (bandUpdateError) {
        console.error(
          "Error updating band compatibility data:",
          bandUpdateError
        );
      }
    }
  } catch (error) {
    console.error("Error in updateBandCompatibilityData:", error);
    throw error;
  }
}

// Helper function to calculate average compatibility for a band
async function calculateBandAverageCompatibility(
  memberIds: string[]
): Promise<any> {
  try {
    const { data: scores, error } = await supabase
      .from("compatibility_scores")
      .select("final_score, location_score, genre_score, experience_score")
      .or(
        memberIds
          .map((id1) =>
            memberIds
              .map((id2) =>
                id1 < id2
                  ? `and(user1_id.eq.${id1},user2_id.eq.${id2})`
                  : id2 < id1
                  ? `and(user1_id.eq.${id2},user2_id.eq.${id1})`
                  : null
              )
              .filter(Boolean)
              .join(",")
          )
          .filter(Boolean)
          .join(",")
      );

    if (error || !scores || scores.length === 0) {
      return { average_compatibility: 0, total_pairs: 0 };
    }

    const totalScore = scores.reduce(
      (sum, score) => sum + score.final_score,
      0
    );
    const avgLocationScore =
      scores.reduce((sum, score) => sum + score.location_score, 0) /
      scores.length;
    const avgGenreScore =
      scores.reduce((sum, score) => sum + score.genre_score, 0) / scores.length;
    const avgExperienceScore =
      scores.reduce((sum, score) => sum + score.experience_score, 0) /
      scores.length;

    return {
      average_compatibility: Math.round(totalScore / scores.length),
      total_pairs: scores.length,
      breakdown: {
        location: Math.round(avgLocationScore),
        genre: Math.round(avgGenreScore),
        experience: Math.round(avgExperienceScore),
      },
      last_updated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error calculating band average compatibility:", error);
    return {
      average_compatibility: 0,
      total_pairs: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// GET /users/profile - Get current user's profile
router.get(
  "/profile",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: "UNAUTHENTICATED",
            message: "User not authenticated",
          },
        });
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to fetch profile",
          },
        });
      }

      if (!user) {
        return res.status(404).json({
          error: {
            code: "PROFILE_NOT_FOUND",
            message: "Profile not found",
          },
        });
      }

      return res.json(user);
    } catch (error) {
      console.error("Profile fetch error:", error);
      return res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      });
    }
  }
);

// PUT /users/profile - Update user profile
router.put(
  "/profile",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: "UNAUTHENTICATED",
            message: "User not authenticated",
          },
        });
      }

      const profileData = req.body as ProfileData;

      // Validate input
      const validation = validateProfileData(profileData);
      if (!validation.isValid) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: validation.errors,
          },
        });
      }

      // Sanitize data
      const sanitizedData = {
        name: profileData.name.trim(),
        bio: profileData.bio?.trim() || null,
        primary_role: profileData.primary_role,
        instruments: profileData.instruments,
        genres: profileData.genres,
        experience: profileData.experience,
        location: profileData.location?.trim() || null,
        avatar_url: profileData.avatar_url || null,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedUser, error } = await supabase
        .from("users")
        .update(sanitizedData)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to update profile",
          },
        });
      }

      // Update band compatibility data when profile changes
      try {
        await updateBandCompatibilityData(userId);
      } catch (compatibilityError) {
        console.error(
          "Failed to update band compatibility data:",
          compatibilityError
        );
        // Don't fail the request if compatibility update fails
      }

      return res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      return res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      });
    }
  }
);

// POST /users/profile/setup - Complete initial profile setup
router.post(
  "/profile/setup",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: "UNAUTHENTICATED",
            message: "User not authenticated",
          },
        });
      }

      const profileData = req.body as ProfileData;

      // Validate input
      const validation = validateProfileData(profileData);
      if (!validation.isValid) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: validation.errors,
          },
        });
      }

      // Check if profile already exists and is completed
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("profile_completed")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("Database error:", fetchError);
        return res.status(500).json({
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to check existing profile",
          },
        });
      }

      if (existingUser?.profile_completed) {
        return res.status(409).json({
          error: {
            code: "PROFILE_ALREADY_COMPLETED",
            message: "Profile already completed",
          },
        });
      }

      // Sanitize data
      const sanitizedData = {
        name: profileData.name.trim(),
        bio: profileData.bio?.trim() || null,
        primary_role: profileData.primary_role,
        instruments: profileData.instruments,
        genres: profileData.genres,
        experience: profileData.experience,
        location: profileData.location?.trim() || null,
        avatar_url: profileData.avatar_url || null,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedUser, error } = await supabase
        .from("users")
        .update(sanitizedData)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to complete profile setup",
          },
        });
      }

      return res.status(201).json({
        message: "Profile setup completed successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Profile setup error:", error);
      return res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      });
    }
  }
);

export default router;
