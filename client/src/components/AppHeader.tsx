import { MapIcon, Facebook } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  isConnected: boolean;
  onConnectFacebook?: () => void;
}

export function AppHeader({ isConnected, onConnectFacebook }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <MapIcon className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold" data-testid="text-app-title">
              Roadside Attractions
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Facebook Photo Map
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="secondary" className="gap-1" data-testid="badge-facebook-connected">
              <SiFacebook className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onConnectFacebook}
              data-testid="button-connect-facebook"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Connect Facebook
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
