import { promises as dns } from "dns";
import { spawn } from "child_process";

async function resolveAndStart() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log("DATABASE_URL not set, starting normally...");
    startApp();
    return;
  }
  
  try {
    const urlObj = new URL(databaseUrl);
    const hostname = urlObj.hostname;
    
    console.log(`📍 Resolving ${hostname} to IPv4...`);
    const addresses = await dns.resolve4(hostname);
    
    if (addresses.length === 0) {
      console.warn("No IPv4 addresses found, using original URL");
      startApp();
      return;
    }
    
    const ipv4 = addresses[0];
    console.log(`✅ Resolved to: ${ipv4}`);
    
    // Replace hostname with IP in DATABASE_URL
    const resolvedUrl = databaseUrl.replace(hostname, ipv4);
    process.env.DATABASE_URL = resolvedUrl;
    
    console.log("🚀 Starting app with IPv4...\n");
    startApp();
  } catch (error) {
    console.error("Failed to resolve hostname:", error);
    console.log("Starting with original URL...\n");
    startApp();
  }
}

function startApp() {
  // Start npm start as a child process
  const proc = spawn("npm", ["start"], {
    stdio: "inherit",
    shell: true,
  });
  
  proc.on("exit", (code) => {
    process.exit(code || 0);
  });
}

resolveAndStart().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});