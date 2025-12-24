import { createContext, useContext, ReactNode } from "react";
import { useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/clerk-react";

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();

  const user = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || "",
    username: clerkUser.username || clerkUser.firstName || undefined,
  } : null;

  const login = async (email: string, password: string) => {
    throw new Error("Use Clerk's sign-in modal instead");
  };

  const logout = async () => {
    try {
      await signOut();
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const resetPassword = async (email: string) => {
    throw new Error("Password reset not available");
  };

  const updatePassword = async (newPassword: string) => {
    throw new Error("Password update not available");
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    throw new Error("Password change not available");
  };

  return (
    <AuthContext.Provider value={{ user, token: null, isLoading: !isLoaded, login, logout, resetPassword, updatePassword, changePassword }}>
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
