import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  ArrowLeft,
  Send,
  Plus,
  X,
  BarChart3
} from "lucide-react";
import { useState } from "react";

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isCreatorForum: boolean;
}

export default function CreateTopic() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const categoryParam = new URLSearchParams(search).get("category");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(categoryParam || "");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isMultiChoice, setIsMultiChoice] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<{ categories: ForumCategory[] }>({
    queryKey: ["/api/forums/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        categoryId,
        title,
        content,
        tags,
      };

      if (showPoll && pollQuestion && pollOptions.filter(Boolean).length >= 2) {
        payload.poll = {
          question: pollQuestion,
          options: pollOptions.filter(Boolean),
          isMultiChoice,
        };
      }

      const res = await fetch("/api/forums/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create topic");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Topic created successfully!" });
      navigate(`/forums/topic/${data.topic.id}`);
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to create topic", variant: "destructive" });
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createMutation.mutate();
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Sign in to create a topic</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to start a discussion.</p>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const categories = categoriesData?.categories || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/forums">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create New Topic</h1>
            <p className="text-muted-foreground">Start a new discussion in the community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Topic Details</CardTitle>
              <CardDescription>
                Choose a category and write your topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                        {cat.isCreatorForum && " (Creator Forum)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {title.length}/255
                </p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your topic content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    maxLength={30}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag} disabled={tags.length >= 5}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Up to 5 tags to help others find your topic
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Poll Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Add a Poll
                  </CardTitle>
                  <CardDescription>
                    Let the community vote on options
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant={showPoll ? "secondary" : "outline"}
                  onClick={() => setShowPoll(!showPoll)}
                >
                  {showPoll ? "Remove Poll" : "Add Poll"}
                </Button>
              </div>
            </CardHeader>
            {showPoll && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Poll Question</Label>
                  <Input
                    placeholder="What should we vote on?"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[index] = e.target.value;
                          setPollOptions(newOptions);
                        }}
                      />
                      {pollOptions.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePollOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 10 && (
                    <Button type="button" variant="outline" size="sm" onClick={handleAddPollOption}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="multiChoice"
                    checked={isMultiChoice}
                    onChange={(e) => setIsMultiChoice(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="multiChoice" className="cursor-pointer">
                    Allow multiple choices
                  </Label>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/forums">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={!title.trim() || !content.trim() || !categoryId || createMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {createMutation.isPending ? "Creating..." : "Create Topic"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
