/**
 * Feed Component
 *
 * A comprehensive social feed interface for user interaction and community engagement.
 * Enables users to share content, follow others, and interact with posts.
 *
 * Features:
 * - Post creation, editing, and deletion functionality
 * - Comment management with editing and deletion capabilities
 * - User discovery with search functionality
 * - Follow/unfollow user management
 * - Tab navigation between different feed views
 * - Media attachment support for posts
 * - Followers and following list displays
 * - Time-based formatting of post and comment timestamps
 *
 * This component serves as the social hub of the BetterDays app,
 * facilitating community building and accountability partnerships
 * through shared content and user connections.
 */

import React, { useEffect, useState, useCallback, useContext } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  BookmarkIcon,
  HeartIcon,
  MessageSquareIcon,
  PlusIcon,
  UsersIcon,
  UserPlusIcon,
  UserCheckIcon,
} from "lucide-react";
import Modal from "react-bootstrap/Modal";
import { useTheme } from "../context/ThemeContext";
import "./css/Feed.css";
import CreatePostModal from "./CreatePostModal";
import FollowUser from "./FollowUser";
import BACKEND_BASE_URL from "../Constants";
import { useFollows } from "../hooks/useFollows";
import { AuthContext } from "../App";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Import our types
import { Follow, User } from "../types/follow";

// Initialise Gemini API
const GEMINI_API_KEY = "AIzaSyBKFgy7XMSB-_l_anuSYS-36SQ62tyWyWs";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface Comment {
  id: number;
  user: number;
  post: number;
  parent_comment: number | null;
  comment_content: string;
  date_created: string;
  like_count: number;
  comment_image: string | null;
  author?: string; // We'll add this when mapping the comments
  author_avatar?: string; // We'll add this when mapping the comments
}

interface Post {
  id: number;
  user: number;
  author: string;
  post_title?: string;
  post_description?: string;
  post_date_created: string;
  post_image?: string;
  like_count: number;
  comments: Comment[];
}

// Updated User interface to match our follows system
interface UserWithFollow extends User {
  is_following: boolean;
  profile_image: string | null;
}

function Feed() {
  const { theme } = useTheme();
  const { userId } = useContext(AuthContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "feed" | "posts" | "discover" | "followers" | "following"
  >("feed");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [users, setUsers] = useState<UserWithFollow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingComment, setEditingComment] = useState<{
    id: number;
    content: string;
  } | null>(null);

  // useEffect(() => {
  //   window.location.reload();
  // }, []);

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Use our custom hook to manage follows
  const {
    followers,
    following,
    isLoading: followsLoading,
    toggleFollow,
    isFollowing,
  } = useFollows(userId || undefined);

  const fetchPosts = useCallback(async () => {
    if (loading) return; // Prevent multiple simultaneous calls
    setLoading(true);
    try {
      const [postsResponse, commentsResponse] = await Promise.all([
        fetch(BACKEND_BASE_URL + "/api/posts/"),
        fetch(BACKEND_BASE_URL + "/api/comments/"),
      ]);

      const postsData = await postsResponse.json();
      const commentsData = await commentsResponse.json();

      // Group comments by post ID
      const commentsByPost = commentsData.reduce(
        (acc: { [key: number]: Comment[] }, comment: Comment) => {
          if (!acc[comment.post]) {
            acc[comment.post] = [];
          }
          acc[comment.post].push(comment);
          return acc;
        },
        {}
      );

      // Add comments to their respective posts
      const postsWithComments = postsData.map((post: Post) => ({
        ...post,
        comments: commentsByPost[post.id] || [],
      }));

      setPosts(postsWithComments);
    } catch (error) {
      console.error("Error fetching posts and comments:", error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const fetchUsers = useCallback(async () => {
    if (usersLoading) return; // Prevent multiple simultaneous calls
    setUsersLoading(true);
    try {
      const response = await fetch(BACKEND_BASE_URL + "/api/users/");
      const userData = await response.json();

      // Update users with their follow status
      const updatedUsers = userData
        .filter((user: any) => user.id !== userId)
        .map((user: any) => ({
          ...user,
          is_following: isFollowing(user.id),
          profile_image: user.profile_image,
        }));

      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  }, [usersLoading, isFollowing]);

  // Initial data fetch
  useEffect(() => {
    fetchPosts();
    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  const addPost = (post: Post) => {
    setPosts([post, ...posts]);
  };

  const editPost = (id: number, updatedPost: Post) => {
    setPosts(posts.map((post) => (post.id === id ? updatedPost : post)));
  };

  const deletePost = async (id: number) => {
    try {
      const response = await fetch(BACKEND_BASE_URL + `api/posts/${id}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRFToken":
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("csrftoken="))
              ?.split("=")[1] || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Only update the UI if the backend deletion was successful
      setPosts(posts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handlePostSuccess = () => {
    fetchPosts(); // Refresh posts after successful creation
  };

  const handleAddComment = async (postId: number) => {
    const newTrimmedComment = newComment.trim();

    if (!newTrimmedComment) return;

    const sentimentScore = await analyseSentiment(newTrimmedComment);
    console.log("Sentiment Score:", sentimentScore);

    if (sentimentScore < -1.0) {
      alert(
        "We do not allow negative comments on our app. Please be more positive and constructive."
      );
      return;
    }

    try {
      const response = await fetch(BACKEND_BASE_URL + `api/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken":
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("csrftoken="))
              ?.split("=")[1] || "",
        },
        credentials: "include",
        body: JSON.stringify({
          user: userId,
          post: postId,
          parent_comment: null,
          comment_content: newComment.trim(),
          date_created: new Date().toISOString().slice(0, 19) + "Z",
          comment_image: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const commentData = await response.json();

      // Update the posts state with the new comment
      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...(post.comments || []), commentData],
            };
          }
          return post;
        })
      );

      setNewComment("");
      setCommentingPostId(null);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Updated to handle follow changes more efficiently
  const handleFollowChange = async (userId: number, isFollowing: boolean) => {
    try {
      const newFollowStatus = await toggleFollow(userId);

      // Update users list with new follow status without refetching
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_following: newFollowStatus } : user
        )
      );
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  const renderUserList = (
    users: Array<{
      id: number | undefined;
      username: string | undefined;
      profile_image: string | null;
    }>,
    type: "followers" | "following"
  ) => {
    if (followsLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      );
    }

    if (!users || users.length === 0) {
      return <div className="no-users-message">No {type} found</div>;
    }

    return users.map(
      (user) =>
        user &&
        user.id &&
        user.username && (
          <FollowUser
            key={user.id}
            userId={user.id}
            username={user.username}
            userAvatar={user.profile_image || "/default_user_img.png"}
            isFollowing={
              type === "following" || (user.id ? isFollowing(user.id) : false)
            }
            onFollowChange={handleFollowChange}
          />
        )
    );
  };

  const analyseSentiment = async (text: string): Promise<number> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Analyze the sentiment of this comment and return ONLY a number between -10.0 and 10.0, where -10.0 is extremely hateful and negative, and 10.0 is extremely positive and delightful. Return ONLY the number, nothing else. Comment: "${text}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const score = parseFloat(response.text().trim());

      return isNaN(score) ? -10.0 : score; // Default to negative if parsing fails
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return -10.0; // Default to negative on error
    }
  };

  const handleEditComment = async (
    postId: number,
    commentId: number,
    newContent: string
  ) => {
    try {
      const sentimentScore = await analyseSentiment(newContent);
      console.log("Sentiment Score:", sentimentScore);

      if (sentimentScore < -1.0) {
        alert(
          "We do not allow negative comments on our app. Please be more positive and constructive."
        );
        return;
      }

      const response = await fetch(
        BACKEND_BASE_URL + `api/comments/${commentId}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken":
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("csrftoken="))
                ?.split("=")[1] || "",
          },
          credentials: "include",
          body: JSON.stringify({
            user: userId,
            post: postId,
            parent_comment: null,
            comment_content: newContent.trim(),
            date_created: new Date().toISOString().slice(0, 19) + "Z",
            comment_image: null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit comment");
      }

      const updatedComment = await response.json();

      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? updatedComment : comment
              ),
            };
          }
          return post;
        })
      );

      setEditingComment(null);
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      const response = await fetch(
        BACKEND_BASE_URL + `api/comments/${commentId}/`,
        {
          method: "DELETE",
          headers: {
            "X-CSRFToken":
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("csrftoken="))
                ?.split("=")[1] || "",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments.filter(
                (comment) => comment.id !== commentId
              ),
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure we are in a browser environment
      if (!sessionStorage.getItem('reloaded_feed')) {
        sessionStorage.setItem('reloaded_feed', 'true');
        window.location.reload();
      }
    }
  }, []); // Empty dependency array ensures this runs only once after the initial render

  return (
    <div className={`feed-container ${theme}`}>
      <div className="feed-header">
        <h1 className="feed-title fw-bold mb-0">Social Feed</h1>
        <p className="card-subtitle text-muted mb-2">
          Keep your friends updated on your journey!
        </p>
        <div className="feed-tabs">
          <button
            className={`tab-button ${activeTab === "feed" ? "active" : ""}`}
            onClick={() => setActiveTab("feed")}
          >
            My Feed
          </button>
          <button
            className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            My Posts
          </button>
          <button
            className={`tab-button ${activeTab === "discover" ? "active" : ""}`}
            onClick={() => setActiveTab("discover")}
          >
            <UsersIcon className="icon" />
            Discover
          </button>
          <button
            className={`tab-button ${
              activeTab === "followers" ? "active" : ""
            }`}
            onClick={() => setActiveTab("followers")}
          >
            <UserPlusIcon className="icon" />
            Followers
          </button>
          <button
            className={`tab-button ${
              activeTab === "following" ? "active" : ""
            }`}
            onClick={() => setActiveTab("following")}
          >
            <UserCheckIcon className="icon" />
            Following
          </button>
        </div>
      </div>

      {activeTab === "discover" ? (
        <div className="discover-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          {usersLoading ? (
            <div className="loading-spinner">Loading users...</div>
          ) : (
            <div className="users-list">
              {filteredUsers.map((user) => (
                <FollowUser
                  key={user.id}
                  userId={user.id}
                  username={user.username}
                  userAvatar={user.profile_image || "/default_user_img.png"}
                  isFollowing={user.is_following}
                  onFollowChange={handleFollowChange}
                />
              ))}
              {filteredUsers.length === 0 && (
                <div className="no-users-message">
                  {searchQuery
                    ? "No users found matching your search"
                    : "No users available"}
                </div>
              )}
            </div>
          )}
        </div>
      ) : activeTab === "followers" ? (
        <div className="user-list">
          {renderUserList(
            followers.map((f) => ({
              id: f.follower_details.id,
              username: f.follower_details.username,
              profile_image: f.follower_details.profile_image,
            })),
            "followers"
          )}
        </div>
      ) : activeTab === "following" ? (
        <div className="user-list">
          {renderUserList(
            following.map((f) => ({
              id: f.following_details.id,
              username: f.following_details.username,
              profile_image: f.following_details.profile_image,
            })),
            "following"
          )}
        </div>
      ) : (
        <div className="feed-posts-container d-flex">
          <div className="posts-container">
            {activeTab === "posts" && (
              <button
                className="create-post-button"
                onClick={() => setShowCreateModal(true)}
              >
                <PlusIcon className="icon" />
                Create New Post
              </button>
            )}
            {loading ? (
              <div className="feed-loading">
                <div className="spinner"></div>
              </div>
            ) : posts.length > 0 ? (
              posts
                .filter((post) => {
                  if (activeTab === "posts") {
                    return post.user === userId;
                  } else if (activeTab === "feed") {
                    // Only show posts from users that the current user is following
                    return isFollowing(post.user);
                  }
                  return true;
                })
                .map((post) => (
                  <div
                    className="feed-post"
                    key={post.id}
                  >
                    <div className="feed-post-header">
                      <img
                        src={"/default_user_img.png"}
                        alt={"profile"}
                        className="feed-post-avatar"
                      />
                      <div>
                        <div className="feed-post-author">{post.author}</div>
                        <div className="feed-post-time">
                          {post.post_date_created
                            ? formatDistanceToNow(
                                new Date(post.post_date_created),
                                { addSuffix: true }
                              )
                            : "Just now"}
                        </div>
                      </div>
                      {post.user === userId && (
                        <div className="post-actions">
                          <button
                            className="edit-button"
                            onClick={() => {
                              setEditingPost(post);
                              setShowEditModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => deletePost(post.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {post.post_title && (
                      <h3 className="feed-post-title">{post.post_title}</h3>
                    )}
                    <div className="feed-post-content">
                      {post.post_description}
                    </div>
                    {post.post_image && (
                      <div className="feed-post-media">
                        <img
                          src={post.post_image}
                          alt="Post content"
                        />
                      </div>
                    )}
                    <div className="feed-post-actions">
                      <button
                        className="feed-post-action-btn"
                        onClick={() =>
                          setCommentingPostId(
                            commentingPostId === post.id ? null : post.id
                          )
                        }
                      >
                        <MessageSquareIcon className="icon" />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </div>
                    {commentingPostId === post.id && (
                      <div className="comment-section">
                        <textarea
                          className="comment-input"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                        />
                        <button
                          className="submit-comment-button"
                          onClick={() => handleAddComment(post.id)}
                        >
                          Submit
                        </button>
                      </div>
                    )}
                    {post.comments && post.comments.length > 0 && (
                      <div className="comments-list">
                        {post.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="comment-item"
                          >
                            <img
                              src={
                                comment.author_avatar || "/default_user_img.png"
                              }
                              alt="Author"
                              className="comment-avatar"
                            />
                            <div className="comment-content">
                              <div className="comment-author">
                                {comment.author}
                              </div>
                              {editingComment?.id === comment.id ? (
                                <div className="comment-edit-form">
                                  <textarea
                                    value={editingComment.content}
                                    onChange={(e) =>
                                      setEditingComment({
                                        ...editingComment,
                                        content: e.target.value,
                                      })
                                    }
                                    className="comment-edit-input"
                                  />
                                  <div className="comment-edit-actions">
                                    <button
                                      className="edit-button me-2"
                                      onClick={() =>
                                        handleEditComment(
                                          // todo
                                          post.id,
                                          comment.id,
                                          editingComment.content
                                        )
                                      }
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="delete-button"
                                      onClick={() => setEditingComment(null)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="comment-text">
                                  {comment.comment_content}
                                </div>
                              )}
                              <div className="comment-time">
                                {formatDistanceToNow(
                                  new Date(comment.date_created)
                                )}{" "}
                                ago
                              </div>
                              {comment.user === userId && (
                                <div className="comment-actions me-2">
                                  <button
                                    className="edit-button  me-2"
                                    onClick={() =>
                                      setEditingComment({
                                        id: comment.id,
                                        content: comment.comment_content,
                                      })
                                    }
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="delete-button"
                                    onClick={() =>
                                      handleDeleteComment(post.id, comment.id)
                                    }
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="no-posts-message">No posts available</div>
            )}
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        show={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        onPostSuccess={handlePostSuccess}
      />

      {/* Edit Post Modal */}
      <CreatePostModal
        show={showEditModal}
        handleClose={() => {
          setShowEditModal(false);
          setEditingPost(null);
        }}
        onPostSuccess={handlePostSuccess}
        initialData={
          editingPost
            ? {
                id: editingPost.id,
                content: editingPost.post_description || "",
                image_url: editingPost.post_image,
              }
            : null
        }
      />
    </div>
  );
}

export default Feed;
