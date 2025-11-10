import postgres from "postgres";
import fs from "fs";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

console.log("🔧 Applying schema fix to users table...\n");

// Create connection with forced IPv4 for Render
const sql = postgres(databaseUrl, {
  ssl: { rejectUnauthorized: false },
  // Force IPv4 connection - Render has issues with IPv6
  socket: {
    family: 4, // 4 = IPv4, 6 = IPv6
  },
});

try {
  // Read the SQL file
  const fixSql = fs.readFileSync("./fix-schema.sql", "utf-8");
  
  // Split by newlines and execute each statement
  const statements = fixSql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    console.log(`Executing: ${statement.substring(0, 60)}...`);
    await sql.unsafe(statement);
  }

  console.log("\n✅ Schema fix applied successfully!");
  console.log("✅ All missing columns have been added to users table\n");
  
  // Verify the columns exist
  const result = await sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    ORDER BY column_name;
  `;
  
  console.log("Users table columns:");
  result.forEach(row => console.log(`  - ${row.column_name}`));
  
} catch (error) {
  console.error("❌ Error applying schema fix:", error);
  process.exit(1);
} finally {
  await sql.end();
}