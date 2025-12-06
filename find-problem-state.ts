import { initializeDatabase } from "./server/db";
import { storage } from "./server/storage";

async function findProblemState() {
  await initializeDatabase();
  
  const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
    "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
    "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming"
  ];

  const locations = await storage.getAllLocations();
  const dbStates = new Set(locations.map(l => l.state));
  const statesArray = Array.from(dbStates).sort();
  const problemStates = statesArray.filter(s => !US_STATES.includes(s));

  console.log("\n📊 DATABASE ANALYSIS");
  console.log(`Total locations: ${locations.length}`);
  console.log(`Unique states: ${statesArray.length}`);
  console.log(`States in US_STATES array: ${US_STATES.length}`);

  console.log(`\n✓ All states with attractions:`);
  statesArray.forEach(s => {
    const count = locations.filter(l => l.state === s).length;
    const mark = US_STATES.includes(s) ? "✓" : "❌";
    console.log(`  ${mark} ${s} (${count} locations)`);
  });

  if (problemStates.length > 0) {
    console.log(`\n❌ PROBLEM FOUND - States NOT in US_STATES array:`);
    problemStates.forEach(s => {
      const count = locations.filter(l => l.state === s).length;
      console.log(`  - '${s}' (${count} locations) ← THIS IS THE BUG!`);
    });
  } else {
    console.log(`\n✓ All states match the array - problem is elsewhere`);
  }

  console.log(`\n📈 Math check:`);
  console.log(`  States with attractions: ${statesArray.length}`);
  console.log(`  Remaining (50 - ${statesArray.length}): ${50 - statesArray.length}`);
  console.log(`  Frontend shows: 7`);
  
  if (50 - statesArray.length !== 7) {
    console.log(`  ⚠️  Mismatch! Expected 7 remaining but calculation shows ${50 - statesArray.length}`);
  }
  
  process.exit(0);
}

findProblemState().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
