/**
 * Unit tests for profile validation utilities
 */

import {
  validateProfile,
  validateProfileSetup,
  validateProfileSetupStep,
  checkProfileCompletion,
  validateEmail,
  validatePassword,
  sanitizeInput,
  validateAndSanitizeProfile,
} from "../profileValidation";
import { ProfileData, ProfileSetupData, User } from "@/types/profile";

describe("Profile Validation", () => {
  describe("validateProfile", () => {
    const validProfile: ProfileData = {
      name: "John Doe",
      bio: "Passionate musician",
      primary_role: "guitarist",
      instruments: ["Guitar", "Piano"],
      genres: ["Rock", "Jazz"],
      experience: "intermediate",
      location: "New York, NY",
    };

    it("should validate a complete valid profile", () => {
      const result = validateProfile(validProfile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should require name", () => {
      const profile = { ...validProfile, name: "" };
      const result = validateProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "name",
        message: "Name is required",
      });
    });

    it("should validate name length", () => {
      const shortName = { ...validProfile, name: "A" };
      const longName = { ...validProfile, name: "A".repeat(101) };

      const shortResult = validateProfile(shortName);
      const longResult = validateProfile(longName);

      expect(shortResult.isValid).toBe(false);
      expect(longResult.isValid).toBe(false);
      expect(shortResult.errors[0].message).toContain("at least 2 characters");
      expect(longResult.errors[0].message).toContain(
        "less than 100 characters"
      );
    });

    it("should validate bio length", () => {
      const profile = { ...validProfile, bio: "A".repeat(501) };
      const result = validateProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain("less than 500 characters");
    });

    it("should require primary role", () => {
      const profile = { ...validProfile, primary_role: undefined as any };
      const result = validateProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "primary_role",
        message: "Primary role is required",
      });
    });

    it("should validate primary role values", () => {
      const profile = { ...validProfile, primary_role: "invalid" as any };
      const result = validateProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain("Invalid primary role");
    });

    it("should require at least one instrument", () => {
      const profile = { ...validProfile, instruments: [] };
      const result = validateProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "instruments",
        message: "At least one instrument is required",
      });
    });

    it("should limit instruments to maximum 10", () => {
      const profile = {
        ...validProfile,
        instruments: new Array(11).fill("Guitar"),
      };
      const result = validateProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain("Maximum 10 instruments");
    });

    it("should require at least one genre", () => {
      const profile = { ...validProfile, genres: [] };
      const result = validateProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "genres",
        message: "At least one genre is required",
      });
    });

    it("should limit genres to maximum 10", () => {
      const profile = { ...validProfile, genres: new Array(11).fill("Rock") };
      const result = validateProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain("Maximum 10 genres");
    });

    it("should require experience level", () => {
      const profile = { ...validProfile, experience: undefined as any };
      const result = validateProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "experience",
        message: "Experience level is required",
      });
    });

    it("should validate experience level values", () => {
      const profile = { ...validProfile, experience: "expert" as any };
      const result = validateProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain("Invalid experience level");
    });

    it("should validate location length", () => {
      const profile = { ...validProfile, location: "A".repeat(101) };
      const result = validateProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain("less than 100 characters");
    });

    it("should validate avatar URL format", () => {
      const profile = { ...validProfile, avatar_url: "invalid-url" };
      const result = validateProfile(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain("Invalid avatar URL format");
    });
  });

  describe("validateProfileSetup", () => {
    const validSetupData: ProfileSetupData = {
      name: "John Doe",
      bio: "Passionate musician",
      location: "New York, NY",
      experience: "intermediate",
      genres: ["Rock", "Jazz"],
      primary_role: "guitarist",
      instruments: ["Guitar", "Piano"],
    };

    it("should validate complete setup data", () => {
      const result = validateProfileSetup(validSetupData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate incomplete setup data", () => {
      const incompleteData = { ...validSetupData, name: "" };
      const result = validateProfileSetup(incompleteData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("validateProfileSetupStep", () => {
    it("should validate step 1 (basic info)", () => {
      const stepData = {
        name: "John Doe",
        bio: "Passionate musician",
        location: "New York, NY",
        experience: "intermediate" as const,
      };

      const result = validateProfileSetupStep(1, stepData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate step 2 (musical preferences)", () => {
      const stepData = {
        genres: ["Rock", "Jazz"],
        primary_role: "guitarist" as const,
      };

      const result = validateProfileSetupStep(2, stepData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate step 3 (instruments)", () => {
      const stepData = {
        instruments: ["Guitar", "Piano"],
      };

      const result = validateProfileSetupStep(3, stepData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail validation for missing required fields in step 1", () => {
      const stepData = {
        bio: "Passionate musician",
        location: "New York, NY",
        // Missing name and experience
      };

      const result = validateProfileSetupStep(1, stepData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "name",
        message: "Name is required",
      });
      expect(result.errors).toContainEqual({
        field: "experience",
        message: "Experience level is required",
      });
    });

    it("should fail validation for invalid step number", () => {
      const result = validateProfileSetupStep(4, {});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "step",
        message: "Invalid step number",
      });
    });
  });

  describe("checkProfileCompletion", () => {
    const completeUser: User = {
      id: "123",
      email: "john@example.com",
      name: "John Doe",
      bio: "Passionate musician",
      primary_role: "guitarist",
      instruments: ["Guitar", "Piano"],
      genres: ["Rock", "Jazz"],
      experience: "intermediate",
      location: "New York, NY",
      avatar_url: "https://example.com/avatar.jpg",
      profile_completed: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    it("should return complete status for fully filled profile", () => {
      const status = checkProfileCompletion(completeUser);
      expect(status.isComplete).toBe(true);
      expect(status.missingFields).toHaveLength(0);
      expect(status.completionPercentage).toBe(100);
    });

    it("should identify missing required fields", () => {
      const incompleteUser = {
        ...completeUser,
        name: "",
        instruments: [],
        experience: undefined as any,
      };

      const status = checkProfileCompletion(incompleteUser);
      expect(status.isComplete).toBe(false);
      expect(status.missingFields).toContain("name");
      expect(status.missingFields).toContain("instruments");
      expect(status.missingFields).toContain("experience");
    });

    it("should calculate completion percentage correctly", () => {
      const partialUser = {
        ...completeUser,
        bio: undefined,
        location: undefined,
      };

      const status = checkProfileCompletion(partialUser);
      expect(status.isComplete).toBe(true); // All required fields present
      expect(status.completionPercentage).toBe(71); // 5/7 fields completed
    });
  });

  describe("validateEmail", () => {
    it("should validate correct email formats", () => {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("test.email+tag@domain.co.uk")).toBe(true);
      expect(validateEmail("user123@test-domain.org")).toBe(true);
    });

    it("should reject invalid email formats", () => {
      expect(validateEmail("invalid-email")).toBe(false);
      expect(validateEmail("@domain.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("user@domain")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should validate strong passwords", () => {
      const result = validatePassword("StrongPass123");
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should require minimum length", () => {
      const result = validatePassword("Short1");
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain("at least 8 characters");
    });

    it("should require lowercase letter", () => {
      const result = validatePassword("UPPERCASE123");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "password",
        message: "Password must contain at least one lowercase letter",
      });
    });

    it("should require uppercase letter", () => {
      const result = validatePassword("lowercase123");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "password",
        message: "Password must contain at least one uppercase letter",
      });
    });

    it("should require number", () => {
      const result = validatePassword("NoNumbers");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "password",
        message: "Password must contain at least one number",
      });
    });

    it("should reject empty password", () => {
      const result = validatePassword("");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: "password",
        message: "Password is required",
      });
    });
  });

  describe("sanitizeInput", () => {
    it("should trim whitespace", () => {
      expect(sanitizeInput("  test  ")).toBe("test");
      expect(sanitizeInput("\n\ttest\n\t")).toBe("test");
    });

    it("should remove script tags", () => {
      const maliciousInput = 'Hello <script>alert("xss")</script> World';
      expect(sanitizeInput(maliciousInput)).toBe("Hello  World");
    });

    it("should handle normal text", () => {
      expect(sanitizeInput("Normal text")).toBe("Normal text");
    });
  });

  describe("validateAndSanitizeProfile", () => {
    it("should sanitize and validate profile data", () => {
      const dirtyProfile: ProfileData = {
        name: "  John Doe  ",
        bio: "  Passionate musician  ",
        primary_role: "guitarist",
        instruments: ["  Guitar  ", "  Piano  "],
        genres: ["  Rock  ", "  Jazz  "],
        experience: "intermediate",
        location: "  New York, NY  ",
      };

      const result = validateAndSanitizeProfile(dirtyProfile);

      expect(result.sanitizedProfile.name).toBe("John Doe");
      expect(result.sanitizedProfile.bio).toBe("Passionate musician");
      expect(result.sanitizedProfile.location).toBe("New York, NY");
      expect(result.sanitizedProfile.instruments).toEqual(["Guitar", "Piano"]);
      expect(result.sanitizedProfile.genres).toEqual(["Rock", "Jazz"]);
      expect(result.validation.isValid).toBe(true);
    });

    it("should return validation errors for invalid data", () => {
      const invalidProfile: ProfileData = {
        name: "",
        primary_role: "guitarist",
        instruments: [],
        genres: [],
        experience: "intermediate",
      };

      const result = validateAndSanitizeProfile(invalidProfile);
      expect(result.validation.isValid).toBe(false);
      expect(result.validation.errors.length).toBeGreaterThan(0);
    });
  });
});
