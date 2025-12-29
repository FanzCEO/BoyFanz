/**
 * Gallery Management - Bulk media upload with progress tracking
 */

import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface GalleryItem {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  tags: string[];
  category?: string;
  caption?: string;
  featured: boolean;
  creatorName?: string;
  createdAt: string;
}

interface UploadProgress {
  filename: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
}

export default function GalleryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [editForm, setEditForm] = useState({
    tags: "",
    category: "",
    caption: "",
    featured: false
  });

  // Fetch gallery items
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/gallery", typeFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/gallery?${params}`);
      return res.json();
    }
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      setIsUploading(true);
      const results: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(prev => prev.map(p =>
          p.filename === file.name ? { ...p, status: "uploading", progress: 0 } : p
        ));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", file.type.startsWith("video/") ? "videos" : "photos");

        try {
          const res = await fetch("/api/admin/gallery/upload", {
            method: "POST",
            body: formData
          });
          const data = await res.json();

          setUploadProgress(prev => prev.map(p =>
            p.filename === file.name ? { ...p, status: "completed", progress: 100 } : p
          ));

          results.push(data);
        } catch (err: any) {
          setUploadProgress(prev => prev.map(p =>
            p.filename === file.name ? { ...p, status: "failed", error: err.message } : p
          ));
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: "Upload complete" });
      setTimeout(() => {
        setUploadProgress([]);
        setIsUploading(false);
      }, 2000);
    },
    onError: () => {
      setIsUploading(false);
    }
  });

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: "Item updated" });
      setEditDialogOpen(false);
    }
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (data: { ids: string[]; tags?: string; category?: string; featured?: boolean }) => {
      const res = await fetch("/api/admin/gallery/bulk/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: `${data.updated} items updated` });
      setBulkEditOpen(false);
      setSelectedItems([]);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: "Item deleted" });
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/admin/gallery/bulk/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({ title: `${data.deleted} items deleted` });
      setSelectedItems([]);
    }
  });

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith("image/") || f.type.startsWith("video/")
    );

    if (files.length > 0) {
      setUploadProgress(files.map(f => ({
        filename: f.name,
        progress: 0,
        status: "pending"
      })));
      uploadMutation.mutate(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadProgress(files.map(f => ({
        filename: f.name,
        progress: 0,
        status: "pending"
      })));
      uploadMutation.mutate(files);
    }
    e.target.value = "";
  };

  const toggleSelect = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === data?.items?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(data?.items?.map((i: GalleryItem) => i.id) || []);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const openEditDialog = (item: GalleryItem) => {
    setSelectedItem(item);
    setEditForm({
      tags: item.tags.join(", "),
      category: item.category || "",
      caption: item.caption || "",
      featured: item.featured
    });
    setEditDialogOpen(true);
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gallery Management</h1>
          <p className="text-gray-400">Upload and manage media assets</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            <i className={`fas fa-${viewMode === "grid" ? "list" : "th"}`} />
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <i className="fas fa-upload mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{data.stats.total}</div>
              <div className="text-sm text-gray-400">Total Items</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{data.stats.images}</div>
              <div className="text-sm text-gray-400">Images</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{data.stats.videos}</div>
              <div className="text-sm text-gray-400">Videos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{data.stats.featured}</div>
              <div className="text-sm text-gray-400">Featured</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{formatBytes(data.stats.totalSize)}</div>
              <div className="text-sm text-gray-400">Total Size</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              <i className="fas fa-upload mr-2" />
              Uploading {uploadProgress.length} files...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadProgress.map((file) => (
              <div key={file.filename} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{file.filename}</span>
                  <span className={
                    file.status === "completed" ? "text-green-500" :
                    file.status === "failed" ? "text-red-500" :
                    file.status === "uploading" ? "text-blue-500" : "text-gray-500"
                  }>
                    {file.status === "completed" ? (
                      <i className="fas fa-check" />
                    ) : file.status === "failed" ? (
                      <i className="fas fa-times" />
                    ) : file.status === "uploading" ? (
                      `${file.progress}%`
                    ) : (
                      "Pending"
                    )}
                  </span>
                </div>
                <Progress value={file.progress} className="h-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-gray-700 hover:border-gray-600"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
      >
        <i className="fas fa-cloud-upload-alt text-4xl text-gray-500 mb-3" />
        <p className="text-gray-400">
          Drag and drop files here or{" "}
          <button
            className="text-primary hover:underline"
            onClick={() => fileInputRef.current?.click()}
          >
            browse
          </button>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Supports: JPG, PNG, GIF, WEBP, MP4, MOV, WEBM (max 100MB each)
        </p>
      </div>

      {/* Filters and Bulk Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="photos">Photos</SelectItem>
                <SelectItem value="videos">Videos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            {selectedItems.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="outline">{selectedItems.length} selected</Badge>
                <Button size="sm" variant="outline" onClick={() => setBulkEditOpen(true)}>
                  <i className="fas fa-edit mr-1" />
                  Edit Selected
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`Delete ${selectedItems.length} items?`)) {
                      bulkDeleteMutation.mutate(selectedItems);
                    }
                  }}
                >
                  <i className="fas fa-trash mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid/List */}
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data?.items?.map((item: GalleryItem) => (
                <div
                  key={item.id}
                  className={`relative group rounded-lg overflow-hidden bg-gray-800 ${
                    selectedItems.includes(item.id) ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div
                    className="aspect-square cursor-pointer"
                    onClick={() => openEditDialog(item)}
                  >
                    {item.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <i className="fas fa-play-circle text-4xl text-gray-500" />
                      </div>
                    ) : (
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {item.featured && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500 text-black">
                        <i className="fas fa-star mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-xs truncate">{item.filename}</div>
                    <div className="text-xs text-gray-400">{formatBytes(item.size)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-4 p-2 text-sm text-gray-400 border-b border-gray-800">
                <div className="w-8">
                  <Checkbox
                    checked={selectedItems.length === data?.items?.length && data?.items?.length > 0}
                    onCheckedChange={selectAll}
                  />
                </div>
                <div className="w-12">Type</div>
                <div className="flex-1">Filename</div>
                <div className="w-24">Size</div>
                <div className="w-32">Category</div>
                <div className="w-24">Actions</div>
              </div>
              {data?.items?.map((item: GalleryItem) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-2 rounded hover:bg-gray-800/50 ${
                    selectedItems.includes(item.id) ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="w-8">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </div>
                  <div className="w-12">
                    <i className={`fas fa-${item.type === "video" ? "video" : "image"} text-gray-400`} />
                  </div>
                  <div className="flex-1 truncate">{item.filename}</div>
                  <div className="w-24 text-sm text-gray-400">{formatBytes(item.size)}</div>
                  <div className="w-32">
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <div className="w-24 flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(item)}>
                      <i className="fas fa-edit" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Delete this item?")) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                    >
                      <i className="fas fa-trash text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!data?.items || data.items.length === 0) && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              <i className="fas fa-images text-4xl mb-3" />
              <p>No items found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                {selectedItem.type === "video" ? (
                  <video src={selectedItem.url} controls className="w-full h-full" />
                ) : (
                  <img src={selectedItem.url} alt="" className="w-full h-full object-contain" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-400">Filename</Label>
                  <div>{selectedItem.filename}</div>
                </div>
                <div>
                  <Label className="text-gray-400">Size</Label>
                  <div>{formatBytes(selectedItem.size)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3..."
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(category) => setEditForm({ ...editForm, category })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photos">Photos</SelectItem>
                    <SelectItem value="videos">Videos</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="behind-scenes">Behind the Scenes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Caption</Label>
                <Textarea
                  value={editForm.caption}
                  onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                  placeholder="Optional caption..."
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={editForm.featured}
                  onCheckedChange={(featured) => setEditForm({ ...editForm, featured: !!featured })}
                />
                <Label>Featured Item</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedItem) {
                  updateMutation.mutate({
                    id: selectedItem.id,
                    data: {
                      tags: editForm.tags,
                      category: editForm.category,
                      caption: editForm.caption,
                      featured: editForm.featured
                    }
                  });
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Edit {selectedItems.length} Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Add Tags (comma-separated)</Label>
              <Input
                placeholder="tag1, tag2, tag3..."
                id="bulk-tags"
              />
            </div>

            <div className="space-y-2">
              <Label>Set Category</Label>
              <Select>
                <SelectTrigger id="bulk-category">
                  <SelectValue placeholder="Leave unchanged" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photos">Photos</SelectItem>
                  <SelectItem value="videos">Videos</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="bulk-featured" />
              <Label htmlFor="bulk-featured">Mark as Featured</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const tags = (document.getElementById("bulk-tags") as HTMLInputElement)?.value;
                const featured = (document.getElementById("bulk-featured") as HTMLInputElement)?.checked;

                bulkUpdateMutation.mutate({
                  ids: selectedItems,
                  tags: tags || undefined,
                  featured
                });
              }}
            >
              Apply to {selectedItems.length} Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
