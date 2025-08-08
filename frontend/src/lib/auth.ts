import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

export interface AuthUser extends User {
  profile?: {
    id: string;
    name: string;
    bio?: string;
    instruments: string[];
    genres: string[];
    experience: "beginner" | "intermediate" | "advanced" | "professional";
    location?: string;
    avatar_url?: string;
    profile_completed: boolean;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: AuthError | null;
}

/**
 * Validate email format
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function validatePassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string
): Promise<AuthResponse> {
  // Validate email format
  if (!validateEmail(email)) {
    return {
      user: null,
      error: { message: "Invalid email format" },
    };
  }

  // Validate password strength
  if (!validatePassword(password)) {
    return {
      user: null,
      error: { message: "Password must be at least 8 characters long" },
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        error: { message: error.message, code: error.message },
      };
    }

    return { user: data.user as AuthUser, error: null };
  } catch (err) {
    return {
      user: null,
      error: { message: "An unexpected error occurred during sign up" },
    };
  }
}

/**
 * Sign in a user with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  // Validate email format
  if (!validateEmail(email)) {
    return {
      user: null,
      error: { message: "Invalid email format" },
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        error: { message: error.message, code: error.message },
      };
    }

    return { user: data.user as AuthUser, error: null };
  } catch (err) {
    return {
      user: null,
      error: { message: "An unexpected error occurred during sign in" },
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: { message: error.message, code: error.message } };
    }

    return { error: null };
  } catch (err) {
    return {
      error: { message: "An unexpected error occurred during sign out" },
    };
  }
}

/**
 * Get the current user session
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return {
        user: null,
        error: { message: error.message },
      };
    }

    return { user: user as AuthUser, error: null };
  } catch (err) {
    return {
      user: null,
      error: { message: "Failed to get current user" },
    };
  }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<{
  session: any | null;
  error: AuthError | null;
}> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return {
        session: null,
        error: { message: error.message },
      };
    }

    return { session, error: null };
  } catch (err) {
    return {
      session: null,
      error: { message: "Failed to get session" },
    };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback((session?.user as AuthUser) || null);
  });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Get the access token for API requests
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const { session } = await getSession();
    return session?.access_token || null;
  } catch (err) {
    return null;
  }
}
