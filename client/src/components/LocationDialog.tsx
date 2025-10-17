import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLocationSchema, type InsertLocation, type Location, type Media } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MediaLibrary } from "@/components/MediaLibrary";

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
  onSubmit: (data: InsertLocation) => void;
  isLoading: boolean;
}

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

const CATEGORIES = [
  { value: "muffler-men", label: "Muffler Men", icon: "🗿" },
  { value: "worlds-largest", label: "World's Largest", icon: "🏆" },
  { value: "unique-finds", label: "Unique Finds", icon: "✨" },
];

interface CustomField {
  key: string;
  value: string;
}

export function LocationDialog({
  open,
  onOpenChange,
  location,
  onSubmit,
  isLoading,
}: LocationDialogProps) {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const form = useForm<InsertLocation>({
    resolver: zodResolver(insertLocationSchema),
    defaultValues: {
      name: "",
      latitude: 0,
      longitude: 0,
      category: "muffler-men",
      state: "",
      city: "",
      zipCode: "",
      photoUrl: "",
      photoId: "",
      taggedDate: new Date().toISOString().split("T")[0],
      description: "",
      customFields: "{}",
    },
  });

  // Reset form when dialog opens/closes or location changes
  useEffect(() => {
    if (open) {
      if (location) {
        // Parse custom fields from location
        let parsedFields: CustomField[] = [];
        try {
          const fieldsObj = JSON.parse(location.customFields || "{}");
          parsedFields = Object.entries(fieldsObj).map(([key, value]) => ({
            key,
            value: String(value),
          }));
        } catch (e) {
          parsedFields = [];
        }
        setCustomFields(parsedFields);
        setPreviewUrl(location.photoUrl);
        
        form.reset({
          name: location.name,
          latitude: location.latitude ?? 0,
          longitude: location.longitude ?? 0,
          category: location.category,
          state: location.state,
          city: location.city ?? "",
          zipCode: location.zipCode ?? "",
          photoUrl: location.photoUrl,
          photoId: location.photoId,
          taggedDate: location.taggedDate,
          description: location.description ?? "",
          customFields: location.customFields ?? "{}",
        });
      } else {
        setCustomFields([]);
        setPreviewUrl("");
        form.reset({
          name: "",
          latitude: 0,
          longitude: 0,
          category: CATEGORIES[0]?.value || "muffler-men",
          state: "",
          city: "",
          zipCode: "",
          photoUrl: "",
          photoId: "",
          taggedDate: new Date().toISOString().split("T")[0],
          description: "",
          customFields: "{}",
        });
      }
    }
  }, [open, location, form]);

  const handleSubmit = (data: InsertLocation) => {
    // Convert custom fields array to JSON string
    const customFieldsObj: Record<string, string> = {};
    customFields.forEach((field) => {
      if (field.key.trim()) {
        customFieldsObj[field.key.trim()] = field.value;
      }
    });
    
    const submitData = {
      ...data,
      customFields: JSON.stringify(customFieldsObj),
    };
    
    onSubmit(submitData);
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: "key" | "value", newValue: string) => {
    const updated = [...customFields];
    updated[index][field] = newValue;
    setCustomFields(updated);
  };

  const handleMediaSelect = (media: Media) => {
    const fullUrl = window.location.origin + media.url;
    form.setValue("photoUrl", fullUrl);
    setPreviewUrl(fullUrl);
    toast({
      title: "Image selected",
      description: "Image from library has been selected",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, GIF, or WebP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const fullUrl = window.location.origin + data.url;
      
      form.setValue("photoUrl", fullUrl);
      setPreviewUrl(fullUrl);
      
      toast({
        title: "Upload successful",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>
            {location ? "Edit Location" : "Add New Location"}
          </DialogTitle>
          <DialogDescription>
            {location
              ? "Update the location details below"
              : "Fill in the details to create a new location"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.icon} {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Brief description of the location" />
                  </FormControl>
                  <FormDescription>
                    Optional description that will be displayed in the location details
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo</FormLabel>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {previewUrl && (
                      <div className="relative w-full rounded-lg overflow-hidden bg-muted border">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-auto object-contain max-h-96"
                          onError={() => setPreviewUrl("")}
                        />
                      </div>
                    )}
                    
                    {/* Upload Buttons */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMediaLibraryOpen(true)}
                        disabled={uploading || isLoading}
                        className="flex-1"
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Choose from Library
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading || isLoading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || isLoading}
                        className="flex-1"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? "Uploading..." : "Upload New"}
                      </Button>
                      {previewUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setPreviewUrl("");
                            form.setValue("photoUrl", "");
                          }}
                          disabled={uploading || isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Manual URL Input */}
                    <div className="space-y-2">
                      <FormLabel className="text-xs text-muted-foreground">Or enter URL manually</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setPreviewUrl(e.target.value);
                          }}
                          disabled={uploading || isLoading}
                        />
                      </FormControl>
                    </div>
                  </div>
                  <FormDescription>
                    Upload an image or enter a URL (max 10MB, JPEG/PNG/GIF/WebP)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Facebook photo ID or reference identifier
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taggedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagged Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Fields Section */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Custom Fields</CardTitle>
                    <CardDescription className="text-xs">
                      Add custom attributes for enhanced search (e.g., material, height, theme)
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomField}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Field
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {customFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No custom fields added. Click "Add Field" to create searchable attributes.
                  </p>
                ) : (
                  customFields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          value={field.key}
                          onChange={(e) => updateCustomField(index, "key", e.target.value)}
                          disabled={isLoading}
                        />
                        <Input
                          value={field.value}
                          onChange={(e) => updateCustomField(index, "value", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomField(index)}
                        disabled={isLoading}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : location ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
        </div>
      </DialogContent>

      {/* Media Library Dialog */}
      <MediaLibrary
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        onSelect={handleMediaSelect}
        mode="select"
      />
    </Dialog>
  );
}