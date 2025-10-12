import { Users, Landmark, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type CategoryType = "all" | "muffler-men" | "worlds-largest" | "state";

interface CategorySidebarProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  categoryCounts: {
    all: number;
    "muffler-men": number;
    "worlds-largest": number;
    state: number;
  };
  selectedState?: string;
  onStateChange?: (state: string) => void;
}

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];

export function CategorySidebar({
  activeCategory,
  onCategoryChange,
  categoryCounts,
  selectedState,
  onStateChange,
}: CategorySidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Filter Attractions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Narrow down locations by category
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <Button
          variant={activeCategory === "all" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onCategoryChange("all")}
          data-testid="button-category-all"
        >
          <MapPin className="h-4 w-4 mr-2" />
          All Locations
          <Badge variant="secondary" className="ml-auto">
            {categoryCounts.all}
          </Badge>
        </Button>

        <Button
          variant={activeCategory === "muffler-men" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onCategoryChange("muffler-men")}
          data-testid="button-category-muffler"
        >
          <Users className="h-4 w-4 mr-2" />
          Muffler Men
          <Badge variant="secondary" className="ml-auto">
            {categoryCounts["muffler-men"]}
          </Badge>
        </Button>

        <Button
          variant={activeCategory === "worlds-largest" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onCategoryChange("worlds-largest")}
          data-testid="button-category-worlds-largest"
        >
          <Landmark className="h-4 w-4 mr-2" />
          World's Largest
          <Badge variant="secondary" className="ml-auto">
            {categoryCounts["worlds-largest"]}
          </Badge>
        </Button>

        <div className="pt-4">
          <h3 className="text-sm font-semibold mb-2 px-3">Filter by State</h3>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {US_STATES.map((state) => (
              <Button
                key={state}
                variant={selectedState === state ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => onStateChange?.(state)}
                data-testid={`button-state-${state.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {state}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {(activeCategory !== "all" || selectedState) && (
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onCategoryChange("all");
              onStateChange?.("");
            }}
            data-testid="button-clear-filters"
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
