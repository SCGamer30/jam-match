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

describe("Profile API Endpoints", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
  };

  const mockProfile = {
    id: "user-123",
    email: "test@example.com",
    name: "John Doe",
    bio: "Passionate musician",
    primary_role: "guitarist",
    instruments: ["Guitar", "Piano"],
    genres: ["Rock", "Jazz"],
    experience: "intermediate",
    location: "New York, NY",
    avatar_url: null,
    profile_completed: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
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

  describe("GET /api/users/profile", () => {
    it("should return user profile for authenticated user", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockProfile,
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
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith("users");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", mockUser.id);
    });

    it("should return 401 for unauthenticated request", async () => {
      const response = await request(app).get("/api/users/profile");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Access token required");
    });

    it("should return 401 for invalid token", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid token");
    });

    it("should return 404 when profile not found", async () => {
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
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("PROFILE_NOT_FOUND");
      expect(response.body.error.message).toBe("Profile not found");
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
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe("DATABASE_ERROR");
      expect(response.body.error.message).toBe("Failed to fetch profile");
    });
  });

  describe("PUT /api/users/profile", () => {
    const validProfileData = {
      name: "John Doe",
      bio: "Updated bio",
      primary_role: "guitarist",
      instruments: ["Guitar", "Piano"],
      genres: ["Rock", "Jazz"],
      experience: "intermediate",
      location: "New York, NY",
    };

    it("should update user profile successfully", async () => {
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { ...mockProfile, ...validProfileData },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      } as any);

      mockUpdate.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .send(validProfileData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Profile updated successfully");
      expect(response.body.user.name).toBe(validProfileData.name);
      expect(mockSupabase.from).toHaveBeenCalledWith("users");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validProfileData.name,
          bio: validProfileData.bio,
          primary_role: validProfileData.primary_role,
        })
      );
    });

    it("should return 400 for invalid profile data", async () => {
      const invalidData = {
        name: "", // Invalid: empty name
        primary_role: "guitarist",
        instruments: [],
        genres: [],
        experience: "intermediate",
      };

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.message).toBe("Validation failed");
      expect(response.body.error.details).toContain("Name is required");
    });

    it("should return 401 for unauthenticated request", async () => {
      const response = await request(app)
        .put("/api/users/profile")
        .send(validProfileData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Access token required");
    });

    it("should handle database errors", async () => {
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      } as any);

      mockUpdate.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .send(validProfileData);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe("DATABASE_ERROR");
      expect(response.body.error.message).toBe("Failed to update profile");
    });
  });

  describe("POST /api/users/profile/setup", () => {
    const validSetupData = {
      name: "John Doe",
      bio: "Passionate musician",
      primary_role: "guitarist",
      instruments: ["Guitar", "Piano"],
      genres: ["Rock", "Jazz"],
      experience: "intermediate",
      location: "New York, NY",
    };

    it("should complete profile setup successfully", async () => {
      // Mock checking existing profile
      const mockSelectCheck = jest.fn().mockReturnThis();
      const mockEqCheck = jest.fn().mockReturnThis();
      const mockSingleCheck = jest.fn().mockResolvedValue({
        data: { profile_completed: false },
        error: null,
      });

      // Mock updating profile
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { ...mockProfile, ...validSetupData, profile_completed: true },
        error: null,
      });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelectCheck,
        } as any)
        .mockReturnValueOnce({
          update: mockUpdate,
        } as any);

      mockSelectCheck.mockReturnValue({
        eq: mockEqCheck,
      });

      mockEqCheck.mockReturnValue({
        single: mockSingleCheck,
      });

      mockUpdate.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      const response = await request(app)
        .post("/api/users/profile/setup")
        .set("Authorization", `Bearer ${validToken}`)
        .send(validSetupData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe(
        "Profile setup completed successfully"
      );
      expect(response.body.user.profile_completed).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          profile_completed: true,
        })
      );
    });

    it("should return 409 if profile already completed", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { profile_completed: true },
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
        .post("/api/users/profile/setup")
        .set("Authorization", `Bearer ${validToken}`)
        .send(validSetupData);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("PROFILE_ALREADY_COMPLETED");
      expect(response.body.error.message).toBe("Profile already completed");
    });

    it("should return 400 for invalid setup data", async () => {
      const invalidData = {
        name: "",
        primary_role: "invalid",
        instruments: [],
        genres: [],
        experience: "invalid",
      };

      const response = await request(app)
        .post("/api/users/profile/setup")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.message).toBe("Validation failed");
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          "Name is required",
          "Valid primary role is required",
          "At least one instrument is required",
          "At least one genre is required",
          "Valid experience level is required",
        ])
      );
    });

    it("should return 401 for unauthenticated request", async () => {
      const response = await request(app)
        .post("/api/users/profile/setup")
        .send(validSetupData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Access token required");
    });

    it("should validate instruments against allowed list", async () => {
      const invalidData = {
        name: "John Doe",
        primary_role: "guitarist",
        instruments: ["InvalidInstrument", "Guitar"],
        genres: ["Rock"],
        experience: "intermediate",
      };

      const response = await request(app)
        .post("/api/users/profile/setup")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toContain(
        "Invalid instruments provided"
      );
    });

    it("should validate genres against allowed list", async () => {
      const invalidData = {
        name: "John Doe",
        primary_role: "guitarist",
        instruments: ["Guitar"],
        genres: ["InvalidGenre", "Rock"],
        experience: "intermediate",
      };

      const response = await request(app)
        .post("/api/users/profile/setup")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toContain("Invalid genres provided");
    });

    it("should handle database error when checking existing profile", async () => {
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
        .post("/api/users/profile/setup")
        .set("Authorization", `Bearer ${validToken}`)
        .send(validSetupData);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe("DATABASE_ERROR");
      expect(response.body.error.message).toBe(
        "Failed to check existing profile"
      );
    });
  });

  describe("Additional Validation Tests", () => {
    it("should validate maximum length constraints", async () => {
      const invalidData = {
        name: "A".repeat(101), // Too long
        bio: "B".repeat(501), // Too long
        primary_role: "guitarist",
        instruments: ["Guitar"],
        genres: ["Rock"],
        experience: "intermediate",
        location: "C".repeat(101), // Too long
      };

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          "Name must be less than 100 characters",
          "Bio must be less than 500 characters",
          "Location must be a string with less than 100 characters",
        ])
      );
    });

    it("should validate array limits", async () => {
      const invalidData = {
        name: "John Doe",
        primary_role: "guitarist",
        instruments: new Array(11).fill("Guitar"), // Too many
        genres: new Array(11).fill("Rock"), // Too many
        experience: "intermediate",
      };

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          "Maximum 10 instruments allowed",
          "Maximum 10 genres allowed",
        ])
      );
    });

    it("should validate data types", async () => {
      const invalidData = {
        name: 123, // Should be string
        primary_role: "guitarist",
        instruments: "not-an-array", // Should be array
        genres: "not-an-array", // Should be array
        experience: "intermediate",
        location: 789, // Should be string
        avatar_url: 101112, // Should be string
      };

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          "Name is required",
          "Instruments must be an array",
          "Genres must be an array",
          "Location must be a string with less than 100 characters",
          "Avatar URL must be a string",
        ])
      );
    });
  });
});
