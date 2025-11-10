import { promises as dns } from "dns";
import { spawn } from "child_process";
import postgres from "postgres";
import fs from "fs";

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
    
    console.log(`📍 Attempting to resolve ${hostname} to IPv4...`);
    
    let ipv4: string | null = null;
    let lastError: Error | null = null;
    
    // Retry logic: try up to 3 times with backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Try dns.lookup() first - works better in some environments
        try {
          const result = await dns.lookup(hostname, { family: 4 });
          ipv4 = result.address;
          console.log(`✅ Resolved via dns.lookup() to: ${ipv4}`);
          break;
        } catch (lookupErr) {
          lastError = lookupErr as Error;
          console.warn(`Attempt ${attempt}: dns.lookup() failed`);
          
          // Try dns.resolve4()
          try {
            const addresses = await dns.resolve4(hostname);
            if (addresses.length > 0) {
              ipv4 = addresses[0];
              console.log(`✅ Resolved via dns.resolve4() to: ${ipv4}`);
              break;
            }
          } catch (resolve4Err) {
            lastError = resolve4Err as Error;
            console.warn(`Attempt ${attempt}: dns.resolve4() failed`);
            
            // Try dns.resolve() as fallback
            try {
              const addresses = await dns.resolve(hostname);
              const ipv4Addresses = addresses.filter(addr => !addr.includes(':'));
              if (ipv4Addresses.length > 0) {
                ipv4 = ipv4Addresses[0];
                console.log(`✅ Resolved via dns.resolve() to: ${ipv4}`);
                break;
              }
            } catch (resolveErr) {
              lastError = resolveErr as Error;
              console.warn(`Attempt ${attempt}: dns.resolve() failed`);
            }
          }
        }
        
        // If we're here, all methods failed - wait before retry
        if (attempt < 3) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (err) {
        lastError = err as Error;
      }
    }
    
    if (ipv4) {
      // Replace hostname with IP in DATABASE_URL
      const resolvedUrl = databaseUrl.replace(hostname, ipv4);
      process.env.DATABASE_URL = resolvedUrl;
      
      // Apply schema fix before starting
      console.log("\n🔧 Applying schema fixes...");
      await applySchemaFix(resolvedUrl);
      
      console.log("\n🚀 Starting app with IPv4...\n");
    } else {
      console.warn("⚠️  Could not resolve to IPv4 after 3 attempts");
      if (lastError) {
        console.warn(`Last error: ${lastError.message}`);
      }
      console.log("💡 postgres client will force IPv4-only connections (family: 4)\n");
      console.log("🚀 Starting app...\n");
    }
    
    startApp();
  } catch (error) {
    console.error("Fatal error during resolution:", error);
    console.log("Starting app anyway...\n");
    startApp();
  }
}

async function applySchemaFix(databaseUrl: string) {
  try {
    // Force IPv4 in schema fix connection too
    const sql = postgres(databaseUrl, {
      ssl: { rejectUnauthorized: false },
      socket: {
        family: 4, // Force IPv4
      },
    });

    // Read the SQL file if it exists
    if (fs.existsSync("./fix-schema.sql")) {
      const fixSql = fs.readFileSync("./fix-schema.sql", "utf-8");
      
      // Split by newlines and execute each statement
      const statements = fixSql
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        try {
          await sql.unsafe(statement);
        } catch (err) {
          // Ignore "already exists" errors - these are expected
          if (!String(err).includes("already exists")) {
            console.warn(`Warning during schema fix: ${err}`);
          }
        }
      }
      
      console.log("✅ Schema fixes applied");
    }
    
    await sql.end();
  } catch (error) {
    console.warn("⚠️  Could not apply schema fix (this is not critical):", error);
    // Don't fail - this is not critical, migrations will handle it
  }
}

function startApp() {
  // Start npm start as a child process with IPv4 preference
  const env = {
    ...process.env,
    NODE_OPTIONS: "--dns-result-order=ipv4first",
  };
  
  const proc = spawn("npm", ["start"], {
    stdio: "inherit",
    shell: true,
    env,
  });
  
  proc.on("exit", (code) => {
    process.exit(code || 0);
  });
}

resolveAndStart().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});