import { CategoryFilter } from "../CategoryFilter";
import { useState } from "react";
import type { CategoryType } from "../CategoryFilter";

export default function CategoryFilterExample() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");

  return (
    <div className="h-screen w-80 border-r">
      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          console.log("Category changed:", cat);
          setActiveCategory(cat);
        }}
        categoryCounts={{
          all: 42,
          "muffler-men": 15,
          "worlds-largest": 18,
        }}
      />
    </div>
  );
}
