import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Book,
  ArrowLeft,
  Clock,
  Eye,
  Star,
  ThumbsUp,
  ThumbsDown,
  Share,
  Bookmark,
  Tag
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  categorySlug: string;
  status: string;
  tags: string[];
  views: number;
  rating: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
  author: {
    name: string;
    role: string;
  };
  metadata: {
    readTime: number;
    difficulty: string;
  };
}

interface WikiArticlePageProps {
  slug: string;
}

export function WikiArticlePage({ slug }: WikiArticlePageProps) {
  // Fetch the article
  const { data: response, isLoading, error } = useQuery<{ success: boolean; data: WikiArticle }>({
    queryKey: ['/api/help/wiki', slug],
    staleTime: 5 * 60 * 1000
  });

  const article = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Book className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Article Not Found</h1>
            <p className="text-gray-400 mb-6">The article you're looking for doesn't exist or has been moved.</p>
            <Link href="/help/wiki">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Knowledge Base
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-500/20 backdrop-blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
            <span>/</span>
            <Link href="/help/wiki" className="hover:text-white transition-colors">Knowledge Base</Link>
            <span>/</span>
            <Link href={`/help/wiki?category=${article.categorySlug}`} className="hover:text-white transition-colors">
              {article.category}
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <Badge className={getDifficultyColor(article.metadata?.difficulty || 'beginner')}>
              {article.metadata?.difficulty || 'beginner'}
            </Badge>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.metadata?.readTime || 1} min read
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.views} views
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              {article.rating?.toFixed(1) || '4.5'}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6 md:p-8">
                <div className="prose prose-invert prose-lg max-w-none">
                  {/* Render content with markdown-like formatting */}
                  {article.content.split('\n').map((paragraph, index) => {
                    // Handle headers
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h3 key={index} className="text-xl font-bold text-white mt-6 mb-3">
                          {paragraph.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    // Handle list items
                    if (paragraph.startsWith('- ')) {
                      return (
                        <li key={index} className="text-gray-300 ml-4">
                          {paragraph.substring(2)}
                        </li>
                      );
                    }
                    // Handle numbered items
                    if (/^\d+\./.test(paragraph)) {
                      return (
                        <li key={index} className="text-gray-300 ml-4 list-decimal">
                          {paragraph.replace(/^\d+\.\s*/, '')}
                        </li>
                      );
                    }
                    // Regular paragraphs
                    if (paragraph.trim()) {
                      return (
                        <p key={index} className="text-gray-300 mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>

                <Separator className="my-8 bg-gray-700" />

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <Tag className="h-4 w-4 text-gray-500" />
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-700/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Helpful Section */}
                <div className="bg-gray-900/50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Was this article helpful?</h4>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Yes ({article.helpful})
                    </Button>
                    <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      No ({article.notHelpful})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back Button */}
            <div className="mt-6">
              <Link href="/help/wiki">
                <Button variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Knowledge Base
                </Button>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Actions */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4 space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Save Article
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </CardContent>
              </Card>

              {/* Article Info */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Article Info</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Author</span>
                      <span className="text-white">{article.author?.name || 'BoyFanz Team'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category</span>
                      <span className="text-white">{article.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated</span>
                      <span className="text-white">
                        {new Date(article.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
