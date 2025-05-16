import { create } from "zustand";

interface Post {
  id: number;
  author: string;
  author_avatar: string;
  content: string;
  created_at: string;
  image_url: string;
  media_type: "image" | "video";
  likes: number;
  comments: Comment[];
}

interface PostState {
  posts: Post[];
  loading: boolean;
  fetchPosts: () => void;
  addPost: (post: Post) => void;
  likePost: (id: number) => void;
  editPost: (id: number, updatedPost: Post) => void;
  deletePost: (id: number) => void;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  loading: false,
  fetchPosts: () => set((state) => ({ posts: [...state.posts], loading: false })),
  addPost: (post) => {
    // Validate post data before adding
    
    set((state) => ({ posts: [post, ...state.posts] }));
  },
  likePost: (id) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id ? { ...post, likes: post.likes + 1 } : post
      ),
    })),
  editPost: (id, updatedPost) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id ? updatedPost : post
      ),
    })),
  deletePost: (id) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== id),
    })),
}));
