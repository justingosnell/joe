import { useState, useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CategoryFilter, type CategoryType } from "@/components/CategoryFilter";
import { StateFilter } from "@/components/StateFilter";
import { USMap } from "@/components/USMap";
import { PhotoPanel } from "@/components/PhotoPanel";
import type { Location } from "@shared/schema";

//todo: remove mock functionality - Replace with real Facebook Graph API data
const MOCK_LOCATIONS: Location[] = [
  {
    id: "1",
    name: "Giant Muffler Man - Wilmington",
    latitude: 41.3083,
    longitude: -88.1467,
    category: "muffler-men",
    state: "Illinois",
    photoUrl: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800",
    photoId: "fb_001",
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
    photoId: "fb_002",
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
    photoId: "fb_003",
    taggedDate: "2024-08-10",
  },
  {
    id: "4",
    name: "World's Largest Thermometer",
    latitude: 35.5944,
    longitude: -116.0733,
    category: "worlds-largest",
    state: "California",
    photoUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    photoId: "fb_004",
    taggedDate: "2024-05-12",
  },
  {
    id: "5",
    name: "Paul Bunyan Muffler Man",
    latitude: 44.8521,
    longitude: -93.2421,
    category: "muffler-men",
    state: "Minnesota",
    photoUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
    photoId: "fb_005",
    taggedDate: "2024-09-03",
  },
  {
    id: "6",
    name: "World's Largest Rocking Chair",
    latitude: 38.8183,
    longitude: -90.6906,
    category: "worlds-largest",
    state: "Missouri",
    photoUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800",
    photoId: "fb_006",
    taggedDate: "2024-04-25",
  },
  {
    id: "7",
    name: "Uniroyal Gal Muffler Woman",
    latitude: 33.4484,
    longitude: -112.0740,
    category: "muffler-men",
    state: "Arizona",
    photoUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
    photoId: "fb_007",
    taggedDate: "2024-03-18",
  },
  {
    id: "8",
    name: "World's Largest Catsup Bottle",
    latitude: 38.6270,
    longitude: -90.1994,
    category: "worlds-largest",
    state: "Illinois",
    photoUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800",
    photoId: "fb_008",
    taggedDate: "2024-10-05",
  },
  {
    id: "9",
    name: "Gemini Giant Muffler Man",
    latitude: 41.1520,
    longitude: -88.1792,
    category: "muffler-men",
    state: "Illinois",
    photoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
    photoId: "fb_009",
    taggedDate: "2024-02-14",
  },
  {
    id: "10",
    name: "World's Largest Mailbox",
    latitude: 41.2565,
    longitude: -95.9345,
    category: "worlds-largest",
    state: "Nebraska",
    photoUrl: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800",
    photoId: "fb_010",
    taggedDate: "2024-01-22",
  },
  {
    id: "11",
    name: "World's Largest Peanut",
    latitude: 33.4754,
    longitude: -84.4491,
    category: "worlds-largest",
    state: "Georgia",
    photoUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800",
    photoId: "fb_011",
    taggedDate: "2023-12-08",
  },
  {
    id: "12",
    name: "Chicken Boy Muffler Man",
    latitude: 34.0522,
    longitude: -118.2437,
    category: "muffler-men",
    state: "California",
    photoUrl: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800",
    photoId: "fb_012",
    taggedDate: "2023-11-17",
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isConnected] = useState(true); //todo: remove mock functionality - Replace with real Facebook connection status

  const filteredLocations = useMemo(() => {
    let filtered = MOCK_LOCATIONS;

    if (activeCategory !== "all") {
      filtered = filtered.filter((loc) => loc.category === activeCategory);
    }

    if (selectedState) {
      filtered = filtered.filter((loc) => loc.state === selectedState);
    }

    return filtered;
  }, [activeCategory, selectedState]);

  const categoryCounts = useMemo(() => {
    return {
      all: MOCK_LOCATIONS.length,
      "muffler-men": MOCK_LOCATIONS.filter((loc) => loc.category === "muffler-men").length,
      "worlds-largest": MOCK_LOCATIONS.filter((loc) => loc.category === "worlds-largest").length,
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <AppHeader 
        isConnected={isConnected}
        onConnectFacebook={() => console.log("Connect Facebook")} //todo: remove mock functionality
      />

      <main id="main-content" className="flex-1 overflow-hidden" role="main">
        <div className="h-full flex flex-col md:flex-row gap-0">
          <aside 
            className="md:w-1/4 bg-background border-r overflow-hidden" 
            role="complementary" 
            aria-label="Category filters"
          >
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              categoryCounts={categoryCounts}
            />
          </aside>

          <section className="md:w-2/4 relative" aria-label="Interactive map">
            <USMap
              locations={filteredLocations}
              activeCategory={activeCategory}
              selectedLocation={selectedLocation}
              onLocationClick={setSelectedLocation}
            />
          </section>

          <aside 
            className="md:w-1/4 bg-background border-l overflow-hidden" 
            role="complementary" 
            aria-label="State filters"
          >
            <StateFilter
              selectedState={selectedState}
              onStateChange={setSelectedState}
            />
          </aside>
        </div>
      </main>

      <PhotoPanel
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </div>
  );
}
