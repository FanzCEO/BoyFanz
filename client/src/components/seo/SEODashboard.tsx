/**
 * SEO Dashboard Component
 *
 * Admin dashboard for monitoring SEO performance and managing backlinks
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSEOStats, useBacklinks, useSEOConfig } from '@/hooks/use-seo';
import {
  Globe,
  FileText,
  Users,
  Link2,
  ExternalLink,
  Search,
  Map,
  Bot,
  Award,
  TrendingUp,
  Copy,
  Check,
  Star,
  Building2,
} from 'lucide-react';

export function SEODashboard() {
  const { data: stats, isLoading: statsLoading } = useSEOStats();
  const { data: config } = useSEOConfig();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const { data: backlinksData, isLoading: backlinksLoading } = useBacklinks(
    selectedCategory !== 'all' ? { category: selectedCategory } : undefined
  );

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredBacklinks = backlinksData?.backlinks.filter(
    (link) =>
      !searchQuery ||
      link.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: number) => {
    if (priority >= 9) return 'bg-green-500';
    if (priority >= 7) return 'bg-blue-500';
    if (priority >= 5) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 9) return 'Critical';
    if (priority >= 7) return 'High';
    if (priority >= 5) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">SEO Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor SEO performance and manage backlink opportunities
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indexable Creators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.indexableCreators.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Profiles in sitemap</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indexable Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.indexablePosts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Public content pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backlink Partners</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalBacklinkPartners}
            </div>
            <p className="text-xs text-muted-foreground">Industry opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.highPriorityBacklinks}
            </div>
            <p className="text-xs text-muted-foreground">Critical backlinks (9-10)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="backlinks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backlinks">
            <Link2 className="h-4 w-4 mr-2" />
            Backlinks
          </TabsTrigger>
          <TabsTrigger value="sitemaps">
            <Map className="h-4 w-4 mr-2" />
            Sitemaps
          </TabsTrigger>
          <TabsTrigger value="structured-data">
            <Bot className="h-4 w-4 mr-2" />
            Structured Data
          </TabsTrigger>
        </TabsList>

        {/* Backlinks Tab */}
        <TabsContent value="backlinks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry Backlink Opportunities</CardTitle>
              <CardDescription>
                Curated list of {backlinksData?.total || 0} high-value link building targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sites..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {backlinksData?.categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Backlinks List */}
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {backlinksLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading backlinks...
                    </div>
                  ) : filteredBacklinks?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No backlinks found matching your search
                    </div>
                  ) : (
                    filteredBacklinks?.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {/* Priority Badge */}
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getPriorityColor(
                              link.priority
                            )}`}
                          >
                            {link.priority}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {getPriorityLabel(link.priority)}
                          </span>
                        </div>

                        {/* Site Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{link.site}</h4>
                            {link.priority >= 9 && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{link.type}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{link.category}</Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyUrl(link.url)}
                          >
                            {copiedUrl === link.url ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sitemaps Tab */}
        <TabsContent value="sitemaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sitemap URLs</CardTitle>
              <CardDescription>
                Submit these URLs to search engines for indexing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.sitemapUrls &&
                  Object.entries(stats.sitemapUrls).map(([key, url]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Map className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium capitalize">{key} Sitemap</p>
                          <p className="text-sm text-muted-foreground">{url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyUrl(url)}
                        >
                          {copiedUrl === url ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}

                {/* robots.txt */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bot className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">robots.txt</p>
                      <p className="text-sm text-muted-foreground">
                        {config ? `https://${config.domain}/robots.txt` : 'Loading...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        config && handleCopyUrl(`https://${config.domain}/robots.txt`)
                      }
                    >
                      {config && copiedUrl === `https://${config.domain}/robots.txt` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={config ? `https://${config.domain}/robots.txt` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search Console Links */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-4">Submit to Search Engines</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" asChild>
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Google Search Console
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a
                      href="https://www.bing.com/webmasters"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Bing Webmaster Tools
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Structured Data Tab */}
        <TabsContent value="structured-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schema.org Structured Data</CardTitle>
              <CardDescription>
                JSON-LD schemas for improved search appearance and AEO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">Organization Schema</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Defines your platform as a business entity with logo, social links, and
                      contact info.
                    </p>
                    <Badge>Homepage</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Globe className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">WebSite Schema</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enables sitelinks search box and defines site structure for search
                      engines.
                    </p>
                    <Badge>Homepage</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="h-5 w-5 text-purple-500" />
                      <h4 className="font-semibold">Person Schema</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Rich creator profiles with follower counts, social links, and verified
                      status.
                    </p>
                    <Badge>Creator Profiles</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="h-5 w-5 text-orange-500" />
                      <h4 className="font-semibold">CreativeWork Schema</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Post content with author, date, engagement metrics, and media
                      attachments.
                    </p>
                    <Badge>Post Pages</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="h-5 w-5 text-yellow-500" />
                      <h4 className="font-semibold">FAQPage Schema</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Platform FAQs for featured snippets and voice search answers.
                    </p>
                    <Badge>Homepage & Help</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Map className="h-5 w-5 text-red-500" />
                      <h4 className="font-semibold">BreadcrumbList Schema</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Navigation breadcrumbs for improved search result appearance.
                    </p>
                    <Badge>All Pages</Badge>
                  </div>
                </div>

                {/* Test Tools */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-4">Validation Tools</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button variant="outline" asChild>
                      <a
                        href="https://search.google.com/test/rich-results"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        Rich Results Test
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href="https://validator.schema.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Schema Validator
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SEODashboard;
