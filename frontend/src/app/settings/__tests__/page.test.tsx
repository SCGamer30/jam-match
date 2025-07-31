/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import SettingsPage from "../page";
import { useAuth } from "@/lib/useAuth";
import { userApi } from "@/lib/api";
import { User } from "@/types/profile";

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
    updateProfile: jest.fn(),
  },
}));

const mockRouter = {
  push: jest.fn(),
};

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  bio: "Test bio",
  primary_role: "guitarist",
  instruments: ["Guitar", "Piano"],
  genres: ["Rock", "Jazz"],
  experience: "intermediate",
  location: "New York, NY",
  avatar_url: null,
  profile_completed: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("SettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "user-1" },
      loading: false,
    });
    (userApi.getProfile as jest.Mock).mockResolvedValue(mockUser);
  });

  it("renders loading state initially", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    render(<SettingsPage />);
    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  it("redirects to login if user is not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<SettingsPage />);
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });

  it("loads and displays user profile data", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("Test bio")).toBeInTheDocument();
    expect(screen.getByDisplayValue("New York, NY")).toBeInTheDocument();
    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.getByText("Jazz")).toBeInTheDocument();
    expect(screen.getByText("Guitar")).toBeInTheDocument();
    expect(screen.getByText("Piano")).toBeInTheDocument();
  });

  it("enables save button when form has changes", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("Test User");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    await waitFor(() => {
      const saveButton = screen.getByRole("button", { name: /save changes/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  it("disables save button when form has no changes", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });

  it("validates required fields", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Clear the name field
    const nameInput = screen.getByDisplayValue("Test User");
    fireEvent.change(nameInput, { target: { value: "" } });

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it("allows adding and removing genres", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Add a new genre
    const genreSelect = screen.getByLabelText(/add a genre/i);
    fireEvent.click(genreSelect);

    const bluesOption = screen.getByText("Blues");
    fireEvent.click(bluesOption);

    await waitFor(() => {
      expect(screen.getByText("Blues")).toBeInTheDocument();
    });

    // Remove an existing genre
    const rockGenre = screen.getByText("Rock").closest(".flex");
    const removeButton = rockGenre?.querySelector("svg");
    if (removeButton) {
      fireEvent.click(removeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText("Rock")).not.toBeInTheDocument();
    });
  });

  it("allows adding and removing instruments", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Add a new instrument
    const instrumentSelect = screen.getByLabelText(/add an instrument/i);
    fireEvent.click(instrumentSelect);

    const drumsOption = screen.getByText("Drums");
    fireEvent.click(drumsOption);

    await waitFor(() => {
      expect(screen.getByText("Drums")).toBeInTheDocument();
    });

    // Remove an existing instrument
    const guitarInstrument = screen.getByText("Guitar").closest(".flex");
    const removeButton = guitarInstrument?.querySelector("svg");
    if (removeButton) {
      fireEvent.click(removeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText("Guitar")).not.toBeInTheDocument();
    });
  });

  it("saves profile changes successfully", async () => {
    const updatedUser = { ...mockUser, name: "Updated Name" };
    (userApi.updateProfile as jest.Mock).mockResolvedValue({
      message: "Profile updated successfully",
      user: updatedUser,
    });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Make a change
    const nameInput = screen.getByDisplayValue("Test User");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    // Save changes
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(userApi.updateProfile).toHaveBeenCalledWith({
        name: "Updated Name",
        bio: "Test bio",
        primary_role: "guitarist",
        instruments: ["Guitar", "Piano"],
        genres: ["Rock", "Jazz"],
        experience: "intermediate",
        location: "New York, NY",
        avatar_url: null,
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText("Profile updated successfully!")
      ).toBeInTheDocument();
    });
  });

  it("handles save errors gracefully", async () => {
    (userApi.updateProfile as jest.Mock).mockRejectedValue(
      new Error("Failed to update profile")
    );

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Make a change
    const nameInput = screen.getByDisplayValue("Test User");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    // Save changes
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to update profile")).toBeInTheDocument();
    });
  });

  it("cancels changes and reverts to original data", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Make a change
    const nameInput = screen.getByDisplayValue("Test User");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    expect(screen.getByDisplayValue("Updated Name")).toBeInTheDocument();

    // Cancel changes
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });
  });

  it("shows character count for bio field", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    expect(screen.getByText("8/500 characters")).toBeInTheDocument();

    const bioTextarea = screen.getByDisplayValue("Test bio");
    fireEvent.change(bioTextarea, { target: { value: "Updated bio text" } });

    await waitFor(() => {
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === "16/500 characters";
        })
      ).toBeInTheDocument();
    });
  });

  it("prevents adding more than 10 genres", async () => {
    const userWithManyGenres = {
      ...mockUser,
      genres: [
        "Rock",
        "Jazz",
        "Blues",
        "Pop",
        "Country",
        "Folk",
        "Classical",
        "Electronic",
        "Hip Hop",
        "R&B",
      ],
    };
    (userApi.getProfile as jest.Mock).mockResolvedValue(userWithManyGenres);

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Try to add another genre
    const genreSelect = screen.getByLabelText(/add a genre/i);
    fireEvent.click(genreSelect);

    // The select should be disabled when user has 10 genres
    const genreSelectDisabled = screen.getByLabelText(/add a genre/i);
    expect(genreSelectDisabled).toBeDisabled();
  });

  it("prevents adding more than 10 instruments", async () => {
    const userWithManyInstruments = {
      ...mockUser,
      instruments: [
        "Guitar",
        "Bass Guitar",
        "Drums",
        "Vocals",
        "Piano",
        "Keyboard",
        "Violin",
        "Saxophone",
        "Trumpet",
        "Flute",
      ],
    };
    (userApi.getProfile as jest.Mock).mockResolvedValue(
      userWithManyInstruments
    );

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Try to add another instrument
    const instrumentSelect = screen.getByLabelText(/add an instrument/i);
    fireEvent.click(instrumentSelect);

    // The select should be disabled when user has 10 instruments
    const instrumentSelectDisabled =
      screen.getByLabelText(/add an instrument/i);
    expect(instrumentSelectDisabled).toBeDisabled();
  });

  it("handles profile loading errors", async () => {
    (userApi.getProfile as jest.Mock).mockRejectedValue(
      new Error("Failed to load profile")
    );

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load profile")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });
});
