import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Camera, TrendingUp, Sparkles, Signpost } from "lucide-react";
import { MediaSlideshow } from "@/components/MediaSlideshow";
import type { Location } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch locations from API
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await fetch("/api/locations");
      if (!response.ok) throw new Error("Failed to fetch locations");
      return response.json();
    },
  });

  // Get featured locations (first 4 with images)
  const featuredLocations = useMemo(() => {
    return locations
      .filter(loc => loc.imageUrl)
      .slice(0, 4);
  }, [locations]);

  // Get latest additions (most recent 6)
  const latestLocations = useMemo(() => {
    return [...locations]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6);
  }, [locations]);

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
        <section className="text-center mb-12 py-8">
          <p className="text-xl text-amber-800 mb-8 max-w-2xl mx-auto">
            Discover America's most peculiar landmarks, oversized oddities, and forgotten wonders
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{locations.length}</div>
              <div className="text-sm text-amber-700">Attractions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {new Set(locations.map(l => l.state)).size}
              </div>
              <div className="text-sm text-amber-700">States</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {locations.filter(l => l.imageUrl).length}
              </div>
              <div className="text-sm text-amber-700">Photos</div>
            </div>
          </div>
        </section>

        {/* Slideshow Section */}
        <section className="mb-12">
          <MediaSlideshow />
        </section>

        {/* Featured Attractions Carousel */}
        {featuredLocations.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-amber-900 flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-orange-500" />
              Featured Attractions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredLocations.map((location) => (
                <Card
                  key={location.id}
                  className="overflow-hidden border-2 border-amber-200 hover:border-orange-400 transition-all hover:shadow-xl cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden bg-amber-100">
                    <img
                      src={location.imageUrl!}
                      alt={location.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
                      {location.category.replace("-", " ")}
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-amber-900 line-clamp-2">
                      {location.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-amber-700">
                      <MapPin className="h-3 w-3" />
                      {location.city}, {location.state}
                    </CardDescription>
                  </CardHeader>
                  {location.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {location.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Category Collections */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-amber-900">Quirky Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryCollections.map((collection) => (
              <Card
                key={collection.category}
                className="border-2 border-amber-200 hover:border-orange-400 transition-all hover:shadow-xl cursor-pointer group bg-white/80 backdrop-blur"
              >
                <CardHeader>
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {collection.icon}
                  </div>
                  <CardTitle className="text-xl text-amber-900">
                    {collection.title}
                  </CardTitle>
                  <CardDescription className="text-amber-700">
                    {collection.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-600">
                      {collection.count}
                    </span>
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                      Explore →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Latest Additions */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-amber-900 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-orange-500" />
            Latest Additions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestLocations.map((location) => (
              <Card
                key={location.id}
                className="border border-amber-200 hover:border-orange-300 transition-all hover:shadow-md cursor-pointer group"
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {location.imageUrl ? (
                      <img
                        src={location.imageUrl}
                        alt={location.name}
                        className="w-20 h-20 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-amber-100 rounded flex items-center justify-center flex-shrink-0">
                        <Camera className="h-8 w-8 text-amber-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-amber-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {location.name}
                      </h4>
                      <p className="text-sm text-amber-700 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {location.city}, {location.state}
                      </p>
                      <Badge variant="secondary" className="mt-2 bg-orange-100 text-orange-700 text-xs">
                        {location.category.replace("-", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

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