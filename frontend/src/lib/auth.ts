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
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string
): Promise<AuthResponse> {
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
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user as AuthUser;
  } catch (err) {
    return null;
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return null;
    }

    return session;
  } catch (err) {
    return null;
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
    const session = await getSession();
    return session?.access_token || null;
  } catch (err) {
    return null;
  }
}
