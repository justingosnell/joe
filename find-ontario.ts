import { initializeDatabase } from "./server/db";
import { storage } from "./server/storage";

async function findOntario() {
  await initializeDatabase();
  
  const locations = await storage.getAllLocations();
  const ontarioLocations = locations.filter(l => l.state === 'Ontario');
  
  console.log("\n📍 Location(s) with state 'Ontario':");
  ontarioLocations.forEach(loc => {
    console.log(`\n  Name: ${loc.name}`);
    console.log(`  City: ${loc.city}`);
    console.log(`  State: ${loc.state}`);
    console.log(`  ID: ${loc.id}`);
  });
  
  process.exit(0);
}

findOntario().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
