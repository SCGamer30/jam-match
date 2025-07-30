/**
 * Matching routes for compatibility calculation and band formation
 */

import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { supabase } from "../config/supabase";
import {
  calculateCompatibilityScore,
  findCompatibleUsers,
  findPotentialBands,
  createBandFromUsers,
  generateBandNotifications,
  areAllUsersCompatible,
} from "../services/matchingService";
import { User, CompatibilityScore } from "../types/user";

const router = Router();

/**
 * GET /users/matches - Get compatibility matches for the authenticated user
 */
router.get(
  "/users/matches",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Get the current user's profile
      const { data: currentUser, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError || !currentUser) {
        return res.status(404).json({ error: "User profile not found" });
      }

      if (!currentUser.profile_completed) {
        return res
          .status(400)
          .json({ error: "Profile must be completed to find matches" });
      }

      // Get all other users with completed profiles
      const { data: allUsers, error: usersError } = await supabase
        .from("users")
        .select("*")
        .eq("profile_completed", true)
        .neq("id", userId);

      if (usersError) {
        return res.status(500).json({ error: "Failed to fetch users" });
      }

      // Find compatible users
      const compatibleUsers = findCompatibleUsers(
        currentUser as User,
        allUsers as User[]
      );

      // Store compatibility scores in database
      for (const match of compatibleUsers) {
        const compatibility = match.compatibility;

        await supabase.from("compatibility_scores").upsert(
          {
            user1_id: userId,
            user2_id: match.user.id,
            algorithmic_score: compatibility.score,
            final_score: compatibility.score,
            location_score: compatibility.breakdown.locationScore,
            genre_score: compatibility.breakdown.genreScore,
            experience_score: compatibility.breakdown.experienceScore,
            calculated_at: new Date().toISOString(),
          },
          {
            onConflict: "user1_id,user2_id",
          }
        );
      }

      res.json({
        matches: compatibleUsers.map((match) => ({
          user: {
            id: match.user.id,
            name: match.user.name,
            bio: match.user.bio,
            primary_role: match.user.primary_role,
            instruments: match.user.instruments,
            genres: match.user.genres,
            experience: match.user.experience,
            location: match.user.location,
            avatar_url: match.user.avatar_url,
          },
          compatibility_score: match.compatibility.score,
          reasoning: match.compatibility.reasoning,
          breakdown: match.compatibility.breakdown,
        })),
        total_matches: compatibleUsers.length,
      });
    } catch (error) {
      console.error("Error finding matches:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /matching/calculate - Trigger compatibility calculation for all users
 */
router.post(
  "/matching/calculate",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // Get all users with completed profiles
      const { data: allUsers, error: usersError } = await supabase
        .from("users")
        .select("*")
        .eq("profile_completed", true);

      if (usersError) {
        return res.status(500).json({ error: "Failed to fetch users" });
      }

      if (!allUsers || allUsers.length < 3) {
        return res.json({
          message: "Not enough users for band formation",
          bands_formed: 0,
          calculations_performed: 0,
        });
      }

      // Find potential bands
      const potentialBands = findPotentialBands(allUsers as User[]);

      // Check existing bands to avoid duplicates
      const { data: existingBands } = await supabase
        .from("bands")
        .select("*")
        .eq("status", "active");

      const existingBandMembers = new Set(
        existingBands?.flatMap((band) =>
          [
            band.drummer_id,
            band.guitarist_id,
            band.bassist_id,
            band.singer_id,
          ].filter((id) => id)
        ) || []
      );

      // Filter out bands where members are already in active bands
      const newBands = potentialBands.filter(
        (bandUsers) =>
          !bandUsers.some((user) => existingBandMembers.has(user.id))
      );

      const bandsFormed = [];

      // Create new bands
      for (const bandUsers of newBands.slice(0, 10)) {
        // Limit to 10 bands per calculation
        try {
          const bandData = createBandFromUsers(bandUsers);

          const { data: newBand, error: bandError } = await supabase
            .from("bands")
            .insert(bandData)
            .select()
            .single();

          if (!bandError && newBand) {
            bandsFormed.push(newBand);
          }
        } catch (error) {
          console.error("Error creating band:", error);
        }
      }

      // Generate notifications (in a real app, you'd send these via a notification service)
      const notifications = generateBandNotifications(bandsFormed);

      res.json({
        message: "Matching calculation completed",
        bands_formed: bandsFormed.length,
        potential_bands_found: potentialBands.length,
        calculations_performed: allUsers.length,
        notifications: notifications.length,
      });
    } catch (error) {
      console.error("Error calculating matches:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /matching/scores/:userId - Get compatibility scores for a specific user
 */
router.get(
  "/matching/scores/:userId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user?.id;

      if (!requestingUserId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Users can only view their own scores or scores involving them
      if (requestingUserId !== userId) {
        // Check if the requesting user is involved in scores with the target user
        const { data: sharedScores } = await supabase
          .from("compatibility_scores")
          .select("*")
          .or(`user1_id.eq.${requestingUserId},user2_id.eq.${requestingUserId}`)
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

        if (!sharedScores || sharedScores.length === 0) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      // Get compatibility scores for the user
      const { data: scores, error: scoresError } = await supabase
        .from("compatibility_scores")
        .select(
          `
        *,
        user1:users!user1_id(id, name, primary_role, instruments, genres, experience, location),
        user2:users!user2_id(id, name, primary_role, instruments, genres, experience, location)
      `
        )
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order("final_score", { ascending: false });

      if (scoresError) {
        return res
          .status(500)
          .json({ error: "Failed to fetch compatibility scores" });
      }

      res.json({
        user_id: userId,
        compatibility_scores: scores || [],
        total_scores: scores?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching compatibility scores:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /matching/ai-analysis - Request AI compatibility analysis
 */
router.post(
  "/matching/ai-analysis",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { user1_id, user2_id } = req.body;
      const requestingUserId = req.user?.id;

      if (!requestingUserId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      if (!user1_id || !user2_id) {
        return res
          .status(400)
          .json({ error: "Both user1_id and user2_id are required" });
      }

      // Verify requesting user is one of the users being analyzed
      if (requestingUserId !== user1_id && requestingUserId !== user2_id) {
        return res
          .status(403)
          .json({ error: "Can only request analysis involving yourself" });
      }

      // Get user profiles
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*")
        .in("id", [user1_id, user2_id]);

      if (usersError || !users || users.length !== 2) {
        return res.status(404).json({ error: "User profiles not found" });
      }

      const user1 = users.find((u) => u.id === user1_id);
      const user2 = users.find((u) => u.id === user2_id);

      if (!user1 || !user2) {
        return res.status(404).json({ error: "User profiles not found" });
      }

      // Call AI service for analysis
      const AI_SERVICE_URL =
        process.env.AI_SERVICE_URL || "http://localhost:5000";

      try {
        const aiResponse = await fetch(`${AI_SERVICE_URL}/compatibility`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user1: {
              name: user1.name,
              genres: user1.genres,
              instruments: user1.instruments,
              experience: user1.experience,
              location: user1.location,
              bio: user1.bio,
            },
            user2: {
              name: user2.name,
              genres: user2.genres,
              instruments: user2.instruments,
              experience: user2.experience,
              location: user2.location,
              bio: user2.bio,
            },
          }),
        });

        if (!aiResponse.ok) {
          throw new Error(
            `AI service responded with status ${aiResponse.status}`
          );
        }

        const aiResult = await aiResponse.json();

        // Store AI analysis result
        await supabase.from("compatibility_scores").upsert(
          {
            user1_id,
            user2_id,
            ai_score: aiResult.compatibility_score,
            ai_reasoning: aiResult.reasoning,
            final_score: aiResult.compatibility_score,
            calculated_at: new Date().toISOString(),
          },
          {
            onConflict: "user1_id,user2_id",
          }
        );

        res.json({
          compatibility_score: aiResult.compatibility_score,
          reasoning: aiResult.reasoning,
          model_used: aiResult.model_used,
          fallback_used: aiResult.fallback_used || false,
          timestamp: aiResult.timestamp,
        });
      } catch (aiError) {
        console.error("AI service error:", aiError);

        // Fallback to algorithmic scoring
        const algorithmicResult = calculateCompatibilityScore(
          user1 as User,
          user2 as User
        );

        await supabase.from("compatibility_scores").upsert(
          {
            user1_id,
            user2_id,
            algorithmic_score: algorithmicResult.score,
            final_score: algorithmicResult.score,
            location_score: algorithmicResult.breakdown.locationScore,
            genre_score: algorithmicResult.breakdown.genreScore,
            experience_score: algorithmicResult.breakdown.experienceScore,
            calculated_at: new Date().toISOString(),
          },
          {
            onConflict: "user1_id,user2_id",
          }
        );

        res.json({
          compatibility_score: algorithmicResult.score,
          reasoning: algorithmicResult.reasoning,
          model_used: "algorithmic_fallback",
          fallback_used: true,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error requesting AI analysis:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
