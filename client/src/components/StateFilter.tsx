import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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

interface StateFilterProps {
  selectedState?: string;
  onStateChange?: (state: string) => void;
}

export function StateFilter({ selectedState, onStateChange }: StateFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStates = US_STATES.filter(state =>
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Filter by State</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select a state to view
        </p>
      </div>

      <div className="p-4 border-b">
        <Input
          type="search"
          placeholder="Search states..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-state-search"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredStates.map((state) => (
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

      {selectedState && (
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onStateChange?.("")}
            data-testid="button-clear-state"
          >
            Clear State Filter
          </Button>
        </div>
      )}
    </div>
  );
}
