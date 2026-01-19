
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./shared/schema.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

async function checkPassword() {
  const databaseUrl = process.env.DATABASE_URL;
  const adminPassword = process.env.INIT_ADMIN_PASSWORD;
  const adminUsername = process.env.INIT_ADMIN_USERNAME;

  if (!databaseUrl || !adminPassword || !adminUsername) {
    console.error("Missing env vars");
    process.exit(1);
  }

  const cleanUrl = databaseUrl.replace('?sslmode=require', '');
  const client = postgres(cleanUrl, {
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(client, { schema });

  try {
    const user = await db.select().from(schema.users).where((u) => {
      // Manual filter in JS if needed, but eq should work
      return undefined;
    });
    
    const allUsers = await db.select().from(schema.users);
    const admin = allUsers.find(u => u.username === adminUsername);

    if (!admin) {
      console.log(`User ${adminUsername} not found`);
    } else {
      const match = await bcrypt.compare(adminPassword, admin.password);
      console.log(`Password match for ${adminUsername}: ${match}`);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

checkPassword();
