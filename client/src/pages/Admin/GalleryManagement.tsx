import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDropzone } from "react-dropzone";
import { 
  Upload, Image, Video, Trash2, Edit, Tag, FolderOpen, 
  Grid, List, Search, Filter, CheckCircle, XCircle, 
  Clock, FileImage, FileVideo, MoreVertical, Download,
  Move, Copy, Eye, X
} from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  thumbnail_url?: string;
  type: "image" | "video";
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  tags: string[];
  category: string;
  status: "processing" | "ready" | "error";
  created_at: string;
  creator_id?: string;
  creator_name?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
  mediaId?: string;
}

export default function GalleryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editCategory, setEditCategory] = useState("");
  const [newTag, setNewTag] = useState("");

  // Fetch gallery items
  const { data: gallery, isLoading } = useQuery({
    queryKey: ["/api/admin/gallery", filterType, filterCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterType !== "all") params.append("type", filterType);
      if (filterCategory !== "all") params.append("category", filterCategory);
      if (searchQuery) params.append("search", searchQuery);
      const res = await fetch(`/api/admin/gallery?${params}`);
      if (!res.ok) throw new Error("Failed to fetch gallery");
      return res.json();
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/admin/gallery/categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/gallery/categories");
      if (!res.ok) return ["uncategorized", "profile", "content", "promo", "banner"];
      return res.json();
    }
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "uncategorized");
      
      const res = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData
      });
      
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/admin/gallery/bulk-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      setSelectedItems([]);
      toast({ title: "Media deleted successfully" });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, tags, category }: { id: string; tags: string[]; category: string }) => {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags, category })
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      setEditDialogOpen(false);
      toast({ title: "Media updated successfully" });
    }
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, tags, category }: { ids: string[]; tags?: string[]; category?: string }) => {
      const res = await fetch("/api/admin/gallery/bulk-update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, tags, category })
      });
      if (!res.ok) throw new Error("Bulk update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      setBulkEditDialogOpen(false);
      setSelectedItems([]);
      toast({ title: "Media items updated successfully" });
    }
  });

  // Dropzone configuration
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads: UploadProgress[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: "uploading"
    }));
    
    setUploads(prev => [...prev, ...newUploads]);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const uploadIndex = uploads.length + i;
      
      try {
        // Simulate progress updates
        for (let p = 0; p <= 90; p += 10) {
          await new Promise(r => setTimeout(r, 100));
          setUploads(prev => prev.map((u, idx) => 
            idx === uploadIndex ? { ...u, progress: p } : u
          ));
        }

        const result = await uploadMutation.mutateAsync(file);
        
        setUploads(prev => prev.map((u, idx) => 
          idx === uploadIndex ? { ...u, progress: 100, status: "complete", mediaId: result.id } : u
        ));
      } catch (error) {
        setUploads(prev => prev.map((u, idx) => 
          idx === uploadIndex ? { ...u, status: "error", error: "Upload failed" } : u
        ));
      }
    }
  }, [uploads.length, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".mov", ".webm", ".avi"]
    },
    maxSize: 500 * 1024 * 1024 // 500MB
  });

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === gallery?.items?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(gallery?.items?.map((item: MediaItem) => item.id) || []);
    }
  };

  const openEditDialog = (item: MediaItem) => {
    setSelectedMedia(item);
    setEditTags(item.tags || []);
    setEditCategory(item.category || "uncategorized");
    setEditDialogOpen(true);
  };

  const addTag = () => {
    if (newTag && !editTags.includes(newTag)) {
      setEditTags([...editTags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  const clearCompletedUploads = () => {
    setUploads(prev => prev.filter(u => u.status !== "complete"));
  };

  if (user?.role !== "admin" && user?.role !== "super_admin") {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-6">
          <CardTitle className="text-red-500">Access Denied</CardTitle>
          <CardDescription>You do not have permission to access this page.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gallery Management</h1>
          <p className="text-muted-foreground">Manage media uploads and organization</p>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <>
              <Button variant="outline" onClick={() => setBulkEditDialogOpen(true)}>
                <Tag className="h-4 w-4 mr-2" />
                Edit {selectedItems.length} items
              </Button>
              <Button variant="destructive" onClick={() => deleteMutation.mutate(selectedItems)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop files here...</p>
            ) : (
              <>
                <p className="text-lg font-medium">Drag & drop media files here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse • Images & Videos up to 500MB
                </p>
              </>
            )}
          </div>

          {/* Upload Progress */}
          {uploads.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploads</span>
                <Button variant="ghost" size="sm" onClick={clearCompletedUploads}>
                  Clear completed
                </Button>
              </div>
              {uploads.map((upload, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                  {upload.file.type.startsWith("image") ? (
                    <FileImage className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FileVideo className="h-5 w-5 text-purple-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{upload.file.name}</p>
                    <Progress value={upload.progress} className="h-1 mt-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(upload.file.size)}
                    </span>
                    {upload.status === "complete" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {upload.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                    {upload.status === "uploading" && <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters & View Toggle */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(categories || []).map((cat: string) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={selectAll}>
          {selectedItems.length === gallery?.items?.length ? "Deselect All" : "Select All"}
        </Button>
      </div>

      {/* Gallery Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Image className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{gallery?.stats?.images || 0}</p>
                <p className="text-xs text-muted-foreground">Images</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Video className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{gallery?.stats?.videos || 0}</p>
                <p className="text-xs text-muted-foreground">Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FolderOpen className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatFileSize(gallery?.stats?.totalSize || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{gallery?.stats?.processing || 0}</p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media Grid/List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading media...</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          {(gallery?.items || []).map((item: MediaItem) => (
            <div
              key={item.id}
              className={`group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all
                ${selectedItems.includes(item.id) ? "border-primary ring-2 ring-primary/50" : "border-transparent hover:border-muted-foreground/25"}`}
              onClick={() => toggleSelectItem(item.id)}
            >
              {item.type === "image" ? (
                <img
                  src={item.thumbnail_url || item.url}
                  alt={item.filename}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); openEditDialog(item); }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); window.open(item.url, "_blank"); }}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {/* Checkbox */}
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  className="bg-white/80"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Type Badge */}
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  {item.type === "image" ? <FileImage className="h-3 w-3" /> : <FileVideo className="h-3 w-3" />}
                </Badge>
              </div>

              {/* Status */}
              {item.status === "processing" && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-500 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="p-4 w-10">
                    <Checkbox
                      checked={selectedItems.length === gallery?.items?.length && gallery?.items?.length > 0}
                      onCheckedChange={selectAll}
                    />
                  </th>
                  <th className="p-4">Preview</th>
                  <th className="p-4">Filename</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(gallery?.items || []).map((item: MediaItem) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleSelectItem(item.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                        {item.type === "image" ? (
                          <img src={item.thumbnail_url || item.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{item.filename}</td>
                    <td className="p-4">
                      <Badge variant={item.type === "image" ? "default" : "secondary"}>
                        {item.type}
                      </Badge>
                    </td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4 text-muted-foreground">{formatFileSize(item.size)}</td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {(item.tags || []).slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                        {(item.tags || []).length > 2 && (
                          <Badge variant="outline" className="text-xs">+{item.tags.length - 2}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditDialog(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => window.open(item.url, "_blank")}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteMutation.mutate([item.id])}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && (!gallery?.items || gallery.items.length === 0) && (
        <Card className="p-12 text-center">
          <Image className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No media found</h3>
          <p className="text-muted-foreground mt-1">Upload some images or videos to get started</p>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Media</DialogTitle>
          </DialogHeader>
          
          {selectedMedia && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                {selectedMedia.type === "image" ? (
                  <img src={selectedMedia.url} alt="" className="w-full h-full object-contain" />
                ) : (
                  <video src={selectedMedia.url} controls className="w-full h-full" />
                )}
              </div>

              <div>
                <Label>Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories || []).map((cat: string) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button onClick={addTag}>Add</Button>
                </div>
                <div className="flex gap-1 flex-wrap mt-2">
                  {editTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedMedia && updateMutation.mutate({
              id: selectedMedia.id,
              tags: editTags,
              category: editCategory
            })}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditDialogOpen} onOpenChange={setBulkEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {selectedItems.length} Items</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Set Category (optional)</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Leave unchanged" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Leave unchanged</SelectItem>
                  {(categories || []).map((cat: string) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Add Tags (optional)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag}>Add</Button>
              </div>
              <div className="flex gap-1 flex-wrap mt-2">
                {editTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => bulkUpdateMutation.mutate({
              ids: selectedItems,
              tags: editTags.length > 0 ? editTags : undefined,
              category: editCategory || undefined
            })}>
              Update All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
