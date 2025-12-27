import { createContext, useContext, ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth0 } from "@auth0/auth0-react";
import { setAuthToken } from "@/lib/api";

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
  const { user: auth0User, isLoading, logout: auth0Logout, getAccessTokenSilently } = useAuth0();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const updateToken = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: (import.meta as any).env?.VITE_AUTH0_AUDIENCE || 'https://joebosse-app.us.auth0.com/api/v2/',
            scope: 'openid profile email',
          },
        });
        setAuthToken(token);
      } catch (error) {
        console.error("Failed to get Auth0 token:", error);
        setAuthToken(null);
      }
    };

    if (!isLoading && auth0User) {
      updateToken();
    } else if (!auth0User) {
      setAuthToken(null);
    }
  }, [auth0User, isLoading, getAccessTokenSilently]);

  const user = auth0User ? {
    id: auth0User.sub || "",
    email: auth0User.email || "",
    username: auth0User.nickname || auth0User.name || undefined,
  } : null;

  const login = async (email: string, password: string) => {
    throw new Error("Use Auth0 login instead");
  };

  const logout = async () => {
    try {
      await auth0Logout({ logoutParams: { returnTo: window.location.origin } });
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
    <AuthContext.Provider value={{ user, token: null, isLoading, login, logout, resetPassword, updatePassword, changePassword }}>
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
