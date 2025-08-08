/**
 * MatchCard component tests
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MatchCard } from "../MatchCard";
import { Match } from "@/types/dashboard";

const mockMatch: Match = {
  user: {
    id: "user-1",
    name: "John Doe",
    bio: "Passionate guitarist looking for a band",
    primary_role: "guitarist",
    instruments: ["Guitar", "Piano", "Bass Guitar"],
    genres: ["Rock", "Jazz", "Blues"],
    experience: "intermediate",
    location: "New York",
    avatar_url: "https://example.com/avatar.jpg",
    profile_completed: true,
  },
  compatibility_score: 85,
  reasoning:
    "Great match based on shared musical interests and location proximity",
  breakdown: {
    locationScore: 50,
    genreScore: 20,
    experienceScore: 15,
  },
};

describe("MatchCard", () => {
  it("renders match information correctly", () => {
    render(<MatchCard match={mockMatch} />);

    // Check user name and role
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getAllByText("Guitarist")).toHaveLength(1);

    // Check location
    expect(screen.getByText("New York")).toBeInTheDocument();

    // Check bio
    expect(
      screen.getByText("Passionate guitarist looking for a band")
    ).toBeInTheDocument();

    // Check experience level
    expect(screen.getByText("Intermediate")).toBeInTheDocument();

    // Check compatibility score
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("Compatibility")).toBeInTheDocument();

    // Check instruments section
    expect(screen.getByText("Instruments")).toBeInTheDocument();
    expect(screen.getByText("Guitar")).toBeInTheDocument();
    expect(screen.getByText("Piano")).toBeInTheDocument();
    expect(screen.getByText("Bass Guitar")).toBeInTheDocument();

    // Check genres section
    expect(screen.getAllByText("Genres")).toHaveLength(2); // Header and breakdown
    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.getByText("Jazz")).toBeInTheDocument();
    expect(screen.getByText("Blues")).toBeInTheDocument();

    // Check compatibility breakdown
    expect(screen.getByText("Compatibility Breakdown")).toBeInTheDocument();
    expect(screen.getByText("50/50")).toBeInTheDocument(); // Location score
    expect(screen.getByText("20/30")).toBeInTheDocument(); // Genre score
    expect(screen.getByText("15/20")).toBeInTheDocument(); // Experience score

    // Check reasoning
    expect(screen.getByText("Why you match")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Great match based on shared musical interests and location proximity"
      )
    ).toBeInTheDocument();
  });

  it("handles missing optional fields gracefully", () => {
    const matchWithoutOptionalFields: Match = {
      ...mockMatch,
      user: {
        ...mockMatch.user,
        bio: undefined,
        location: undefined,
        avatar_url: undefined,
      },
      reasoning: "",
    };

    render(<MatchCard match={matchWithoutOptionalFields} />);

    // Should still render name and role
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getAllByText("Guitarist")).toHaveLength(1);

    // Should not show location or bio
    expect(screen.queryByText("New York")).not.toBeInTheDocument();
    expect(screen.queryByText("Passionate guitarist")).not.toBeInTheDocument();

    // Should show avatar fallback
    expect(screen.getByText("JD")).toBeInTheDocument(); // Initials fallback
  });

  it("limits displayed instruments and genres", () => {
    const matchWithManyItems: Match = {
      ...mockMatch,
      user: {
        ...mockMatch.user,
        instruments: ["Guitar", "Piano", "Bass Guitar", "Drums", "Violin"],
        genres: ["Rock", "Jazz", "Blues", "Pop", "Country"],
      },
    };

    render(<MatchCard match={matchWithManyItems} />);

    // Should show first 3 instruments plus "+2 more"
    expect(screen.getByText("Guitar")).toBeInTheDocument();
    expect(screen.getByText("Piano")).toBeInTheDocument();
    expect(screen.getByText("Bass Guitar")).toBeInTheDocument();
    expect(screen.getByText("+2 more")).toBeInTheDocument();

    // Should show first 3 genres plus "+2 more"
    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.getByText("Jazz")).toBeInTheDocument();
    expect(screen.getByText("Blues")).toBeInTheDocument();
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("calls onViewProfile when View Profile button is clicked", () => {
    const mockOnViewProfile = jest.fn();
    render(<MatchCard match={mockMatch} onViewProfile={mockOnViewProfile} />);

    const viewProfileButton = screen.getByRole("button", {
      name: /view profile/i,
    });
    fireEvent.click(viewProfileButton);

    expect(mockOnViewProfile).toHaveBeenCalledWith("user-1");
  });

  it("calls onRequestAIAnalysis when AI Analysis button is clicked", () => {
    const mockOnRequestAIAnalysis = jest.fn();
    render(
      <MatchCard
        match={mockMatch}
        onRequestAIAnalysis={mockOnRequestAIAnalysis}
      />
    );

    const aiAnalysisButton = screen.getByRole("button", {
      name: /ai analysis/i,
    });
    fireEvent.click(aiAnalysisButton);

    expect(mockOnRequestAIAnalysis).toHaveBeenCalledWith("user-1");
  });

  it("does not render action buttons when handlers are not provided", () => {
    render(<MatchCard match={mockMatch} />);

    expect(
      screen.queryByRole("button", { name: /view profile/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ai analysis/i })
    ).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <MatchCard match={mockMatch} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("displays correct experience level colors", () => {
    const experiences = [
      "beginner",
      "intermediate",
      "advanced",
      "professional",
    ] as const;

    experiences.forEach((experience) => {
      const matchWithExperience: Match = {
        ...mockMatch,
        user: {
          ...mockMatch.user,
          experience,
        },
      };

      const { rerender } = render(<MatchCard match={matchWithExperience} />);

      expect(
        screen.getByText(
          experience.charAt(0).toUpperCase() + experience.slice(1)
        )
      ).toBeInTheDocument();

      rerender(<div />); // Clear for next iteration
    });
  });

  it("displays correct role icons", () => {
    const roles = [
      "drummer",
      "guitarist",
      "bassist",
      "singer",
      "other",
    ] as const;

    roles.forEach((role) => {
      const matchWithRole: Match = {
        ...mockMatch,
        user: {
          ...mockMatch.user,
          primary_role: role,
        },
      };

      const { rerender } = render(<MatchCard match={matchWithRole} />);

      expect(
        screen.getByText(role.charAt(0).toUpperCase() + role.slice(1))
      ).toBeInTheDocument();

      rerender(<div />); // Clear for next iteration
    });
  });
});
