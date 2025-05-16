import { useState, useEffect } from 'react';
import BACKEND_BASE_URL from '../Constants';

interface Follow {
  id: number;
  followers: number;
  following: number;
  follower_details: {
    id: number;
    username: string;
    profile_image: string | null;
    user_gender: string;
    email: string;
    roles: string;
    followers_count: number;
    following_count: number;
    bio: string | null;
  };
  following_details: {
    id: number;
    username: string;
    profile_image: string | null;
    user_gender: string;
    email: string;
    roles: string;
    followers_count: number;
    following_count: number;
    bio: string | null;
  };
  created_at: string;
}

export const useFollows = (userId: number | undefined) => {
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Fetch CSRF token when component mounts
  useEffect(() => {
    const getCSRFToken = () => {
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        let [name, value] = cookie.trim().split("=");
        if (name === "csrftoken") {
          return value;
        }
      }
      return null;
    };

    const token = getCSRFToken();
    setCsrfToken(token);
  }, []);

  useEffect(() => {
    const fetchFollows = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const [followersResponse, followingResponse] = await Promise.all([
          fetch(`${BACKEND_BASE_URL}/api/follows/${userId}/followers/`, {
            credentials: 'include'
          }),
          fetch(`${BACKEND_BASE_URL}/api/follows/${userId}/following/`, {
            credentials: 'include'
          })
        ]);

        if (!followersResponse.ok || !followingResponse.ok) {
          throw new Error('Failed to fetch follows');
        }

        const [followersData, followingData] = await Promise.all([
          followersResponse.json(),
          followingResponse.json()
        ]);
        
        setFollowers(followersData);
        setFollowing(followingData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollows();
  }, [userId]);

  const toggleFollow = async (targetUserId: number): Promise<boolean> => {
    if (!csrfToken) {
      throw new Error('CSRF token not available');
    }

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/follows/toggle/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          following_id: targetUserId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle follow status');
      }

      const data = await response.json();
      const newStatus = data.status === 'following';
      
      // Immediately update the following list based on the response
      if (newStatus) {
        // If we're now following, add to following list
        const userResponse = await fetch(`${BACKEND_BASE_URL}/api/users/${targetUserId}/`, {
          credentials: 'include'
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setFollowing(prev => [...prev, {
            id: Date.now(),
            followers: 0,
            following: 0,
            following_details: {
              id: userData.id,
              username: userData.username,
              profile_image: userData.profile_picture,
              user_gender: userData.gender,
              email: userData.email,
              roles: userData.roles,
              followers_count: 0,
              following_count: 0,
              bio: userData.bio
            },
            follower_details: {
              id: userId!,
              username: '',
              profile_image: null,
              user_gender: '',
              email: '',
              roles: '',
              followers_count: 0,
              following_count: 0,
              bio: null
            },
            created_at: new Date().toISOString()
          }]);
        }
      } else {
        // If we're no longer following, remove from following list
        setFollowing(prev => prev.filter(f => f.following_details.id !== targetUserId));
      }

      // Refresh both lists to ensure consistency
      const [followersResponse, followingResponse] = await Promise.all([
        fetch(`${BACKEND_BASE_URL}/api/follows/${userId}/followers/`, {
          credentials: 'include'
        }),
        fetch(`${BACKEND_BASE_URL}/api/follows/${userId}/following/`, {
          credentials: 'include'
        })
      ]);

      if (!followersResponse.ok || !followingResponse.ok) {
        throw new Error('Failed to refresh follows data');
      }

      const [followersData, followingData] = await Promise.all([
        followersResponse.json(),
        followingResponse.json()
      ]);

      setFollowers(followersData);
      setFollowing(followingData);

      return newStatus;
    } catch (err) {
      console.error('Error toggling follow status:', err);
      throw err;
    }
  };

  const isFollowing = (targetUserId: number): boolean => {
    return following.some(follow => follow.following_details.id === targetUserId);
  };

  return {
    followers,
    following,
    isLoading,
    error,
    toggleFollow,
    isFollowing
  };
};
