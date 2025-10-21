import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/AppHeader";
import { CategoryFilter, type CategoryType } from "@/components/CategoryFilter";
import { StateFilter } from "@/components/StateFilter";
import { USMap } from "@/components/USMap";
import { PhotoPanel } from "@/components/PhotoPanel";
import type { Location } from "@shared/schema";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Fetch locations from API
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await fetch("/api/locations");
      if (!response.ok) throw new Error("Failed to fetch locations");
      return response.json();
    },
  });

  const filteredLocations = useMemo(() => {
    let filtered = locations;

    if (activeCategory !== "all") {
      filtered = filtered.filter((loc) => loc.category === activeCategory);
    }

    if (selectedState) {
      filtered = filtered.filter((loc) => loc.state === selectedState);
    }

    return filtered;
  }, [locations, activeCategory, selectedState]);

  const categoryCounts = useMemo(() => {
    return {
      all: locations.length,
      "muffler-men": locations.filter(loc => loc.category === "muffler-men").length,
      "worlds-largest": locations.filter(loc => loc.category === "worlds-largest").length,
      "unique-finds": locations.filter(loc => loc.category === "unique-finds").length,
    };
  }, [locations]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <AppHeader />

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
