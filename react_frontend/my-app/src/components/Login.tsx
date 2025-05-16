/**
 * Login Component
 *
 * The user authentication form for signing into the BetterDays application.
 * Provides a clean interface for credential entry and validation.
 *
 * Features:
 * - Username and password input fields with validation
 * - Password hashing for secure transmission
 * - Error messaging for invalid credentials or empty fields
 * - Integration with application authentication context
 * - Navigation to dashboard upon successful login
 * - Links to account creation and password recovery
 * - Styled form with consistent application branding
 *
 * This component handles the secure authentication of existing users,
 * providing access to their personal dashboard and app functionality.
 */

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/AuthenticationForm.css";
import { sha256 } from "js-sha256";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      const hashedPassword = sha256(password);
      await login(username, hashedPassword);
      navigate("/dashboard"); // Redirect after successful login
    } catch (err: any) {
      // Handle specific error cases based on error response
      if (err.message === "INVALID_CREDENTIALS") {
        setError("Incorrect username or password.");
      } else if (err.message === "ACCOUNT_NOT_FOUND") {
        setError("Account does not exist. Please sign up.");
      } else if (err.message === "ACCOUNT_LOCKED") {
        setError("Your account has been locked. Please contact support.");
      } else if (err.message === "TOO_MANY_ATTEMPTS") {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Login</h2>

      {error && (
        <p className="text-danger text-center error-message">{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label
            htmlFor="username"
            className="label-input"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="password"
            className="label-input"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="forgot-password-container">
          <a
            href="/forgot"
            className="forgot-password-link"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="create-account-button"
        >
          Login
        </button>

        <div className="login-link-container">
          <span className="login-text">Need to </span>
          <a
            href="/signup"
            className="login-link"
          >
            create an account?
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;
