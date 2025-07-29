import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase";

export interface TokenPayload {
  sub: string; // user id
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

/**
 * Validate a Supabase JWT token
 */
export async function validateSupabaseToken(
  token: string
): Promise<TokenValidationResult> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        valid: false,
        error: error?.message || "Invalid token",
      };
    }

    return {
      valid: true,
      payload: {
        sub: user.id,
        email: user.email || "",
        role: user.role,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Token validation failed",
    };
  }
}

/**
 * Validate a custom JWT token
 */
export function validateJWTToken(token: string): TokenValidationResult {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return {
        valid: false,
        error: "JWT secret not configured",
      };
    }

    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

    return {
      valid: true,
      payload: decoded,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        valid: false,
        error: "Token has expired",
      };
    } else if (error instanceof jwt.JsonWebTokenError) {
      return {
        valid: false,
        error: "Invalid token format",
      };
    } else {
      return {
        valid: false,
        error: "Token validation failed",
      };
    }
  }
}

/**
 * Generate a custom JWT token (for testing or fallback scenarios)
 */
export function generateJWTToken(
  payload: Omit<TokenPayload, "iat" | "exp">
): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: "24h",
    issuer: "jamMatch-backend",
  });
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Check if token is expired (for custom JWT tokens)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Decode token without verification (useful for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
}
