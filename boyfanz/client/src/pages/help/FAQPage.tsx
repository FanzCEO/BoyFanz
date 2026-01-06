import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import {
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Book
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
}

interface FAQCategory {
  name: string;
  slug: string;
  count: number;
}

export function FAQPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Get the hash from the URL to auto-expand a specific FAQ item
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setExpandedItems([hash]);
      // Scroll to the element after a short delay to ensure it's rendered
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [location]);

  // Fetch FAQ articles from wiki
  const { data: articlesResponse, isLoading } = useQuery<{
    success: boolean;
    data: { articles: FAQArticle[] };
  }>({
    queryKey: ['/api/help/wiki', { search: searchQuery, category: selectedCategory }],
  });

  const articles = articlesResponse?.data?.articles || [];

  // Group articles by category
  const groupedArticles = articles.reduce((acc, article) => {
    const category = article.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(article);
    return acc;
  }, {} as Record<string, FAQArticle[]>);

  // Filter articles by search query
  const filteredArticles = searchQuery
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  const filteredGrouped = searchQuery
    ? { 'Search Results': filteredArticles }
    : groupedArticles;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" data-testid="faq-page">
      {/* Header */}
      <div className="mb-8">
        <Link href="/help">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Button>
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
            <p className="text-muted-foreground">
              Find answers to common questions about BoyFanz
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search FAQs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* FAQ Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : Object.keys(filteredGrouped).length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No FAQs Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : 'No FAQ articles available yet.'}
            </p>
            <Link href="/help/chat">
              <Button>
                Ask Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredGrouped).map(([category, categoryArticles]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" />
                {category}
                <Badge variant="secondary" className="ml-2">
                  {categoryArticles.length}
                </Badge>
              </h2>

              <Accordion
                type="multiple"
                value={expandedItems}
                onValueChange={setExpandedItems}
                className="space-y-2"
              >
                {categoryArticles.map((article) => (
                  <AccordionItem
                    key={article.id}
                    value={article.slug}
                    id={article.slug}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-start gap-3 text-left">
                        <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="font-medium">{article.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="pl-8">
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none mb-4"
                          dangerouslySetInnerHTML={{
                            __html: article.content
                              .replace(/\n/g, '<br/>')
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/`(.*?)`/g, '<code>$1</code>')
                          }}
                        />

                        {/* Article metadata */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-4 mt-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Updated {new Date(article.lastUpdated).toLocaleDateString()}
                          </span>
                          {article.tags.length > 0 && (
                            <div className="flex gap-1">
                              {article.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Helpful feedback */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                          <span className="text-sm text-muted-foreground">Was this helpful?</span>
                          <Button variant="outline" size="sm" className="gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {article.helpful}
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <ThumbsDown className="h-4 w-4" />
                            {article.notHelpful}
                          </Button>
                          <Link href={`/help/wiki/${article.slug}`} className="ml-auto">
                            <Button variant="ghost" size="sm">
                              View Full Article
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      )}

      {/* Contact Support CTA */}
      <Card className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Still Need Help?</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/help/chat">
              <Button>
                Chat with Support
              </Button>
            </Link>
            <Link href="/help/tickets/create">
              <Button variant="outline">
                Submit a Ticket
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FAQPage;
