const https = require("http");

// Fetch locations
const locReq = https.get("http://localhost:3000/api/locations", (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const locations = JSON.parse(data);
      console.log(`\n📍 Total locations: ${locations.length}`);

      // Count locations with photos
      const locationsWithPhotos = locations.filter(
        (l) => l.photoUrl && l.photoUrl.trim() !== ""
      );
      console.log(`📸 Locations with photos: ${locationsWithPhotos.length}`);

      // Get all photoIds
      const photoIds = new Set(locations.map((l) => l.photoId).filter(Boolean));
      console.log(`🔗 Unique photo IDs referenced: ${photoIds.size}`);

      // Show some sample photoIds
      const photoIdArray = Array.from(photoIds);
      console.log("\n Sample photoIds:");
      photoIdArray.slice(0, 5).forEach((id) => {
        console.log(`   - ${id}`);
      });
      if (photoIdArray.length > 5) {
        console.log(`   ... and ${photoIdArray.length - 5} more`);
      }

      process.exit(0);
    } catch (e) {
      console.error("Failed to parse locations:", e.message);
      process.exit(1);
    }
  });
});

locReq.on("error", (e) => {
  console.error("Failed to fetch locations:", e.message);
  process.exit(1);
});
