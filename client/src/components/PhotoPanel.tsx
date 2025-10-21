import { Calendar, MapPin, Tag, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Location } from "@shared/schema";

interface PhotoPanelProps {
  location: Location | null;
  onClose: () => void;
}

export function PhotoPanel({ location, onClose }: PhotoPanelProps) {
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

  const getCustomFields = (location: Location): Record<string, string> => {
    try {
      return JSON.parse(location.customFields || "{}");
    } catch (e) {
      return {};
    }
  };

  return (
    <Dialog open={!!location} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {location && (
          <>
            <div className="relative w-full aspect-video bg-muted">
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
              <DialogHeader>
                <DialogTitle className="sr-only">Location Details</DialogTitle>
              </DialogHeader>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-location-state">
                    {location.city && location.zipCode 
                      ? `${location.city}, ${location.state} ${location.zipCode}`
                      : location.city 
                        ? `${location.city}, ${location.state}`
                        : location.state}
                  </p>
                  {location.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {location.description}
                    </p>
                  )}
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

              {/* Custom Fields Section */}
              {Object.keys(getCustomFields(location)).length > 0 && (
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-2">Additional Information</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(getCustomFields(location)).map(([key, value]) => (
                        <div key={key} className="bg-muted rounded-md p-2">
                          <p className="text-xs font-medium text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm font-medium">Photo URL</p>
                <a 
                  href={location.photoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline break-all"
                >
                  {location.photoUrl}
                </a>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
