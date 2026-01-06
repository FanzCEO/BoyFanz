import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  Calendar,
  User,
  Clock,
  Search,
  Filter,
  BookOpen,
  TrendingUp,
  Star,
  Heart,
  PawPrint
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  viewsCount: number;
  likesCount: number;
  isFeatured: boolean;
}

const BlogPostCard = ({ post, featured = false }: { post: BlogPost; featured?: boolean }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group bg-black/60 backdrop-blur-sm border-gray-700 ${
        featured ? 'md:col-span-2 lg:col-span-3' : ''
      }`}
      data-testid={`blog-post-${post.id}`}
    >
      <div className={`relative ${featured ? 'aspect-video md:aspect-[21/9]' : 'aspect-video'}`}>
        {post.featuredImage ? (
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
        )}
        
        {post.isFeatured && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}

        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="text-xs">
            {post.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {post.author.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-white" data-testid={`author-${post.id}`}>{post.author.name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{post.author.role}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <Calendar className="h-3 w-3" />
              <span data-testid={`date-${post.id}`}>{formatDate(post.publishedAt)}</span>
              <span>•</span>
              <Clock className="h-3 w-3" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>

        <CardTitle className={`mb-3 line-clamp-2 text-white group-hover:text-primary transition-colors ${
          featured ? 'text-2xl' : 'text-lg'
        }`} data-testid={`title-${post.id}`}>
          {post.title}
        </CardTitle>

        <CardDescription className={`mb-4 text-gray-300 ${featured ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'}`} data-testid={`excerpt-${post.id}`}>
          {post.excerpt}
        </CardDescription>

        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.slice(0, 3).map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs text-gray-300 border-gray-600">
              {tag}
            </Badge>
          ))}
          {post.tags.length > 3 && (
            <Badge variant="outline" className="text-xs text-gray-300 border-gray-600">
              +{post.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {post.viewsCount} views
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {post.likesCount} likes
            </span>
          </div>

          <Button variant="ghost" size="sm" className="text-xs text-white hover:text-primary" data-testid={`read-more-${post.id}`}>
            Read More →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: postsResponse, isLoading } = useQuery<{ success: boolean; posts: BlogPost[] }>({
    queryKey: ['/api/blog/posts', { search: searchQuery, category: selectedCategory }],
    retry: false, // Don't retry if API doesn't exist
  });

  const posts: BlogPost[] = postsResponse?.posts || [];

  const categories = ['All', 'Industry', 'Creator Tips', 'Platform News', 'Tutorials', 'Success Stories'];
  
  const featuredPosts = posts.filter(post => post.isFeatured);
  const regularPosts = posts.filter(post => !post.isFeatured);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-6 w-full bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="blog-page">
      <div className="max-w-6xl mx-auto bg-black/70 backdrop-blur-sm rounded-2xl p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Creator Hub Blog
          </h1>
          <p className="text-gray-300">
            Insights, tips, and updates from the creator economy
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-input"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === (category === 'All' ? '' : category) ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                data-testid={`category-${category.toLowerCase().replace(' ', '-')}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {posts.length === 0 ? (
          <Card className="text-center py-12 bg-black/60 backdrop-blur-sm border-gray-700">
            <CardContent>
              <div className="space-y-4">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Blog Coming Soon</h3>
                  <p className="text-gray-300">
                    Stay tuned for creator tips, industry insights, and platform updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Featured Posts</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} featured={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Posts */}
            {regularPosts.length > 0 && (
              <div>
                {featuredPosts.length > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Latest Posts</h2>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Newsletter Signup */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-6">
              Get the latest creator economy insights delivered to your inbox
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                data-testid="newsletter-email"
              />
              <Button data-testid="newsletter-subscribe">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* The Wittle Bear Foundation */}
        <Card className="mt-8 border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-amber-500/5">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center gap-2 mb-3">
                <PawPrint className="h-6 w-6 text-pink-400" />
                <Heart className="h-5 w-5 text-pink-500 fill-pink-500 animate-pulse" />
                <PawPrint className="h-6 w-6 text-pink-400 transform scale-x-[-1]" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-pink-500 to-amber-400 bg-clip-text text-transparent mb-1">
                The Wittle Bear Foundation
              </h3>
              <p className="text-sm text-pink-200/60 italic">In loving memory of Wittle Bear</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-pink-500/10">
                <Heart className="h-6 w-6 text-pink-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-pink-300 text-sm">Supporting LGBTQ+ Youth</p>
                  <p className="text-xs text-muted-foreground">Shelter & resources for homeless youth</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10">
                <PawPrint className="h-6 w-6 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-300 text-sm">Rescuing Shelter Animals</p>
                  <p className="text-xs text-muted-foreground">Helping animals find forever homes</p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm">
              <p className="text-muted-foreground mb-2">
                <span className="text-pink-300 font-medium">A large portion of our profits</span> goes directly to the foundation
              </p>
              <p className="text-pink-300/60 text-xs flex items-center justify-center gap-1">
                <Heart className="h-3 w-3 text-pink-500 fill-pink-500" />
                Because no one should ever feel alone or unwanted
                <Heart className="h-3 w-3 text-pink-500 fill-pink-500" />
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}