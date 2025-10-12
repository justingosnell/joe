import { CategorySidebar } from "../CategorySidebar";
import { useState } from "react";
import type { CategoryType } from "../CategorySidebar";

export default function CategorySidebarExample() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [selectedState, setSelectedState] = useState("");

  return (
    <div className="h-screen w-80 border-r">
      <CategorySidebar
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          console.log("Category changed:", cat);
          setActiveCategory(cat);
        }}
        categoryCounts={{
          all: 42,
          "muffler-men": 15,
          "worlds-largest": 18,
          state: 42,
        }}
        selectedState={selectedState}
        onStateChange={(state) => {
          console.log("State changed:", state);
          setSelectedState(state);
        }}
      />
    </div>
  );
}
