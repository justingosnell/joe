import { storage } from "./server/storage";

async function debugStates() {
  const locations = await storage.getAllLocations();
  
  const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
    "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
    "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming"
  ];
  
  const statesInDB = new Set(locations.map(loc => loc.state));
  const stateArray = Array.from(statesInDB).sort();
  
  console.log(`\n📊 DEBUG: State Analysis`);
  console.log(`Total locations: ${locations.length}`);
  console.log(`Unique states in DB: ${stateArray.length}`);
  console.log(`\nStates in database:`);
  stateArray.forEach(state => console.log(`  - "${state}"`));
  
  console.log(`\n❌ States NOT in US_STATES array (causing the bug):`);
  const mismatchedStates = stateArray.filter(state => !US_STATES.includes(state));
  if (mismatchedStates.length === 0) {
    console.log(`  None found - all states match`);
  } else {
    mismatchedStates.forEach(state => console.log(`  - "${state}"`));
  }
  
  console.log(`\n✓ States WITH attractions: ${stateArray.length}`);
  console.log(`Remaining: ${US_STATES.length} - ${stateArray.length} = ${US_STATES.length - stateArray.length}`);
  console.log(`But you're seeing: 7 remaining (math error!)`);
}

debugStates().catch(console.error);
