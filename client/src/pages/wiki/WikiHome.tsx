/**
 * Wiki Home Page
 * Main dashboard for the BoyFanz Wiki/Help Center
 * Features category grid, popular articles, and quick search
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import {
  BookOpen,
  Search,
  Home,
  Users,
  Heart,
  CreditCard,
  Shield,
  FileCheck,
  Code,
  Settings,
  Wrench,
  HelpCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Zap
} from 'lucide-react';
import { wikiCategories, wikiArticles, WikiCategory, searchArticles } from '@/data/wiki/wikiContent';

const categoryIcons: Record<WikiCategory, React.ElementType> = {
  'getting-started': Home,
  'creators': Users,
  'fans': Heart,
  'payments': CreditCard,
  'security': Shield,
  'compliance': FileCheck,
  'api': Code,
  'admin': Settings,
  'technical': Wrench,
  'troubleshooting': HelpCircle,
};

const categoryColors: Record<WikiCategory, string> = {
  'getting-started': 'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400/50',
  'creators': 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400/50',
  'fans': 'from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-400/50',
  'payments': 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 hover:border-yellow-400/50',
  'security': 'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-400/50',
  'compliance': 'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-400/50',
  'api': 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400/50',
  'admin': 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-400/50',
  'technical': 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400/50',
  'troubleshooting': 'from-gray-500/20 to-gray-600/10 border-gray-500/30 hover:border-gray-400/50',
};

const categoryIconColors: Record<WikiCategory, string> = {
  'getting-started': 'text-green-400',
  'creators': 'text-purple-400',
  'fans': 'text-pink-400',
  'payments': 'text-yellow-400',
  'security': 'text-red-400',
  'compliance': 'text-orange-400',
  'api': 'text-blue-400',
  'admin': 'text-indigo-400',
  'technical': 'text-cyan-400',
  'troubleshooting': 'text-gray-400',
};

export default function WikiHome() {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchArticles(searchQuery).slice(0, 6);
  }, [searchQuery]);

  // Featured articles (first article from key categories)
  const featuredArticles = useMemo(() => {
    const featured = ['getting-started', 'creators', 'payments', 'security'];
    return featured.map(cat =>
      wikiArticles.find(a => a.category === cat)
    ).filter(Boolean).slice(0, 4);
  }, []);

  // Popular articles (based on difficulty - beginner first)
  const popularArticles = wikiArticles
    .filter(a => a.difficulty === 'beginner')
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-cyan-300">AI-Powered Help Center</span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
          BoyFanz <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">Wiki</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Everything you need to know about creating, earning, and connecting on BoyFanz
        </p>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for articles, guides, and more..."
            className="w-full bg-gray-800/50 border border-cyan-500/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all text-lg"
          />

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-gray-800 border border-cyan-500/30 rounded-xl shadow-xl shadow-cyan-500/10 overflow-hidden z-20">
              {searchResults.map((article) => (
                <Link
                  key={article.id}
                  to={`/wiki/${article.slug}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-cyan-500/10 border-b border-cyan-500/10 last:border-b-0 transition-colors"
                >
                  <div className="p-1.5 bg-gray-700/50 rounded-lg mt-0.5">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{article.title}</p>
                    <p className="text-sm text-gray-400 truncate">{article.summary}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 mt-1.5 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-gray-800/30 border border-cyan-500/10 rounded-xl p-4 text-center">
          <BookOpen className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{wikiArticles.length}</div>
          <div className="text-sm text-gray-400">Articles</div>
        </div>
        <div className="bg-gray-800/30 border border-cyan-500/10 rounded-xl p-4 text-center">
          <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{wikiCategories.length}</div>
          <div className="text-sm text-gray-400">Categories</div>
        </div>
        <div className="bg-gray-800/30 border border-cyan-500/10 rounded-xl p-4 text-center">
          <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">24/7</div>
          <div className="text-sm text-gray-400">AI Support</div>
        </div>
        <div className="bg-gray-800/30 border border-cyan-500/10 rounded-xl p-4 text-center">
          <Zap className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">Fast</div>
          <div className="text-sm text-gray-400">Answers</div>
        </div>
      </div>

      {/* Categories Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-cyan-500 rounded-full" />
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wikiCategories.map((category) => {
            const Icon = categoryIcons[category.id];
            const articleCount = wikiArticles.filter(a => a.category === category.id).length;

            return (
              <Link
                key={category.id}
                to={`/wiki/${wikiArticles.find(a => a.category === category.id)?.slug || ''}`}
                className={`group relative p-5 bg-gradient-to-br ${categoryColors[category.id]} border rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 bg-gray-800/50 rounded-xl ${categoryIconColors[category.id]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">
                    {articleCount} articles
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {category.description}
                </p>
                <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Articles */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-cyan-500 rounded-full" />
          Featured Guides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredArticles.map((article) => {
            if (!article) return null;
            const Icon = categoryIcons[article.category];

            return (
              <Link
                key={article.id}
                to={`/wiki/${article.slug}`}
                className="group flex gap-4 p-5 bg-gray-800/30 hover:bg-gray-800/50 border border-cyan-500/10 hover:border-cyan-500/30 rounded-xl transition-all"
              >
                <div className={`p-3 bg-gray-800/50 rounded-xl ${categoryIconColors[article.category]} flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.estimatedTime}
                    </span>
                    <span className="capitalize px-2 py-0.5 bg-gray-700/50 rounded">
                      {article.difficulty}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Articles */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-cyan-500 rounded-full" />
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Popular Articles
        </h2>
        <div className="bg-gray-800/20 border border-cyan-500/10 rounded-xl overflow-hidden">
          {popularArticles.map((article, index) => (
            <Link
              key={article.id}
              to={`/wiki/${article.slug}`}
              className="group flex items-center gap-4 px-5 py-4 hover:bg-cyan-500/5 border-b border-cyan-500/10 last:border-b-0 transition-colors"
            >
              <span className="text-2xl font-bold text-gray-700 w-8">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {article.summary}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* AI Guide CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/10 to-cyan-500/20 rounded-2xl" />
        <div className="relative p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl mb-6 shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Need Help? Ask Our AI Guide!
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">
            Get instant answers to your questions with our AI-powered assistant.
            Available 24/7 to help you navigate BoyFanz.
          </p>
          <p className="text-cyan-400 text-sm">
            Click the chat button in the corner to get started
          </p>
        </div>
      </section>
    </div>
  );
}
