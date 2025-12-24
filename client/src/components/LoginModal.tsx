import { SignIn } from "@clerk/clerk-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { user } = useAuth();

  if (user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Already Signed In</DialogTitle>
            <DialogDescription>
              You are already logged in as {user.email}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Visit the admin dashboard to manage locations.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0">
        <SignIn
          afterSignInUrl="/admin"
          signUpUrl="/sign-up"
          routing="hash"
        />
      </DialogContent>
    </Dialog>
  );
}
