/**
 * BandCard component tests
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BandCard } from "../BandCard";
import { Band } from "@/types/dashboard";
import { it } from "zod/locales";

const mockBand: Band = {
  id: "band-1",
  name: "The Rock Stars",
  drummer_id: "user-1",
  guitarist_id: "user-2",
  bassist_id: "user-3",
  singer_id: "user-4",
  status: "active",
  compatibility_data: {},
  formation_date: "2024-01-15T10:30:00Z",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-15T10:30:00Z",
  members: [
    {
      id: "user-1",
      name: "John Drummer",
      primary_role: "drummer",
      instruments: ["Drums"],
      genres: ["Rock", "Jazz"],
      experience: "intermediate",
      location: "New York",
      avatar_url: "https://example.com/john.jpg",
      profile_completed: true,
    },
    {
      id: "user-2",
      name: "Jane Guitarist",
      primary_role: "guitarist",
      instruments: ["Guitar"],
      genres: ["Rock", "Blues"],
      experience: "advanced",
      location: "New York",
      avatar_url: "https://example.com/jane.jpg",
      profile_completed: true,
    },
    {
      id: "user-3",
      name: "Bob Bassist",
      primary_role: "bassist",
      instruments: ["Bass Guitar"],
      genres: ["Rock", "Funk"],
      experience: "professional",
      location: "New York",
      profile_completed: true,
    },
    {
      id: "user-4",
      name: "Alice Singer",
      primary_role: "singer",
      instruments: ["Vocals"],
      genres: ["Rock", "Pop"],
      experience: "intermediate",
      location: "New York",
      profile_completed: true,
    },
  ],
};

describe("BandCard", () => {
  it("renders band information correctly", () => {
    render(<BandCard band={mockBand} currentUserId="user-1" />);

    // Check band name
    expect(screen.getByText("The Rock Stars")).toBeInTheDocument();

    // Check formation date
    expect(screen.getByText("Formed Jan 15, 2024")).toBeInTheDocument();

    // Check status
    expect(screen.getByText("active")).toBeInTheDocument();

    // Check compatibility score
    expect(screen.getByText("78%")).toBeInTheDocument();
    expect(screen.getByText("Compatibility")).toBeInTheDocument();

    // Check band members section
    expect(screen.getByText("Band Members")).toBeInTheDocument();
    expect(screen.getByText("John Drummer")).toBeInTheDocument();
    expect(screen.getByText("Jane Guitarist")).toBeInTheDocument();
    expect(screen.getByText("Bob Bassist")).toBeInTheDocument();
    expect(screen.getByText("Alice Singer")).toBeInTheDocument();

    // Check shared interests section
    expect(screen.getByText("Shared Interests")).toBeInTheDocument();
    expect(screen.getByText("Rock")).toBeInTheDocument(); // Common genre
  });

  it("generates band name when none provided", () => {
    const bandWithoutName: Band = {
      ...mockBand,
      name: undefined,
    };

    render(<BandCard band={bandWithoutName} currentUserId="user-1" />);

    // Should generate name from member names
    expect(screen.getByText("John & 3 others")).toBeInTheDocument();
  });

  it("highlights current user in member list", () => {
    render(<BandCard band={mockBand} currentUserId="user-2" />);

    // Current user should be shown as "You"
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.queryByText("Jane Guitarist")).not.toBeInTheDocument();

    // Other members should show their names
    expect(screen.getByText("John Drummer")).toBeInTheDocument();
    expect(screen.getByText("Bob Bassist")).toBeInTheDocument();
    expect(screen.getByText("Alice Singer")).toBeInTheDocument();
  });

  it("displays member roles correctly", () => {
    render(<BandCard band={mockBand} currentUserId="user-1" />);

    // Check role labels
    expect(screen.getByText("drummer")).toBeInTheDocument();
    expect(screen.getByText("guitarist")).toBeInTheDocument();
    expect(screen.getByText("bassist")).toBeInTheDocument();
    expect(screen.getByText("singer")).toBeInTheDocument();
  });

  it("shows shared genres when members have common interests", () => {
    render(<BandCard band={mockBand} currentUserId="user-1" />);

    // Rock appears in all members' genres, so it should be shown
    expect(screen.getByText("Rock")).toBeInTheDocument();
  });

  it("shows fallback message when no shared genres", () => {
    const bandWithDiverseGenres: Band = {
      ...mockBand,
      members: mockBand.members.map((member, index) => ({
        ...member,
        genres: [`Genre${index + 1}`], // Each member has unique genres
      })),
    };

    render(<BandCard band={bandWithDiverseGenres} currentUserId="user-1" />);

    expect(
      screen.getByText("Exploring diverse musical styles")
    ).toBeInTheDocument();
  });

  it("calls onViewBand when View Band button is clicked", () => {
    const mockOnViewBand = jest.fn();
    render(
      <BandCard
        band={mockBand}
        currentUserId="user-1"
        onViewBand={mockOnViewBand}
      />
    );

    const viewBandButton = screen.getByRole("button", { name: /view band/i });
    fireEvent.click(viewBandButton);

    expect(mockOnViewBand).toHaveBeenCalledWith("band-1");
  });

  it("calls onOpenChat when Chat button is clicked", () => {
    const mockOnOpenChat = jest.fn();
    render(
      <BandCard
        band={mockBand}
        currentUserId="user-1"
        onOpenChat={mockOnOpenChat}
      />
    );

    const chatButton = screen.getByRole("button", { name: /chat/i });
    fireEvent.click(chatButton);

    expect(mockOnOpenChat).toHaveBeenCalledWith("band-1");
  });

  it("does not render action buttons when handlers are not provided", () => {
    render(<BandCard band={mockBand} currentUserId="user-1" />);

    expect(
      screen.queryByRole("button", { name: /view band/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /chat/i })
    ).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <BandCard
        band={mockBand}
        currentUserId="user-1"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("displays member avatars with fallbacks", () => {
    const bandWithMissingAvatars: Band = {
      ...mockBand,
      members: mockBand.members.map((member) => ({
        ...member,
        avatar_url: undefined,
      })),
    };

    render(<BandCard band={bandWithMissingAvatars} currentUserId="user-1" />);

    // Should show initials as fallbacks
    expect(screen.getByText("JD")).toBeInTheDocument(); // John Drummer
    expect(screen.getByText("JG")).toBeInTheDocument(); // Jane Guitarist
    expect(screen.getByText("BB")).toBeInTheDocument(); // Bob Bassist
    expect(screen.getByText("AS")).toBeInTheDocument(); // Alice Singer
  });

  it("handles different band statuses", () => {
    const statuses = ["active", "inactive", "disbanded"] as const;

    statuses.forEach((status) => {
      const bandWithStatus: Band = {
        ...mockBand,
        status,
      };

      const { rerender } = render(
        <BandCard band={bandWithStatus} currentUserId="user-1" />
      );

      expect(screen.getByText(status)).toBeInTheDocument();

      rerender(<div />); // Clear for next iteration
    });
  });

  it("formats formation date correctly", () => {
    const testDates = [
      { input: "2024-01-01T00:00:00Z", expected: "Jan 1, 2024" },
      { input: "2024-12-25T15:30:00Z", expected: "Dec 25, 2024" },
      { input: "2023-06-15T09:45:00Z", expected: "Jun 15, 2023" },
    ];

    testDates.forEach(({ input, expected }) => {
      const bandWithDate: Band = {
        ...mockBand,
        formation_date: input,
      };

      const { rerender } = render(
        <BandCard band={bandWithDate} currentUserId="user-1" />
      );

      expect(
        screen.getByText(new RegExp(`Formed.*${expected.replace(/,/g, ",?")}`))
      ).toBeInTheDocument();

      rerender(<div />); // Clear for next iteration
    });
  });
});
