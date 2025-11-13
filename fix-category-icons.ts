import { initializeDatabase, db } from "./server/db";
import { categories } from "@shared/schema";
import { eq } from "drizzle-orm";

async function fixCategoryIcons() {
  await initializeDatabase();
  
  console.log("🔄 Fixing category icons...\n");
  
  // Reset all category icons to default emoji
  const result = await db.update(categories)
    .set({ icon: "📍" })
    .returning();
  
  console.log(`✅ Updated ${result.length} categories with default emoji icon\n`);
  
  result.forEach(cat => {
    console.log(`  - ${cat.name}: ${cat.icon}`);
  });
}

fixCategoryIcons();
