/**
 * Band Management API Routes
 *
 * This module provides endpoints for managing bands in the JamMatch application.
 * All endpoints require authentication and provide comprehensive validation.
 *
 * Endpoints:
 * - GET /bands - Get user's bands
 * - GET /bands/:id - Get specific band details
 * - GET /bands/:id/members - Get band member details
 */

import { Router, Request, Response } from "express";
import { supabase } from "../config/supabase";
import { authenticateToken } from "../middleware/auth";

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// GET /bands - Get user's bands
router.get(
  "/",
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

      // Get bands where user is a member
      const { data: bands, error } = await supabase
        .from("bands")
        .select(
          `
          *,
          drummer:users!drummer_id(id, name, primary_role, instruments, genres, experience, location, avatar_url),
          guitarist:users!guitarist_id(id, name, primary_role, instruments, genres, experience, location, avatar_url),
          bassist:users!bassist_id(id, name, primary_role, instruments, genres, experience, location, avatar_url),
          singer:users!singer_id(id, name, primary_role, instruments, genres, experience, location, avatar_url)
        `
        )
        .or(
          `drummer_id.eq.${userId},guitarist_id.eq.${userId},bassist_id.eq.${userId},singer_id.eq.${userId}`
        )
        .eq("status", "active")
        .order("formation_date", { ascending: false });

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to fetch bands",
          },
        });
      }

      // Transform the data to include members array
      const transformedBands =
        bands?.map((band) => ({
          ...band,
          members: [
            band.drummer,
            band.guitarist,
            band.bassist,
            band.singer,
          ].filter(Boolean),
        })) || [];

      return res.json({
        bands: transformedBands,
        total: transformedBands.length,
      });
    } catch (error) {
      console.error("Bands fetch error:", error);
      return res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      });
    }
  }
);

// GET /bands/:id - Get specific band details
router.get(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id: bandId } = req.params;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: "UNAUTHENTICATED",
            message: "User not authenticated",
          },
        });
      }

      // Get band details with member information
      const { data: band, error } = await supabase
        .from("bands")
        .select(
          `
          *,
          drummer:users!drummer_id(id, name, primary_role, instruments, genres, experience, location, avatar_url, bio),
          guitarist:users!guitarist_id(id, name, primary_role, instruments, genres, experience, location, avatar_url, bio),
          bassist:users!bassist_id(id, name, primary_role, instruments, genres, experience, location, avatar_url, bio),
          singer:users!singer_id(id, name, primary_role, instruments, genres, experience, location, avatar_url, bio)
        `
        )
        .eq("id", bandId)
        .single();

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to fetch band",
          },
        });
      }

      if (!band) {
        return res.status(404).json({
          error: {
            code: "BAND_NOT_FOUND",
            message: "Band not found",
          },
        });
      }

      // Check if user is a member of this band
      const memberIds = [
        band.drummer_id,
        band.guitarist_id,
        band.bassist_id,
        band.singer_id,
      ];
      if (!memberIds.includes(userId)) {
        return res.status(403).json({
          error: {
            code: "ACCESS_DENIED",
            message: "You are not a member of this band",
          },
        });
      }

      // Transform the data to include members array
      const transformedBand = {
        ...band,
        members: [
          band.drummer,
          band.guitarist,
          band.bassist,
          band.singer,
        ].filter(Boolean),
      };

      return res.json(transformedBand);
    } catch (error) {
      console.error("Band fetch error:", error);
      return res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      });
    }
  }
);

// GET /bands/:id/members - Get band member details
router.get(
  "/:id/members",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id: bandId } = req.params;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: "UNAUTHENTICATED",
            message: "User not authenticated",
          },
        });
      }

      // First check if user is a member of this band
      const { data: band, error: bandError } = await supabase
        .from("bands")
        .select("drummer_id, guitarist_id, bassist_id, singer_id")
        .eq("id", bandId)
        .single();

      if (bandError || !band) {
        return res.status(404).json({
          error: {
            code: "BAND_NOT_FOUND",
            message: "Band not found",
          },
        });
      }

      const memberIds = [
        band.drummer_id,
        band.guitarist_id,
        band.bassist_id,
        band.singer_id,
      ];
      if (!memberIds.includes(userId)) {
        return res.status(403).json({
          error: {
            code: "ACCESS_DENIED",
            message: "You are not a member of this band",
          },
        });
      }

      // Get detailed member information
      const { data: members, error: membersError } = await supabase
        .from("users")
        .select(
          "id, name, primary_role, instruments, genres, experience, location, avatar_url, bio"
        )
        .in("id", memberIds);

      if (membersError) {
        console.error("Database error:", membersError);
        return res.status(500).json({
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to fetch band members",
          },
        });
      }

      // Get compatibility scores between all members
      const { data: compatibilityScores, error: scoresError } = await supabase
        .from("compatibility_scores")
        .select("*")
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

      if (scoresError) {
        console.error("Compatibility scores error:", scoresError);
      }

      return res.json({
        band_id: bandId,
        members: members || [],
        compatibility_scores: compatibilityScores || [],
        total_members: members?.length || 0,
      });
    } catch (error) {
      console.error("Band members fetch error:", error);
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
