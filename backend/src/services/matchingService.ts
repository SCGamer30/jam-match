/**
 * Matching service for calculating compatibility scores between musicians
 * Implements algorithmic scoring based on location, genre overlap, and experience
 */

import { User, PrimaryRole } from "../types/user";

export interface CompatibilityBreakdown {
  locationScore: number;
  genreScore: number;
  experienceScore: number;
  totalScore: number;
}

export interface CompatibilityResult {
  score: number;
  breakdown: CompatibilityBreakdown;
  reasoning: string;
}

/**
 * Calculate location proximity score (max 50 points)
 * Same city = 50 points, within 25mi = 30 points, within 50mi = 10 points
 */
export function calculateLocationScore(user1: User, user2: User): number {
  // If either user doesn't have location data, return 0
  if (!user1.location || !user2.location) {
    return 0;
  }

  const location1 = user1.location.toLowerCase().trim();
  const location2 = user2.location.toLowerCase().trim();

  // Exact match (same city)
  if (location1 === location2) {
    return 50;
  }

  // For now, we'll implement a simple string similarity check
  // In a real application, you'd use a geocoding service to calculate actual distances
  const similarity = calculateStringSimilarity(location1, location2);

  if (similarity >= 0.6) {
    return 30; // Very similar locations (likely nearby)
  } else if (similarity >= 0.3) {
    return 10; // Somewhat similar locations
  }

  return 0; // Different locations
}

/**
 * Calculate genre overlap score (max 30 points, 10 per shared genre, max 3)
 */
export function calculateGenreScore(user1: User, user2: User): number {
  if (
    !user1.genres ||
    !user2.genres ||
    user1.genres.length === 0 ||
    user2.genres.length === 0
  ) {
    return 0;
  }

  const genres1 = user1.genres.map((g) => g.toLowerCase());
  const genres2 = user2.genres.map((g) => g.toLowerCase());

  const sharedGenres = genres1.filter((genre) => genres2.includes(genre));

  // 10 points per shared genre, maximum of 3 genres (30 points)
  return Math.min(sharedGenres.length * 10, 30);
}

/**
 * Calculate experience compatibility score (max 20 points)
 * Same level = 20 points, adjacent levels = 10 points, distant levels = 0 points
 */
export function calculateExperienceScore(user1: User, user2: User): number {
  if (!user1.experience || !user2.experience) {
    return 0;
  }

  const experienceLevels = [
    "beginner",
    "intermediate",
    "advanced",
    "professional",
  ];
  const level1Index = experienceLevels.indexOf(user1.experience);
  const level2Index = experienceLevels.indexOf(user2.experience);

  if (level1Index === -1 || level2Index === -1) {
    return 0;
  }

  const levelDifference = Math.abs(level1Index - level2Index);

  if (levelDifference === 0) {
    return 20; // Same experience level
  } else if (levelDifference === 1) {
    return 10; // Adjacent experience levels (compatible)
  } else {
    return 0; // Too far apart in experience
  }
}

/**
 * Calculate composite compatibility score combining all factors
 */
export function calculateCompatibilityScore(
  user1: User,
  user2: User
): CompatibilityResult {
  const locationScore = calculateLocationScore(user1, user2);
  const genreScore = calculateGenreScore(user1, user2);
  const experienceScore = calculateExperienceScore(user1, user2);

  const totalScore = locationScore + genreScore + experienceScore;

  const breakdown: CompatibilityBreakdown = {
    locationScore,
    genreScore,
    experienceScore,
    totalScore,
  };

  const reasoning = generateCompatibilityReasoning(user1, user2, breakdown);

  return {
    score: totalScore,
    breakdown,
    reasoning,
  };
}

/**
 * Generate human-readable reasoning for compatibility score
 */
function generateCompatibilityReasoning(
  user1: User,
  user2: User,
  breakdown: CompatibilityBreakdown
): string {
  const reasons: string[] = [];

  // Location reasoning
  if (breakdown.locationScore === 50) {
    reasons.push(`Both musicians are in the same location (${user1.location})`);
  } else if (breakdown.locationScore === 30) {
    reasons.push(`Musicians are in nearby locations`);
  } else if (breakdown.locationScore === 10) {
    reasons.push(`Musicians are in somewhat nearby locations`);
  } else if (
    breakdown.locationScore === 0 &&
    user1.location &&
    user2.location
  ) {
    reasons.push(
      `Musicians are in different locations (${user1.location} vs ${user2.location})`
    );
  } else {
    reasons.push(`Location information is incomplete`);
  }

  // Genre reasoning
  if (breakdown.genreScore > 0) {
    const sharedGenres =
      user1.genres?.filter((g1) =>
        user2.genres?.some((g2) => g1.toLowerCase() === g2.toLowerCase())
      ) || [];
    reasons.push(
      `Share ${sharedGenres.length} musical genre${
        sharedGenres.length > 1 ? "s" : ""
      }: ${sharedGenres.join(", ")}`
    );
  } else {
    reasons.push(`No shared musical genres`);
  }

  // Experience reasoning
  if (breakdown.experienceScore === 20) {
    reasons.push(`Both have ${user1.experience} experience level`);
  } else if (breakdown.experienceScore === 10) {
    reasons.push(
      `Compatible experience levels (${user1.experience} and ${user2.experience})`
    );
  } else {
    reasons.push(
      `Different experience levels (${user1.experience} vs ${user2.experience})`
    );
  }

  return reasons.join(". ") + ".";
}

/**
 * Simple string similarity calculation using Jaccard similarity
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.split(" "));
  const set2 = new Set(str2.split(" "));

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Check if users are compatible for band formation (score >= 60)
 */
export function areUsersCompatible(user1: User, user2: User): boolean {
  const result = calculateCompatibilityScore(user1, user2);
  return result.score >= 60;
}

/**
 * Find all compatible users for a given user from a list of candidates
 */
export function findCompatibleUsers(
  targetUser: User,
  candidates: User[]
): Array<{ user: User; compatibility: CompatibilityResult }> {
  return candidates
    .filter((candidate) => candidate.id !== targetUser.id)
    .map((candidate) => ({
      user: candidate,
      compatibility: calculateCompatibilityScore(targetUser, candidate),
    }))
    .filter((result) => result.compatibility.score >= 60)
    .sort((a, b) => b.compatibility.score - a.compatibility.score);
}
/**
 * Band formation interfaces and types
 */
export interface BandFormationResult {
  bandsFormed: Band[];
  notifications: BandNotification[];
}

export interface Band {
  id: string;
  drummer_id: string;
  guitarist_id: string;
  bassist_id: string;
  singer_id: string;
  status: "active" | "inactive" | "disbanded";
  compatibility_data: Record<string, any>;
  formation_date: string;
  created_at: string;
  updated_at: string;
}

export interface BandNotification {
  type: "band_formed";
  bandId: string;
  memberIds: string[];
  message: string;
  timestamp: string;
}

/**
 * Check if a group of users can form a complete band
 * Requires one of each: drummer, guitarist, bassist, singer
 */
export function canFormBand(users: User[]): boolean {
  if (users.length < 3 || users.length > 4) {
    return false;
  }

  const roles = users.map((user) => user.primary_role);
  const requiredRoles: PrimaryRole[] = [
    "drummer",
    "guitarist",
    "bassist",
    "singer",
  ];

  // Check if we have at least 3 of the 4 required roles
  const availableRoles = requiredRoles.filter((role) => roles.includes(role));
  return availableRoles.length >= 3;
}

/**
 * Check if all users in a group are mutually compatible (score >= 60)
 */
export function areAllUsersCompatible(users: User[]): boolean {
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      if (!areUsersCompatible(users[i], users[j])) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Find potential band formations from a list of users
 * Returns groups of 3-4 users who are all mutually compatible and can form a band
 */
export function findPotentialBands(users: User[]): User[][] {
  const potentialBands: User[][] = [];

  // Generate all combinations of 3-4 users
  for (let size = 3; size <= 4; size++) {
    const combinations = generateCombinations(users, size);

    for (const combination of combinations) {
      if (canFormBand(combination) && areAllUsersCompatible(combination)) {
        potentialBands.push(combination);
      }
    }
  }

  // Sort by average compatibility score (highest first)
  return potentialBands.sort((a, b) => {
    const avgScoreA = calculateAverageCompatibility(a);
    const avgScoreB = calculateAverageCompatibility(b);
    return avgScoreB - avgScoreA;
  });
}

/**
 * Calculate average compatibility score for a group of users
 */
function calculateAverageCompatibility(users: User[]): number {
  let totalScore = 0;
  let pairCount = 0;

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      totalScore += calculateCompatibilityScore(users[i], users[j]).score;
      pairCount++;
    }
  }

  return pairCount > 0 ? totalScore / pairCount : 0;
}

/**
 * Generate all combinations of a given size from an array
 */
function generateCombinations<T>(array: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (array.length === 0) return [];

  const [first, ...rest] = array;
  const withFirst = generateCombinations(rest, size - 1).map((combo) => [
    first,
    ...combo,
  ]);
  const withoutFirst = generateCombinations(rest, size);

  return [...withFirst, ...withoutFirst];
}

/**
 * Create a band from a group of compatible users
 */
export function createBandFromUsers(
  users: User[]
): Omit<Band, "id" | "created_at" | "updated_at"> {
  if (!canFormBand(users) || !areAllUsersCompatible(users)) {
    throw new Error("Users cannot form a compatible band");
  }

  // Find users by their primary roles
  const drummer = users.find((u) => u.primary_role === "drummer");
  const guitarist = users.find((u) => u.primary_role === "guitarist");
  const bassist = users.find((u) => u.primary_role === "bassist");
  const singer = users.find((u) => u.primary_role === "singer");

  // If we don't have all 4 roles, assign the 'other' role user to the missing role
  const otherUser = users.find((u) => u.primary_role === "other");

  const bandData: Omit<Band, "id" | "created_at" | "updated_at"> = {
    drummer_id: drummer?.id || otherUser?.id || "",
    guitarist_id: guitarist?.id || otherUser?.id || "",
    bassist_id: bassist?.id || otherUser?.id || "",
    singer_id: singer?.id || otherUser?.id || "",
    status: "active",
    compatibility_data: calculateBandCompatibilityData(users),
    formation_date: new Date().toISOString(),
  };

  return bandData;
}

/**
 * Calculate compatibility data for a band
 */
function calculateBandCompatibilityData(users: User[]): Record<string, any> {
  const compatibilityMatrix: Record<
    string,
    Record<string, CompatibilityResult>
  > = {};

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const user1 = users[i];
      const user2 = users[j];
      const compatibility = calculateCompatibilityScore(user1, user2);

      if (!compatibilityMatrix[user1.id]) {
        compatibilityMatrix[user1.id] = {};
      }
      if (!compatibilityMatrix[user2.id]) {
        compatibilityMatrix[user2.id] = {};
      }

      compatibilityMatrix[user1.id][user2.id] = compatibility;
      compatibilityMatrix[user2.id][user1.id] = compatibility;
    }
  }

  return {
    compatibility_matrix: compatibilityMatrix,
    average_score: calculateAverageCompatibility(users),
    formation_algorithm: "algorithmic_matching",
    member_count: users.length,
  };
}

/**
 * Generate notifications for newly formed bands
 */
export function generateBandNotifications(bands: Band[]): BandNotification[] {
  return bands.map((band) => ({
    type: "band_formed" as const,
    bandId: band.id,
    memberIds: [
      band.drummer_id,
      band.guitarist_id,
      band.bassist_id,
      band.singer_id,
    ].filter((id) => id),
    message: `New band formed! You've been matched with compatible musicians.`,
    timestamp: new Date().toISOString(),
  }));
}
