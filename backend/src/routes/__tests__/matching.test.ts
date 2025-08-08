import request from "supertest";
import app from "../../index";
import { supabase } from "../../config/supabase";
import jwt from "jsonwebtoken";

// Mock Supabase
jest.mock("../../config/supabase", () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock JWT
jest.mock("jsonwebtoken");
const mockJwt = jwt as jest.Mocked<typeof jwt>;

// Mock AI service
jest.mock("../../services/aiService", () => ({
  calculateAICompatibility: jest.fn(),
}));

describe("Matching API Endpoints", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
  };

  const validToken = "valid-jwt-token";

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase auth to fail and fallback to JWT
    (mockSupabase.auth.getUser as jest.Mock).mockRejectedValue(
      new Error("Supabase auth failed")
    );

    // Mock JWT verification
    mockJwt.verify.mockImplementation((token) => {
      if (token === validToken) {
        return { sub: mockUser.id, email: mockUser.email };
      }
      throw new jwt.JsonWebTokenError("Invalid token");
    });
  });

  describe("GET /api/users/matches", () => {
    const mockUsers = [
      {
        id: "user-1",
        name: "Alice",
        primary_role: "guitarist",
        instruments: ["Guitar"],
        genres: ["Rock", "Jazz"],
        experience: "intermediate",
        location: "New York",
        profile_completed: true,
      },
      {
        id: "user-2",
        name: "Bob",
        primary_role: "drummer",
        instruments: ["Drums"],
        genres: ["Rock", "Blues"],
        experience: "intermediate",
        location: "New York",
        profile_completed: true,
      },
      {
        id: "user-3",
        name: "Charlie",
        primary_role: "bassist",
        instruments: ["Bass"],
        genres: ["Jazz", "Funk"],
        experience: "advanced",
        location: "Los Angeles",
        profile_completed: true,
      },
    ];

    const currentUser = {
      id: "user-123",
      name: "Current User",
      primary_role: "singer",
      instruments: ["Vocals"],
      genres: ["Rock", "Pop"],
      experience: "intermediate",
      location: "New York",
      profile_completed: true,
    };

    it("should return compatible matches for authenticated user", async () => {
      // Mock getting current user
      const mockSelectCurrent = jest.fn().mockReturnThis();
      const mockEqCurrent = jest.fn().mockReturnThis();
      const mockSingleCurrent = jest.fn().mockResolvedValue({
        data: currentUser,
        error: null,
      });

      // Mock getting all users
      const mockSelectAll = jest.fn().mockReturnThis();
      const mockEqAll = jest.fn().mockReturnThis();
      const mockNeqAll = jest.fn().mockReturnThis();
      const mockAllUsers = jest.fn().mockResolvedValue({
        data: mockUsers,
        error: null,
      });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelectCurrent,
        } as any)
        .mockReturnValueOnce({
          select: mockSelectAll,
        } as any);

      mockSelectCurrent.mockReturnValue({
        eq: mockEqCurrent,
      });

      mockEqCurrent.mockReturnValue({
        single: mockSingleCurrent,
      });

      mockSelectAll.mockReturnValue({
        eq: mockEqAll,
      });

      mockEqAll.mockReturnValue({
        neq: mockNeqAll,
      });

      mockNeqAll.mockReturnValue(mockAllUsers);

      const response = await request(app)
        .get("/api/users/matches")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.matches).toBeDefined();
      expect(Array.isArray(response.body.matches)).toBe(true);

      // Should include compatibility scores
      response.body.matches.forEach((match: any) => {
        expect(match.user).toBeDefined();
        expect(match.compatibility).toBeDefined();
        expect(match.compatibility.score).toBeGreaterThanOrEqual(0);
        expect(match.compatibility.score).toBeLessThanOrEqual(100);
      });
    });

    it("should return 401 for unauthenticated request", async () => {
      const response = await request(app).get("/api/users/matches");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Access token required");
    });

    it("should return 404 when user profile not found", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const response = await request(app)
        .get("/api/users/matches")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("PROFILE_NOT_FOUND");
    });

    it("should return 400 for incomplete user profile", async () => {
      const incompleteUser = {
        ...currentUser,
        profile_completed: false,
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: incompleteUser,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const response = await request(app)
        .get("/api/users/matches")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("PROFILE_INCOMPLETE");
      expect(response.body.error.message).toBe(
        "Profile must be completed to find matches"
      );
    });

    it("should filter out users with incomplete profiles", async () => {
      const usersWithIncomplete = [
        ...mockUsers,
        {
          id: "user-4",
          name: "Incomplete User",
          profile_completed: false,
        },
      ];

      // Mock getting current user
      const mockSelectCurrent = jest.fn().mockReturnThis();
      const mockEqCurrent = jest.fn().mockReturnThis();
      const mockSingleCurrent = jest.fn().mockResolvedValue({
        data: currentUser,
        error: null,
      });

      // Mock getting all users
      const mockSelectAll = jest.fn().mockReturnThis();
      const mockEqAll = jest.fn().mockReturnThis();
      const mockNeqAll = jest.fn().mockReturnThis();
      const mockAllUsers = jest.fn().mockResolvedValue({
        data: usersWithIncomplete,
        error: null,
      });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelectCurrent,
        } as any)
        .mockReturnValueOnce({
          select: mockSelectAll,
        } as any);

      mockSelectCurrent.mockReturnValue({
        eq: mockEqCurrent,
      });

      mockEqCurrent.mockReturnValue({
        single: mockSingleCurrent,
      });

      mockSelectAll.mockReturnValue({
        eq: mockEqAll,
      });

      mockEqAll.mockReturnValue({
        neq: mockNeqAll,
      });

      mockNeqAll.mockReturnValue(mockAllUsers);

      const response = await request(app)
        .get("/api/users/matches")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);

      // Should not include incomplete user
      const userIds = response.body.matches.map((match: any) => match.user.id);
      expect(userIds).not.toContain("user-4");
    });

    it("should sort matches by compatibility score", async () => {
      // Mock getting current user
      const mockSelectCurrent = jest.fn().mockReturnThis();
      const mockEqCurrent = jest.fn().mockReturnThis();
      const mockSingleCurrent = jest.fn().mockResolvedValue({
        data: currentUser,
        error: null,
      });

      // Mock getting all users
      const mockSelectAll = jest.fn().mockReturnThis();
      const mockEqAll = jest.fn().mockReturnThis();
      const mockNeqAll = jest.fn().mockReturnThis();
      const mockAllUsers = jest.fn().mockResolvedValue({
        data: mockUsers,
        error: null,
      });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelectCurrent,
        } as any)
        .mockReturnValueOnce({
          select: mockSelectAll,
        } as any);

      mockSelectCurrent.mockReturnValue({
        eq: mockEqCurrent,
      });

      mockEqCurrent.mockReturnValue({
        single: mockSingleCurrent,
      });

      mockSelectAll.mockReturnValue({
        eq: mockEqAll,
      });

      mockEqAll.mockReturnValue({
        neq: mockNeqAll,
      });

      mockNeqAll.mockReturnValue(mockAllUsers);

      const response = await request(app)
        .get("/api/users/matches")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);

      // Verify matches are sorted by score (highest first)
      const scores = response.body.matches.map(
        (match: any) => match.compatibility.score
      );
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    });

    it("should handle database errors", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const response = await request(app)
        .get("/api/users/matches")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe("DATABASE_ERROR");
    });
  });

  describe("POST /api/matching/calculate", () => {
    it("should trigger compatibility calculation for user", async () => {
      // Mock getting user profile
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: "user-123",
          name: "Test User",
          profile_completed: true,
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const response = await request(app)
        .post("/api/matching/calculate")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Compatibility calculation triggered");
    });

    it("should return 401 for unauthenticated request", async () => {
      const response = await request(app).post("/api/matching/calculate");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Access token required");
    });

    it("should return 400 for incomplete profile", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: "user-123",
          name: "Test User",
          profile_completed: false,
        },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const response = await request(app)
        .post("/api/matching/calculate")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("PROFILE_INCOMPLETE");
    });
  });

  describe("POST /api/matching/ai-analysis", () => {
    const testProfiles = {
      user1: {
        id: "user-1",
        name: "Alice",
        genres: ["Rock", "Jazz"],
        instruments: ["Guitar"],
        experience: "intermediate",
        location: "New York",
      },
      user2: {
        id: "user-2",
        name: "Bob",
        genres: ["Rock", "Blues"],
        instruments: ["Drums"],
        experience: "intermediate",
        location: "New York",
      },
    };

    it("should return AI compatibility analysis", async () => {
      const { calculateAICompatibility } = require("../../services/aiService");
      calculateAICompatibility.mockResolvedValue({
        score: 85,
        reasoning: "High compatibility based on shared musical interests",
      });

      const response = await request(app)
        .post("/api/matching/ai-analysis")
        .set("Authorization", `Bearer ${validToken}`)
        .send(testProfiles);

      expect(response.status).toBe(200);
      expect(response.body.score).toBe(85);
      expect(response.body.reasoning).toBeDefined();
      expect(calculateAICompatibility).toHaveBeenCalledWith(
        testProfiles.user1,
        testProfiles.user2
      );
    });

    it("should return 400 for missing profiles", async () => {
      const response = await request(app)
        .post("/api/matching/ai-analysis")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ user1: testProfiles.user1 }); // Missing user2

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.message).toBe(
        "Both user profiles are required"
      );
    });

    it("should return 401 for unauthenticated request", async () => {
      const response = await request(app)
        .post("/api/matching/ai-analysis")
        .send(testProfiles);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Access token required");
    });

    it("should handle AI service errors gracefully", async () => {
      const { calculateAICompatibility } = require("../../services/aiService");
      calculateAICompatibility.mockRejectedValue(
        new Error("AI service unavailable")
      );

      const response = await request(app)
        .post("/api/matching/ai-analysis")
        .set("Authorization", `Bearer ${validToken}`)
        .send(testProfiles);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe("AI_SERVICE_ERROR");
      expect(response.body.error.message).toBe(
        "AI analysis temporarily unavailable"
      );
    });

    it("should validate profile data structure", async () => {
      const invalidProfiles = {
        user1: { id: "user-1" }, // Missing required fields
        user2: testProfiles.user2,
      };

      const response = await request(app)
        .post("/api/matching/ai-analysis")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidProfiles);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.message).toBe("Invalid profile data");
    });
  });

  describe("GET /api/matching/scores/:userId", () => {
    it("should return compatibility scores for user", async () => {
      const mockScores = [
        {
          id: "score-1",
          user1_id: "user-123",
          user2_id: "user-1",
          final_score: 85,
          ai_reasoning: "High compatibility",
          calculated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "score-2",
          user1_id: "user-123",
          user2_id: "user-2",
          final_score: 72,
          ai_reasoning: "Good compatibility",
          calculated_at: "2024-01-01T00:00:00Z",
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockOr = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockScores,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      mockSelect.mockReturnValue({
        or: mockOr,
      });

      mockOr.mockReturnValue({
        order: mockOrder,
      });

      const response = await request(app)
        .get("/api/matching/scores/user-123")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.scores).toEqual(mockScores);
      expect(mockSupabase.from).toHaveBeenCalledWith("compatibility_scores");
    });

    it("should return 401 for unauthenticated request", async () => {
      const response = await request(app).get("/api/matching/scores/user-123");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Access token required");
    });

    it("should return 403 when accessing other user's scores", async () => {
      const response = await request(app)
        .get("/api/matching/scores/other-user")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
      expect(response.body.error.message).toBe(
        "Cannot access other user's compatibility scores"
      );
    });

    it("should handle database errors", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockOr = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      } as any);

      mockSelect.mockReturnValue({
        or: mockOr,
      });

      mockOr.mockReturnValue({
        order: mockOrder,
      });

      const response = await request(app)
        .get("/api/matching/scores/user-123")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe("DATABASE_ERROR");
    });
  });
});
