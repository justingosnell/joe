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
import { CategorySlideshowModal } from "@/components/CategorySlideshowModal";
import { getApiUrl } from "@/lib/api";
import type { Location } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch locations from API
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/locations"));
      if (!response.ok) throw new Error("Failed to fetch locations");
      return response.json();
    },
  });

  // Fetch categories from API
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/categories"));
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Category collections - dynamically generated from API
  const categoryCollections = useMemo(() => {
    return categories
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map(category => ({
        title: category.name,
        description: category.description,
        category: category.slug,
        count: locations.filter(loc => loc.category === category.slug).length,
        icon: category.icon,
        color: category.color,
        backgroundImageUrl: (category as any).backgroundImageUrl,
        overlayColor: (category as any).overlayColor,
        overlayOpacity: (category as any).overlayOpacity,
        textColor: (category as any).textColor,
        customIconUrl: (category as any).customIconUrl,
      }));
  }, [categories, locations]);

  // Get images for selected category
  const categoryImages = useMemo(() => {
    if (!selectedCategory) return [];
    return locations.filter(
      (loc) => loc.category === selectedCategory && loc.photoUrl
    );
  }, [locations, selectedCategory]);

  // Get category title for modal
  const selectedCategoryTitle = useMemo(() => {
    if (!selectedCategory) return "";
    return (
      categoryCollections.find((cat) => cat.category === selectedCategory)
        ?.title || ""
    );
  }, [selectedCategory, categoryCollections]);

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
            Discover America's most peculiar landmarks, Colossal Objects, and Roadside Relics
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
          </div>
        </section>

        {/* Category Collections */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-foreground" style={{ fontFamily: '"Luckiest Guy", cursive' }}>Roadside Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryCollections.map((collection) => {
              const backgroundImage = (collection as any).backgroundImageUrl || null;
              const overlayColor = (collection as any).overlayColor || "#000000";
              const overlayOpacity = parseFloat((collection as any).overlayOpacity || "0.5");
              const textColor = (collection as any).textColor || "#ffffff";
              const customIcon = (collection as any).customIconUrl || null;

              return (
                <Card
                  key={collection.category}
                  className="border shadow-md cursor-pointer group rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-64 relative"
                >
                  {backgroundImage && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${backgroundImage}')`,
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: overlayColor,
                      opacity: overlayOpacity,
                    }}
                  />
                  <CardContent className="p-4 relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-5xl group-hover:scale-110 transition-transform flex items-center justify-center w-16 h-16">
                        {customIcon ? (
                          <img
                            src={customIcon}
                            alt={collection.title}
                            className="w-16 h-16 object-contain"
                          />
                        ) : collection.icon.startsWith("http") ||
                          collection.icon.startsWith("/") ? (
                          <img
                            src={collection.icon}
                            alt={collection.title}
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          collection.icon
                        )}
                      </div>
                      <div className="flex-1 text-center">
                        <CardTitle
                          className="text-lg line-clamp-2"
                          style={{ 
                            color: textColor,
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          {collection.title}
                        </CardTitle>
                        <CardDescription style={{ color: "#fff", opacity: 0.8 }} className="text-sm line-clamp-3">
                          {collection.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-4xl font-bold"
                        style={{ color: textColor }}
                      >
                        {collection.count}
                      </span>
                      <button
                        className="ribbon-badge-custom text-xs cursor-pointer transition-all hover:scale-105"
                        style={{
                          backgroundColor: textColor,
                          color: overlayColor,
                          '--ribbon-bg': textColor,
                        } as React.CSSProperties & { '--ribbon-bg': string }}
                        onClick={() => {
                          setSelectedCategory(collection.category);
                          setIsModalOpen(true);
                        }}
                      >
                        See All →
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Interactive Map Section */}
        <HomeMapSection />

        {/* Slideshow Section */}
        <section className="mb-12 py-8 px-6 rounded-lg bg-card border border-border">
          <MediaSlideshow />
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
      <footer className="shape-divider bg-card border-t border-border text-foreground py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg mb-2">Brought to you by: Joe Bosse</p>
          <p className="text-sm text-muted-foreground">
            Documenting America's peculiar roadside attractions, one oddity at a time.
          </p>
        </div>
      </footer>

      <CategorySlideshowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryTitle={selectedCategoryTitle}
        images={categoryImages}
      />
    </div>
  );
}
