import { Users, Landmark, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type CategoryType = "all" | "muffler-men" | "worlds-largest";

interface CategoryFilterProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  categoryCounts: {
    all: number;
    "muffler-men": number;
    "worlds-largest": number;
  };
}

export function CategoryFilter({
  activeCategory,
  onCategoryChange,
  categoryCounts,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Tagged Places</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Filter by attraction type
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
      </div>

      {activeCategory !== "all" && (
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onCategoryChange("all")}
            data-testid="button-clear-category"
          >
            Clear Filter
          </Button>
        </div>
      )}
    </div>
  );
}
