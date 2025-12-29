/**
 * Site Appearance - Platform appearance and content settings
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  text: string;
  creatorName: string;
  verified: boolean;
  featured: boolean;
}

interface Section {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export default function SiteAppearance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editReviewOpen, setEditReviewOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reviewForm, setReviewForm] = useState({
    author: "",
    rating: 5,
    text: "",
    creatorName: "",
    verified: true
  });

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/appearance"],
    queryFn: async () => {
      const res = await fetch("/api/admin/appearance");
      return res.json();
    }
  });

  // Update basic info
  const updateBasicMutation = useMutation({
    mutationFn: async (data: { tagline?: string; description?: string }) => {
      const res = await fetch("/api/admin/appearance/basic", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appearance"] });
      toast({ title: "Settings updated" });
    }
  });

  // Update SEO
  const updateSEOMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/appearance/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appearance"] });
      toast({ title: "SEO settings updated" });
    }
  });

  // Update social links
  const updateSocialMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/appearance/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appearance"] });
      toast({ title: "Social links updated" });
    }
  });

  // Toggle section
  const toggleSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/appearance/sections/${id}/toggle`, {
        method: "PUT"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appearance"] });
    }
  });

  // Toggle feature
  const toggleFeatureMutation = useMutation({
    mutationFn: async (feature: string) => {
      const res = await fetch(`/api/admin/appearance/features/${feature}/toggle`, {
        method: "PUT"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appearance"] });
    }
  });

  // Add review
  const addReviewMutation = useMutation({
    mutationFn: async (data: typeof reviewForm) => {
      const res = await fetch("/api/admin/appearance/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appearance"] });
      toast({ title: "Review added" });
      setEditReviewOpen(false);
      setReviewForm({ author: "", rating: 5, text: "", creatorName: "", verified: true });
    }
  });

  // Delete review
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/appearance/reviews/${id}`, {
        method: "DELETE"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appearance"] });
      toast({ title: "Review deleted" });
    }
  });

  // Update maintenance
  const updateMaintenanceMutation = useMutation({
    mutationFn: async (data: { enabled: boolean; message?: string }) => {
      const res = await fetch("/api/admin/appearance/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appearance"] });
      toast({ title: "Maintenance mode updated" });
    }
  });

  if (user?.role !== "admin") {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const siteSettings = settings?.settings;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site Appearance</h1>
        <p className="text-gray-400">Manage platform content and appearance settings</p>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Content</CardTitle>
              <CardDescription>Main platform text and descriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  defaultValue={siteSettings?.tagline}
                  onBlur={(e) => {
                    if (e.target.value !== siteSettings?.tagline) {
                      updateBasicMutation.mutate({ tagline: e.target.value });
                    }
                  }}
                  placeholder="Your platform's tagline..."
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  defaultValue={siteSettings?.description}
                  onBlur={(e) => {
                    if (e.target.value !== siteSettings?.description) {
                      updateBasicMutation.mutate({ description: e.target.value });
                    }
                  }}
                  placeholder="Platform description for homepage..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>Take the site offline for maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Maintenance Mode</Label>
                  <p className="text-sm text-gray-400">Site will be unavailable to visitors</p>
                </div>
                <Switch
                  checked={siteSettings?.maintenance?.enabled}
                  onCheckedChange={(enabled) => updateMaintenanceMutation.mutate({ enabled })}
                />
              </div>

              {siteSettings?.maintenance?.enabled && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-500 text-sm">
                    <i className="fas fa-exclamation-triangle mr-2" />
                    Maintenance mode is active. Site is unavailable to visitors.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Maintenance Message</Label>
                <Textarea
                  defaultValue={siteSettings?.maintenance?.message}
                  placeholder="Message to show visitors during maintenance..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Search engine optimization and meta tags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  defaultValue={siteSettings?.seo?.metaTitle}
                  placeholder="Page title for search engines..."
                />
                <p className="text-xs text-gray-500">Recommended: 50-60 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  defaultValue={siteSettings?.seo?.metaDescription}
                  placeholder="Description for search results..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">Recommended: 150-160 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input
                  defaultValue={siteSettings?.seo?.keywords?.join(", ")}
                  placeholder="keyword1, keyword2, keyword3..."
                />
              </div>

              <Button onClick={() => {
                const form = document.querySelectorAll("[data-seo-field]");
                // Save SEO settings
              }}>
                <i className="fas fa-save mr-2" />
                Save SEO Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Sections</CardTitle>
              <CardDescription>Enable, disable, and reorder homepage sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {siteSettings?.homepageSections?.map((section: Section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <i className="fas fa-grip-vertical text-gray-500 cursor-move" />
                      <div>
                        <div className="font-medium">{section.name}</div>
                        <div className="text-xs text-gray-500">Order: {section.order}</div>
                      </div>
                    </div>
                    <Switch
                      checked={section.enabled}
                      onCheckedChange={() => toggleSectionMutation.mutate(section.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Featured Reviews</CardTitle>
                <CardDescription>Testimonials displayed on the homepage</CardDescription>
              </div>
              <Button onClick={() => {
                setSelectedReview(null);
                setReviewForm({ author: "", rating: 5, text: "", creatorName: "", verified: true });
                setEditReviewOpen(true);
              }}>
                <i className="fas fa-plus mr-2" />
                Add Review
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {siteSettings?.featuredReviews?.map((review: Review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-gray-800 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.avatar}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {review.author}
                            {review.verified && (
                              <Badge variant="outline" className="text-xs">
                                <i className="fas fa-check-circle text-green-400 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            for {review.creatorName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star text-sm ${i < review.rating ? "text-yellow-400" : "text-gray-600"}`}
                            />
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Delete this review?")) {
                              deleteReviewMutation.mutate(review.id);
                            }
                          }}
                        >
                          <i className="fas fa-trash text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm">{review.text}</p>
                  </div>
                ))}

                {(!siteSettings?.featuredReviews || siteSettings.featuredReviews.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No featured reviews yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Platform social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "twitter", icon: "fab fa-twitter", label: "Twitter / X" },
                { key: "instagram", icon: "fab fa-instagram", label: "Instagram" },
                { key: "tiktok", icon: "fab fa-tiktok", label: "TikTok" },
                { key: "discord", icon: "fab fa-discord", label: "Discord" },
                { key: "telegram", icon: "fab fa-telegram", label: "Telegram" }
              ].map((social) => (
                <div key={social.key} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <i className={`${social.icon} text-lg`} />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm">{social.label}</Label>
                    <Input
                      defaultValue={siteSettings?.socialLinks?.[social.key]}
                      placeholder={`https://${social.key}.com/yourprofile`}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}

              <Button className="w-full mt-4">
                <i className="fas fa-save mr-2" />
                Save Social Links
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {siteSettings?.features && Object.entries(siteSettings.features).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div>
                      <Label className="capitalize">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                      </Label>
                    </div>
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={() => toggleFeatureMutation.mutate(key)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Review Dialog */}
      <Dialog open={editReviewOpen} onOpenChange={setEditReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedReview ? "Edit Review" : "Add Review"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Author Name</Label>
              <Input
                value={reviewForm.author}
                onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                placeholder="John D."
              />
            </div>

            <div className="space-y-2">
              <Label>Creator Name</Label>
              <Input
                value={reviewForm.creatorName}
                onChange={(e) => setReviewForm({ ...reviewForm, creatorName: e.target.value })}
                placeholder="Creator they reviewed..."
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="p-1"
                  >
                    <i
                      className={`fas fa-star text-xl ${star <= reviewForm.rating ? "text-yellow-400" : "text-gray-600"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Review Text</Label>
              <Textarea
                value={reviewForm.text}
                onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                placeholder="What they said..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={reviewForm.verified}
                onCheckedChange={(verified) => setReviewForm({ ...reviewForm, verified })}
              />
              <Label>Verified Purchase</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditReviewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addReviewMutation.mutate(reviewForm)}
              disabled={!reviewForm.author || !reviewForm.text}
            >
              {selectedReview ? "Update" : "Add"} Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
