
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

async function checkSessionTable() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const cleanUrl = databaseUrl.replace('?sslmode=require', '');
  const sql = postgres(cleanUrl, {
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'session'
      );
    `;
    console.log("Session table exists:", result[0].exists);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sql.end();
  }
}

checkSessionTable();
