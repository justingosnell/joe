import { Switch, Route, Redirect } from "wouter";
import { Auth0Provider } from "@auth0/auth0-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/PageTransition";
import Home from "@/pages/home";
import Map from "@/pages/map";
import Login from "@/pages/login";
import Admin from "@/pages/admin";
import Categories from "@/pages/categories";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

if (!auth0Domain || !auth0ClientId) {
  throw new Error("Missing Auth0 environment variables");
}

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  return (
    <PageTransition>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/map" component={Map} />
        <Route path="/login" component={Login} />
        <Route path="/auth/reset-password" component={ResetPassword} />
        <Route path="/admin">
          {() => <ProtectedRoute component={Admin} />}
        </Route>
        <Route path="/categories">
          {() => <ProtectedRoute component={Categories} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

function App() {
  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Auth0Provider>
  );
}

export default App;
