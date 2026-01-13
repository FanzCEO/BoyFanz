/**
 * Create Forum Category Page
 * Allows admins/authorized users to create new forum categories
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, FolderPlus, Loader2 } from 'lucide-react';
import { Link } from 'wouter';

export default function CreateCategory() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isCreatorForum: false,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/forums/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Category Created',
        description: `"${formData.name}" has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/forums/categories'] });
      setLocation(`/forums/category/${data.category.slug}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }

    // Auto-generate slug if not provided
    const dataToSubmit = {
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    };

    createCategoryMutation.mutate(dataToSubmit);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      // Auto-generate slug from name
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-cyan-900/20 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <Link href="/forums">
          <Button variant="ghost" className="mb-6 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forums
          </Button>
        </Link>

        <Card className="bg-gray-900/80 border-cyan-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <FolderPlus className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Create Forum Category</CardTitle>
                <CardDescription className="text-gray-400">
                  Add a new category to organize forum discussions
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., General Discussion"
                  className="bg-gray-800/50 border-cyan-500/20 text-white placeholder-gray-500 focus:border-cyan-500/50"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-white">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="general-discussion"
                  className="bg-gray-800/50 border-cyan-500/20 text-white placeholder-gray-500 focus:border-cyan-500/50"
                />
                <p className="text-xs text-gray-500">
                  Auto-generated from name. Will be used in URL: /forums/category/{formData.slug || 'your-slug'}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is this category about?"
                  className="bg-gray-800/50 border-cyan-500/20 text-white placeholder-gray-500 focus:border-cyan-500/50 min-h-[100px]"
                />
              </div>

              {/* Creator Forum Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-cyan-500/10">
                <div>
                  <Label htmlFor="isCreatorForum" className="text-white font-medium">Creator Forum</Label>
                  <p className="text-sm text-gray-400 mt-1">
                    Only verified creators can post in this category
                  </p>
                </div>
                <Switch
                  id="isCreatorForum"
                  checked={formData.isCreatorForum}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCreatorForum: checked }))}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                >
                  {createCategoryMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Create Category
                    </>
                  )}
                </Button>
                <Link href="/forums">
                  <Button type="button" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
