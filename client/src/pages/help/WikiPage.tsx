import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Search,
  Book,
  Star,
  Clock,
  Filter,
  ArrowRight,
  ChevronDown,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Zap,
  Users,
  CreditCard,
  Shield,
  Video,
  MessageSquare,
  Settings,
  TrendingUp,
  HelpCircle,
  FileText,
  Sparkles,
  Rocket,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { AISearchInterface } from '@/components/help/AISearchInterface';

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: 'published' | 'draft' | 'archived';
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
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

interface WikiCategory {
  name: string;
  slug: string;
  count: number;
  description: string;
  icon?: string;
}

// Default categories for the wiki
const defaultCategories: WikiCategory[] = [
  { name: 'Getting Started', slug: 'getting-started', count: 12, description: 'New to BoyFanz? Start here', icon: 'rocket' },
  { name: 'Creator Guide', slug: 'creator-guide', count: 24, description: 'Everything about content creation', icon: 'video' },
  { name: 'Monetization', slug: 'monetization', count: 18, description: 'Subscriptions, tips, and earnings', icon: 'credit-card' },
  { name: 'Fan Experience', slug: 'fan-experience', count: 15, description: 'Subscribing, tipping, and engagement', icon: 'users' },
  { name: 'Safety & Privacy', slug: 'safety-privacy', count: 20, description: 'Account security and privacy settings', icon: 'shield' },
  { name: 'Messaging', slug: 'messaging', count: 10, description: 'DMs, mass messaging, and PPV', icon: 'message-square' },
  { name: 'Live Streaming', slug: 'live-streaming', count: 14, description: 'Go live and connect with fans', icon: 'video' },
  { name: 'Account Settings', slug: 'account-settings', count: 16, description: 'Profile, verification, and preferences', icon: 'settings' },
  { name: 'Payouts', slug: 'payouts', count: 12, description: 'Withdrawals and payment methods', icon: 'trending-up' },
  { name: 'Troubleshooting', slug: 'troubleshooting', count: 22, description: 'Common issues and solutions', icon: 'help-circle' }
];

// Featured articles for quick access
const featuredTopics = [
  {
    title: 'How to Set Up Your Creator Profile',
    slug: 'setup-creator-profile',
    category: 'Getting Started',
    icon: Rocket,
    color: 'from-red-600 to-orange-500'
  },
  {
    title: 'Understanding Your Earnings',
    slug: 'understanding-earnings',
    category: 'Monetization',
    icon: TrendingUp,
    color: 'from-green-600 to-emerald-500'
  },
  {
    title: 'Setting Subscription Prices',
    slug: 'subscription-pricing',
    category: 'Monetization',
    icon: CreditCard,
    color: 'from-blue-600 to-cyan-500'
  },
  {
    title: 'Content Protection & DMCA',
    slug: 'content-protection',
    category: 'Safety & Privacy',
    icon: Shield,
    color: 'from-purple-600 to-pink-500'
  }
];

export function WikiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');

  // Fetch wiki categories from KB API
  const { data: categories } = useQuery<WikiCategory[]>({
    queryKey: ['/api/help/wiki/categories'],
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  // Fetch wiki articles from KB API
  const { data: articlesData, isLoading } = useQuery<{
    articles: WikiArticle[];
    totalCount: number;
    hasMore: boolean;
  }>({
    queryKey: ['/api/help/wiki', {
      search: searchQuery,
      category: selectedCategory,
      sort: sortBy,
      page: 1,
      limit: 20
    }],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (categorySlug: string) => {
    setSelectedCategory(categorySlug === selectedCategory ? '' : categorySlug);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'rocket': return Rocket;
      case 'video': return Video;
      case 'credit-card': return CreditCard;
      case 'users': return Users;
      case 'shield': return Shield;
      case 'message-square': return MessageSquare;
      case 'settings': return Settings;
      case 'trending-up': return TrendingUp;
      case 'help-circle': return HelpCircle;
      default: return BookOpen;
    }
  };

  // Use API categories or fallback to defaults
  const displayCategories = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20" data-testid="wiki-page">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/help" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-red-600 to-orange-500 rounded-full">
                <Book className="h-10 w-10 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">
              BoyFanz Knowledge Base
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Comprehensive guides, tutorials, and documentation to help you succeed on BoyFanz.
            </p>

            {/* Search Interface */}
            <div className="max-w-3xl mx-auto">
              <AISearchInterface
                onSearch={handleSearch}
                placeholder="Search the knowledge base..."
                showSuggestions={true}
                compact={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links - Featured Topics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-400" />
          Popular Topics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredTopics.map((topic, index) => (
            <Link key={index} href={`/help/wiki/${topic.slug}`}>
              <Card className="group bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${topic.color}`}>
                    <topic.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white group-hover:text-red-400 truncate transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-gray-400">{topic.category}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Categories & Articles */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar - Categories */}
          <div className="lg:w-1/4">
            <Card className="bg-gray-800/50 border-gray-700 sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="h-5 w-5 text-red-400" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === '' ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    selectedCategory === ''
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                  onClick={() => setSelectedCategory('')}
                  data-testid="filter-all-categories"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  All Articles
                  <Badge variant="secondary" className="ml-auto bg-gray-700 text-gray-300">
                    {articlesData?.totalCount || displayCategories.reduce((sum, c) => sum + c.count, 0)}
                  </Badge>
                </Button>

                <Separator className="my-3 bg-gray-700" />

                {displayCategories.map((category) => {
                  const IconComponent = getCategoryIcon(category.icon);
                  return (
                    <Button
                      key={category.slug}
                      variant={selectedCategory === category.slug ? "default" : "ghost"}
                      className={`w-full justify-start text-left ${
                        selectedCategory === category.slug
                          ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                      }`}
                      onClick={() => handleCategoryFilter(category.slug)}
                      data-testid={`filter-category-${category.slug}`}
                    >
                      <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate flex-1">{category.name}</span>
                      <Badge variant="secondary" className="ml-auto bg-gray-700 text-gray-300 flex-shrink-0">
                        {category.count}
                      </Badge>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Need More Help */}
            <Card className="bg-gradient-to-br from-red-600/20 to-orange-500/20 border-red-500/30 mt-6">
              <CardContent className="p-4 text-center">
                <HelpCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white mb-1">Need More Help?</h3>
                <p className="text-xs text-gray-300 mb-3">
                  Can't find what you're looking for?
                </p>
                <Button asChild size="sm" className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600">
                  <Link href="/help/chat">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat with AI Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">

            {/* Sort & View Options */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedCategory ?
                  displayCategories.find(c => c.slug === selectedCategory)?.name || 'Articles' :
                  'All Articles'
                }
                {searchQuery && (
                  <span className="text-lg font-normal text-gray-400 ml-2">
                    for "{searchQuery}"
                  </span>
                )}
              </h2>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                    Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem onClick={() => setSortBy('popular')} className="text-white hover:bg-gray-700">
                    Most Popular
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('recent')} className="text-white hover:bg-gray-700">
                    Recently Updated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('rating')} className="text-white hover:bg-gray-700">
                    Highest Rated
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Articles Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : articlesData?.articles && articlesData.articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articlesData.articles.map((article) => (
                  <Link key={article.id} href={`/help/wiki/${article.slug}`}>
                    <Card className="group bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                            {article.category}
                          </Badge>
                          <Badge className={getDifficultyColor(article.metadata.difficulty)}>
                            {article.metadata.difficulty}
                          </Badge>
                        </div>

                        <CardTitle className="text-lg text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                          {article.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                          {article.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {article.views.toLocaleString()} views
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {article.metadata.readTime} min read
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-current text-yellow-400 mr-1" />
                            {article.rating.toFixed(1)}
                          </div>
                        </div>

                        <Separator className="bg-gray-700 mb-4" />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <ThumbsUp className="h-3 w-3 mr-1 text-green-400" />
                            {article.helpful}
                            <ThumbsDown className="h-3 w-3 ml-3 mr-1 text-red-400" />
                            {article.notHelpful}
                          </div>

                          <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              /* No Results / Default Category Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayCategories.map((category) => {
                  const IconComponent = getCategoryIcon(category.icon);
                  return (
                    <Card
                      key={category.slug}
                      className="group bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all cursor-pointer"
                      onClick={() => handleCategoryFilter(category.slug)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-gradient-to-r from-red-600/20 to-orange-500/20 group-hover:from-red-600/30 group-hover:to-orange-500/30 transition-colors">
                            <IconComponent className="h-6 w-6 text-red-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                              {category.description}
                            </p>
                            <Badge variant="secondary" className="mt-3 bg-gray-700 text-gray-300">
                              {category.count} articles
                            </Badge>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Load More / Pagination */}
            {articlesData?.hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  data-testid="button-load-more"
                >
                  Load More Articles
                </Button>
              </div>
            )}

            {/* Search No Results */}
            {searchQuery && articlesData?.articles?.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No results for "{searchQuery}"
                </h3>
                <p className="text-gray-400 mb-6">
                  Try different keywords or browse by category.
                </p>
                <Button
                  variant="outline"
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="mt-12 border-t border-gray-800 pt-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6 text-orange-400" />
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/legal">
              <Card className="bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <FileText className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Legal Library</h3>
                    <p className="text-xs text-gray-400">Terms, Privacy, DMCA</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/help/tutorials">
              <Card className="bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Video className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Video Tutorials</h3>
                    <p className="text-xs text-gray-400">Watch and learn</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/help/tickets">
              <Card className="bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <HelpCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Support Tickets</h3>
                    <p className="text-xs text-gray-400">Get personalized help</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/contact">
              <Card className="bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <MessageSquare className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Contact Us</h3>
                    <p className="text-xs text-gray-400">Reach our team</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
