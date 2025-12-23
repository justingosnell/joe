import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import type { Location } from "@shared/schema";
import { cn } from "@/lib/utils";
import { PhotoPanel } from "@/components/PhotoPanel";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/locations"));
      if (!response.ok) throw new Error("Failed to fetch locations");
      return response.json();
    },
  });

  const filteredLocations = query.length > 0 
    ? locations.filter(loc => 
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        (loc.city && loc.city.toLowerCase().includes(query.toLowerCase())) ||
        (loc.state && loc.state.toLowerCase().includes(query.toLowerCase())) ||
        (loc.category && loc.category.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        if (window.innerWidth < 768 && query === "") {
             setIsExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSearch = (loc: Location) => {
    setSelectedLocation(loc);
    setQuery("");
    setShowSuggestions(false);
    setIsExpanded(false);
  };

  return (
    <>
      <div ref={containerRef} className={cn("relative flex items-center transition-all duration-200", isExpanded ? "w-full absolute left-0 right-0 px-4 z-50 bg-background h-16" : "w-auto md:w-64")}>
          
          {/* Mobile Toggle */}
          <Button 
              variant="ghost" 
              size="icon" 
              className={cn("md:hidden", isExpanded ? "hidden" : "flex")}
              onClick={() => setIsExpanded(true)}
          >
              <Search className="h-5 w-5" />
          </Button>

          {/* Input Container */}
          <div className={cn(
              "items-center w-full relative",
              isExpanded ? "flex" : "hidden md:flex"
          )}>
              <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input 
                      ref={inputRef}
                      className="pl-8 w-full"
                      placeholder="Search locations..."
                      value={query}
                      onChange={(e) => {
                          setQuery(e.target.value);
                          setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      autoComplete="off"
                  />
                  {(query || isExpanded) && (
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-9 w-9"
                          onClick={() => {
                              setQuery("");
                              if (window.innerWidth < 768) setIsExpanded(false);
                          }}
                       >
                          <X className="h-5 w-5" />
                       </Button>
                  )}
              </div>
          </div>

        {showSuggestions && filteredLocations.length > 0 && (
          <div className={cn("absolute left-0 right-0 bg-popover text-popover-foreground border rounded-md shadow-md z-50 overflow-y-auto max-h-[60vh]", isExpanded ? "top-14 mx-4" : "top-full mt-1")}>
            {filteredLocations.map((loc) => (
              <div
                key={loc.id}
                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b last:border-0"
                onClick={() => handleSearch(loc)}
              >
                <div className="font-medium">{loc.name}</div>
                <div className="text-xs text-muted-foreground">{[loc.city, loc.state].filter(Boolean).join(", ")}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PhotoPanel
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </>
  );
}
