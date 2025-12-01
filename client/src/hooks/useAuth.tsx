import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { getApiUrl } from "@/lib/api";

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const checkAuth = async (skipLoadingUpdate: boolean = false) => {
    try {
      console.log("🔍 Checking auth...");
      const response = await fetch(getApiUrl("/api/auth/me"), {
        credentials: "include",
      });

      console.log("✅ Auth check response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Auth check success, user:", data.user);
        setUser(data.user);
      } else {
        console.log("❌ Auth check failed, status:", response.status);
        const errorData = await response.json().catch(() => ({}));
        console.log("Error details:", errorData);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      if (!skipLoadingUpdate) {
        setIsLoading(false);
      }
    }
  };

  const login = async (username: string, password: string) => {
    console.log("🔐 Attempting login for user:", username);
    const response = await fetch(getApiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    console.log("📡 Login response status:", response.status);
    
    if (!response.ok) {
      const data = await response.json();
      console.error("❌ Login failed:", data.message);
      throw new Error(data.message || "Login failed");
    }

    const data = await response.json();
    console.log("✅ Login successful, user data:", data.user);
    setUser(data.user);
    
    // Wait for auth check to verify session is established before redirecting
    // Skip loading update since we already have the user data
    console.log("🔄 Verifying session...");
    await checkAuth(true);
    console.log("✅ Session verified, redirecting to /admin");
    setLocation("/admin");
  };

  const logout = async () => {
    try {
      await fetch(getApiUrl("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setLocation("/login");
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await fetch(getApiUrl("/api/auth/change-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to change password");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}