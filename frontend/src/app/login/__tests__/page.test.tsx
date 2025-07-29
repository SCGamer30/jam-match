import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../page";

// Mock the useAuth hook
const mockSignIn = jest.fn();
const mockUseAuth = {
  user: null,
  loading: false,
  error: null,
  signIn: mockSignIn,
  signUp: jest.fn(),
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

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.user = null;
    mockUseAuth.loading = false;
    mockUseAuth.error = null;
  });

  it("renders login form", () => {
    render(<LoginPage />);

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: "Sign In" });
    await user.click(submitButton);

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", { name: "Sign In" });
    await user.click(submitButton);

    expect(
      screen.getByText("Please enter a valid email address")
    ).toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(true);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: "Sign In" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles login failure", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(false);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");

    const submitButton = screen.getByRole("button", { name: "Sign In" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Invalid email or password. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("shows loading state while checking authentication", () => {
    mockUseAuth.loading = true;

    render(<LoginPage />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("clears field errors when user starts typing", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    // Trigger validation error
    const submitButton = screen.getByRole("button", { name: "Sign In" });
    await user.click(submitButton);

    expect(screen.getByText("Email is required")).toBeInTheDocument();

    // Start typing in email field
    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "t");

    expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
  });
});
