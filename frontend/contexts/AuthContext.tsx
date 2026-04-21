"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useGetUserQuery, useLogoutMutation } from "@/store/api/auth";

interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  bio?: string;
  phone?: string;
  website?: string;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const { data: userData, isLoading, error, refetch } = useGetUserQuery();
  const [logoutUser] = useLogoutMutation();

  useEffect(() => {
    if (!isLoading) {
      if (userData?.success) {
        setUser(userData.user);
      } else {
        setUser(null);
        router.push("/login");
      }
      setLoading(false);
    }
  }, [userData, isLoading, error, router]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser().unwrap();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    await refetch();
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
