/**
 * Unit tests for matching service compatibility scoring algorithms
 */

import {
  calculateLocationScore,
  calculateGenreScore,
  calculateExperienceScore,
  calculateCompatibilityScore,
  areUsersCompatible,
  findCompatibleUsers,
  canFormBand,
  areAllUsersCompatible,
  findPotentialBands,
  createBandFromUsers,
  generateBandNotifications,
} from "../matchingService";
import { User } from "../../types/user";

// Test user fixtures
const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: "test-id",
  email: "test@example.com",
  name: "Test User",
  bio: "Test bio",
  primary_role: "guitarist",
  instruments: ["Guitar"],
  genres: ["Rock"],
  experience: "intermediate",
  location: "New York",
  avatar_url: undefined,
  profile_completed: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

describe("calculateLocationScore", () => {
  it("should return 50 points for exact location match", () => {
    const user1 = createTestUser({ location: "New York" });
    const user2 = createTestUser({ location: "New York" });

    expect(calculateLocationScore(user1, user2)).toBe(50);
  });

  it("should return 50 points for case-insensitive location match", () => {
    const user1 = createTestUser({ location: "New York" });
    const user2 = createTestUser({ location: "new york" });

    expect(calculateLocationScore(user1, user2)).toBe(50);
  });

  it("should return 30 points for very similar locations", () => {
    const user1 = createTestUser({ location: "New York City" });
    const user2 = createTestUser({ location: "New York" });

    expect(calculateLocationScore(user1, user2)).toBe(30);
  });

  it("should return 10 points for somewhat similar locations", () => {
    const user1 = createTestUser({ location: "New York" });
    const user2 = createTestUser({ location: "York" });

    expect(calculateLocationScore(user1, user2)).toBe(10);
  });

  it("should return 0 points for completely different locations", () => {
    const user1 = createTestUser({ location: "New York" });
    const user2 = createTestUser({ location: "Los Angeles" });

    expect(calculateLocationScore(user1, user2)).toBe(0);
  });

  it("should return 0 points when one user has no location", () => {
    const user1 = createTestUser({ location: "New York" });
    const user2 = createTestUser({ location: undefined });

    expect(calculateLocationScore(user1, user2)).toBe(0);
  });

  it("should return 0 points when both users have no location", () => {
    const user1 = createTestUser({ location: undefined });
    const user2 = createTestUser({ location: undefined });

    expect(calculateLocationScore(user1, user2)).toBe(0);
  });
});

describe("calculateGenreScore", () => {
  it("should return 10 points for one shared genre", () => {
    const user1 = createTestUser({ genres: ["Rock", "Pop"] });
    const user2 = createTestUser({ genres: ["Rock", "Jazz"] });

    expect(calculateGenreScore(user1, user2)).toBe(10);
  });

  it("should return 20 points for two shared genres", () => {
    const user1 = createTestUser({ genres: ["Rock", "Pop", "Blues"] });
    const user2 = createTestUser({ genres: ["Rock", "Pop", "Jazz"] });

    expect(calculateGenreScore(user1, user2)).toBe(20);
  });

  it("should return 30 points for three shared genres (maximum)", () => {
    const user1 = createTestUser({ genres: ["Rock", "Pop", "Blues", "Jazz"] });
    const user2 = createTestUser({
      genres: ["Rock", "Pop", "Blues", "Country"],
    });

    expect(calculateGenreScore(user1, user2)).toBe(30);
  });

  it("should cap at 30 points even with more than 3 shared genres", () => {
    const user1 = createTestUser({
      genres: ["Rock", "Pop", "Blues", "Jazz", "Country"],
    });
    const user2 = createTestUser({
      genres: ["Rock", "Pop", "Blues", "Jazz", "Folk"],
    });

    expect(calculateGenreScore(user1, user2)).toBe(30);
  });

  it("should be case-insensitive for genre matching", () => {
    const user1 = createTestUser({ genres: ["Rock", "POP"] });
    const user2 = createTestUser({ genres: ["rock", "pop"] });

    expect(calculateGenreScore(user1, user2)).toBe(20);
  });

  it("should return 0 points for no shared genres", () => {
    const user1 = createTestUser({ genres: ["Rock", "Pop"] });
    const user2 = createTestUser({ genres: ["Jazz", "Blues"] });

    expect(calculateGenreScore(user1, user2)).toBe(0);
  });

  it("should return 0 points when one user has no genres", () => {
    const user1 = createTestUser({ genres: ["Rock", "Pop"] });
    const user2 = createTestUser({ genres: [] });

    expect(calculateGenreScore(user1, user2)).toBe(0);
  });

  it("should return 0 points when both users have no genres", () => {
    const user1 = createTestUser({ genres: [] });
    const user2 = createTestUser({ genres: [] });

    expect(calculateGenreScore(user1, user2)).toBe(0);
  });
});

describe("calculateExperienceScore", () => {
  it("should return 20 points for same experience level", () => {
    const user1 = createTestUser({ experience: "intermediate" });
    const user2 = createTestUser({ experience: "intermediate" });

    expect(calculateExperienceScore(user1, user2)).toBe(20);
  });

  it("should return 10 points for adjacent experience levels (beginner-intermediate)", () => {
    const user1 = createTestUser({ experience: "beginner" });
    const user2 = createTestUser({ experience: "intermediate" });

    expect(calculateExperienceScore(user1, user2)).toBe(10);
  });

  it("should return 10 points for adjacent experience levels (intermediate-advanced)", () => {
    const user1 = createTestUser({ experience: "intermediate" });
    const user2 = createTestUser({ experience: "advanced" });

    expect(calculateExperienceScore(user1, user2)).toBe(10);
  });

  it("should return 10 points for adjacent experience levels (advanced-professional)", () => {
    const user1 = createTestUser({ experience: "advanced" });
    const user2 = createTestUser({ experience: "professional" });

    expect(calculateExperienceScore(user1, user2)).toBe(10);
  });

  it("should return 0 points for distant experience levels (beginner-advanced)", () => {
    const user1 = createTestUser({ experience: "beginner" });
    const user2 = createTestUser({ experience: "advanced" });

    expect(calculateExperienceScore(user1, user2)).toBe(0);
  });

  it("should return 0 points for distant experience levels (beginner-professional)", () => {
    const user1 = createTestUser({ experience: "beginner" });
    const user2 = createTestUser({ experience: "professional" });

    expect(calculateExperienceScore(user1, user2)).toBe(0);
  });

  it("should return 0 points for distant experience levels (intermediate-professional)", () => {
    const user1 = createTestUser({ experience: "intermediate" });
    const user2 = createTestUser({ experience: "professional" });

    expect(calculateExperienceScore(user1, user2)).toBe(0);
  });
});

describe("calculateCompatibilityScore", () => {
  it("should combine all scoring factors correctly", () => {
    const user1 = createTestUser({
      location: "New York",
      genres: ["Rock", "Pop"],
      experience: "intermediate",
    });
    const user2 = createTestUser({
      location: "New York",
      genres: ["Rock", "Jazz"],
      experience: "intermediate",
    });

    const result = calculateCompatibilityScore(user1, user2);

    expect(result.score).toBe(80); // 50 (location) + 10 (genre) + 20 (experience)
    expect(result.breakdown.locationScore).toBe(50);
    expect(result.breakdown.genreScore).toBe(10);
    expect(result.breakdown.experienceScore).toBe(20);
    expect(result.breakdown.totalScore).toBe(80);
    expect(result.reasoning).toContain("same location");
    expect(result.reasoning).toContain("Share 1 musical genre");
    expect(result.reasoning).toContain("Both have intermediate experience");
  });

  it("should generate appropriate reasoning for low compatibility", () => {
    const user1 = createTestUser({
      location: "New York",
      genres: ["Rock"],
      experience: "beginner",
    });
    const user2 = createTestUser({
      location: "Los Angeles",
      genres: ["Jazz"],
      experience: "professional",
    });

    const result = calculateCompatibilityScore(user1, user2);

    expect(result.score).toBe(0);
    expect(result.reasoning).toContain("different locations");
    expect(result.reasoning).toContain("No shared musical genres");
    expect(result.reasoning).toContain("Different experience levels");
  });

  it("should handle maximum possible score", () => {
    const user1 = createTestUser({
      location: "New York",
      genres: ["Rock", "Pop", "Blues"],
      experience: "advanced",
    });
    const user2 = createTestUser({
      location: "New York",
      genres: ["Rock", "Pop", "Blues"],
      experience: "advanced",
    });

    const result = calculateCompatibilityScore(user1, user2);

    expect(result.score).toBe(100); // 50 + 30 + 20
  });
});

describe("areUsersCompatible", () => {
  it("should return true for users with score >= 60", () => {
    const user1 = createTestUser({
      location: "New York",
      genres: ["Rock"],
      experience: "intermediate",
    });
    const user2 = createTestUser({
      location: "New York",
      genres: ["Rock"],
      experience: "intermediate",
    });

    expect(areUsersCompatible(user1, user2)).toBe(true);
  });

  it("should return false for users with score < 60", () => {
    const user1 = createTestUser({
      location: "New York",
      genres: ["Rock"],
      experience: "beginner",
    });
    const user2 = createTestUser({
      location: "Los Angeles",
      genres: ["Jazz"],
      experience: "professional",
    });

    expect(areUsersCompatible(user1, user2)).toBe(false);
  });
});

describe("findCompatibleUsers", () => {
  const targetUser = createTestUser({
    id: "target",
    location: "New York",
    genres: ["Rock"],
    experience: "intermediate",
  });

  const candidates = [
    createTestUser({
      id: "compatible1",
      location: "New York",
      genres: ["Rock"],
      experience: "intermediate",
    }), // Score: 80
    createTestUser({
      id: "compatible2",
      location: "New York",
      genres: ["Pop"],
      experience: "advanced",
    }), // Score: 60
    createTestUser({
      id: "incompatible",
      location: "Los Angeles",
      genres: ["Jazz"],
      experience: "professional",
    }), // Score: 0
    createTestUser({
      id: "target", // Same as target user
      location: "New York",
      genres: ["Rock"],
      experience: "intermediate",
    }),
  ];

  it("should return only compatible users (score >= 60)", () => {
    const result = findCompatibleUsers(targetUser, candidates);

    expect(result).toHaveLength(2);
    expect(result[0].user.id).toBe("compatible1");
    expect(result[1].user.id).toBe("compatible2");
  });

  it("should exclude the target user from results", () => {
    const result = findCompatibleUsers(targetUser, candidates);

    expect(result.every((r) => r.user.id !== targetUser.id)).toBe(true);
  });

  it("should sort results by compatibility score (highest first)", () => {
    const result = findCompatibleUsers(targetUser, candidates);

    expect(result[0].compatibility.score).toBeGreaterThan(
      result[1].compatibility.score
    );
  });

  it("should return empty array when no compatible users found", () => {
    const incompatibleCandidates = [
      createTestUser({
        id: "incompatible1",
        location: "Los Angeles",
        genres: ["Jazz"],
        experience: "professional",
      }),
    ];

    const result = findCompatibleUsers(targetUser, incompatibleCandidates);

    expect(result).toHaveLength(0);
  });
});

describe("Band Formation Logic", () => {
  const drummer = createTestUser({
    id: "drummer1",
    primary_role: "drummer",
    location: "New York",
    genres: ["Rock"],
    experience: "intermediate",
  });

  const guitarist = createTestUser({
    id: "guitarist1",
    primary_role: "guitarist",
    location: "New York",
    genres: ["Rock"],
    experience: "intermediate",
  });

  const bassist = createTestUser({
    id: "bassist1",
    primary_role: "bassist",
    location: "New York",
    genres: ["Rock"],
    experience: "intermediate",
  });

  const singer = createTestUser({
    id: "singer1",
    primary_role: "singer",
    location: "New York",
    genres: ["Rock"],
    experience: "intermediate",
  });

  const otherUser = createTestUser({
    id: "other1",
    primary_role: "other",
    location: "New York",
    genres: ["Rock"],
    experience: "intermediate",
  });

  describe("canFormBand", () => {
    it("should return true for 4 users with all required roles", () => {
      const users = [drummer, guitarist, bassist, singer];
      expect(canFormBand(users)).toBe(true);
    });

    it("should return true for 3 users with 3 required roles", () => {
      const users = [drummer, guitarist, bassist];
      expect(canFormBand(users)).toBe(true);
    });

    it("should return false for less than 3 users", () => {
      const users = [drummer, guitarist];
      expect(canFormBand(users)).toBe(false);
    });

    it("should return false for more than 4 users", () => {
      const users = [drummer, guitarist, bassist, singer, otherUser];
      expect(canFormBand(users)).toBe(false);
    });

    it("should return false for users with insufficient role diversity", () => {
      const drummer2 = createTestUser({
        id: "drummer2",
        primary_role: "drummer",
        location: "New York",
        genres: ["Rock"],
        experience: "intermediate",
      });
      const users = [drummer, drummer2, guitarist];
      expect(canFormBand(users)).toBe(false);
    });
  });

  describe("areAllUsersCompatible", () => {
    it("should return true when all users are mutually compatible", () => {
      const users = [drummer, guitarist, bassist];
      expect(areAllUsersCompatible(users)).toBe(true);
    });

    it("should return false when some users are not compatible", () => {
      const incompatibleUser = createTestUser({
        id: "incompatible",
        location: "Los Angeles",
        genres: ["Classical"],
        experience: "professional",
      });
      const users = [drummer, guitarist, incompatibleUser];
      expect(areAllUsersCompatible(users)).toBe(false);
    });
  });

  describe("findPotentialBands", () => {
    it("should find compatible band formations", () => {
      const users = [drummer, guitarist, bassist, singer];
      const potentialBands = findPotentialBands(users);

      expect(potentialBands.length).toBeGreaterThan(0);
      expect(potentialBands[0].length).toBeGreaterThanOrEqual(3);
      expect(potentialBands[0].length).toBeLessThanOrEqual(4);
    });

    it("should return empty array when no compatible bands can be formed", () => {
      const incompatibleUsers = [
        createTestUser({
          id: "user1",
          location: "New York",
          genres: ["Rock"],
          experience: "beginner",
        }),
        createTestUser({
          id: "user2",
          location: "Los Angeles",
          genres: ["Jazz"],
          experience: "professional",
        }),
        createTestUser({
          id: "user3",
          location: "Chicago",
          genres: ["Classical"],
          experience: "advanced",
        }),
      ];

      const potentialBands = findPotentialBands(incompatibleUsers);
      expect(potentialBands).toHaveLength(0);
    });

    it("should sort bands by average compatibility score", () => {
      const highCompatibilityUsers = [
        createTestUser({
          id: "high1",
          primary_role: "drummer",
          location: "New York",
          genres: ["Rock", "Pop", "Blues"],
          experience: "intermediate",
        }),
        createTestUser({
          id: "high2",
          primary_role: "guitarist",
          location: "New York",
          genres: ["Rock", "Pop", "Blues"],
          experience: "intermediate",
        }),
        createTestUser({
          id: "high3",
          primary_role: "bassist",
          location: "New York",
          genres: ["Rock", "Pop", "Blues"],
          experience: "intermediate",
        }),
      ];

      const mediumCompatibilityUsers = [
        createTestUser({
          id: "med1",
          primary_role: "drummer",
          location: "New York",
          genres: ["Rock"],
          experience: "beginner",
        }),
        createTestUser({
          id: "med2",
          primary_role: "guitarist",
          location: "New York",
          genres: ["Rock"],
          experience: "intermediate",
        }),
        createTestUser({
          id: "med3",
          primary_role: "bassist",
          location: "New York",
          genres: ["Rock"],
          experience: "advanced",
        }),
      ];

      const allUsers = [...highCompatibilityUsers, ...mediumCompatibilityUsers];
      const potentialBands = findPotentialBands(allUsers);

      if (potentialBands.length >= 2) {
        // First band should have higher average compatibility
        const firstBandAvg = calculateAverageCompatibility(potentialBands[0]);
        const secondBandAvg = calculateAverageCompatibility(potentialBands[1]);
        expect(firstBandAvg).toBeGreaterThanOrEqual(secondBandAvg);
      }
    });
  });

  describe("createBandFromUsers", () => {
    it("should create a band with all 4 roles filled", () => {
      const users = [drummer, guitarist, bassist, singer];
      const band = createBandFromUsers(users);

      expect(band.drummer_id).toBe(drummer.id);
      expect(band.guitarist_id).toBe(guitarist.id);
      expect(band.bassist_id).toBe(bassist.id);
      expect(band.singer_id).toBe(singer.id);
      expect(band.status).toBe("active");
      expect(band.compatibility_data).toBeDefined();
    });

    it("should handle missing role with other user", () => {
      const users = [drummer, guitarist, bassist, otherUser]; // No singer
      const band = createBandFromUsers(users);

      expect(band.drummer_id).toBe(drummer.id);
      expect(band.guitarist_id).toBe(guitarist.id);
      expect(band.bassist_id).toBe(bassist.id);
      expect(band.singer_id).toBe(otherUser.id); // Other user fills singer role
    });

    it("should throw error for incompatible users", () => {
      const incompatibleUser = createTestUser({
        id: "incompatible",
        primary_role: "singer",
        location: "Los Angeles",
        genres: ["Classical"],
        experience: "professional",
      });
      const users = [drummer, guitarist, bassist, incompatibleUser];

      expect(() => createBandFromUsers(users)).toThrow(
        "Users cannot form a compatible band"
      );
    });

    it("should include compatibility data in band", () => {
      const users = [drummer, guitarist, bassist];
      const band = createBandFromUsers(users);

      expect(band.compatibility_data.compatibility_matrix).toBeDefined();
      expect(band.compatibility_data.average_score).toBeGreaterThan(0);
      expect(band.compatibility_data.formation_algorithm).toBe(
        "algorithmic_matching"
      );
      expect(band.compatibility_data.member_count).toBe(3);
    });
  });

  describe("generateBandNotifications", () => {
    it("should generate notifications for formed bands", () => {
      const bands = [
        {
          id: "band1",
          drummer_id: drummer.id,
          guitarist_id: guitarist.id,
          bassist_id: bassist.id,
          singer_id: singer.id,
          status: "active" as const,
          compatibility_data: {},
          formation_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const notifications = generateBandNotifications(bands);

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe("band_formed");
      expect(notifications[0].bandId).toBe("band1");
      expect(notifications[0].memberIds).toContain(drummer.id);
      expect(notifications[0].memberIds).toContain(guitarist.id);
      expect(notifications[0].memberIds).toContain(bassist.id);
      expect(notifications[0].memberIds).toContain(singer.id);
      expect(notifications[0].message).toContain("New band formed");
    });

    it("should handle empty bands array", () => {
      const notifications = generateBandNotifications([]);
      expect(notifications).toHaveLength(0);
    });
  });
});

// Helper function for testing (make it available to tests)
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
