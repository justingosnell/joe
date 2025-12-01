import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api";
import { LogOut, Plus, MapPin, Search, X, Image as ImageIcon, Upload, FileUp, FolderTree, Home, RefreshCw, ArrowUp } from "lucide-react";
import { LocationTable } from "@/components/LocationTable";
import { LocationDialog } from "@/components/LocationDialog";
import { MediaLibraryPanel } from "@/components/MediaLibraryPanel";
import { LogoSelectorDialog } from "@/components/LogoSelectorDialog";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { PhotoPanel } from "@/components/PhotoPanel";
import { CategoryManagement } from "@/components/CategoryManagement";
import type { Location, InsertLocation } from "@shared/schema";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedTab, setSelectedTab] = useState<"locations" | "categories" | "media">("locations");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      console.log("Scroll Y:", window.scrollY, "Show button:", window.scrollY > 300);
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Fetch locations
  const { data: allLocations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/locations"));
      if (!response.ok) throw new Error("Failed to fetch locations");
      return response.json();
    },
  });

  // Fetch settings for logo
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/settings"));
      if (!response.ok) return {};
      return response.json();
    },
  });

  // Filter locations based on search query
  const locations = useMemo(() => {
    if (!searchQuery.trim()) return allLocations;

    const query = searchQuery.toLowerCase();
    return allLocations.filter((location) => {
      // Search in basic fields
      if (location.name.toLowerCase().includes(query)) return true;
      if (location.state.toLowerCase().includes(query)) return true;
      if (location.category.toLowerCase().includes(query)) return true;
      
      // Search in custom fields
      try {
        const customFields = JSON.parse(location.customFields || "{}");
        const customFieldsString = Object.entries(customFields)
          .map(([key, value]) => `${key}:${value}`)
          .join(" ")
          .toLowerCase();
        if (customFieldsString.includes(query)) return true;
      } catch (e) {
        // Ignore parse errors
      }

      return false;
    });
  }, [allLocations, searchQuery]);

  // Create location mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertLocation) => {
      const response = await fetch(getApiUrl("/api/locations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create location");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({ title: "Success", description: "Location created successfully" });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update location mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertLocation> }) => {
      const response = await fetch(`/api/locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update location");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({ title: "Success", description: "Location updated successfully" });
      setIsDialogOpen(false);
      setEditingLocation(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete location mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete location");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({ title: "Success", description: "Location deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Re-geocode invalid locations mutation
  const regeocodeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(getApiUrl("/api/locations/regeocode-invalid"), {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to re-geocode locations");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({
        title: "Re-geocoding Complete",
        description: `Processed ${data.processed} locations, updated ${data.updated} coordinates`
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out", description: "You have been logged out successfully" });
    setLocation("/");
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: InsertLocation) => {
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingLocation(null);
  };

  return (
    <div className="w-full h-auto bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <MapPin className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Joe's Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Logged in as <strong>{user?.username}</strong>
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setIsLogoDialogOpen(true)} className="flex-1 sm:flex-none">
                <Upload className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Change Logo</span>
                <span className="sm:hidden">Logo</span>
              </Button>
              <Button
                onClick={() => regeocodeMutation.mutate()}
                variant="outline"
                className="flex-1 sm:flex-none"
                disabled={regeocodeMutation.isPending}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${regeocodeMutation.isPending ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Fix Markers</span>
                <span className="sm:hidden">Fix</span>
              </Button>
              <Button variant="outline" onClick={() => setLocation("/")} className="flex-1 sm:flex-none">
                <Home className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
                <span className="sm:hidden">Home</span>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="flex-1 sm:flex-none">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full h-auto">
        {/* Tabs Header */}
        <div className="container mx-auto px-4 py-4 sm:py-8 border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedTab("locations")}
              className={`pb-2 px-2 font-medium transition-colors ${
                selectedTab === "locations"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="inline mr-2 h-4 w-4" />
              Locations
            </button>
            <button
              onClick={() => setSelectedTab("categories")}
              className={`pb-2 px-2 font-medium transition-colors ${
                selectedTab === "categories"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FolderTree className="inline mr-2 h-4 w-4" />
              Categories
            </button>
            <button
              onClick={() => setSelectedTab("media")}
              className={`pb-2 px-2 font-medium transition-colors ${
                selectedTab === "media"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ImageIcon className="inline mr-2 h-4 w-4" />
              Media Library
            </button>
          </div>
        </div>

        {/* Content */}
        {selectedTab === "locations" && (
          <div className="container mx-auto px-4 py-4 sm:py-8">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Location Management</CardTitle>
                      <CardDescription>
                        Manage all roadside attraction locations
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button onClick={() => setIsBulkUploadOpen(true)} variant="outline" className="flex-1 sm:flex-none">
                        <FileUp className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Bulk Upload</span>
                        <span className="sm:hidden">Upload</span>
                      </Button>
                      <Button onClick={() => setIsDialogOpen(true)} className="flex-1 sm:flex-none">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Location
                      </Button>
                    </div>
                  </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name, category, state, or custom attributes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Search Results Info */}
              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Found {locations.length} location{locations.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading locations...
              </div>
            ) : (
              <LocationTable
                locations={locations}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLocationClick={setSelectedLocation}
              />
            )}
          </CardContent>
        </Card>
          </div>
        )}

        {selectedTab === "categories" && (
          <div className="container mx-auto px-4 py-4 sm:py-8">
            <Card>
              <CardContent className="pt-6">
                <CategoryManagement />
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "media" && (
          <div className="w-full h-auto">
            <div className="px-4 py-4 sm:py-8">
              <div className="mb-4">
                <h2 className="luckiest-guy-regular text-2xl font-bold">Media Library</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your uploaded images and media files
                </p>
              </div>
            </div>
            <MediaLibraryPanel mode="manage" />
          </div>
        )}
      </main>

      {/* Location Dialog */}
      <LocationDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        location={editingLocation}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Logo Selector Dialog */}
      <LogoSelectorDialog
        open={isLogoDialogOpen}
        onOpenChange={setIsLogoDialogOpen}
        currentLogoUrl={settings?.site_logo}
      />

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
      />

      {/* Photo Panel for viewing location details */}
      <PhotoPanel
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 rounded-full shadow-lg"
          title="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}