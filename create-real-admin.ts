
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const adminUsername = process.env.INIT_ADMIN_USERNAME;
let adminPassword = process.env.INIT_ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseServiceKey || !adminUsername || !adminPassword) {
  console.error("Missing environment variables");
  process.exit(1);
}

// Trim password just in case
adminPassword = adminPassword.trim();

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  console.log(`Creating user with email: ${adminUsername}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminUsername,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      username: adminUsername.split('@')[0],
      role: "admin"
    }
  });

  if (error) {
    console.error("Error creating user:", error.message);
    return;
  }

  console.log("User created successfully:");
  console.log(`Email: ${adminUsername}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`ID: ${data.user.id}`);
}

createAdminUser();
