import { initializeDatabase, db } from "./server/db";
import { categories } from "@shared/schema";

async function checkCategories() {
  await initializeDatabase();
  
  const allCategories = await db.select().from(categories);
  console.log(`Total categories: ${allCategories.length}\n`);
  
  allCategories.forEach((cat, i) => {
    console.log(`${i + 1}. ID: ${cat.id}`);
    console.log(`   Name: ${cat.name}`);
    console.log(`   Slug: ${cat.slug}`);
    console.log(`   Icon: ${cat.icon}`);
    console.log(`   Color: ${cat.color}`);
    console.log();
  });
}

checkCategories();
