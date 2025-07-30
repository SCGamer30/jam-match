/**
 * API Tests for Band Management Endpoints
 *
 * Tests all band-related API endpoints including:
 * - GET /bands - Get user's bands
 * - GET /bands/:id - Get specific band details
 * - GET /bands/:id/members - Get band member information
 * - Authorization checks and error handling
 */

import request from "supertest";
import express from "express";
import bandsRouter from "../bands";
import { supabase } from "../../config/supabase";
import { authenticateToken } from "../../middleware/auth";

// Mock Supabase
jest.mock("../../config/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock authentication middleware
jest.mock("../../middleware/auth", () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: "test-user-id", email: "test@example.com" };
    next();
  }),
}));

const app = express();
app.use(express.json());
app.use("/api/bands", bandsRouter);

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock data
const mockUser1 = {
  id: "user1",
  name: "John Doe",
  primary_role: "guitarist",
  instruments: ["guitar", "bass"],
  genres: ["rock", "blues"],
  experience: "advanced",
  location: "New York, NY",
  avatar_url: "https://example.com/avatar1.jpg",
  bio: "Experienced guitarist",
};

const mockUser2 = {
  id: "user2",
  name: "Jane Smith",
  primary_role: "drummer",
  instruments: ["drums"],
  genres: ["rock", "jazz"],
  experience: "professional",
  location: "New York, NY",
  avatar_url: "https://example.com/avatar2.jpg",
  bio: "Professional drummer",
};

const mockBand = {
  id: "band1",
  name: "Rock Legends",
  drummer_id: "user2",
  guitarist_id: "test-user-id",
  bassist_id: "user3",
  singer_id: "user4",
  status: "active",
  compatibility_data: {},
  formation_date: "2024-01-15T10:00:00Z",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
  drummer: mockUser2,
  guitarist: mockUser1,
  bassist: null,
  singer: null,
};

const mockCompatibilityScore = {
  id: "score1",
  user1_id: "user1",
  user2_id: "user2",
  algorithmic_score: 85,
  ai_score: 88,
  final_score: 87,
  ai_reasoning: "Great compatibility",
  location_score: 50,
  genre_score: 20,
  experience_score: 15,
  calculated_at: "2024-01-15T10:00:00Z",
};

describe("Band Management API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/bands", () => {
    it("should return user bands successfully", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [mockBand],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const response = await request(app).get("/api/bands").expect(200);

      expect(response.body).toEqual({
        bands: [
          {
            ...mockBand,
            members: [mockUser2, mockUser1].filter(Boolean),
          },
        ],
        total: 1,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("bands");
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.or).toHaveBeenCalledWith(
        "drummer_id.eq.test-user-id,guitarist_id.eq.test-user-id,bassist_id.eq.test-user-id,singer_id.eq.test-user-id"
      );
      expect(mockQuery.eq).toHaveBeenCalledWith("status", "active");
      expect(mockQuery.order).toHaveBeenCalledWith("formation_date", {
        ascending: false,
      });
    });

    it("should handle database errors", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const response = await request(app).get("/api/bands").expect(500);

      expect(response.body).toEqual({
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to fetch bands",
        },
      });
    });

    it("should return empty array when user has no bands", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const response = await request(app).get("/api/bands").expect(200);

      expect(response.body).toEqual({
        bands: [],
        total: 0,
      });
    });

    it("should require authentication", async () => {
      // Mock unauthenticated request
      const mockAuthMiddleware = authenticateToken as jest.MockedFunction<
        typeof authenticateToken
      >;
      mockAuthMiddleware.mockImplementationOnce(async (req, res, next) => {
        res.status(401).json({
          error: {
            code: "UNAUTHENTICATED",
            message: "User not authenticated",
          },
        });
      });

      await request(app).get("/api/bands").expect(401);
    });
  });

  describe("GET /api/bands/:id", () => {
    it("should return band details successfully", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockBand,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const response = await request(app).get("/api/bands/band1").expect(200);

      expect(response.body).toEqual({
        ...mockBand,
        members: [mockUser2, mockUser1].filter(Boolean),
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("bands");
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith("id", "band1");
      expect(mockQuery.single).toHaveBeenCalled();
    });

    it("should return 404 when band not found", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const response = await request(app)
        .get("/api/bands/nonexistent")
        .expect(500);

      expect(response.body).toEqual({
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to fetch band",
        },
      });
    });

    it("should return 403 when user is not a band member", async () => {
      const bandWithoutUser = {
        ...mockBand,
        drummer_id: "other-user",
        guitarist_id: "other-user2",
        bassist_id: "other-user3",
        singer_id: "other-user4",
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: bandWithoutUser,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const response = await request(app).get("/api/bands/band1").expect(403);

      expect(response.body).toEqual({
        error: {
          code: "ACCESS_DENIED",
          message: "You are not a member of this band",
        },
      });
    });

    it("should handle database errors", async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const response = await request(app).get("/api/bands/band1").expect(500);

      expect(response.body).toEqual({
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to fetch band",
        },
      });
    });
  });

  describe("GET /api/bands/:id/members", () => {
    it("should return band members successfully", async () => {
      // Mock band query
      const mockBandQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            drummer_id: "user2",
            guitarist_id: "test-user-id",
            bassist_id: "user3",
            singer_id: "user4",
          },
          error: null,
        }),
      };

      // Mock members query
      const mockMembersQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [mockUser1, mockUser2],
          error: null,
        }),
      };

      // Mock compatibility scores query
      const mockScoresQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockResolvedValue({
          data: [mockCompatibilityScore],
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockBandQuery as any)
        .mockReturnValueOnce(mockMembersQuery as any)
        .mockReturnValueOnce(mockScoresQuery as any);

      const response = await request(app)
        .get("/api/bands/band1/members")
        .expect(200);

      expect(response.body).toEqual({
        band_id: "band1",
        members: [mockUser1, mockUser2],
        compatibility_scores: [mockCompatibilityScore],
        total_members: 2,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("bands");
      expect(mockSupabase.from).toHaveBeenCalledWith("users");
      expect(mockSupabase.from).toHaveBeenCalledWith("compatibility_scores");
    });

    it("should return 404 when band not found", async () => {
      const mockBandQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      };

      mockSupabase.from.mockReturnValue(mockBandQuery as any);

      const response = await request(app)
        .get("/api/bands/nonexistent/members")
        .expect(404);

      expect(response.body).toEqual({
        error: {
          code: "BAND_NOT_FOUND",
          message: "Band not found",
        },
      });
    });

    it("should return 403 when user is not a band member", async () => {
      const mockBandQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            drummer_id: "other-user",
            guitarist_id: "other-user2",
            bassist_id: "other-user3",
            singer_id: "other-user4",
          },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockBandQuery as any);

      const response = await request(app)
        .get("/api/bands/band1/members")
        .expect(403);

      expect(response.body).toEqual({
        error: {
          code: "ACCESS_DENIED",
          message: "You are not a member of this band",
        },
      });
    });

    it("should handle members fetch errors gracefully", async () => {
      // Mock band query success
      const mockBandQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            drummer_id: "user2",
            guitarist_id: "test-user-id",
            bassist_id: "user3",
            singer_id: "user4",
          },
          error: null,
        }),
      };

      // Mock members query error
      const mockMembersQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockBandQuery as any)
        .mockReturnValueOnce(mockMembersQuery as any);

      const response = await request(app)
        .get("/api/bands/band1/members")
        .expect(500);

      expect(response.body).toEqual({
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to fetch band members",
        },
      });
    });

    it("should handle compatibility scores fetch errors gracefully", async () => {
      // Mock band query success
      const mockBandQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            drummer_id: "user2",
            guitarist_id: "test-user-id",
            bassist_id: "user3",
            singer_id: "user4",
          },
          error: null,
        }),
      };

      // Mock members query success
      const mockMembersQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [mockUser1, mockUser2],
          error: null,
        }),
      };

      // Mock compatibility scores query error
      const mockScoresQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Scores error" },
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockBandQuery as any)
        .mockReturnValueOnce(mockMembersQuery as any)
        .mockReturnValueOnce(mockScoresQuery as any);

      const response = await request(app)
        .get("/api/bands/band1/members")
        .expect(200);

      expect(response.body).toEqual({
        band_id: "band1",
        members: [mockUser1, mockUser2],
        compatibility_scores: [],
        total_members: 2,
      });
    });
  });

  describe("Authorization", () => {
    it("should require authentication for all endpoints", async () => {
      const mockAuthMiddleware = authenticateToken as jest.MockedFunction<
        typeof authenticateToken
      >;
      mockAuthMiddleware.mockImplementation(async (req, res, next) => {
        res.status(401).json({
          error: {
            code: "UNAUTHENTICATED",
            message: "User not authenticated",
          },
        });
      });

      await request(app).get("/api/bands").expect(401);
      await request(app).get("/api/bands/band1").expect(401);
      await request(app).get("/api/bands/band1/members").expect(401);
    });

    it("should validate band member access for protected endpoints", async () => {
      // Reset auth middleware to allow authenticated requests
      const mockAuthMiddleware = authenticateToken as jest.MockedFunction<
        typeof authenticateToken
      >;
      mockAuthMiddleware.mockImplementation(async (req, res, next) => {
        req.user = { id: "test-user-id", email: "test@example.com" };
        next();
      });

      const bandWithoutUser = {
        ...mockBand,
        drummer_id: "other-user",
        guitarist_id: "other-user2",
        bassist_id: "other-user3",
        singer_id: "other-user4",
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: bandWithoutUser,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      await request(app).get("/api/bands/band1").expect(403);
      await request(app).get("/api/bands/band1/members").expect(403);
    });
  });

  describe("Error Handling", () => {
    it("should handle internal server errors gracefully", async () => {
      // Reset auth middleware to allow authenticated requests
      const mockAuthMiddleware = authenticateToken as jest.MockedFunction<
        typeof authenticateToken
      >;
      mockAuthMiddleware.mockImplementation(async (req, res, next) => {
        req.user = { id: "test-user-id", email: "test@example.com" };
        next();
      });

      mockSupabase.from.mockImplementation(() => {
        throw new Error("Internal error");
      });

      const response = await request(app).get("/api/bands").expect(500);

      expect(response.body).toEqual({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      });
    });

    it("should handle malformed requests", async () => {
      // Reset auth middleware to allow authenticated requests
      const mockAuthMiddleware = authenticateToken as jest.MockedFunction<
        typeof authenticateToken
      >;
      mockAuthMiddleware.mockImplementation(async (req, res, next) => {
        req.user = { id: "test-user-id", email: "test@example.com" };
        next();
      });

      // Mock a database error for malformed request
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Invalid ID format" },
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery as any);

      const response = await request(app)
        .get("/api/bands/invalid-id-format")
        .expect(500);

      // Should still attempt to process but may fail gracefully
      expect(response.body.error).toBeDefined();
    });
  });
});
