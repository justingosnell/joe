import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { createClient } from "@supabase/supabase-js";
import type { AuthError } from "@supabase/supabase-js";

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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Supabase config check:", {
  url: supabaseUrl ? "✓" : "✗",
  key: supabaseAnonKey ? "✓" : "✗",
});

let supabase: any;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.error("❌ Failed to create Supabase client:", error);
  supabase = null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    let mounted = true;

    const setupAuthListener = () => {
      if (!supabase) {
        console.error("❌ Supabase client not initialized");
        setIsLoading(false);
        return null;
      }

      try {
        console.log("🔐 Setting up Supabase auth listener...");
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mounted) return;

            console.log("🔔 Auth state changed:", event, session?.user?.email);
            if (session?.user) {
              setUser({
                id: session.user.id,
                email: session.user.email || "",
                username: session.user.user_metadata?.username,
              });
              setToken(session.access_token);
            } else {
              setUser(null);
              setToken(null);
            }
            setIsLoading(false);
          }
        );

        console.log("✅ Auth listener set up successfully");
        return subscription;
      } catch (error) {
        console.error("❌ Failed to set up auth listener:", error);
        setIsLoading(false);
        return null;
      }
    };

    const subscription = setupAuthListener();

    return () => {
      mounted = false;
      try {
        subscription?.unsubscribe?.();
      } catch (error) {
        console.error("Error unsubscribing:", error);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error("Authentication service not available");
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Don't redirect immediately - let the auth state change handle it
      // The auth listener will detect the login and update the UI accordingly
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(authError.message || "Login failed");
    }
  };

  const logout = async () => {
    if (!supabase) {
      setUser(null);
      setToken(null);
      setLocation("/login");
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      setLocation("/login");
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      throw new Error("Authentication service not available");
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(authError.message || "Password reset failed");
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!supabase) {
      throw new Error("Authentication service not available");
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(authError.message || "Password update failed");
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await updatePassword(newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, resetPassword, updatePassword, changePassword }}>
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
