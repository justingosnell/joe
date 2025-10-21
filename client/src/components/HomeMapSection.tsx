import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Maximize2, Minimize2, MapIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PhotoPanel } from "@/components/PhotoPanel";
import type { Location } from "@shared/schema";

const categoryColors: Record<string, string> = {
  "muffler-men": "#f97316",
  "worlds-largest": "#eab308",
  "unique-finds": "#10b981",
};

const mapLayers = [
  {
    id: "standard",
    label: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: "satellite",
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri",
  },
  {
    id: "terrain",
    label: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://opentopomap.org/copyright">OpenTopoMap</a>',
  },
];

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

function createCustomIcon(category: string, isSelected: boolean) {
  let color = categoryColors[category] || "#3b82f6";

  if (isSelected) {
    color = "#a855f7";
  }

  const svgIcon = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C9.373 0 4 5.373 4 12c0 9 12 28 12 28s12-19 12-28c0-6.627-5.373-12-12-12z" 
            fill="${color}" 
            stroke="white" 
            stroke-width="2"/>
      <circle cx="16" cy="12" r="5" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: "custom-marker",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

function MapController({
  locations,
  selectedLocation,
}: {
  locations: Location[];
  selectedLocation: Location | null;
}) {
  const map = useMap();

  const handleResetView = () => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <button
      onClick={handleResetView}
      className="absolute bottom-4 left-4 z-[400] bg-white p-2 rounded shadow-md hover:shadow-lg transition-shadow"
      title="Fit to bounds"
    >
      <MapIcon className="h-4 w-4" />
    </button>
  );
}

interface MapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationClick: (location: Location | null) => void;
  mapLayerId: string;
}

function InteractiveMap({
  locations,
  selectedLocation,
  onLocationClick,
  mapLayerId,
}: MapProps) {
  const currentLayer = mapLayers.find((l) => l.id === mapLayerId) || mapLayers[0];

  return (
    <MapContainer
      center={[39.8283, -98.5795] as [number, number]}
      zoom={4}
      className="h-full w-full rounded"
      zoomControl={true}
    >
      <TileLayer
        url={currentLayer.url}
        attribution={currentLayer.attribution}
      />

      <MapController locations={locations} selectedLocation={selectedLocation} />

      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude] as [number, number]}
          icon={createCustomIcon(
            location.category,
            selectedLocation?.id === location.id
          )}
          eventHandlers={{
            click: () => {
              onLocationClick(location);
            },
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{location.name}</p>
              <p className="text-xs text-muted-foreground">
                {location.city}, {location.state}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export function HomeMapSection() {
  const [category, setCategory] = useState("all");
  const [state, setState] = useState("all");
  const [mapLayer, setMapLayer] = useState("standard");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const { data: locations = [], isLoading, error } = useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await fetch("/api/locations");
      if (!response.ok) throw new Error("Failed to fetch locations");
      return response.json();
    },
  });

  console.log("HomeMapSection - Loading:", isLoading, "Error:", error, "Locations:", locations.length);

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="text-center py-12 bg-white p-6 rounded border">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-amber-700">Loading map...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <div className="text-center py-12 bg-white p-6 rounded border text-red-600">
          <p>Error loading locations: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </section>
    );
  }

  const filteredLocations = useMemo(() => {
    let filtered = locations;

    if (category !== "all") {
      filtered = filtered.filter((loc) => loc.category === category);
    }

    if (state !== "all") {
      filtered = filtered.filter((loc) => loc.state === state);
    }

    return filtered;
  }, [locations, category, state]);

  const states = useMemo(
    () => Array.from(new Set(locations.map((l) => l.state))).sort(),
    [locations]
  );

  const categories = useMemo(
    () => [
      { id: "all", label: "All Categories" },
      { id: "muffler-men", label: "Muffler Men" },
      { id: "worlds-largest", label: "World's Largest" },
      { id: "unique-finds", label: "Unique Finds" },
    ],
    []
  );

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="h-full w-full flex flex-col">
          {/* Header */}
          <div className="bg-background border-b p-4 flex items-center justify-between">
            <div className="flex gap-4 flex-1">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATE_NAMES[s] || s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={mapLayer} onValueChange={setMapLayer}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mapLayers.map((layer) => (
                    <SelectItem key={layer.id} value={layer.id}>
                      {layer.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsExpanded(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Map */}
          <div className="flex-1 overflow-hidden">
            <InteractiveMap
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onLocationClick={setSelectedLocation}
              mapLayerId={mapLayer}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-amber-900 flex items-center gap-2">
          <MapIcon className="h-7 w-7 text-orange-500" />
          Interactive Map
        </h2>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map((s) => (
              <SelectItem key={s} value={s}>
                {STATE_NAMES[s] || s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mapLayer} onValueChange={setMapLayer}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mapLayers.map((layer) => (
              <SelectItem key={layer.id} value={layer.id}>
                {layer.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsExpanded(true)}
          className="ml-auto"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Container */}
      <Card className="border-2 border-amber-200 overflow-hidden">
        <div style={{ height: "400px", width: "100%" }}>
          <InteractiveMap
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onLocationClick={setSelectedLocation}
            mapLayerId={mapLayer}
          />
        </div>
      </Card>

      {/* Results Info */}
      <div className="mt-4 text-sm text-amber-700">
        Showing {filteredLocations.length} location
        {filteredLocations.length !== 1 ? "s" : ""}
        {category !== "all" && ` • ${categories.find(c => c.id === category)?.label}`}
        {state !== "all" && ` • ${STATE_NAMES[state]}`}
      </div>

      {/* Photo Panel Modal */}
      <PhotoPanel
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </section>
  );
}