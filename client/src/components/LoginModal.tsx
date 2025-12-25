import { SignIn } from "@clerk/clerk-react";
import { useAuth } from "@/hooks/useAuth";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { user } = useAuth();

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg w-full max-w-md">
        <button
          onClick={() => onOpenChange(false)}
          className="float-right p-4 text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
        <div className="p-6 pt-0">
          <SignIn
            afterSignInUrl="/admin"
            routing="hash"
          />
        </div>
      </div>
    </div>
  );
}
