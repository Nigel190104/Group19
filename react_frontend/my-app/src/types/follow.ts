export interface User {
  id: number;
  username: string;
  profile_picture: string | null;
}

export interface Follow {
  id: number;
  followers: number;
  following: number;
  created_at: string;
  follower_details: User;
  following_details: User;
}

export type FollowStatus = 'following' | 'unfollowed';
