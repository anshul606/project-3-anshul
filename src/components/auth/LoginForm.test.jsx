import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import LoginForm from "./LoginForm";
import { AuthProvider } from "../../contexts/AuthContext";

// Mock the auth service
vi.mock("../../services/authService", () => ({
  default: {
    signIn: vi.fn(),
    signInWithGoogle: vi.fn(),
    onAuthStateChanged: vi.fn(() => () => {}),
  },
}));

const renderLoginForm = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("LoginForm", () => {
  it("renders login form with email and password inputs", () => {
    renderLoginForm();

    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in$/i })
    ).toBeInTheDocument();
  });

  it("renders Google sign-in button", () => {
    renderLoginForm();

    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
  });

  it("shows validation error for empty email", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const submitButton = screen.getByRole("button", { name: /sign in$/i });

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for empty password", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByPlaceholderText(/email address/i);
    const submitButton = screen.getByRole("button", { name: /sign in$/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("renders forgot password link", () => {
    renderLoginForm();

    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
  });

  it("renders create account link", () => {
    renderLoginForm();

    expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
  });
});
