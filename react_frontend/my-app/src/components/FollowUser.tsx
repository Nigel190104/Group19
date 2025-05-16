/**
 * FollowUser Component
 *
 * A reusable user card component that displays user information with follow/unfollow functionality.
 * Used throughout the social features of the BetterDays app.
 *
 * Features:
 * - User avatar and username display
 * - Toggle button for following/unfollowing users
 * - Loading state indication during API operations
 * - Theme integration with the application's theming system
 * - Responsive layout suitable for various display contexts
 *
 * This component serves as a building block for the user discovery, followers,
 * and following sections of the social feed, providing consistent user
 * representation and interaction capabilities.
 */

import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import "./css/FollowUser.css";

interface FollowUserProps {
  userId: number;
  username: string;
  userAvatar: string;
  isFollowing: boolean;
  onFollowChange: (userId: number, isFollowing: boolean) => Promise<void>;
}

function FollowUser({
  userId,
  username,
  userAvatar,
  isFollowing: initialIsFollowing,
  onFollowChange,
}: FollowUserProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [followStatus, setFollowStatus] = useState(initialIsFollowing);

  // Update local state when prop changes
  useEffect(() => {
    setFollowStatus(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleFollow = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // Call the parent component's handler
      await onFollowChange(userId, followStatus);
      // Toggle the follow status locally for immediate UI feedback
      setFollowStatus(!followStatus);
    } catch (error) {
      console.error("Error updating follow status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`follow-user-container ${theme}`}>
      <div className="follow-user-info">
        <img
          src={userAvatar || "/default_user_img.png"}
          alt={username}
          className="follow-user-avatar"
        />
        <span className="follow-username">{username}</span>
      </div>
      <button
        className={`follow-button ${followStatus ? "following" : ""}`}
        onClick={handleFollow}
        disabled={isLoading}
      >
        {isLoading ? "..." : followStatus ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
}

export default FollowUser;
