import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Edit, Trash2, Eye, MessageCircle, Heart } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  author: string;
  category: string;
  status: "published" | "draft";
  views: number;
  comments: number;
  likes: number;
  publishedAt: string;
}

export default function BlogManagement() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: 1,
      title: "Welcome to BoyFanz Platform",
      author: "Admin",
      category: "Announcements",
      status: "published",
      views: 12453,
      comments: 87,
      likes: 342,
      publishedAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Creator Tips: Maximizing Your Earnings",
      author: "Admin",
      category: "Creator Tips",
      status: "published",
      views: 8921,
      comments: 124,
      likes: 567,
      publishedAt: "2024-01-12"
    },
    {
      id: 3,
      title: "Platform Updates - January 2024",
      author: "Admin",
      category: "Updates",
      status: "published",
      views: 5432,
      comments: 45,
      likes: 198,
      publishedAt: "2024-01-10"
    },
    {
      id: 4,
      title: "Safety and Community Guidelines",
      author: "Admin",
      category: "Guidelines",
      status: "draft",
      views: 0,
      comments: 0,
      likes: 0,
      publishedAt: "2024-01-08"
    },
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-400 flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Blog Management
          </h1>
          <p className="text-gray-400 mt-2">Create and manage blog posts</p>
        </div>
        <Button className="bg-gradient-to-r from-slate-500 to-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-slate-400">4</div>
            <p className="text-gray-400">Total Posts</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-400">3</div>
            <p className="text-gray-400">Published</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-slate-400">26.8K</div>
            <p className="text-gray-400">Total Views</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-400">256</div>
            <p className="text-gray-400">Total Comments</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-slate-500/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-slate-400">All Blog Posts</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search posts..."
                className="bg-gray-800 border-slate-500/20 w-64"
              />
              <select className="px-3 py-2 bg-gray-800 border border-slate-500/20 rounded-md text-sm">
                <option value="">All Categories</option>
                <option value="announcements">Announcements</option>
                <option value="tips">Creator Tips</option>
                <option value="updates">Updates</option>
                <option value="guidelines">Guidelines</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-500/20">
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id} className="border-slate-500/10">
                  <TableCell className="font-medium max-w-xs">
                    {post.title}
                  </TableCell>
                  <TableCell className="text-gray-400">{post.author}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-500/30">
                      {post.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={post.status === "published" ? "default" : "secondary"}
                      className={post.status === "published" ? "bg-green-500" : "bg-yellow-600"}
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.views.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.comments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-400">{post.publishedAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-500/20"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-slate-500/20">
          <CardHeader>
            <CardTitle className="text-slate-400">Top Posts This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts.slice(0, 3).map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-slate-400">#{index + 1}</div>
                    <div>
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-gray-400">{post.views.toLocaleString()} views</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-slate-500/20">
          <CardHeader>
            <CardTitle className="text-slate-400">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Announcements</span>
                <Badge className="bg-slate-500">1 post</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Creator Tips</span>
                <Badge className="bg-slate-500">1 post</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Updates</span>
                <Badge className="bg-slate-500">1 post</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">Guidelines</span>
                <Badge className="bg-slate-500">1 post</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
