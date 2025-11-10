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
    
    // Apply schema fix before starting
    console.log("\n🔧 Applying schema fixes...");
    await applySchemaFix(resolvedUrl);
    
    console.log("\n🚀 Starting app with IPv4...\n");
    startApp();
  } catch (error) {
    console.error("Failed to resolve hostname:", error);
    console.log("Starting with original URL...\n");
    startApp();
  }
}

async function applySchemaFix(databaseUrl: string) {
  try {
    const sql = postgres(databaseUrl, {
      ssl: { rejectUnauthorized: false },
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