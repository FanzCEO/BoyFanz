/**
 * Wiki Layout Component
 * Main layout wrapper for the BoyFanz Wiki/Help Center
 * Features sidebar navigation with categories and search
 */

import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BookOpen,
  Search,
  ChevronRight,
  ChevronDown,
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
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { wikiCategories, wikiArticles, WikiCategory, searchArticles } from '@/data/wiki/wikiContent';
import { AITutorialGuide } from './AITutorialGuide';
import { WikiPage } from './WikiPage';
import WikiHome from '@/pages/wiki/WikiHome';

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

interface WikiLayoutProps {
  children?: React.ReactNode;
}

export function WikiLayout({ children }: WikiLayoutProps = {}) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<WikiCategory[]>(['getting-started']);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchArticles(searchQuery).slice(0, 8);
  }, [searchQuery]);

  const toggleCategory = (category: WikiCategory) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const isActiveArticle = (slug: string) => {
    return location === `/wiki/${slug}`;
  };

  // Determine what content to show based on the current location
  const currentSlug = location.startsWith('/wiki/') ? location.split('/wiki/')[1] : null;
  const ContentComponent = currentSlug ? <WikiPage slug={currentSlug} /> : <WikiHome />;

  const handleArticleClick = () => {
    setIsMobileSidebarOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-cyan-500/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-cyan-400" />
          </button>
          <Link to="/wiki" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <span className="font-bold text-white">BoyFanz Wiki</span>
          </Link>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          w-80 h-screen overflow-y-auto
          bg-gray-900/95 lg:bg-gray-900/50 backdrop-blur-sm
          border-r border-cyan-500/20
          transform transition-transform duration-300 lg:transform-none
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent
        `}>
          {/* Sidebar Header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 p-4 border-b border-cyan-500/20">
            <div className="flex items-center justify-between mb-4">
              <Link to="/wiki" className="flex items-center gap-3 group" onClick={handleArticleClick}>
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl border border-cyan-500/30 group-hover:border-cyan-400/50 transition-colors">
                  <BookOpen className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="font-bold text-white text-lg">BoyFanz Wiki</h1>
                  <p className="text-xs text-cyan-400/70">Help & Documentation</p>
                </div>
              </Link>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-gray-800/50 border border-cyan-500/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-4 right-4 mt-2 bg-gray-800 border border-cyan-500/30 rounded-lg shadow-xl shadow-cyan-500/10 overflow-hidden z-20">
                {searchResults.map((article) => (
                  <Link
                    key={article.id}
                    to={`/wiki/${article.slug}`}
                    onClick={handleArticleClick}
                    className="block px-4 py-3 hover:bg-cyan-500/10 border-b border-cyan-500/10 last:border-b-0 transition-colors"
                  >
                    <p className="text-sm font-medium text-white">{article.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{article.summary}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Categories */}
          <nav className="p-4 space-y-1">
            {wikiCategories.map((category) => {
              const Icon = categoryIcons[category.id];
              const articles = wikiArticles.filter(a => a.category === category.id);
              const isExpanded = expandedCategories.includes(category.id);

              return (
                <div key={category.id} className="mb-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-cyan-500/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-gray-800/50 px-1.5 py-0.5 rounded">
                        {articles.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {/* Category Articles */}
                  {isExpanded && (
                    <div className="ml-4 pl-4 border-l border-cyan-500/10 mt-1 space-y-0.5">
                      {articles.map((article) => (
                        <Link
                          key={article.id}
                          to={`/wiki/${article.slug}`}
                          onClick={handleArticleClick}
                          className={`
                            block px-3 py-2 rounded-lg text-sm transition-all
                            ${isActiveArticle(article.slug)
                              ? 'bg-cyan-500/20 text-cyan-300 border-l-2 border-cyan-400 -ml-[1px] pl-[11px]'
                              : 'text-gray-400 hover:text-white hover:bg-cyan-500/5'
                            }
                          `}
                        >
                          {article.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* AI Guide Promo */}
          <div className="p-4 mt-4">
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white text-sm">AI Guide</h3>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Get instant answers with our AI-powered assistant
              </p>
              <div className="text-xs text-cyan-400/70">
                Available on every page →
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children || ContentComponent}
        </main>
      </div>

      {/* Floating AI Guide */}
      <AITutorialGuide compact onArticleSelect={(articleSlug) => {
        window.location.assign(`/wiki/${articleSlug}`);
      }} />
    </div>
  );
}

export default WikiLayout;
