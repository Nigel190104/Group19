/**
 * LogoutButton Component
 *
 * A dropdown menu component that displays the user's profile information
 * and provides account management options.
 *
 * Features:
 * - User profile image display with fallback to default icon
 * - Username display from authentication context
 * - Dropdown menu with settings and logout options
 * - Profile image fetching and error handling
 * - Context synchronization for profile data
 * - Navigation to settings page
 * - Secure logout functionality with redirect
 * - Click-outside detection to close dropdown
 *
 * This component serves as the main account control interface in the
 * app header, allowing users to manage their profile and log out securely.
 */

import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";
import "./css/LogoutButton.css";
import BACKEND_BASE_URL from "../Constants";

const LogoutButton: React.FC = () => {
  const {
    logout,
    username,
    userId,
    profileImage: contextProfileImage,
    updateProfileImage,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localProfileImage, setLocalProfileImage] = useState<string | null>(
    null
  );
  const [imageError, setImageError] = useState(false);

  // Use effect to synchronize local state with context or fetch user data
  useEffect(() => {
    // Reset states when userId changes (including on logout)
    setImageError(false);

    // If there's no userId, reset the local profile image
    if (!userId) {
      setLocalProfileImage(null);
      return;
    }

    // If there's a profileImage in context, use it first
    if (contextProfileImage) {
      setLocalProfileImage(contextProfileImage);
      return;
    }

    // Otherwise fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          BACKEND_BASE_URL + `api/users/${userId}/`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();

        // Handle profile image
        if (userData.profile_image) {
          let imageUrl = userData.profile_image;

          // If it doesn't start with http, it's a relative path - prepend base URL
          if (!imageUrl.startsWith("http")) {
            imageUrl = BACKEND_BASE_URL + imageUrl;
          }

          setLocalProfileImage(imageUrl);
          // Update profile image in context so other components can use it
          updateProfileImage(imageUrl);
        } else {
          // Explicitly set to null if no profile image exists
          setLocalProfileImage(null);
          updateProfileImage(""); // Update context with empty string
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setImageError(true);
        setLocalProfileImage(null);
      }
    };

    fetchUserData();
  }, [userId, contextProfileImage, updateProfileImage]);

  const handleLogout = async () => {
    try {
      // Clear the profile image state before logout
      setLocalProfileImage(null);
      setImageError(false);

      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const goToSettings = () => {
    navigate("/settings");
    setIsDropdownOpen(false);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-profile-container")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="utility-container d-flex space-between">
      <div className="user-profile-container">
        <div
          className="user-profile-header"
          onClick={toggleDropdown}
        >
          {localProfileImage && !imageError ? (
            <div className="profile-picture-small">
              <img
                src={localProfileImage}
                alt={`${username}'s profile`}
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              className="profile-icon"
            >
              <path
                fill="#454545"
                d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"
              ></path>
            </svg>
          )}
          <span className="username">{username}</span>
        </div>

        {isDropdownOpen && (
          <div className="menu-dropdown">
            <div
              className="menu-item"
              onClick={goToSettings}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                ></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Settings</span>
            </div>
            <div
              className="menu-item logout-menu-item"
              onClick={handleLogout}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line
                  x1="21"
                  y1="12"
                  x2="9"
                  y2="12"
                ></line>
              </svg>
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoutButton;
