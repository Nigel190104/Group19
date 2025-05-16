/**
 * App Component
 *
 * Main application component for BetterDays that provides:
 * - Authentication context and user state management
 * - Protected route handling for authenticated content
 * - Application routing between all major views
 * - API connectivity with CSRF protection
 * - Query client provider for data fetching
 *
 * Uses React Router for navigation and React Context for global state management.
 */

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Habits from "./components/Habits";
import Journal from "./components/Journal/Journal";
import Settings from "./components/Settings";
import Feed from "./components/Feed";
import "./App.css";
import ForgotPassword from "./components/ForgotPassword";
import AOS from "aos";
import "aos/dist/aos.css";
import BACKEND_BASE_URL from "./Constants";
import JournalContainer from "./components/Journal/JournalContainer";

//import CreateNoteView from "./components/CreateNoteView";
// Create a Query Client
const queryClient = new QueryClient();

// Authentication Context
export const AuthContext = React.createContext({
  isAuthenticated: false,
  username: "",
  userId: null as number | null,
  profileImage: null as string | null,
  csrf: "",
  login: (username: string, password: string) => Promise.resolve(),
  signup: (username: string, email: string, password: string) =>
    Promise.resolve(),
  logout: () => {},
  updateProfileImage: (newImageUrl: string) => {},
  forgotPassword: (username: string, email: string, password: string) =>
    Promise.resolve(),
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = React.useContext(AuthContext);
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate
      to="/login"
      replace
    />
  );
};

const App: React.FC = () => {
  //animations handling (setup)
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out",
      once: true,
      mirror: false,
      offset: 120,
    });
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [csrf, setCsrf] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const updateProfileImage = useCallback((newImageUrl: string) => {
    setProfileImage(newImageUrl);
  }, []);

  // Get CSRF token (either from response header or cookies)
  const getCSRF = useCallback(async () => {
    try {
      const cookies = document.cookie.split("; ");
      const csrfCookie = cookies.find((cookie) =>
        cookie.startsWith("csrftoken=")
      );
      const csrfToken = csrfCookie ? csrfCookie.split("=")[1] : "";

      if (csrfToken) {
        setCsrf(csrfToken);
      } else {
        console.error("CSRF token not found in cookies!");
      }
    } catch (error) {
      console.error("Error retrieving CSRF token:", error);
    }
  }, []);

  // Get session (this func checks if the user is authenticated)
  const getSession = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(BACKEND_BASE_URL + "auth/session/", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.isAuthenticated) {
        setIsAuthenticated(true);
        setUsername(data.username);
        setUserId(data.userId);
      } else {
        setIsAuthenticated(false);
        getCSRF(); // Get CSRF if not authenticated
      }
    } catch (error) {
      console.error("Session fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [getCSRF]);

  // Fetch session on mount
  useEffect(() => {
    getSession();
  }, [getSession]);

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        const res = await fetch(BACKEND_BASE_URL + "auth/login/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrf,
          },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        });

        // Handle non-successful responses
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Login failed:", errorData);

          // Check for specific error messages or status codes
          if (res.status === 404) {
            throw new Error("ACCOUNT_NOT_FOUND");
          } else if (res.status === 401 || res.status === 403) {
            throw new Error("INVALID_CREDENTIALS");
          } else if (errorData.detail) {
            const errorMessage = errorData.detail.toLowerCase();

            if (errorMessage.includes("lock")) {
              throw new Error("ACCOUNT_LOCKED");
            } else if (errorMessage.includes("attempt")) {
              throw new Error("TOO_MANY_ATTEMPTS");
            }
          }

          // Generic error for other cases
          throw new Error("LOGIN_FAILED");
        }

        // Handle successful login
        const userData = await res.json();
        setIsAuthenticated(true);
        setUsername(username);

        // Get the userId from the response if available
        if (userData.userId) {
          setUserId(userData.userId);
        }

        // Reset profile image when a new user logs in
        setProfileImage(null);

        // Fetch the user profile immediately after login to get the profile image
        try {
          const userResponse = await fetch(
            BACKEND_BASE_URL + `api/users/${userData.userId || userId}/`,
            {
              credentials: "include",
            }
          );

          if (userResponse.ok) {
            const userProfileData = await userResponse.json();
            if (userProfileData.profile_image) {
              let imageUrl = userProfileData.profile_image;
              if (!imageUrl.startsWith("http")) {
                imageUrl = BACKEND_BASE_URL + imageUrl;
              }
              setProfileImage(imageUrl);
            }
          }
        } catch (profileError) {
          console.error(
            "Error fetching user profile after login:",
            profileError
          );
        }

        return userData;
      } catch (error) {
        // Rethrow errors with specific codes that were already set
        if (error instanceof Error) {
          if (
            [
              "ACCOUNT_NOT_FOUND",
              "INVALID_CREDENTIALS",
              "ACCOUNT_LOCKED",
              "TOO_MANY_ATTEMPTS",
              "LOGIN_FAILED",
            ].includes(error.message)
          ) {
            throw error;
          }
        }

        console.error("Login error:", error);
        throw new Error("LOGIN_FAILED");
      }
    },
    [csrf, userId]
  );

  // recover password function
  // const forgotPassword = useCallback(
  //   async (username: string, email: string, password: string) => {
  //     try {
  //       const res = await fetch(BACKEND_BASE_URL + "auth/forgot/", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           "X-CSRFToken": csrf,
  //         },
  //         credentials: "include",
  //         body: JSON.stringify({ username, email, password }),
  //       });

  //       if (!res.ok) {
  //         const errorData = await res.json();
  //         console.error("changed Password failed:", errorData);
  //         throw new Error("new password failed");
  //       }

  //       await res.json(); // Just consume the response without assigning to unused variable
  //       setUsername(username);
  //     } catch (error) {
  //       console.error("change password error:", error);
  //     }
  //   },
  //   [csrf]
  // );

  // recover password function
  const forgotPassword = useCallback(
    async (username: string, email: string, password: string) => {
      try {
        const res = await fetch(BACKEND_BASE_URL + "auth/forgot/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrf,
          },
          credentials: "include",
          body: JSON.stringify({ username, email, password }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("changed Password failed:", errorData);
          throw new Error("new password failed");
        }

        await res.json(); // Just consume the response without assigning to unused variable
        setUsername(username);
      } catch (error) {
        console.error("change password error:", error);
      }
    },
    [csrf]
  );

  const signup = useCallback(
    async (username: string, email: string, password: string) => {
      try {
        const res = await fetch(BACKEND_BASE_URL + "auth/signup/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrf,
          },
          credentials: "include",
          body: JSON.stringify({ username, email, password }),
        });

        // Handle non-successful responses
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Signup failed:", errorData);

          // Map specific error messages from backend to expected error types
          if (errorData.detail) {
            const errorMessage = errorData.detail.toLowerCase();

            if (
              errorMessage.includes("email") &&
              (errorMessage.includes("registered") ||
                errorMessage.includes("exists") ||
                errorMessage.includes("taken"))
            ) {
              throw new Error("EMAIL_EXISTS");
            } else if (
              errorMessage.includes("username") &&
              (errorMessage.includes("taken") ||
                errorMessage.includes("exists") ||
                errorMessage.includes("already"))
            ) {
              throw new Error("USERNAME_EXISTS");
            }
          }

          // Generic error if we can't determine the specific type
          throw new Error("SIGNUP_FAILED");
        }

        // Handle successful response
        const userData = await res.json();
        setIsAuthenticated(true);
        setUsername(username);

        // Set userId if available in response
        if (userData.userId) {
          setUserId(userData.userId);
        }

        return userData;
      } catch (error) {
        // Rethrow errors with specific codes that were already set
        if (error instanceof Error) {
          if (
            ["EMAIL_EXISTS", "USERNAME_EXISTS", "SIGNUP_FAILED"].includes(
              error.message
            )
          ) {
            throw error;
          }
        }

        // Log and rethrow any other errors as a generic signup failure
        console.error("Signup error:", error);
        throw new Error("SIGNUP_FAILED");
      }
    },
    [csrf]
  );

  const logout = useCallback(async () => {
    try {
      await fetch(BACKEND_BASE_URL + "auth/logout/", {
        credentials: "include",
      });
      setIsAuthenticated(false);
      setUsername("");
      setUserId(null);
      setProfileImage(null);
      getCSRF();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [getCSRF]);

  const authContextValue = useMemo(
    () => ({
      isAuthenticated,
      username,
      userId,
      profileImage,
      csrf,
      login,
      signup,
      logout,
      updateProfileImage,
      forgotPassword,
    }),
    [
      isAuthenticated,
      username,
      userId,
      profileImage,
      csrf,
      login,
      signup,
      logout,
      updateProfileImage,
      forgotPassword,
    ]
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authContextValue}>
        <Router>
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="/signup"
              element={<Signup />}
            />
            <Route
              path="/forgot"
              element={<ForgotPassword />}
            />
            {/* Protected Routes */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/habits"
              element={
                <ProtectedRoute>
                  <Habits />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  <JournalContainer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings key={userId} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
