import { Request, Response, NextFunction } from "express";
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
  authenticateToken,
  authenticateJWT,
  optionalAuth,
  requireRole,
  AuthenticatedRequest,
} from "../auth";
import { supabase } from "../../config/supabase";

const mockGetUser = supabase.auth.getUser as jest.MockedFunction<
  typeof supabase.auth.getUser
>;

describe("Authentication Middleware", () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("authenticateToken", () => {
    it("should authenticate valid Supabase token", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        role: "authenticated",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      await authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual({
        id: "user-123",
        email: "test@example.com",
        role: "authenticated",
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should reject request without token", async () => {
      mockRequest.headers = {};

      await authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Access token required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject invalid token", async () => {
      mockRequest.headers = {
        authorization: "Bearer invalid-token",
      };

      // Mock both Supabase failure and JWT failure
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid token" },
      } as any);

      // Mock JWT to also fail
      const originalJwtSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "test-secret";

      // Mock jwt.verify to throw JsonWebTokenError
      const mockJwtVerify = jest.spyOn(jwt, "verify").mockImplementation(() => {
        throw new jwt.JsonWebTokenError("Invalid token");
      });

      await authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid token",
      });
      expect(mockNext).not.toHaveBeenCalled();

      // Cleanup
      process.env.JWT_SECRET = originalJwtSecret;
      mockJwtVerify.mockRestore();
    });

    it("should handle Supabase errors and fallback to JWT", async () => {
      const payload = {
        sub: "user-123",
        email: "test@example.com",
        role: "user",
      };
      const testSecret = "test-jwt-secret-key-for-testing-purposes-only";
      const token = jwt.sign(payload, testSecret);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      // Mock Supabase to fail
      mockGetUser.mockRejectedValue(new Error("Network error"));

      // Set JWT secret for fallback
      const originalJwtSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = testSecret;

      await authenticateToken(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual({
        id: "user-123",
        email: "test@example.com",
        role: "user",
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();

      // Cleanup
      process.env.JWT_SECRET = originalJwtSecret;
    });
  });

  describe("authenticateJWT", () => {
    const testSecret = "test-jwt-secret-key-for-testing-purposes-only";

    beforeEach(() => {
      process.env.JWT_SECRET = testSecret;
    });

    it("should authenticate valid JWT token", () => {
      const payload = {
        sub: "user-123",
        email: "test@example.com",
        role: "user",
      };
      const token = jwt.sign(payload, testSecret);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticateJWT(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual({
        id: "user-123",
        email: "test@example.com",
        role: "user",
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject invalid JWT token", () => {
      mockRequest.headers = {
        authorization: "Bearer invalid-token",
      };

      authenticateJWT(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid token",
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject expired JWT token", () => {
      const payload = {
        sub: "user-123",
        email: "test@example.com",
      };
      const expiredToken = jwt.sign(payload, testSecret, { expiresIn: "-1h" });

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      authenticateJWT(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: "EXPIRED_TOKEN",
          message: "Token has expired",
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("optionalAuth", () => {
    it("should continue without user when no token provided", async () => {
      mockRequest.headers = {};

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should set user when valid token provided", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        role: "authenticated",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual({
        id: "user-123",
        email: "test@example.com",
        role: "authenticated",
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it("should continue without user when token is invalid", async () => {
      mockRequest.headers = {
        authorization: "Bearer invalid-token",
      };

      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid token" },
      } as any);

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe("requireRole", () => {
    it("should allow access for user with required role", () => {
      mockRequest.user = {
        id: "user-123",
        email: "test@example.com",
        role: "admin",
      };

      const middleware = requireRole("admin");
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should reject unauthenticated user", () => {
      mockRequest.user = undefined;

      const middleware = requireRole("admin");
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject user with insufficient role", () => {
      mockRequest.user = {
        id: "user-123",
        email: "test@example.com",
        role: "user",
      };

      const middleware = requireRole("admin");
      middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: "Role 'admin' required",
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
