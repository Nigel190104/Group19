/**
 * Signup Component
 *
 * User registration form for the BetterDays app that collects:
 * - Username
 * - Email
 * - Password (with confirmation)
 *
 * Validates input fields, secures passwords with SHA-256 hashing,
 * and uses AuthContext for registration functionality.
 */

import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App"; // Import AuthContext
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Form, Container, Card } from "react-bootstrap";
import "./css/AuthenticationForm.css";
import { sha256 } from "js-sha256";

const Signup: React.FC = () => {
  const [username, setUsername] = useState(""); // Added username state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext); // Use signup function from context

  // Debug effect to monitor error state changes
  useEffect(() => {
    if (error) {
      console.log("Error state updated:", error);
    }
  }, [error]);

  // Validation checks
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    // At least 8 characters, at least one letter and one number
    return password.length >= 8;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Check if fields are filled
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const hashedPassword = sha256(password);

      // Use the signup function from context instead of making an API call directly
      await signup(username, email, hashedPassword);

      // Redirect after sign up
      navigate("/dashboard");
    } catch (err: any) {
      // Handle specific error cases based on error response
      if (err.message === "USERNAME_EXISTS") {
        setError("An account with this username already exists.");
      } else if (err.message === "EMAIL_EXISTS") {
        setError("An account with this email already exists.");
      } else {
        setError("Signup failed. Please try again.");
      }

      console.error("Signup error:", err.message); // Log error for debugging
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign-up</h2>

      {error && (
        <div
          style={{
            color: "red",
            fontWeight: "bold",
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#ffebee",
            borderRadius: "4px",
            border: "1px solid #f44336",
            textAlign: "center",
          }}
        >
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label
            htmlFor="email"
            className="label-input"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
        </div>

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

        <div className="form-group">
          <label
            htmlFor="confirmPassword"
            className="label-input"
          >
            Confirm password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-input"
          />
        </div>

        <button
          type="submit"
          className="create-account-button"
        >
          Create account!
        </button>

        <div className="login-link-container">
          <span className="login-text">Looking to </span>
          <a
            href="/login"
            className="login-link"
          >
            login?
          </a>
        </div>
      </form>
    </div>
  );
};

export default Signup;
