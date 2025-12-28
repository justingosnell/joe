
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const adminUsername = process.env.INIT_ADMIN_USERNAME;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
  console.log(`Checking for user: ${adminUsername}`);
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  const foundUser = users.find(u => u.email === adminUsername);
  
  if (foundUser) {
    console.log(`✅ User found: ${foundUser.email} (ID: ${foundUser.id})`);
  } else {
    console.log(`❌ User '${adminUsername}' NOT found.`);
    console.log("Existing users:");
    users.forEach(u => console.log(`- ${u.email}`));
  }
}

checkUser();
