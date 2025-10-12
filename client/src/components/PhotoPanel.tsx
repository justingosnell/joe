import { X, Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Location } from "@shared/schema";

interface PhotoPanelProps {
  location: Location | null;
  onClose: () => void;
}

export function PhotoPanel({ location, onClose }: PhotoPanelProps) {
  if (!location) return null;

  const getCategoryLabel = (category: string) => {
    if (category === "muffler-men") return "Muffler Men";
    if (category === "worlds-largest") return "World's Largest";
    return category;
  };

  const getCategoryColor = (category: string) => {
    if (category === "muffler-men") return "bg-pin-muffler text-white";
    if (category === "worlds-largest") return "bg-pin-worlds-largest text-white";
    return "bg-primary text-primary-foreground";
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-background border-l shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Location Details</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-close-photo-panel"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="relative aspect-square w-full bg-muted">
          <img
            src={location.photoUrl}
            alt={location.name}
            className="w-full h-full object-cover"
            data-testid="img-location-photo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge className={`${getCategoryColor(location.category)} mb-2`}>
              <Tag className="h-3 w-3 mr-1" />
              {getCategoryLabel(location.category)}
            </Badge>
            <h2 className="text-2xl font-bold text-white" data-testid="text-location-name">
              {location.name}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Location</p>
              <p className="text-sm text-muted-foreground" data-testid="text-location-state">
                {location.state}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Visit Date</p>
              <p className="text-sm text-muted-foreground" data-testid="text-location-date">
                {new Date(location.taggedDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Tagged on Facebook
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Photo ID: {location.photoId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
