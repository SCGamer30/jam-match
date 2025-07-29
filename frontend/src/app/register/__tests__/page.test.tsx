import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../page";

// Mock the useAuth hook
const mockSignUp = jest.fn();
const mockUseAuth = {
  user: null,
  loading: false,
  error: null,
  signIn: jest.fn(),
  signUp: mockSignUp,
  signOut: jest.fn(),
  clearError: jest.fn(),
  isAuthenticated: false,
};

jest.mock("../../../lib/useAuth", () => ({
  useAuth: () => mockUseAuth,
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.user = null;
    mockUseAuth.loading = false;
    mockUseAuth.error = null;
  });

  it("renders registration form", () => {
    render(<RegisterPage />);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Account" })
    ).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const submitButton = screen.getByRole("button", { name: "Create Account" });
    await user.click(submitButton);

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(
      screen.getByText("Please confirm your password")
    ).toBeInTheDocument();
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", { name: "Create Account" });
    await user.click(submitButton);

    expect(
      screen.getByText("Please enter a valid email address")
    ).toBeInTheDocument();
  });

  it("validates password length", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const passwordInput = screen.getByLabelText("Password");
    await user.type(passwordInput, "123");

    const submitButton = screen.getByRole("button", { name: "Create Account" });
    await user.click(submitButton);

    expect(
      screen.getByText("Password must be at least 6 characters long")
    ).toBeInTheDocument();
  });

  it("validates password confirmation", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "different123");

    const submitButton = screen.getByRole("button", { name: "Create Account" });
    await user.click(submitButton);

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockSignUp.mockResolvedValue(true);

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", { name: "Create Account" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(mockPush).toHaveBeenCalledWith("/profile/setup");
    });
  });

  it("handles registration failure", async () => {
    const user = userEvent.setup();
    mockSignUp.mockResolvedValue(false);

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    const submitButton = screen.getByRole("button", { name: "Create Account" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Registration failed. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("clears field errors when user starts typing", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    // Trigger validation error
    const submitButton = screen.getByRole("button", { name: "Create Account" });
    await user.click(submitButton);

    expect(screen.getByText("Email is required")).toBeInTheDocument();

    // Start typing in email field
    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "t");

    expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
  });
});
