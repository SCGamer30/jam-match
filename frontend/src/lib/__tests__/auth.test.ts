/**
 * Unit tests for authentication utilities
 */

import { supabase } from "../supabase";
import { signUp, signIn, signOut, getCurrentUser, getSession } from "../auth";

// Mock Supabase
jest.mock("../supabase", () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe("Authentication Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("signUp", () => {
    it("should sign up user successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
      };

      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: { access_token: "token" },
        },
        error: null,
      } as any);

      const result = await signUp("test@example.com", "password123");

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it("should handle sign up errors", async () => {
      const mockError = { message: "Email already registered" };

      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await signUp("test@example.com", "password123");

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it("should validate email format", async () => {
      const result = await signUp("invalid-email", "password123");

      expect(result.error).toEqual({
        message: "Invalid email format",
      });
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it("should validate password strength", async () => {
      const result = await signUp("test@example.com", "weak");

      expect(result.error).toEqual({
        message: "Password must be at least 8 characters long",
      });
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });
  });

  describe("signIn", () => {
    it("should sign in user successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: { access_token: "token" },
        },
        error: null,
      } as any);

      const result = await signIn("test@example.com", "password123");

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it("should handle sign in errors", async () => {
      const mockError = { message: "Invalid credentials" };

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await signIn("test@example.com", "wrongpassword");

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it("should validate email format", async () => {
      const result = await signIn("invalid-email", "password123");

      expect(result.error).toEqual({
        message: "Invalid email format",
      });
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe("signOut", () => {
    it("should sign out user successfully", async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({
        error: null,
      } as any);

      const result = await signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it("should handle sign out errors", async () => {
      const mockError = { message: "Sign out failed" };

      mockSupabase.auth.signOut.mockResolvedValueOnce({
        error: mockError,
      } as any);

      const result = await signOut();

      expect(result.error).toEqual(mockError);
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
      };

      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      } as any);

      const result = await getCurrentUser();

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it("should handle get user errors", async () => {
      const mockError = { message: "User not found" };

      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: mockError,
      } as any);

      const result = await getCurrentUser();

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe("getSession", () => {
    it("should get current session successfully", async () => {
      const mockSession = {
        access_token: "token",
        user: { id: "user-123" },
      };

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      } as any);

      const result = await getSession();

      expect(mockSupabase.auth.getSession).toHaveBeenCalled();
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it("should handle get session errors", async () => {
      const mockError = { message: "Session not found" };

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: mockError,
      } as any);

      const result = await getSession();

      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });
});
