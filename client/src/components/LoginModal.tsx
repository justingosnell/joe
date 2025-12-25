import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { user } = useAuth();
  const { loginWithRedirect } = useAuth0();

  if (!open) return null;

  if (user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-6 max-w-sm">
          <h2 className="text-lg font-semibold mb-2">Already Signed In</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You are already logged in as {user.email}
          </p>
          <button
            onClick={() => onOpenChange(false)}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleLogin = async () => {
    await loginWithRedirect({
      appState: { returnTo: "/admin" },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Admin Access</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Login to manage locations
        </p>
        <Button onClick={handleLogin} className="w-full">
          Sign In with Auth0
        </Button>
      </div>
    </div>
  );
}
