import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export interface JWTPayload {
  sub: string; // user id
  email: string;
  role?: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to authenticate requests using Supabase JWT tokens
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        error: {
          code: "MISSING_TOKEN",
          message: "Access token is required",
        },
      });
      return;
    }

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired token",
        },
      });
      return;
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email || "",
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      error: {
        code: "AUTH_ERROR",
        message: "Authentication failed",
      },
    });
  }
}

/**
 * Middleware to authenticate requests using custom JWT tokens (fallback)
 */
export function authenticateJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        error: {
          code: "MISSING_TOKEN",
          message: "Access token is required",
        },
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: {
          code: "EXPIRED_TOKEN",
          message: "Token has expired",
        },
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid token",
        },
      });
    } else {
      console.error("JWT authentication error:", error);
      res.status(500).json({
        error: {
          code: "AUTH_ERROR",
          message: "Authentication failed",
        },
      });
    }
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      // No token provided, continue without user
      next();
      return;
    }

    // Try to verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (!error && user) {
      req.user = {
        id: user.id,
        email: user.email || "",
        role: user.role,
      };
    }

    next();
  } catch (error) {
    // Log error but don't fail the request
    console.error("Optional auth error:", error);
    next();
  }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(role: string) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        },
      });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: `Role '${role}' required`,
        },
      });
      return;
    }

    next();
  };
}
