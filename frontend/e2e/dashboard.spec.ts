import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state with completed profile
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "supabase.auth.token",
        JSON.stringify({
          access_token: "mock-token",
          user: {
            id: "test-user-id",
            email: "test@example.com",
            name: "John Doe",
            profile_completed: true,
          },
        })
      );
    });

    // Mock API responses
    await page.route("**/api/users/profile", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-user-id",
          name: "John Doe",
          email: "test@example.com",
          profile_completed: true,
          primary_role: "guitarist",
          instruments: ["Guitar", "Piano"],
          genres: ["Rock", "Jazz"],
          experience: "intermediate",
          location: "New York, NY",
        }),
      });
    });

    await page.route("**/api/bands", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          bands: [
            {
              id: "band-1",
              name: "The Rock Stars",
              status: "active",
              formation_date: "2024-01-15T10:30:00Z",
              members: [
                {
                  id: "test-user-id",
                  name: "John Doe",
                  primary_role: "guitarist",
                  instruments: ["Guitar"],
                  avatar_url: null,
                },
                {
                  id: "user-2",
                  name: "Jane Smith",
                  primary_role: "drummer",
                  instruments: ["Drums"],
                  avatar_url: null,
                },
              ],
              compatibility_data: {
                average_score: 78,
              },
            },
          ],
        }),
      });
    });

    await page.route("**/api/users/matches", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          matches: [
            {
              user: {
                id: "user-3",
                name: "Bob Wilson",
                primary_role: "bassist",
                instruments: ["Bass Guitar"],
                genres: ["Rock", "Blues"],
                experience: "intermediate",
                location: "New York, NY",
                avatar_url: null,
              },
              compatibility: {
                score: 85,
                reasoning:
                  "High compatibility based on shared location and musical preferences",
              },
            },
            {
              user: {
                id: "user-4",
                name: "Alice Johnson",
                primary_role: "singer",
                instruments: ["Vocals"],
                genres: ["Jazz", "Pop"],
                experience: "advanced",
                location: "New York, NY",
                avatar_url: null,
              },
              compatibility: {
                score: 72,
                reasoning:
                  "Good compatibility with some shared musical interests",
              },
            },
          ],
        }),
      });
    });

    await page.goto("/dashboard");
  });

  test("should display user dashboard with bands and matches", async ({
    page,
  }) => {
    // Should show welcome message
    await expect(page.locator("text=Welcome back, John Doe")).toBeVisible();

    // Should show current bands section
    await expect(page.locator('h2:has-text("Your Bands")')).toBeVisible();
    await expect(page.locator("text=The Rock Stars")).toBeVisible();
    await expect(page.locator("text=78%")).toBeVisible(); // Compatibility score

    // Should show potential matches section
    await expect(
      page.locator('h2:has-text("Potential Matches")')
    ).toBeVisible();
    await expect(page.locator("text=Bob Wilson")).toBeVisible();
    await expect(page.locator("text=Alice Johnson")).toBeVisible();
    await expect(page.locator("text=85%")).toBeVisible(); // Highest compatibility score
  });

  test("should navigate to band profile when band is clicked", async ({
    page,
  }) => {
    // Mock band profile API
    await page.route("**/api/bands/band-1", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "band-1",
          name: "The Rock Stars",
          members: [
            {
              id: "test-user-id",
              name: "John Doe",
              primary_role: "guitarist",
            },
            {
              id: "user-2",
              name: "Jane Smith",
              primary_role: "drummer",
            },
          ],
        }),
      });
    });

    // Click on band card
    await page.click('[data-testid="band-card-band-1"]');

    // Should navigate to band profile
    await expect(page).toHaveURL("/band/band-1");
  });

  test("should navigate to chat when chat button is clicked", async ({
    page,
  }) => {
    // Click on chat button
    await page.click('[data-testid="chat-button-band-1"]');

    // Should navigate to chat
    await expect(page).toHaveURL("/chat/band-1");
  });

  test("should display empty state when no bands", async ({ page }) => {
    // Mock empty bands response
    await page.route("**/api/bands", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ bands: [] }),
      });
    });

    await page.reload();

    // Should show empty state
    await expect(page.locator("text=No bands yet")).toBeVisible();
    await expect(
      page.locator(
        "text=Complete your profile to start finding compatible musicians"
      )
    ).toBeVisible();
  });

  test("should display empty state when no matches", async ({ page }) => {
    // Mock empty matches response
    await page.route("**/api/users/matches", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ matches: [] }),
      });
    });

    await page.reload();

    // Should show empty state
    await expect(page.locator("text=No matches found")).toBeVisible();
    await expect(
      page.locator("text=We're looking for compatible musicians for you")
    ).toBeVisible();
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Mock API error
    await page.route("**/api/bands", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "SERVER_ERROR",
            message: "Internal server error",
          },
        }),
      });
    });

    await page.reload();

    // Should show error message
    await expect(page.locator("text=Failed to load bands")).toBeVisible();
  });

  test("should refresh data when refresh button is clicked", async ({
    page,
  }) => {
    let requestCount = 0;

    await page.route("**/api/bands", (route) => {
      requestCount++;
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          bands: [
            {
              id: "band-1",
              name: `Band ${requestCount}`,
              status: "active",
              members: [],
              compatibility_data: { average_score: 75 },
            },
          ],
        }),
      });
    });

    // Initial load
    await page.reload();
    await expect(page.locator("text=Band 1")).toBeVisible();

    // Click refresh button
    await page.click('[data-testid="refresh-button"]');

    // Should show updated data
    await expect(page.locator("text=Band 2")).toBeVisible();
    expect(requestCount).toBe(2);
  });

  test("should be mobile responsive", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Should display properly on mobile
    await expect(page.locator("text=Welcome back, John Doe")).toBeVisible();
    await expect(page.locator('h2:has-text("Your Bands")')).toBeVisible();

    // Cards should stack vertically on mobile
    const bandCard = page.locator('[data-testid="band-card-band-1"]');
    const boundingBox = await bandCard.boundingBox();
    expect(boundingBox?.width).toBeLessThan(400); // Should be narrow on mobile

    // Navigation should be accessible
    await expect(
      page.locator('[data-testid="mobile-menu-button"]')
    ).toBeVisible();
  });

  test("should show real-time updates", async ({ page }) => {
    // Mock WebSocket connection for real-time updates
    await page.addInitScript(() => {
      // Mock WebSocket
      (window as any).mockWebSocket = {
        send: jest.fn(),
        close: jest.fn(),
        addEventListener: jest.fn(),
      };
    });

    // Simulate receiving a new band formation
    await page.evaluate(() => {
      const event = new CustomEvent("bandFormed", {
        detail: {
          band: {
            id: "band-2",
            name: "New Band",
            status: "active",
            members: [],
            compatibility_data: { average_score: 80 },
          },
        },
      });
      window.dispatchEvent(event);
    });

    // Should show notification
    await expect(page.locator("text=New band formed!")).toBeVisible();

    // Should update the bands list
    await expect(page.locator("text=New Band")).toBeVisible();
  });

  test("should filter and search functionality", async ({ page }) => {
    // Should have search input
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

    // Type in search
    await page.fill('input[placeholder*="Search"]', "Bob");

    // Should filter matches
    await expect(page.locator("text=Bob Wilson")).toBeVisible();
    await expect(page.locator("text=Alice Johnson")).not.toBeVisible();

    // Clear search
    await page.fill('input[placeholder*="Search"]', "");

    // Should show all matches again
    await expect(page.locator("text=Bob Wilson")).toBeVisible();
    await expect(page.locator("text=Alice Johnson")).toBeVisible();
  });
});
