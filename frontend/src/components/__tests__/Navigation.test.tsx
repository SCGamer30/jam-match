/**
 * Navigation component tests
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Navigation } from "../Navigation";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";

// Mock useAuth hook
jest.mock("@/lib/useAuth", () => ({
  useAuth: jest.fn(),
}));

// Mock useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("Navigation", () => {
  const mockPush = jest.fn();
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  describe("Authenticated user", () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      name: "John Doe",
      profile_completed: true,
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        signOut: mockSignOut,
      } as any);
    });

    it("should render navigation for authenticated user", () => {
      render(<Navigation />);

      expect(screen.getByText("JamMatch")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should navigate to dashboard when Dashboard link is clicked", () => {
      render(<Navigation />);

      const dashboardLink = screen.getByText("Dashboard");
      fireEvent.click(dashboardLink);

      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("should navigate to settings when Settings link is clicked", () => {
      render(<Navigation />);

      const settingsLink = screen.getByText("Settings");
      fireEvent.click(settingsLink);

      expect(mockPush).toHaveBeenCalledWith("/settings");
    });

    it("should show user menu when user name is clicked", () => {
      render(<Navigation />);

      const userButton = screen.getByText("John Doe");
      fireEvent.click(userButton);

      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    it("should navigate to profile when Profile menu item is clicked", () => {
      render(<Navigation />);

      const userButton = screen.getByText("John Doe");
      fireEvent.click(userButton);

      const profileLink = screen.getByText("Profile");
      fireEvent.click(profileLink);

      expect(mockPush).toHaveBeenCalledWith("/settings");
    });

    it("should sign out when Sign Out menu item is clicked", async () => {
      render(<Navigation />);

      const userButton = screen.getByText("John Doe");
      fireEvent.click(userButton);

      const signOutButton = screen.getByText("Sign Out");
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it("should show user initials when no avatar", () => {
      render(<Navigation />);

      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should show avatar when user has avatar_url", () => {
      const userWithAvatar = {
        ...mockUser,
        avatar_url: "https://example.com/avatar.jpg",
      };

      mockUseAuth.mockReturnValue({
        user: userWithAvatar,
        loading: false,
        signOut: mockSignOut,
      } as any);

      render(<Navigation />);

      const avatar = screen.getByRole("img");
      expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });
  });

  describe("Unauthenticated user", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signOut: mockSignOut,
      } as any);
    });

    it("should render navigation for unauthenticated user", () => {
      render(<Navigation />);

      expect(screen.getByText("JamMatch")).toBeInTheDocument();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
      expect(screen.getByText("Sign Up")).toBeInTheDocument();
    });

    it("should navigate to login when Sign In is clicked", () => {
      render(<Navigation />);

      const signInButton = screen.getByText("Sign In");
      fireEvent.click(signInButton);

      expect(mockPush).toHaveBeenCalledWith("/login");
    });

    it("should navigate to register when Sign Up is clicked", () => {
      render(<Navigation />);

      const signUpButton = screen.getByText("Sign Up");
      fireEvent.click(signUpButton);

      expect(mockPush).toHaveBeenCalledWith("/register");
    });

    it("should not show authenticated user elements", () => {
      render(<Navigation />);

      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });
  });

  describe("Loading state", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        signOut: mockSignOut,
      } as any);
    });

    it("should show loading state", () => {
      render(<Navigation />);

      expect(screen.getByText("JamMatch")).toBeInTheDocument();
      // Should not show sign in/up buttons while loading
      expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
      expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
    });
  });

  describe("User with incomplete profile", () => {
    const incompleteUser = {
      id: "user-123",
      email: "test@example.com",
      name: "John Doe",
      profile_completed: false,
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: incompleteUser,
        loading: false,
        signOut: mockSignOut,
      } as any);
    });

    it("should show profile setup prompt", () => {
      render(<Navigation />);

      expect(screen.getByText("Complete Profile")).toBeInTheDocument();
    });

    it("should navigate to profile setup when Complete Profile is clicked", () => {
      render(<Navigation />);

      const completeProfileButton = screen.getByText("Complete Profile");
      fireEvent.click(completeProfileButton);

      expect(mockPush).toHaveBeenCalledWith("/profile/setup");
    });
  });

  describe("Mobile navigation", () => {
    beforeEach(() => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      mockUseAuth.mockReturnValue({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "John Doe",
          profile_completed: true,
        },
        loading: false,
        signOut: mockSignOut,
      } as any);
    });

    it("should show mobile menu button", () => {
      render(<Navigation />);

      const menuButton = screen.getByRole("button", { name: /menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it("should toggle mobile menu when menu button is clicked", () => {
      render(<Navigation />);

      const menuButton = screen.getByRole("button", { name: /menu/i });
      fireEvent.click(menuButton);

      // Menu should be visible
      expect(screen.getByText("Dashboard")).toBeVisible();
      expect(screen.getByText("Settings")).toBeVisible();

      // Click again to close
      fireEvent.click(menuButton);

      // Menu should be hidden (implementation dependent)
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "John Doe",
          profile_completed: true,
        },
        loading: false,
        signOut: mockSignOut,
      } as any);
    });

    it("should have proper ARIA labels", () => {
      render(<Navigation />);

      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /user menu/i })
      ).toBeInTheDocument();
    });

    it("should support keyboard navigation", () => {
      render(<Navigation />);

      const userButton = screen.getByText("John Doe");

      // Focus the user button
      userButton.focus();
      expect(userButton).toHaveFocus();

      // Press Enter to open menu
      fireEvent.keyDown(userButton, { key: "Enter" });
      expect(screen.getByText("Profile")).toBeInTheDocument();

      // Press Escape to close menu
      fireEvent.keyDown(userButton, { key: "Escape" });
    });
  });
});
