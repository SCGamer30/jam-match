/**
 * Profile validation utilities for JamMatch application
 */

import {
  ProfileData,
  ProfileSetupData,
  ProfileValidationError,
  ProfileValidationResult,
  ProfileCompletionStatus,
  User,
  ExperienceLevel,
  PrimaryRole,
  MUSICAL_GENRES,
  INSTRUMENTS,
} from "@/types/profile";

/**
 * Validates a complete profile data object
 */
export function validateProfile(profile: ProfileData): ProfileValidationResult {
  const errors: ProfileValidationError[] = [];

  // Validate name
  if (!profile.name || profile.name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (profile.name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters long",
    });
  } else if (profile.name.trim().length > 100) {
    errors.push({
      field: "name",
      message: "Name must be less than 100 characters",
    });
  }

  // Validate bio (optional but has constraints if provided)
  if (profile.bio && profile.bio.length > 500) {
    errors.push({
      field: "bio",
      message: "Bio must be less than 500 characters",
    });
  }

  // Validate primary role
  if (!profile.primary_role) {
    errors.push({ field: "primary_role", message: "Primary role is required" });
  } else if (
    !["drummer", "guitarist", "bassist", "singer", "other"].includes(
      profile.primary_role
    )
  ) {
    errors.push({ field: "primary_role", message: "Invalid primary role" });
  }

  // Validate instruments
  if (!profile.instruments || profile.instruments.length === 0) {
    errors.push({
      field: "instruments",
      message: "At least one instrument is required",
    });
  } else if (profile.instruments.length > 10) {
    errors.push({
      field: "instruments",
      message: "Maximum 10 instruments allowed",
    });
  } else {
    // Validate each instrument
    const invalidInstruments = profile.instruments.filter(
      (instrument) => !INSTRUMENTS.includes(instrument as any)
    );
    if (invalidInstruments.length > 0) {
      errors.push({
        field: "instruments",
        message: `Invalid instruments: ${invalidInstruments.join(", ")}`,
      });
    }
  }

  // Validate genres
  if (!profile.genres || profile.genres.length === 0) {
    errors.push({ field: "genres", message: "At least one genre is required" });
  } else if (profile.genres.length > 10) {
    errors.push({ field: "genres", message: "Maximum 10 genres allowed" });
  } else {
    // Validate each genre
    const invalidGenres = profile.genres.filter(
      (genre) => !MUSICAL_GENRES.includes(genre as any)
    );
    if (invalidGenres.length > 0) {
      errors.push({
        field: "genres",
        message: `Invalid genres: ${invalidGenres.join(", ")}`,
      });
    }
  }

  // Validate experience
  if (!profile.experience) {
    errors.push({
      field: "experience",
      message: "Experience level is required",
    });
  } else if (
    !["beginner", "intermediate", "advanced", "professional"].includes(
      profile.experience
    )
  ) {
    errors.push({ field: "experience", message: "Invalid experience level" });
  }

  // Validate location (optional but has constraints if provided)
  if (profile.location && profile.location.length > 100) {
    errors.push({
      field: "location",
      message: "Location must be less than 100 characters",
    });
  }

  // Validate avatar URL (optional but has constraints if provided)
  if (profile.avatar_url) {
    try {
      new URL(profile.avatar_url);
    } catch {
      errors.push({
        field: "avatar_url",
        message: "Invalid avatar URL format",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates profile setup data for multi-step wizard
 */
export function validateProfileSetup(
  setupData: ProfileSetupData
): ProfileValidationResult {
  // Convert setup data to profile data format for validation
  const profileData: ProfileData = {
    name: setupData.name,
    bio: setupData.bio,
    primary_role: setupData.primary_role,
    instruments: setupData.instruments,
    genres: setupData.genres,
    experience: setupData.experience,
    location: setupData.location,
  };

  return validateProfile(profileData);
}

/**
 * Validates individual profile setup steps
 */
export function validateProfileSetupStep(
  step: number,
  setupData: Partial<ProfileSetupData>
): ProfileValidationResult {
  const errors: ProfileValidationError[] = [];

  switch (step) {
    case 1: // Basic Info Step
      if (!setupData.name || setupData.name.trim().length === 0) {
        errors.push({ field: "name", message: "Name is required" });
      } else if (setupData.name.trim().length < 2) {
        errors.push({
          field: "name",
          message: "Name must be at least 2 characters long",
        });
      } else if (setupData.name.trim().length > 100) {
        errors.push({
          field: "name",
          message: "Name must be less than 100 characters",
        });
      }

      if (setupData.bio && setupData.bio.length > 500) {
        errors.push({
          field: "bio",
          message: "Bio must be less than 500 characters",
        });
      }

      if (!setupData.experience) {
        errors.push({
          field: "experience",
          message: "Experience level is required",
        });
      } else if (
        !["beginner", "intermediate", "advanced", "professional"].includes(
          setupData.experience
        )
      ) {
        errors.push({
          field: "experience",
          message: "Invalid experience level",
        });
      }

      if (setupData.location && setupData.location.length > 100) {
        errors.push({
          field: "location",
          message: "Location must be less than 100 characters",
        });
      }
      break;

    case 2: // Musical Preferences Step
      if (!setupData.genres || setupData.genres.length === 0) {
        errors.push({
          field: "genres",
          message: "At least one genre is required",
        });
      } else if (setupData.genres.length > 10) {
        errors.push({ field: "genres", message: "Maximum 10 genres allowed" });
      }

      if (!setupData.primary_role) {
        errors.push({
          field: "primary_role",
          message: "Primary role is required",
        });
      } else if (
        !["drummer", "guitarist", "bassist", "singer", "other"].includes(
          setupData.primary_role
        )
      ) {
        errors.push({ field: "primary_role", message: "Invalid primary role" });
      }
      break;

    case 3: // Instruments Step
      if (!setupData.instruments || setupData.instruments.length === 0) {
        errors.push({
          field: "instruments",
          message: "At least one instrument is required",
        });
      } else if (setupData.instruments.length > 10) {
        errors.push({
          field: "instruments",
          message: "Maximum 10 instruments allowed",
        });
      }
      break;

    default:
      errors.push({ field: "step", message: "Invalid step number" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if a user profile is complete
 */
export function checkProfileCompletion(user: User): ProfileCompletionStatus {
  const requiredFields = [
    "name",
    "primary_role",
    "instruments",
    "genres",
    "experience",
  ];

  const missingFields: string[] = [];
  let completedFields = 0;

  // Check required fields
  if (!user.name || user.name.trim().length === 0) {
    missingFields.push("name");
  } else {
    completedFields++;
  }

  if (!user.primary_role) {
    missingFields.push("primary_role");
  } else {
    completedFields++;
  }

  if (!user.instruments || user.instruments.length === 0) {
    missingFields.push("instruments");
  } else {
    completedFields++;
  }

  if (!user.genres || user.genres.length === 0) {
    missingFields.push("genres");
  } else {
    completedFields++;
  }

  if (!user.experience) {
    missingFields.push("experience");
  } else {
    completedFields++;
  }

  // Optional fields that contribute to completion percentage
  const optionalFields = ["bio", "location"];
  let optionalCompleted = 0;

  if (user.bio && user.bio.trim().length > 0) {
    optionalCompleted++;
  }

  if (user.location && user.location.trim().length > 0) {
    optionalCompleted++;
  }

  const totalFields = requiredFields.length + optionalFields.length;
  const totalCompleted = completedFields + optionalCompleted;
  const completionPercentage = Math.round((totalCompleted / totalFields) * 100);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
  };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ProfileValidationResult {
  const errors: ProfileValidationError[] = [];

  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  } else {
    if (password.length < 8) {
      errors.push({
        field: "password",
        message: "Password must be at least 8 characters long",
      });
    }
    if (password.length > 128) {
      errors.push({
        field: "password",
        message: "Password must be less than 128 characters",
      });
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push({
        field: "password",
        message: "Password must contain at least one lowercase letter",
      });
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push({
        field: "password",
        message: "Password must contain at least one uppercase letter",
      });
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push({
        field: "password",
        message: "Password must contain at least one number",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes user input by trimming whitespace and removing potentially harmful content
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

/**
 * Validates and sanitizes profile data
 */
export function validateAndSanitizeProfile(profile: ProfileData): {
  sanitizedProfile: ProfileData;
  validation: ProfileValidationResult;
} {
  // Sanitize string fields
  const sanitizedProfile: ProfileData = {
    ...profile,
    name: sanitizeInput(profile.name),
    bio: profile.bio ? sanitizeInput(profile.bio) : undefined,
    location: profile.location ? sanitizeInput(profile.location) : undefined,
    instruments: profile.instruments.map((instrument) =>
      sanitizeInput(instrument)
    ),
    genres: profile.genres.map((genre) => sanitizeInput(genre)),
  };

  // Validate the sanitized profile
  const validation = validateProfile(sanitizedProfile);

  return {
    sanitizedProfile,
    validation,
  };
}
