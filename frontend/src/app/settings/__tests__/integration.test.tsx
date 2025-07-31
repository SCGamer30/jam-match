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
import { it } from "zod/locales";
import { it } from "zod/locales";
import { it } from "zod/locales";
import { it } from "zod/locales";
import { it } from "zod/locales";
import { it } from "zod/locales";
import { it } from "zod/locales";
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

describe("Settings Page Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "user-1" },
      loading: false,
    });
    (userApi.getProfile as jest.Mock).mockResolvedValue(mockUser);
  });

  it("performs complete profile update flow with optimistic updates", async () => {
    const updatedUser = {
      ...mockUser,
      name: "Updated Name",
      bio: "Updated bio",
      location: "Los Angeles, CA",
    };

    (userApi.updateProfile as jest.Mock).mockResolvedValue({
      message: "Profile updated successfully",
      user: updatedUser,
    });

    render(<SettingsPage />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Make multiple changes
    const nameInput = screen.getByDisplayValue("Test User");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    const bioTextarea = screen.getByDisplayValue("Test bio");
    fireEvent.change(bioTextarea, { target: { value: "Updated bio" } });

    const locationInput = screen.getByDisplayValue("New York, NY");
    fireEvent.change(locationInput, { target: { value: "Los Angeles, CA" } });

    // Verify changes are reflected in UI
    expect(screen.getByDisplayValue("Updated Name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Updated bio")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Los Angeles, CA")).toBeInTheDocument();

    // Save changes
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    // Verify optimistic update shows success immediately
    await waitFor(() => {
      expect(
        screen.getByText("Profile updated successfully!")
      ).toBeInTheDocument();
    });

    // Verify API was called with correct data
    await waitFor(() => {
      expect(userApi.updateProfile).toHaveBeenCalledWith({
        name: "Updated Name",
        bio: "Updated bio",
        primary_role: "guitarist",
        instruments: ["Guitar", "Piano"],
        genres: ["Rock", "Jazz"],
        experience: "intermediate",
        location: "Los Angeles, CA",
        avatar_url: null,
      });
    });

    // Verify save button is disabled after successful save
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it("handles optimistic update rollback on API failure", async () => {
    (userApi.updateProfile as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    render(<SettingsPage />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Make a change
    const nameInput = screen.getByDisplayValue("Test User");
    fireEvent.change(nameInput, { target: { value: "Failed Update" } });

    // Save changes
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    // Verify error is shown and optimistic update is reverted
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });

    // Verify the form reverted to original values
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });
  });

  it("handles validation errors before API call", async () => {
    render(<SettingsPage />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Clear required field
    const nameInput = screen.getByDisplayValue("Test User");
    fireEvent.change(nameInput, { target: { value: "" } });

    // Try to save
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    // Verify validation error is shown
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    // Verify API was not called
    expect(userApi.updateProfile).not.toHaveBeenCalled();
  });

  it("handles genre and instrument updates correctly", async () => {
    const updatedUser = {
      ...mockUser,
      genres: ["Rock", "Jazz", "Blues"],
      instruments: ["Guitar", "Piano", "Drums"],
    };

    (userApi.updateProfile as jest.Mock).mockResolvedValue({
      message: "Profile updated successfully",
      user: updatedUser,
    });

    render(<SettingsPage />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Add a new genre
    const genreSelect = screen.getByLabelText(/add a genre/i);
    fireEvent.click(genreSelect);

    const bluesOption = screen.getByText("Blues");
    fireEvent.click(bluesOption);

    // Add a new instrument
    const instrumentSelect = screen.getByLabelText(/add an instrument/i);
    fireEvent.click(instrumentSelect);

    const drumsOption = screen.getByText("Drums");
    fireEvent.click(drumsOption);

    // Verify new items are displayed
    await waitFor(() => {
      expect(screen.getByText("Blues")).toBeInTheDocument();
      expect(screen.getByText("Drums")).toBeInTheDocument();
    });

    // Save changes
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    // Verify API was called with updated arrays
    await waitFor(() => {
      expect(userApi.updateProfile).toHaveBeenCalledWith({
        name: "Test User",
        bio: "Test bio",
        primary_role: "guitarist",
        instruments: ["Guitar", "Piano", "Drums"],
        genres: ["Rock", "Jazz", "Blues"],
        experience: "intermediate",
        location: "New York, NY",
        avatar_url: null,
      });
    });
  });

  it("handles experience level and primary role updates", async () => {
    const updatedUser = {
      ...mockUser,
      experience: "advanced" as const,
      primary_role: "drummer" as const,
    };

    (userApi.updateProfile as jest.Mock).mockResolvedValue({
      message: "Profile updated successfully",
      user: updatedUser,
    });

    render(<SettingsPage />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Change experience level - find by the label and then the select
    const experienceLabel = screen.getByText("Experience Level *");
    const experienceSelect =
      experienceLabel.parentElement?.querySelector('[role="combobox"]');
    if (experienceSelect) {
      fireEvent.click(experienceSelect);
      const advancedOption = screen.getByText("Advanced");
      fireEvent.click(advancedOption);
    }

    // Change primary role - find by the label and then the select
    const roleLabel = screen.getByText("Primary Role *");
    const roleSelect =
      roleLabel.parentElement?.querySelector('[role="combobox"]');
    if (roleSelect) {
      fireEvent.click(roleSelect);
      const drummerOption = screen.getByText("Drummer");
      fireEvent.click(drummerOption);
    }

    // Save changes
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    // Verify API was called with updated values
    await waitFor(() => {
      expect(userApi.updateProfile).toHaveBeenCalledWith({
        name: "Test User",
        bio: "Test bio",
        primary_role: "drummer",
        instruments: ["Guitar", "Piano"],
        genres: ["Rock", "Jazz"],
        experience: "advanced",
        location: "New York, NY",
        avatar_url: null,
      });
    });
  });

  it("handles bio character limit validation", async () => {
    render(<SettingsPage />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Try to enter bio that's too long
    const bioTextarea = screen.getByDisplayValue("Test bio");
    const longBio = "a".repeat(501); // Over 500 character limit
    fireEvent.change(bioTextarea, { target: { value: longBio } });

    // Try to save
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    // Verify validation error
    await waitFor(() => {
      expect(
        screen.getByText(/bio must be less than 500 characters/i)
      ).toBeInTheDocument();
    });

    // Verify API was not called
    expect(userApi.updateProfile).not.toHaveBeenCalled();
  });

  it("shows loading state during save operation", async () => {
    // Mock a slow API response
    (userApi.updateProfile as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                message: "Profile updated successfully",
                user: mockUser,
              }),
            100
          )
        )
    );

    render(<SettingsPage />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Make a change
    const nameInput = screen.getByDisplayValue("Test User");
    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    // Save changes
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(saveButton);

    // Verify loading state
    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByText("Save Changes")).toBeInTheDocument();
    });
  });
});
