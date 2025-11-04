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
        color: "#0ea5e9",
      },
      {
        title: "World's Largest",
        description: "Oversized objects claiming to be the biggest",
        category: "worlds-largest",
        count: locations.filter(loc => loc.category === "worlds-largest").length,
        icon: "🏆",
        color: "#0ea5e9",
      },
      {
        title: "Unique Finds",
        description: "One-of-a-kind oddities and curiosities",
        category: "unique-finds",
        count: locations.filter(loc => loc.category === "unique-finds").length,
        icon: "✨",
        color: "#0ea5e9",
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
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-12 py-8 px-6 rounded-lg bg-card border border-border">
          <p className="text-xl text-foreground mb-8 max-w-2xl mx-auto">
            Discover America's most peculiar landmarks, oversized oddities, and forgotten wonders
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{locations.length}</div>
              <div className="text-sm text-muted-foreground">Attractions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {new Set(locations.map(l => l.state)).size}
              </div>
              <div className="text-sm text-muted-foreground">States</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {locations.filter(l => l.photoUrl).length}
              </div>
              <div className="text-sm text-muted-foreground">Photos</div>
            </div>
          </div>
        </section>

        {/* Slideshow Section */}
        <section className="mb-12 py-8 px-6 rounded-lg bg-card border border-border">
          <MediaSlideshow />
        </section>



        {/* Interactive Map Section */}
        <HomeMapSection />

        {/* Category Collections */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Quirky Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryCollections.map((collection) => (
              <Card
                key={collection.category}
                className="border shadow-md cursor-pointer group bg-card rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader className="bg-card">
                </CardHeader>
                <CardContent className="pt-6 bg-card">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {collection.icon}
                  </div>
                  <CardTitle className="text-xl text-foreground">
                    {collection.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {collection.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {collection.count}
                    </span>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Explore →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12">
          <Card className="border-2 border-primary bg-card shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl text-foreground">
                Know of an Offbeat Sight?
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Help us document America's roadside wonders. Share your discoveries!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8">
                Submit a Tip
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border text-foreground py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-2">RoadsideMapper</p>
          <p className="text-sm text-muted-foreground">
            Documenting America's quirky roadside attractions, one oddity at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
