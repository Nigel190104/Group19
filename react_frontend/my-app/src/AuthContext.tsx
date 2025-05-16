import React, { useState, useCallback, useMemo, ReactNode } from "react";

export type AuthContextType = {
  isAuthenticated: boolean;
  username: string;
  userAvatar: File | null;
  csrf: string;
  login: (username: string, password: string) => Promise<void>;
  signup: (
    username: string,
    email: string,
    password: string,
    profileImage?: File | null
  ) => Promise<void>;
  logout: () => void;
};

export const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  username: "",
  userAvatar: null,
  csrf: "",
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [userAvatar, setUserAvatar] = useState<File | null>(null);
  const [csrf, setCsrf] = useState("");

  const login = useCallback(async (u: string, p: string) => {
    setIsAuthenticated(true);
    setUsername(u);
    setUserAvatar(null);
  }, []);

  const signup = useCallback(
    async (
      u: string,
      e: string,
      pw: string,
      profileImage?: File | null
    ) => {
      setIsAuthenticated(true);
      setUsername(u);
      setUserAvatar(profileImage || null);
    },
    []
  );

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setUsername("");
    setUserAvatar(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      username,
      userAvatar,
      csrf,
      login,
      signup,
      logout,
    }),
    [isAuthenticated, username, userAvatar, csrf, login, signup, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
