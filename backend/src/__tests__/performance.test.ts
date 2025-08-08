/**
 * Performance tests for matching algorithm and AI service
 */

import {
  calculateCompatibilityScore,
  findCompatibleUsers,
  findPotentialBands,
} from "../services/matchingService";
import { User } from "../types/user";

// Mock AI service for performance testing
jest.mock("../services/aiService", () => ({
  calculateAICompatibility: jest.fn().mockResolvedValue({
    score: 75,
    reasoning: "Mock AI compatibility analysis",
  }),
}));

describe("Performance Tests", () => {
  // Helper function to create test users
  const createTestUsers = (count: number): User[] => {
    const roles = ["guitarist", "drummer", "bassist", "singer"];
    const genres = ["Rock", "Jazz", "Blues", "Pop", "Country", "Classical"];
    const experiences = [
      "beginner",
      "intermediate",
      "advanced",
      "professional",
    ];
    const locations = [
      "New York",
      "Los Angeles",
      "Chicago",
      "Houston",
      "Phoenix",
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `user-${i}`,
      email: `user${i}@example.com`,
      name: `User ${i}`,
      bio: `Bio for user ${i}`,
      primary_role: roles[i % roles.length] as any,
      instruments: [
        roles[i % roles.length].charAt(0).toUpperCase() +
          roles[i % roles.length].slice(1),
      ],
      genres: [
        genres[i % genres.length],
        genres[(i + 1) % genres.length],
        genres[(i + 2) % genres.length],
      ],
      experience: experiences[i % experiences.length] as any,
      location: locations[i % locations.length],
      avatar_url: undefined,
      profile_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  };

  describe("Matching Algorithm Performance", () => {
    test("should calculate compatibility for 100 users in reasonable time", async () => {
      const users = createTestUsers(100);
      const targetUser = users[0];
      const candidates = users.slice(1);

      const startTime = performance.now();

      const matches = findCompatibleUsers(targetUser, candidates);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within 1 second for 100 users
      expect(executionTime).toBeLessThan(1000);
      expect(matches.length).toBeGreaterThan(0);

      console.log(
        `Compatibility calculation for 100 users: ${executionTime.toFixed(2)}ms`
      );
    });

    test("should calculate compatibility for 1000 users in reasonable time", async () => {
      const users = createTestUsers(1000);
      const targetUser = users[0];
      const candidates = users.slice(1);

      const startTime = performance.now();

      const matches = findCompatibleUsers(targetUser, candidates);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within 5 seconds for 1000 users
      expect(executionTime).toBeLessThan(5000);
      expect(matches.length).toBeGreaterThan(0);

      console.log(
        `Compatibility calculation for 1000 users: ${executionTime.toFixed(
          2
        )}ms`
      );
    });

    test("should handle large dataset efficiently", async () => {
      const users = createTestUsers(5000);
      const targetUser = users[0];
      const candidates = users.slice(1);

      const startTime = performance.now();

      // Test with limited results to simulate pagination
      const matches = findCompatibleUsers(targetUser, candidates).slice(0, 50);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within 10 seconds for 5000 users
      expect(executionTime).toBeLessThan(10000);
      expect(matches.length).toBeLessThanOrEqual(50);

      console.log(
        `Compatibility calculation for 5000 users (top 50): ${executionTime.toFixed(
          2
        )}ms`
      );
    });

    test("should scale linearly with user count", async () => {
      const userCounts = [100, 200, 500];
      const executionTimes: number[] = [];

      for (const count of userCounts) {
        const users = createTestUsers(count);
        const targetUser = users[0];
        const candidates = users.slice(1);

        const startTime = performance.now();
        findCompatibleUsers(targetUser, candidates);
        const endTime = performance.now();

        executionTimes.push(endTime - startTime);
      }

      // Execution time should scale roughly linearly
      const ratio1 = executionTimes[1] / executionTimes[0]; // 200/100
      const ratio2 = executionTimes[2] / executionTimes[1]; // 500/200

      // Allow for some variance but should be roughly proportional
      expect(ratio1).toBeGreaterThan(1.5);
      expect(ratio1).toBeLessThan(3);
      expect(ratio2).toBeGreaterThan(2);
      expect(ratio2).toBeLessThan(4);

      console.log(
        `Scaling ratios: 200/100 = ${ratio1.toFixed(
          2
        )}, 500/200 = ${ratio2.toFixed(2)}`
      );
    });
  });

  describe("Band Formation Performance", () => {
    test("should find potential bands efficiently", async () => {
      const users = createTestUsers(200);

      const startTime = performance.now();

      const potentialBands = findPotentialBands(users);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within 2 seconds for 200 users
      expect(executionTime).toBeLessThan(2000);
      expect(potentialBands.length).toBeGreaterThan(0);

      console.log(
        `Band formation for 200 users: ${executionTime.toFixed(2)}ms`
      );
      console.log(`Found ${potentialBands.length} potential bands`);
    });

    test("should handle complex band formation scenarios", async () => {
      // Create users with specific roles to ensure band formation
      const guitarists = Array.from({ length: 50 }, (_, i) => ({
        id: `guitarist-${i}`,
        email: `guitarist${i}@example.com`,
        name: `Guitarist ${i}`,
        bio: `Bio for guitarist ${i}`,
        primary_role: "guitarist" as const,
        instruments: ["Guitar"],
        genres: ["Rock", "Jazz"],
        experience: "intermediate" as const,
        location: "New York",
        avatar_url: undefined,
        profile_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const drummers = Array.from({ length: 50 }, (_, i) => ({
        ...guitarists[0],
        id: `drummer-${i}`,
        email: `drummer${i}@example.com`,
        name: `Drummer ${i}`,
        primary_role: "drummer" as const,
        instruments: ["Drums"],
      }));

      const bassists = Array.from({ length: 50 }, (_, i) => ({
        ...guitarists[0],
        id: `bassist-${i}`,
        email: `bassist${i}@example.com`,
        name: `Bassist ${i}`,
        primary_role: "bassist" as const,
        instruments: ["Bass"],
      }));

      const singers = Array.from({ length: 50 }, (_, i) => ({
        ...guitarists[0],
        id: `singer-${i}`,
        email: `singer${i}@example.com`,
        name: `Singer ${i}`,
        primary_role: "singer" as const,
        instruments: ["Vocals"],
      }));

      const allUsers = [...guitarists, ...drummers, ...bassists, ...singers];

      const startTime = performance.now();

      const potentialBands = findPotentialBands(allUsers);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within 5 seconds for 200 users with optimal role distribution
      expect(executionTime).toBeLessThan(5000);
      expect(potentialBands.length).toBeGreaterThan(0);

      console.log(
        `Complex band formation for 200 users: ${executionTime.toFixed(2)}ms`
      );
      console.log(`Found ${potentialBands.length} potential bands`);
    });
  });

  describe("Memory Usage Tests", () => {
    test("should not cause memory leaks with large datasets", async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Process multiple large datasets
      for (let i = 0; i < 10; i++) {
        const users = createTestUsers(1000);
        const targetUser = users[0];
        const candidates = users.slice(1);

        findCompatibleUsers(targetUser, candidates);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);

      console.log(
        `Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`
      );
    });

    test("should handle concurrent calculations efficiently", async () => {
      const users = createTestUsers(500);
      const targetUsers = users.slice(0, 10);
      const candidates = users.slice(10);

      const startTime = performance.now();

      // Run multiple compatibility calculations concurrently
      const promises = targetUsers.map((targetUser) =>
        Promise.resolve(findCompatibleUsers(targetUser, candidates))
      );

      const results = await Promise.all(promises);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within 3 seconds for 10 concurrent calculations
      expect(executionTime).toBeLessThan(3000);
      expect(results.length).toBe(10);
      results.forEach((matches) => {
        expect(matches.length).toBeGreaterThanOrEqual(0);
      });

      console.log(
        `Concurrent calculations (10 users vs 490): ${executionTime.toFixed(
          2
        )}ms`
      );
    });
  });

  describe("Edge Cases Performance", () => {
    test("should handle users with no compatible matches efficiently", async () => {
      // Create a target user with very specific requirements
      const targetUser: User = {
        id: "unique-user",
        email: "unique@example.com",
        name: "Unique User",
        bio: "Very specific requirements",
        primary_role: "guitarist",
        instruments: ["Guitar"],
        genres: ["VeryRareGenre"], // Genre that no other user will have
        experience: "professional",
        location: "VeryRareLocation", // Location that no other user will have
        avatar_url: undefined,
        profile_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const candidates = createTestUsers(1000);

      const startTime = performance.now();

      const matches = findCompatibleUsers(targetUser, candidates);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should still complete quickly even with no matches
      expect(executionTime).toBeLessThan(1000);
      expect(matches.length).toBe(0);

      console.log(
        `No matches scenario for 1000 users: ${executionTime.toFixed(2)}ms`
      );
    });

    test("should handle users with maximum compatibility efficiently", async () => {
      // Create users that will all be highly compatible
      const baseUser: Omit<User, "id" | "email" | "name"> = {
        bio: "Compatible user",
        primary_role: "guitarist",
        instruments: ["Guitar"],
        genres: ["Rock", "Jazz", "Blues"],
        experience: "intermediate",
        location: "New York",
        avatar_url: undefined,
        profile_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const targetUser: User = {
        ...baseUser,
        id: "target-user",
        email: "target@example.com",
        name: "Target User",
      };

      const candidates: User[] = Array.from({ length: 1000 }, (_, i) => ({
        ...baseUser,
        id: `candidate-${i}`,
        email: `candidate${i}@example.com`,
        name: `Candidate ${i}`,
      }));

      const startTime = performance.now();

      const matches = findCompatibleUsers(targetUser, candidates);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete quickly even with all matches being highly compatible
      expect(executionTime).toBeLessThan(1000);
      expect(matches.length).toBe(1000); // All should be compatible

      console.log(
        `All matches scenario for 1000 users: ${executionTime.toFixed(2)}ms`
      );
    });
  });

  describe("Algorithmic Complexity", () => {
    test("should demonstrate O(n) complexity for compatibility calculation", async () => {
      const sizes = [100, 200, 400, 800];
      const times: number[] = [];

      for (const size of sizes) {
        const users = createTestUsers(size);
        const targetUser = users[0];
        const candidates = users.slice(1);

        const startTime = performance.now();
        findCompatibleUsers(targetUser, candidates);
        const endTime = performance.now();

        times.push(endTime - startTime);
      }

      // Each doubling should roughly double the time (O(n) complexity)
      for (let i = 1; i < times.length; i++) {
        const ratio = times[i] / times[i - 1];
        // Allow for variance but should be roughly 2x
        expect(ratio).toBeGreaterThan(1.5);
        expect(ratio).toBeLessThan(3);
      }

      console.log(`Complexity test - sizes: ${sizes.join(", ")}`);
      console.log(`Times: ${times.map((t) => t.toFixed(2)).join(", ")}ms`);
    });

    test("should demonstrate efficient sorting performance", async () => {
      const users = createTestUsers(10000);
      const targetUser = users[0];
      const candidates = users.slice(1);

      // Calculate all compatibility scores
      const startCalc = performance.now();
      const matches = findCompatibleUsers(targetUser, candidates);
      const endCalc = performance.now();

      // Verify sorting is correct
      for (let i = 1; i < matches.length; i++) {
        expect(matches[i].compatibility.score).toBeLessThanOrEqual(
          matches[i - 1].compatibility.score
        );
      }

      const calcTime = endCalc - startCalc;
      console.log(`Sorting 10000 matches: ${calcTime.toFixed(2)}ms`);

      // Should complete within reasonable time
      expect(calcTime).toBeLessThan(5000);
    });
  });
});
