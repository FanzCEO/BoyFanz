import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Save } from "lucide-react";

interface Page {
  id: number;
  title: string;
  slug: string;
  status: "published" | "draft";
  views: number;
  lastModified: string;
}

export default function PagesManagement() {
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([
    { id: 1, title: "About Us", slug: "/about", status: "published", views: 4521, lastModified: "2024-01-15" },
    { id: 2, title: "Terms of Service", slug: "/terms", status: "published", views: 8934, lastModified: "2024-01-10" },
    { id: 3, title: "Privacy Policy", slug: "/privacy", status: "published", views: 7821, lastModified: "2024-01-10" },
    { id: 4, title: "Community Guidelines", slug: "/guidelines", status: "published", views: 2134, lastModified: "2024-01-08" },
    { id: 5, title: "FAQ", slug: "/faq", status: "draft", views: 0, lastModified: "2024-01-05" },
  ]);

  const [editingPage, setEditingPage] = useState<number | null>(null);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Pages Management
          </h1>
          <p className="text-gray-400 mt-2">Create and manage static pages</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-cyan-400">5</div>
            <p className="text-gray-400">Total Pages</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-400">4</div>
            <p className="text-gray-400">Published</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-400">1</div>
            <p className="text-gray-400">Drafts</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-cyan-400">23.4K</div>
            <p className="text-gray-400">Total Views</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-400">All Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-cyan-500/20">
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id} className="border-cyan-500/10">
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-gray-400">{page.slug}</TableCell>
                  <TableCell>
                    <Badge
                      variant={page.status === "published" ? "default" : "secondary"}
                      className={page.status === "published" ? "bg-green-500" : "bg-yellow-600"}
                    >
                      {page.status === "published" ? (
                        <><Eye className="h-3 w-3 mr-1" /> Published</>
                      ) : (
                        <><EyeOff className="h-3 w-3 mr-1" /> Draft</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {page.views.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-gray-400">{page.lastModified}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-500/20"
                        onClick={() => setEditingPage(page.id)}
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

      {editingPage && (
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-cyan-400">Edit Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Page Title</Label>
                <Input
                  defaultValue={pages.find(p => p.id === editingPage)?.title}
                  className="bg-gray-800 border-cyan-500/20"
                  placeholder="Enter page title"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  defaultValue={pages.find(p => p.id === editingPage)?.slug}
                  className="bg-gray-800 border-cyan-500/20"
                  placeholder="/page-url"
                />
              </div>
            </div>

            <div>
              <Label>Page Content</Label>
              <Textarea
                placeholder="Enter page content (supports Markdown)"
                className="bg-gray-800 border-cyan-500/20 min-h-[300px] font-mono"
                defaultValue="# Page Content\n\nYour content goes here..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>Published</Label>
                <Switch defaultChecked={pages.find(p => p.id === editingPage)?.status === "published"} />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-cyan-500/20"
                  onClick={() => setEditingPage(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-500"
                  onClick={() => {
                    toast({
                      title: "Page Saved",
                      description: "Your changes have been saved successfully.",
                    });
                    setEditingPage(null);
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
