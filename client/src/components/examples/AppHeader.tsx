import { AppHeader } from "../AppHeader";
import { ThemeProvider } from "../ThemeProvider";
import { useState } from "react";

export default function AppHeaderExample() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <AppHeader
          isConnected={isConnected}
          onConnectFacebook={() => {
            console.log("Connect Facebook clicked");
            setIsConnected(true);
          }}
        />
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            Header component demo. Click "Connect Facebook" to see the connected state.
          </p>
        </div>
      </div>
    </ThemeProvider>
  );
}
