import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto("/");
  });

  test("should allow user to register and login", async ({ page }) => {
    // Navigate to register page
    await page.click("text=Sign Up");
    await expect(page).toHaveURL("/register");

    // Fill registration form
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "TestPassword123";

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);

    // Submit registration
    await page.click('button[type="submit"]');

    // Should redirect to profile setup or dashboard
    await expect(page).toHaveURL(/\/(profile\/setup|dashboard)/);

    // Sign out
    await page.click('[data-testid="user-menu"]');
    await page.click("text=Sign Out");

    // Should redirect to home page
    await expect(page).toHaveURL("/");

    // Now test login
    await page.click("text=Sign In");
    await expect(page).toHaveURL("/login");

    // Fill login form
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // Submit login
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
  });

  test("should show validation errors for invalid registration", async ({
    page,
  }) => {
    await page.click("text=Sign Up");
    await expect(page).toHaveURL("/register");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator("text=Email is required")).toBeVisible();
    await expect(page.locator("text=Password is required")).toBeVisible();

    // Try with invalid email
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "weak");
    await page.fill('input[name="confirmPassword"]', "different");

    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator("text=Invalid email format")).toBeVisible();
    await expect(
      page.locator("text=Password must be at least 8 characters")
    ).toBeVisible();
    await expect(page.locator("text=Passwords do not match")).toBeVisible();
  });

  test("should show error for invalid login credentials", async ({ page }) => {
    await page.click("text=Sign In");
    await expect(page).toHaveURL("/login");

    // Try with invalid credentials
    await page.fill('input[name="email"]', "nonexistent@example.com");
    await page.fill('input[name="password"]', "wrongpassword");

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator("text=Invalid credentials")).toBeVisible();
  });

  test("should redirect unauthenticated users from protected routes", async ({
    page,
  }) => {
    // Try to access dashboard without authentication
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL("/login");

    // Try to access settings
    await page.goto("/settings");

    // Should redirect to login
    await expect(page).toHaveURL("/login");

    // Try to access profile setup
    await page.goto("/profile/setup");

    // Should redirect to login
    await expect(page).toHaveURL("/login");
  });

  test("should handle session persistence", async ({ page, context }) => {
    // Register and login
    await page.click("text=Sign Up");
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "TestPassword123";

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL(/\/(profile\/setup|dashboard)/);

    // Create new page in same context (simulates new tab)
    const newPage = await context.newPage();
    await newPage.goto("/dashboard");

    // Should be authenticated in new page
    await expect(newPage).toHaveURL("/dashboard");

    // Close new page
    await newPage.close();
  });
});
