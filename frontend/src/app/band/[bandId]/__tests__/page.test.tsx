/**
 * Integration tests for Band Profile Page
 *
 * Tests the band profile page functionality including:
 * - Loading states and error handling
 * - Member display and compatibility scores
 * - Access control and navigation
 * - AI reasoning display
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useParams, useRouter } from "next/navigation";
import BandProfilePage from "../page";
import { bandsApi } from "@/lib/api";
import { Band, User, CompatibilityScore } from "@/types/dashboard";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock API
jest.mock("@/lib/api", () => ({
  bandsApi: {
    getBandDetails: jest.fn(),
    getBandMembers: jest.fn(),
  },
}));

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockGetBandDetails = bandsApi.getBandDetails as jest.MockedFunction<
  typeof bandsApi.getBandDetails
>;
const mockGetBandMembers = bandsApi.getBandMembers as jest.MockedFunction<
  typeof bandsApi.getBandMembers
>;

const mockPush = jest.fn();
const mockBack = jest.fn();

// Mock data
const mockUser1: User = {
  id: "user1",
  name: "John Doe",
  bio: "Experienced guitarist with 10 years of playing",
  primary_role: "guitarist",
  instruments: ["guitar", "bass"],
  genres: ["rock", "blues"],
  experience: "advanced",
  location: "New York, NY",
  avatar_url: "https://example.com/avatar1.jpg",
  profile_completed: true,
};

const mockUser2: User = {
  id: "user2",
  name: "Jane Smith",
  bio: "Professional drummer and music producer",
  primary_role: "drummer",
  instruments: ["drums", "percussion"],
  genres: ["rock", "jazz"],
  experience: "professional",
  location: "New York, NY",
  avatar_url: "https://example.com/avatar2.jpg",
  profile_completed: true,
};

const mockBand: Band = {
  id: "band1",
  name: "Rock Legends",
  drummer_id: "user2",
  guitarist_id: "user1",
  bassist_id: "user3",
  singer_id: "user4",
  status: "active",
  compatibility_data: {},
  formation_date: "2024-01-15T10:00:00Z",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
  members: [mockUser1, mockUser2],
  drummer: mockUser2,
  guitarist: mockUser1,
};

const mockCompatibilityScore: CompatibilityScore = {
  id: "score1",
  user1_id: "user1",
  user2_id: "user2",
  algorithmic_score: 85,
  ai_score: 88,
  final_score: 87,
  ai_reasoning:
    "Both musicians have complementary styles and extensive experience in rock music. Their location proximity and shared musical interests make them highly compatible for collaboration.",
  location_score: 50,
  genre_score: 20,
  experience_score: 15,
  calculated_at: "2024-01-15T10:00:00Z",
};

const mockMembersData = {
  band_id: "band1",
  members: [mockUser1, mockUser2],
  compatibility_scores: [mockCompatibilityScore],
  total_members: 2,
};

describe("BandProfilePage", () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ bandId: "band1" });
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: mockBack,
    } as any);

    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should display loading spinner while fetching data", () => {
      mockGetBandDetails.mockImplementation(() => new Promise(() => {})); // Never resolves
      mockGetBandMembers.mockImplementation(() => new Promise(() => {}));

      render(<BandProfilePage />);

      expect(screen.getByText("Loading band profile...")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument(); // Loading spinner
    });
  });

  describe("Error Handling", () => {
    it("should display error message when band fetch fails", async () => {
      const errorMessage = "Failed to fetch band data";
      mockGetBandDetails.mockRejectedValue(new Error(errorMessage));
      mockGetBandMembers.mockRejectedValue(new Error(errorMessage));

      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });

    it("should display access denied message when user is not a band member", async () => {
      mockGetBandDetails.mockRejectedValue(
        new Error("You are not a member of this band")
      );
      mockGetBandMembers.mockRejectedValue(new Error("ACCESS_DENIED"));

      render(<BandProfilePage />);

      await waitFor(() => {
        expect(
          screen.getByText("You are not a member of this band")
        ).toBeInTheDocument();
      });
    });

    it("should handle band not found error", async () => {
      mockGetBandDetails.mockResolvedValue(null as any);
      mockGetBandMembers.mockResolvedValue(null as any);

      render(<BandProfilePage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Band not found or you don't have access to view this band."
          )
        ).toBeInTheDocument();
      });

      expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
    });
  });

  describe("Band Information Display", () => {
    beforeEach(() => {
      mockGetBandDetails.mockResolvedValue(mockBand);
      mockGetBandMembers.mockResolvedValue(mockMembersData);
    });

    it("should display band header information", async () => {
      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("Rock Legends")).toBeInTheDocument();
      });

      expect(screen.getByText("Formed 1/15/2024")).toBeInTheDocument();
      expect(screen.getByText("2 members")).toBeInTheDocument();
      expect(screen.getByText("active")).toBeInTheDocument();
    });

    it("should display default band name when name is not provided", async () => {
      const bandWithoutName = { ...mockBand, name: undefined };
      mockGetBandDetails.mockResolvedValue(bandWithoutName);

      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("Your Band")).toBeInTheDocument();
      });
    });

    it("should display Open Chat button", async () => {
      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("Open Chat")).toBeInTheDocument();
      });
    });
  });

  describe("Member Information Display", () => {
    beforeEach(() => {
      mockGetBandDetails.mockResolvedValue(mockBand);
      mockGetBandMembers.mockResolvedValue(mockMembersData);
    });

    it("should display all band members with their details", async () => {
      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getAllByText("John Doe")).toHaveLength(2); // Appears in member list and compatibility
        expect(screen.getAllByText("Jane Smith")).toHaveLength(2); // Appears in member list and compatibility
      });

      expect(screen.getByText("guitarist")).toBeInTheDocument();
      expect(screen.getByText("drummer")).toBeInTheDocument();
      expect(
        screen.getByText("Experienced guitarist with 10 years of playing")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Professional drummer and music producer")
      ).toBeInTheDocument();
    });

    it("should display member instruments and genres", async () => {
      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("guitar")).toBeInTheDocument();
        expect(screen.getByText("bass")).toBeInTheDocument();
        expect(screen.getByText("drums")).toBeInTheDocument();
        expect(screen.getAllByText("rock")).toHaveLength(2); // Both users have rock genre
        expect(screen.getByText("blues")).toBeInTheDocument();
        expect(screen.getByText("jazz")).toBeInTheDocument();
      });
    });

    it("should display member experience and location", async () => {
      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("advanced")).toBeInTheDocument();
        expect(screen.getByText("professional")).toBeInTheDocument();
        expect(screen.getAllByText("New York, NY")).toHaveLength(2);
      });
    });
  });

  describe("Compatibility Scores Display", () => {
    beforeEach(() => {
      mockGetBandDetails.mockResolvedValue(mockBand);
      mockGetBandMembers.mockResolvedValue(mockMembersData);
    });

    it("should display compatibility matrix between members", async () => {
      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("Member Compatibility")).toBeInTheDocument();
      });

      // Should show compatibility between John and Jane
      expect(screen.getAllByText("John Doe")).toHaveLength(2); // Member list + compatibility
      expect(screen.getAllByText("Jane Smith")).toHaveLength(2); // Member list + compatibility
    });

    it("should display compatibility score breakdown", async () => {
      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("Location")).toBeInTheDocument();
        expect(screen.getByText("50/50")).toBeInTheDocument();
        expect(screen.getByText("Genres")).toBeInTheDocument();
        expect(screen.getByText("20/30")).toBeInTheDocument();
        expect(screen.getByText("Experience")).toBeInTheDocument();
        expect(screen.getByText("15/20")).toBeInTheDocument();
      });
    });

    it("should display AI reasoning when available", async () => {
      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("AI Analysis")).toBeInTheDocument();
        expect(
          screen.getByText(/Both musicians have complementary styles/)
        ).toBeInTheDocument();
      });
    });

    it("should handle missing compatibility scores gracefully", async () => {
      const membersDataWithoutScores = {
        ...mockMembersData,
        compatibility_scores: [],
      };
      mockGetBandMembers.mockResolvedValue(membersDataWithoutScores);

      render(<BandProfilePage />);

      await waitFor(() => {
        expect(
          screen.getByText("Compatibility analysis not available")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    beforeEach(() => {
      mockGetBandDetails.mockResolvedValue(mockBand);
      mockGetBandMembers.mockResolvedValue(mockMembersData);
    });

    it("should navigate to chat when Open Chat button is clicked", async () => {
      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("Open Chat")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Open Chat"));
      expect(mockPush).toHaveBeenCalledWith("/chat/band1");
    });

    it("should navigate back when Go Back button is clicked on error", async () => {
      mockGetBandDetails.mockRejectedValue(new Error("Test error"));
      mockGetBandMembers.mockRejectedValue(new Error("Test error"));

      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("Go Back")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Go Back"));
      expect(mockBack).toHaveBeenCalled();
    });

    it("should navigate to dashboard when Back to Dashboard is clicked", async () => {
      mockGetBandDetails.mockResolvedValue(null as any);
      mockGetBandMembers.mockResolvedValue(null as any);

      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("Back to Dashboard")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Back to Dashboard"));
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("Access Control", () => {
    it("should fetch band data on component mount", async () => {
      mockGetBandDetails.mockResolvedValue(mockBand);
      mockGetBandMembers.mockResolvedValue(mockMembersData);

      render(<BandProfilePage />);

      await waitFor(() => {
        expect(mockGetBandDetails).toHaveBeenCalledWith("band1");
        expect(mockGetBandMembers).toHaveBeenCalledWith("band1");
      });
    });

    it("should handle unauthorized access gracefully", async () => {
      mockGetBandDetails.mockRejectedValue(new Error("ACCESS_DENIED"));
      mockGetBandMembers.mockRejectedValue(new Error("ACCESS_DENIED"));

      render(<BandProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("ACCESS_DENIED")).toBeInTheDocument();
      });
    });
  });

  describe("Responsive Design", () => {
    beforeEach(() => {
      mockGetBandDetails.mockResolvedValue(mockBand);
      mockGetBandMembers.mockResolvedValue(mockMembersData);
    });

    it("should render with proper responsive classes", async () => {
      render(<BandProfilePage />);

      await waitFor(() => {
        const container = screen
          .getByText("Rock Legends")
          .closest(".container");
        expect(container).toHaveClass("mx-auto", "px-4", "py-8", "max-w-6xl");
      });
    });
  });
});
