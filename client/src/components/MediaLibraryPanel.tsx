import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Search, Trash2, Edit2, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getApiUrl } from "@/lib/api";
import type { Media } from "@shared/schema";

interface MediaLibraryPanelProps {
  onSelect?: (media: Media) => void;
  mode?: "select" | "manage";
}

export function MediaLibraryPanel({ onSelect, mode = "manage" }: MediaLibraryPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [selectedTab, setSelectedTab] = useState<"library" | "upload">("library");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 80;

  // Fetch all media
  const { data: allMedia = [], isLoading } = useQuery<Media[]>({
    queryKey: ["media"],
    queryFn: async () => {
      const response = await fetch(getApiUrl("/api/media"), {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch media");
      return response.json();
    },
  });

  // Filter media based on search
  const filteredMedia = allMedia.filter((media) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      media.originalName.toLowerCase().includes(query) ||
      media.alt?.toLowerCase().includes(query) ||
      media.caption?.toLowerCase().includes(query)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMedia = filteredMedia.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Upload mutation for single file
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(getApiUrl("/api/media"), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, alt, caption }: { id: string; alt: string; caption: string }) => {
      const response = await fetch(`/api/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt, caption }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Update failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: "Success", description: "Media updated successfully" });
      setEditingMedia(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Delete failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast({ title: "Success", description: "Media deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    // Convert FileList to Array
    const fileArray = Array.from(files);
    
    // Validate all files first
    const invalidFiles: string[] = [];
    const validFiles: File[] = [];
    
    fileArray.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} (invalid type)`);
      } else if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (too large)`);
      } else {
        validFiles.push(file);
      }
    });
    
    // Show validation errors
    if (invalidFiles.length > 0) {
      toast({
        title: "Some files were skipped",
        description: `Invalid files: ${invalidFiles.join(", ")}`,
        variant: "destructive",
      });
    }
    
    if (validFiles.length === 0) return;
    
    // Upload files sequentially
    setUploading(true);
    setUploadProgress({ current: 0, total: validFiles.length });
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < validFiles.length; i++) {
      try {
        setUploadProgress({ current: i + 1, total: validFiles.length });
        await uploadMutation.mutateAsync(validFiles[i]);
        successCount++;
      } catch (error) {
        failCount++;
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error(`Failed to upload ${validFiles[i].name}:`, error);
        toast({
          title: "Upload failed",
          description: `${validFiles[i].name}: ${errorMsg}`,
          variant: "destructive",
        });
      }
    }
    
    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    
    // Refresh media list
    queryClient.invalidateQueries({ queryKey: ["media"] });
    
    // Show summary toast
    if (successCount > 0) {
      toast({
        title: "Upload complete",
        description: `Successfully uploaded ${successCount} image${successCount > 1 ? "s" : ""}${failCount > 0 ? `, ${failCount} failed` : ""}`,
      });
      setSelectedTab("library");
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelect = (media: Media) => {
    if (onSelect) {
      onSelect(media);
    }
  };

  const handleEdit = (media: Media) => {
    setEditingMedia(media);
    setEditAlt(media.alt || "");
    setEditCaption(media.caption || "");
  };

  const handleSaveEdit = () => {
    if (editingMedia) {
      updateMutation.mutate({
        id: editingMedia.id,
        alt: editAlt,
        caption: editCaption,
      });
    }
  };

  const handleDelete = (media: Media) => {
    if (confirm(`Are you sure you want to delete "${media.originalName || media.filename}"?`)) {
      deleteMutation.mutate(media.id);
    }
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full h-auto">
      <div className="flex gap-2 border-b mb-6 px-4">
        <Button
          variant={selectedTab === "library" ? "default" : "ghost"}
          onClick={() => setSelectedTab("library")}
          className="rounded-none border-b-2"
        >
          Library ({allMedia.length})
        </Button>
        <Button
          variant={selectedTab === "upload" ? "default" : "ghost"}
          onClick={() => setSelectedTab("upload")}
          className="rounded-none border-b-2"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload New
        </Button>
      </div>

      {selectedTab === "library" && (
        <div className="w-full h-auto">
          {/* Search Bar */}
          <div className="relative mb-4 shrink-0 px-4">
            <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by filename, alt text, or caption..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-5 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => handleSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Media Grid */}
          <div className="w-full h-auto px-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading media...
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No media found matching your search" : "No media uploaded yet"}
                </div>
              ) : (
                <>
                <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
                  {paginatedMedia.map((media) => (
                  <Card
                    key={media.id}
                    className={`group relative overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                      editingMedia?.id === media.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => mode === "select" && handleSelect(media)}
                  >
                    <div className="aspect-square relative bg-muted">
                      <img
                        src={media.url}
                        alt={media.alt || media.originalName || media.filename}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {mode === "select" ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSelect(media)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Select
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(media);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="icon"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(media);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(media);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Media Info */}
                    <div className="p-2 space-y-1">
                      <p className="text-xs font-medium truncate" title={media.originalName || media.filename}>
                        {media.originalName || media.filename}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(media.size)}</span>
                        {media.width && media.height && (
                          <span>{media.width}×{media.height}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(media.uploadedAt)}
                      </p>
                    </div>
                  </Card>
                ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 py-6 px-4 flex-wrap">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {totalPages <= 7 ? (
                        Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="h-8 w-8 text-xs"
                          >
                            {page}
                          </Button>
                        ))
                      ) : (
                        <>
                          <Button
                            variant={currentPage === 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            className="h-8 w-8 text-xs"
                          >
                            1
                          </Button>
                          {currentPage > 3 && <span className="text-xs px-1">...</span>}
                          {Array.from({ length: Math.min(3, totalPages - 2) }, (_, i) => {
                            const page = Math.max(2, currentPage - 1) + i;
                            if (page < totalPages) return page;
                            return null;
                          }).filter(Boolean).map(page => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page as number)}
                              className="h-8 w-8 text-xs"
                            >
                              {page}
                            </Button>
                          ))}
                          {currentPage < totalPages - 2 && <span className="text-xs px-1">...</span>}
                          <Button
                            variant={currentPage === totalPages ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="h-8 w-8 text-xs"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                </>
              )}
          </div>

          {/* Edit Panel */}
          {editingMedia && mode === "manage" && (
            <Card className="mt-4 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Edit Media Details</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingMedia(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-alt">Alt Text</Label>
                    <Input
                      id="edit-alt"
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      placeholder="Describe the image for accessibility"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-caption">Caption</Label>
                    <Textarea
                      id="edit-caption"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Add a caption for the image"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveEdit}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingMedia(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {selectedTab === "upload" && (
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4 my-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Upload Images</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select one or multiple image files to upload
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                  multiple
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    uploadProgress.total > 0 
                      ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...` 
                      : "Uploading..."
                  ) : "Select Images"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPEG, PNG, GIF, WebP (max 10MB per file)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}