/**
 * ForgotPassword Component
 *
 * A form interface for resetting user passwords in the BetterDays app.
 * Provides password creation, validation, and submission functionality.
 *
 * Features:
 * - Password input fields with confirmation matching
 * - Password strength validation for security
 * - Error messaging for validation failures
 * - Success messaging after successful submission
 * - Automatic redirection to login page after reset
 * - Password hashing for secure transmission
 * - Navigation links back to the login page
 *
 * This component handles the final step in the password recovery process,
 * allowing users to set a new password after verifying their identity.
 */

import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/AuthenticationForm.css";
import { sha256 } from "js-sha256";
import { AuthContext } from "../App";


const ForgotPassword: React.FC = () => {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { forgotPassword } = useContext(AuthContext);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!newPassword || !email || !confirmPassword || !username) {
      setError("Please fill in all fields.");
      return;
    }


    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password strength validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const hashedPassword = sha256(newPassword);
      // Here you would call your API to update the password
      await forgotPassword(username, email, hashedPassword);

      setSuccess("Password successfully reset!");
      // Redirect after short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Reset Password</h2>

      {error && (
        <p className="text-danger text-center error-message">{error}</p>
      )}

      {success && (
        <p className="text-success text-center error-message">{success}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="form-group">
          <label
            htmlFor="email"
            className="label-input"
          >
            Email
          </label>
          <input
            type="email"
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
            type="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
          />
        </div>
          <label
            htmlFor="email"
            className="label-input"
          >
            Email
          </label>
          <input
            type="email"
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
            type="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="newPassword"
            className="label-input"
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="confirmPassword"
            className="label-input"
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-input"
          />
        </div>

        <button
          type="submit"
          className="create-account-button"
        >
          Reset Password
        </button>

        <div className="login-link-container">
          <span className="login-text">Remember your password? </span>
          <a
            href="/login"
            className="login-link"
          >
            Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
