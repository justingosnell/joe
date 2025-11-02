import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Camera, Signpost } from "lucide-react";
import { MediaSlideshow } from "@/components/MediaSlideshow";
import { HomeMapSection } from "@/components/HomeMapSection";
import { getApiUrl } from "@/lib/api";
import type { Location } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch locations from API
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/locations"));
      if (!response.ok) throw new Error("Failed to fetch locations");
      return response.json();
    },
  });

  // Category collections - hardcoded
  const categoryCollections = useMemo(() => {
    return [
      {
        title: "Muffler Men",
        description: "Giant fiberglass figures that once advertised businesses",
        category: "muffler-men",
        count: locations.filter(loc => loc.category === "muffler-men").length,
        icon: "🗿",
        color: "#f97316",
      },
      {
        title: "World's Largest",
        description: "Oversized objects claiming to be the biggest",
        category: "worlds-largest",
        count: locations.filter(loc => loc.category === "worlds-largest").length,
        icon: "🏆",
        color: "#eab308",
      },
      {
        title: "Unique Finds",
        description: "One-of-a-kind oddities and curiosities",
        category: "unique-finds",
        count: locations.filter(loc => loc.category === "unique-finds").length,
        icon: "✨",
        color: "#10b981",
      },
    ];
  }, [locations]);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return locations.filter(loc => 
      loc.name.toLowerCase().includes(query) ||
      loc.description?.toLowerCase().includes(query) ||
      loc.city.toLowerCase().includes(query) ||
      loc.state.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [locations, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading attractions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-12 py-8 px-6 rounded-lg" style={{ backgroundColor: "#dde4e7" }}>
          <p className="text-xl text-amber-800 mb-8 max-w-2xl mx-auto">
            Discover America's most peculiar landmarks, oversized oddities, and forgotten wonders
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-300">{locations.length}</div>
              <div className="text-sm text-amber-700">Attractions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-300">
                {new Set(locations.map(l => l.state)).size}
              </div>
              <div className="text-sm text-amber-700">States</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-300">
                {locations.filter(l => l.photoUrl).length}
              </div>
              <div className="text-sm text-amber-700">Photos</div>
            </div>
          </div>
        </section>

        {/* Slideshow Section */}
        <section className="mb-12 py-8 px-6 rounded-lg" style={{ backgroundColor: "#f3f4f6" }}>
          <MediaSlideshow />
        </section>



        {/* Category Collections */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-slate-900">Quirky Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryCollections.map((collection) => (
              <Card
                key={collection.category}
                className="border-0 shadow-2xl cursor-pointer group bg-blue-50 rounded-lg overflow-hidden"
              >
                <CardHeader className="bg-blue-50">
                </CardHeader>
                <CardContent className="pt-6 bg-blue-50">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {collection.icon}
                  </div>
                  <CardTitle className="text-xl text-slate-900">
                    {collection.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {collection.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-700">
                      {collection.count}
                    </span>
                    <Button className="border-2 border-white text-white bg-transparent hover:bg-white/20">
                      Explore →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Interactive Map Section */}
        <HomeMapSection />

        {/* Call to Action */}
        <section className="text-center py-12">
          <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-100 to-amber-100 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-amber-900">
                Know of an Offbeat Sight?
              </CardTitle>
              <CardDescription className="text-lg text-amber-800">
                Help us document America's roadside wonders. Share your discoveries!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8">
                Submit a Tip
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-2">RoadsideMapper</p>
          <p className="text-sm text-amber-300">
            Documenting America's quirky roadside attractions, one oddity at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}