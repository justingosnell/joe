import { USMap } from "../USMap";
import { useState } from "react";
import type { Location } from "@shared/schema";

const mockLocations: Location[] = [
  {
    id: "1",
    name: "Giant Muffler Man",
    latitude: 41.8781,
    longitude: -87.6298,
    category: "muffler-men",
    state: "Illinois",
    photoUrl: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800",
    photoId: "fb_123",
    taggedDate: "2024-06-15",
  },
  {
    id: "2",
    name: "World's Largest Ball of Twine",
    latitude: 39.2026,
    longitude: -98.4842,
    category: "worlds-largest",
    state: "Kansas",
    photoUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800",
    photoId: "fb_124",
    taggedDate: "2024-07-20",
  },
  {
    id: "3",
    name: "Cowboy Muffler Man",
    latitude: 32.7767,
    longitude: -96.7970,
    category: "muffler-men",
    state: "Texas",
    photoUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    photoId: "fb_125",
    taggedDate: "2024-08-10",
  },
];

export default function USMapExample() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  return (
    <div className="h-screen w-full">
      <USMap
        locations={mockLocations}
        activeCategory="all"
        selectedLocation={selectedLocation}
        onLocationClick={(loc) => {
          console.log("Selected:", loc.name);
          setSelectedLocation(loc);
        }}
      />
    </div>
  );
}
