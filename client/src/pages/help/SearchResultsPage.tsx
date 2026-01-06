import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import {
  Search,
  Book,
  ArrowLeft,
  ArrowRight,
  Clock,
  Eye,
  Star,
  FileText,
  PlayCircle,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  type: 'article' | 'tutorial' | 'faq';
  title: string;
  excerpt: string;
  url: string;
  category: string;
  relevanceScore: number;
}

interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
    totalCount: number;
  };
}

export function SearchResultsPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Extract query from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    setSearchQuery(q);
  }, [location]);

  // Fetch search results
  const { data: response, isLoading } = useQuery<SearchResponse>({
    queryKey: [`/api/help/search?q=${encodeURIComponent(searchQuery)}&type=all&limit=50`],
    enabled: searchQuery.length > 0,
    staleTime: 5 * 60 * 1000
  });

  const results = response?.data?.results || [];
  const totalCount = response?.data?.totalCount || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/help/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="h-4 w-4" />;
      case 'tutorial': return <PlayCircle className="h-4 w-4" />;
      case 'faq': return <HelpCircle className="h-4 w-4" />;
      default: return <Book className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-500/10 text-blue-400';
      case 'tutorial': return 'bg-green-500/10 text-green-400';
      case 'faq': return 'bg-purple-500/10 text-purple-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-yellow-500/20 backdrop-blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Link */}
          <Link href="/help" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Link>

          <h1 className="text-3xl font-bold text-white mb-6">Search Results</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help articles..."
                className="pl-10 bg-gray-800/50 border-gray-700 text-white"
              />
            </div>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchQuery && results.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No results found</h2>
            <p className="text-gray-400 mb-6">
              We couldn't find anything matching "{searchQuery}"
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Try:</p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Using different keywords</li>
                <li>Checking your spelling</li>
                <li>Using more general terms</li>
              </ul>
            </div>
            <Link href="/help/wiki">
              <Button className="mt-6" variant="outline">
                Browse Knowledge Base
              </Button>
            </Link>
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-gray-400 mb-6">
              Found {totalCount} result{totalCount !== 1 ? 's' : ''} for "{searchQuery}"
            </p>

            <div className="space-y-4">
              {results.map((result) => (
                <Link key={result.id} href={result.url || `/help/wiki/${result.id}`}>
                  <Card className="group bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {result.type}
                            </Badge>
                            {result.category && (
                              <Badge variant="outline" className="text-xs">
                                {result.category}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                            {result.title}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                            {result.excerpt}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Search for help</h2>
            <p className="text-gray-400">
              Enter a search term above to find articles, tutorials, and FAQs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
