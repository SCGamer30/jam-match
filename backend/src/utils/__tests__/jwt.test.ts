import jwt from "jsonwebtoken";

// Mock the supabase module
jest.mock("../../config/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

import {
  validateSupabaseToken,
  validateJWTToken,
  generateJWTToken,
  extractTokenFromHeader,
  isTokenExpired,
  decodeToken,
} from "../jwt";
import { supabase } from "../../config/supabase";

const mockGetUser = supabase.auth.getUser as jest.MockedFunction<
  typeof supabase.auth.getUser
>;

describe("JWT Utilities", () => {
  const testSecret = "test-jwt-secret-key-for-testing-purposes-only";

  beforeEach(() => {
    process.env.JWT_SECRET = testSecret;
    jest.clearAllMocks();
  });

  describe("validateSupabaseToken", () => {
    it("should validate a valid Supabase token", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        role: "authenticated",
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      const result = await validateSupabaseToken("valid-token");

      expect(result.valid).toBe(true);
      expect(result.payload).toEqual({
        sub: "user-123",
        email: "test@example.com",
        role: "authenticated",
      });
      expect(mockGetUser).toHaveBeenCalledWith("valid-token");
    });

    it("should reject an invalid Supabase token", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid token" },
      } as any);

      const result = await validateSupabaseToken("invalid-token");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid token");
    });

    it("should handle Supabase errors", async () => {
      mockGetUser.mockRejectedValue(new Error("Network error"));

      const result = await validateSupabaseToken("error-token");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("validateJWTToken", () => {
    it("should validate a valid JWT token", () => {
      const payload = {
        sub: "user-123",
        email: "test@example.com",
        role: "user",
      };
      const token = jwt.sign(payload, testSecret);

      const result = validateJWTToken(token);

      expect(result.valid).toBe(true);
      expect(result.payload?.sub).toBe("user-123");
      expect(result.payload?.email).toBe("test@example.com");
    });

    it("should reject an invalid JWT token", () => {
      const result = validateJWTToken("invalid-token");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid token format");
    });

    it("should reject an expired JWT token", () => {
      const payload = {
        sub: "user-123",
        email: "test@example.com",
      };
      const expiredToken = jwt.sign(payload, testSecret, { expiresIn: "-1h" });

      const result = validateJWTToken(expiredToken);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Token has expired");
    });

    it("should handle missing JWT secret", () => {
      delete process.env.JWT_SECRET;

      const result = validateJWTToken("any-token");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("JWT secret not configured");
    });
  });

  describe("generateJWTToken", () => {
    it("should generate a valid JWT token", () => {
      const payload = {
        sub: "user-123",
        email: "test@example.com",
        role: "user",
      };

      const token = generateJWTToken(payload);

      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, testSecret) as any;
      expect(decoded.sub).toBe("user-123");
      expect(decoded.email).toBe("test@example.com");
      expect(decoded.role).toBe("user");
      expect(decoded.iss).toBe("jamMatch-backend");
    });

    it("should throw error when JWT secret is missing", () => {
      delete process.env.JWT_SECRET;

      expect(() => {
        generateJWTToken({
          sub: "user-123",
          email: "test@example.com",
        });
      }).toThrow("JWT_SECRET is not configured");
    });
  });

  describe("extractTokenFromHeader", () => {
    it("should extract token from valid Bearer header", () => {
      const token = extractTokenFromHeader("Bearer abc123");
      expect(token).toBe("abc123");
    });

    it("should return null for invalid header format", () => {
      expect(extractTokenFromHeader("Invalid abc123")).toBeNull();
      expect(extractTokenFromHeader("Bearer")).toBeNull();
      expect(extractTokenFromHeader("Bearer token1 token2")).toBeNull();
    });

    it("should return null for missing header", () => {
      expect(extractTokenFromHeader(undefined)).toBeNull();
      expect(extractTokenFromHeader("")).toBeNull();
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for valid token", () => {
      const token = jwt.sign({ sub: "user-123" }, testSecret, {
        expiresIn: "1h",
      });
      expect(isTokenExpired(token)).toBe(false);
    });

    it("should return true for expired token", () => {
      const token = jwt.sign({ sub: "user-123" }, testSecret, {
        expiresIn: "-1h",
      });
      expect(isTokenExpired(token)).toBe(true);
    });

    it("should return true for invalid token", () => {
      expect(isTokenExpired("invalid-token")).toBe(true);
    });

    it("should return true for token without expiration", () => {
      const token = jwt.sign({ sub: "user-123" }, testSecret);
      expect(isTokenExpired(token)).toBe(true);
    });
  });

  describe("decodeToken", () => {
    it("should decode a valid token", () => {
      const payload = { sub: "user-123", email: "test@example.com" };
      const token = jwt.sign(payload, testSecret);

      const decoded = decodeToken(token);

      expect(decoded?.sub).toBe("user-123");
      expect(decoded?.email).toBe("test@example.com");
    });

    it("should return null for invalid token", () => {
      const decoded = decodeToken("invalid-token");
      expect(decoded).toBeNull();
    });
  });
});
