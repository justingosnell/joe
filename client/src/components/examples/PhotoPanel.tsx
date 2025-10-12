import { PhotoPanel } from "../PhotoPanel";
import { useState } from "react";
import type { Location } from "@shared/schema";

const mockLocation: Location = {
  id: "1",
  name: "Giant Muffler Man",
  latitude: 41.8781,
  longitude: -87.6298,
  category: "muffler-men",
  state: "Illinois",
  photoUrl: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800",
  photoId: "fb_123456",
  taggedDate: "2024-06-15",
};

export default function PhotoPanelExample() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="p-8">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Show Photo Panel
        </button>
      </div>
    );
  }

  return (
    <PhotoPanel
      location={mockLocation}
      onClose={() => {
        console.log("Panel closed");
        setIsOpen(false);
      }}
    />
  );
}
