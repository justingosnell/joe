
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./shared/schema.js";
import dotenv from "dotenv";

dotenv.config();

async function checkUsers() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const cleanUrl = databaseUrl.replace('?sslmode=require', '');
  const client = postgres(cleanUrl, {
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(client, { schema });

  try {
    const allUsers = await db.select().from(schema.users);
    console.log(`Found ${allUsers.length} users:`);
    allUsers.forEach(u => {
      console.log(`- ${u.username}: role=${u.role}, isLocked=${u.isLocked}, failedAttempts=${u.failedLoginAttempts}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

checkUsers();
