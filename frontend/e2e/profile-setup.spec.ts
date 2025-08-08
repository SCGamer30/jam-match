import { test, expect } from "@playwright/test";

test.describe("Profile Setup Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "supabase.auth.token",
        JSON.stringify({
          access_token: "mock-token",
          user: {
            id: "test-user-id",
            email: "test@example.com",
            profile_completed: false,
          },
        })
      );
    });

    await page.goto("/profile/setup");
  });

  test("should complete profile setup wizard", async ({ page }) => {
    // Step 1: Basic Info
    await expect(
      page.locator('h2:has-text("Basic Information")')
    ).toBeVisible();

    await page.fill('input[name="name"]', "John Doe");
    await page.fill(
      'textarea[name="bio"]',
      "Passionate musician with 5 years of experience"
    );
    await page.fill('input[name="location"]', "New York, NY");
    await page.selectOption('select[name="experience"]', "intermediate");

    await page.click('button:has-text("Next")');

    // Step 2: Musical Preferences
    await expect(
      page.locator('h2:has-text("Musical Preferences")')
    ).toBeVisible();

    // Select genres
    await page.click('label:has-text("Rock")');
    await page.click('label:has-text("Jazz")');
    await page.click('label:has-text("Blues")');

    // Select primary role
    await page.click('label:has-text("Guitarist")');

    await page.click('button:has-text("Next")');

    // Step 3: Instruments
    await expect(page.locator('h2:has-text("Instruments")')).toBeVisible();

    // Select instruments
    await page.click('label:has-text("Guitar")');
    await page.click('label:has-text("Piano")');

    await page.click('button:has-text("Complete Profile")');

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");

    // Should show success message
    await expect(
      page.locator("text=Profile completed successfully")
    ).toBeVisible();
  });

  test("should validate required fields in each step", async ({ page }) => {
    // Step 1: Try to proceed without filling required fields
    await page.click('button:has-text("Next")');

    // Should show validation errors
    await expect(page.locator("text=Name is required")).toBeVisible();
    await expect(
      page.locator("text=Experience level is required")
    ).toBeVisible();

    // Fill required fields
    await page.fill('input[name="name"]', "John Doe");
    await page.selectOption('select[name="experience"]', "intermediate");

    await page.click('button:has-text("Next")');

    // Step 2: Try to proceed without selections
    await page.click('button:has-text("Next")');

    // Should show validation errors
    await expect(
      page.locator("text=At least one genre is required")
    ).toBeVisible();
    await expect(page.locator("text=Primary role is required")).toBeVisible();

    // Make selections
    await page.click('label:has-text("Rock")');
    await page.click('label:has-text("Guitarist")');

    await page.click('button:has-text("Next")');

    // Step 3: Try to complete without instruments
    await page.click('button:has-text("Complete Profile")');

    // Should show validation error
    await expect(
      page.locator("text=At least one instrument is required")
    ).toBeVisible();
  });

  test("should allow navigation between steps", async ({ page }) => {
    // Fill step 1
    await page.fill('input[name="name"]', "John Doe");
    await page.selectOption('select[name="experience"]', "intermediate");
    await page.click('button:has-text("Next")');

    // Go to step 2
    await expect(
      page.locator('h2:has-text("Musical Preferences")')
    ).toBeVisible();

    // Go back to step 1
    await page.click('button:has-text("Back")');
    await expect(
      page.locator('h2:has-text("Basic Information")')
    ).toBeVisible();

    // Data should be preserved
    await expect(page.locator('input[name="name"]')).toHaveValue("John Doe");
    await expect(page.locator('select[name="experience"]')).toHaveValue(
      "intermediate"
    );

    // Go forward again
    await page.click('button:has-text("Next")');
    await expect(
      page.locator('h2:has-text("Musical Preferences")')
    ).toBeVisible();

    // Fill step 2
    await page.click('label:has-text("Rock")');
    await page.click('label:has-text("Guitarist")');
    await page.click('button:has-text("Next")');

    // Go to step 3
    await expect(page.locator('h2:has-text("Instruments")')).toBeVisible();

    // Go back to step 2
    await page.click('button:has-text("Back")');
    await expect(
      page.locator('h2:has-text("Musical Preferences")')
    ).toBeVisible();

    // Selections should be preserved
    await expect(page.locator('label:has-text("Rock") input')).toBeChecked();
    await expect(
      page.locator('label:has-text("Guitarist") input')
    ).toBeChecked();
  });

  test("should show progress indicator", async ({ page }) => {
    // Should show step 1 as active
    await expect(page.locator('[data-testid="step-indicator-1"]')).toHaveClass(
      /active/
    );
    await expect(
      page.locator('[data-testid="step-indicator-2"]')
    ).not.toHaveClass(/active/);
    await expect(
      page.locator('[data-testid="step-indicator-3"]')
    ).not.toHaveClass(/active/);

    // Move to step 2
    await page.fill('input[name="name"]', "John Doe");
    await page.selectOption('select[name="experience"]', "intermediate");
    await page.click('button:has-text("Next")');

    // Should show step 2 as active
    await expect(page.locator('[data-testid="step-indicator-1"]')).toHaveClass(
      /completed/
    );
    await expect(page.locator('[data-testid="step-indicator-2"]')).toHaveClass(
      /active/
    );
    await expect(
      page.locator('[data-testid="step-indicator-3"]')
    ).not.toHaveClass(/active/);

    // Move to step 3
    await page.click('label:has-text("Rock")');
    await page.click('label:has-text("Guitarist")');
    await page.click('button:has-text("Next")');

    // Should show step 3 as active
    await expect(page.locator('[data-testid="step-indicator-1"]')).toHaveClass(
      /completed/
    );
    await expect(page.locator('[data-testid="step-indicator-2"]')).toHaveClass(
      /completed/
    );
    await expect(page.locator('[data-testid="step-indicator-3"]')).toHaveClass(
      /active/
    );
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Mock API to return error
    await page.route("**/api/users/profile/setup", (route) => {
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

    // Complete all steps
    await page.fill('input[name="name"]', "John Doe");
    await page.selectOption('select[name="experience"]', "intermediate");
    await page.click('button:has-text("Next")');

    await page.click('label:has-text("Rock")');
    await page.click('label:has-text("Guitarist")');
    await page.click('button:has-text("Next")');

    await page.click('label:has-text("Guitar")');
    await page.click('button:has-text("Complete Profile")');

    // Should show error message
    await expect(
      page.locator("text=Failed to complete profile setup")
    ).toBeVisible();

    // Should remain on the same page
    await expect(page).toHaveURL("/profile/setup");
  });

  test("should redirect completed profiles", async ({ page }) => {
    // Mock user with completed profile
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "supabase.auth.token",
        JSON.stringify({
          access_token: "mock-token",
          user: {
            id: "test-user-id",
            email: "test@example.com",
            profile_completed: true,
          },
        })
      );
    });

    await page.goto("/profile/setup");

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
  });

  test("should be mobile responsive", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Should display properly on mobile
    await expect(
      page.locator('h2:has-text("Basic Information")')
    ).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();

    // Form elements should be touch-friendly
    const nameInput = page.locator('input[name="name"]');
    const boundingBox = await nameInput.boundingBox();
    expect(boundingBox?.height).toBeGreaterThan(40); // Minimum touch target size

    // Navigation buttons should be accessible
    await expect(page.locator('button:has-text("Next")')).toBeVisible();
  });
});
