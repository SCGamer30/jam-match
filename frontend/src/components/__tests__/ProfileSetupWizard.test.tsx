/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { ProfileSetupWizard } from "../ProfileSetupWizard";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
};

describe("ProfileSetupWizard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("renders the first step correctly", () => {
    render(<ProfileSetupWizard />);

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByText("Basic Info")).toBeInTheDocument();
    expect(screen.getByText("Tell us about yourself")).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bio/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
  });

  it("shows progress indicator correctly", () => {
    render(<ProfileSetupWizard />);

    expect(screen.getByText("33% Complete")).toBeInTheDocument();

    const progressBar = document.querySelector(".bg-orange-300");
    expect(progressBar).toHaveStyle({ width: "33.33333333333333%" });
  });

  it("validates required fields before proceeding", () => {
    render(<ProfileSetupWizard />);

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });

  it("disables Previous button on first step", () => {
    render(<ProfileSetupWizard />);

    const previousButton = screen.getByText("Previous");
    expect(previousButton).toBeDisabled();
  });

  it("updates form data correctly", () => {
    render(<ProfileSetupWizard />);

    const nameInput = screen.getByLabelText(/Full Name/);
    fireEvent.change(nameInput, { target: { value: "John Doe" } });

    expect(nameInput).toHaveValue("John Doe");
  });

  it("shows error messages for validation failures", () => {
    render(<ProfileSetupWizard />);

    // Try to proceed without filling required fields
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    // Should show validation error
    expect(screen.getByText("Name is required")).toBeInTheDocument();
  });
});
