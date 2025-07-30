/**
 * Dashboard page tests
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { userApi, bandsApi, matchingApi } from "@/lib/api";
import DashboardPage from "../page";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { it } from "node:test";
import { beforeEach } from "node:test";
import { describe } from "node:test";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  userApi: {
    getProfile: jest.fn(),
  },
  bandsApi: {
    getUserBands: jest.fn(),
  },
  matchingApi: {
    getUserMatches: jest.fn(),
    requestAIAnalysis: jest.fn(),
  },
}));

jest.mock("@/components/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockRouter = {
  push: jest.fn(),
};

const mockUser = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  primary_role: "guitarist" as const,
  instruments: ["Guitar", "Piano"],
  genres: ["Rock", "Jazz"],
  experience: "intermediate" as const,
  location: "New York",
  profile_completed: true,
};

const mockBand = {
  id: "band-1",
  name: "Test Band",
  drummer_id: "user-2",
  guitarist_id: "user-1",
  bassist_id: "user-3",
  singer_id: "user-4",
  status: "active" as const,
  compatibility_data: {},
  formation_date: "2024-01-01T00:00:00Z",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  members: [
    { ...mockUser, id: "user-1", primary_role: "guitarist" as const },
    {
      ...mockUser,
      id: "user-2",
      name: "Jane Drummer",
      primary_role: "drummer" as const,
    },
    {
      ...mockUser,
      id: "user-3",
      name: "Bob Bassist",
      primary_role: "bassist" as const,
    },
    {
      ...mockUser,
      id: "user-4",
      name: "Alice Singer",
      primary_role: "singer" as const,
    },
  ],
};

const mockMatch = {
  user: {
    ...mockUser,
    id: "user-5",
    name: "Compatible Musician",
    primary_role: "drummer" as const,
  },
  compatibility_score: 85,
  reasoning: "Great match based on shared genres and location",
  breakdown: {
    locationScore: 50,
    genreScore: 20,
    experienceScore: 15,
  },
};

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: "john@example.com" },
      signOut: jest.fn(),
    });
  });

  it("shows loading state initially", () => {
    (userApi.getProfile as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<DashboardPage />);

    expect(screen.getByText("Loading your dashboard...")).toBeInTheDocument();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument(); // Loading spinner
  });

  it("shows profile incomplete state when profile is not completed", async () => {
    const incompleteUser = { ...mockUser, profile_completed: false };
    (userApi.getProfile as jest.Mock).mockResolvedValue(incompleteUser);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Complete Your Profile")).toBeInTheDocument();
    });

    expect(screen.getByText("Complete Profile Setup")).toBeInTheDocument();
    expect(screen.getByText(/Set up your musical profile/)).toBeInTheDocument();
  });

  it("navigates to profile setup when complete profile button is clicked", async () => {
    const incompleteUser = { ...mockUser, profile_completed: false };
    (userApi.getProfile as jest.Mock).mockResolvedValue(incompleteUser);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Complete Profile Setup")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Complete Profile Setup"));
    expect(mockRouter.push).toHaveBeenCalledWith("/profile/setup");
  });

  it("displays dashboard content when profile is completed", async () => {
    (userApi.getProfile as jest.Mock).mockResolvedValue(mockUser);
    (bandsApi.getUserBands as jest.Mock).mockResolvedValue({
      bands: [mockBand],
      total: 1,
    });
    (matchingApi.getUserMatches as jest.Mock).mockResolvedValue({
      matches: [mockMatch],
      total_matches: 1,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Welcome back, John Doe")).toBeInTheDocument();
    });

    // Check status overview
    expect(screen.getByText("Profile Status")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByText("Active Bands")).toBeInTheDocument();
    expect(screen.getAllByText("Potential Matches")).toHaveLength(2); // Header and section

    // Check bands section
    expect(screen.getByText("Your Bands")).toBeInTheDocument();
    expect(screen.getByText("Test Band")).toBeInTheDocument();

    // Check matches section
    expect(screen.getByText("Compatible Musician")).toBeInTheDocument();
  });

  it("shows empty states when no bands or matches", async () => {
    (userApi.getProfile as jest.Mock).mockResolvedValue(mockUser);
    (bandsApi.getUserBands as jest.Mock).mockResolvedValue({
      bands: [],
      total: 0,
    });
    (matchingApi.getUserMatches as jest.Mock).mockResolvedValue({
      matches: [],
      total_matches: 0,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("No Bands Yet")).toBeInTheDocument();
    });

    expect(screen.getByText("No Matches Found")).toBeInTheDocument();
    expect(
      screen.getByText(/When you match with compatible musicians/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We're looking for compatible musicians/)
    ).toBeInTheDocument();
  });

  it("handles refresh functionality", async () => {
    (userApi.getProfile as jest.Mock).mockResolvedValue(mockUser);
    (bandsApi.getUserBands as jest.Mock).mockResolvedValue({
      bands: [],
      total: 0,
    });
    (matchingApi.getUserMatches as jest.Mock).mockResolvedValue({
      matches: [],
      total_matches: 0,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole("button", { name: "Refresh" });
    fireEvent.click(refreshButton);

    // Should call APIs again
    await waitFor(() => {
      expect(userApi.getProfile).toHaveBeenCalledTimes(2);
    });
  });

  it("handles navigation to band and chat pages", async () => {
    (userApi.getProfile as jest.Mock).mockResolvedValue(mockUser);
    (bandsApi.getUserBands as jest.Mock).mockResolvedValue({
      bands: [mockBand],
      total: 1,
    });
    (matchingApi.getUserMatches as jest.Mock).mockResolvedValue({
      matches: [],
      total_matches: 0,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Band")).toBeInTheDocument();
    });

    // Test view band navigation
    const viewBandButton = screen.getByRole("button", { name: /view band/i });
    fireEvent.click(viewBandButton);
    expect(mockRouter.push).toHaveBeenCalledWith("/band/band-1");

    // Test chat navigation
    const chatButton = screen.getByRole("button", { name: /chat/i });
    fireEvent.click(chatButton);
    expect(mockRouter.push).toHaveBeenCalledWith("/chat/band-1");
  });

  it("handles AI analysis request", async () => {
    (userApi.getProfile as jest.Mock).mockResolvedValue(mockUser);
    (bandsApi.getUserBands as jest.Mock).mockResolvedValue({
      bands: [],
      total: 0,
    });
    (matchingApi.getUserMatches as jest.Mock).mockResolvedValue({
      matches: [mockMatch],
      total_matches: 1,
    });
    (matchingApi.requestAIAnalysis as jest.Mock).mockResolvedValue({
      compatibility_score: 90,
      reasoning: "Excellent compatibility based on AI analysis",
      model_used: "ai",
      fallback_used: false,
      timestamp: "2024-01-01T00:00:00Z",
    });

    // Mock window.alert
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Compatible Musician")).toBeInTheDocument();
    });

    const aiAnalysisButton = screen.getByRole("button", {
      name: /ai analysis/i,
    });
    fireEvent.click(aiAnalysisButton);

    await waitFor(() => {
      expect(matchingApi.requestAIAnalysis).toHaveBeenCalledWith(
        "user-1",
        "user-5"
      );
    });

    expect(alertSpy).toHaveBeenCalledWith(
      "AI Analysis: Excellent compatibility based on AI analysis (Score: 90)"
    );

    alertSpy.mockRestore();
  });

  it("displays error state when API calls fail", async () => {
    (userApi.getProfile as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("API Error")).toBeInTheDocument();
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("handles sign out", async () => {
    const mockSignOut = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: "john@example.com" },
      signOut: mockSignOut,
    });
    (userApi.getProfile as jest.Mock).mockResolvedValue(mockUser);
    (bandsApi.getUserBands as jest.Mock).mockResolvedValue({
      bands: [],
      total: 0,
    });
    (matchingApi.getUserMatches as jest.Mock).mockResolvedValue({
      matches: [],
      total_matches: 0,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });
});
