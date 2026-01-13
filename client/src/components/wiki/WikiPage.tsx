/**
 * Wiki Page Component
 * Renders individual wiki articles with markdown support
 * Includes breadcrumbs, metadata, and related articles
 */

import React, { useMemo, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronRight,
  Clock,
  Tag,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Lightbulb,
  Share2,
  Printer,
  ThumbsUp,
  ThumbsDown,
  ExternalLink
} from 'lucide-react';
import { getArticleBySlug, getArticlesByCategory, wikiCategories, WikiArticle } from '@/data/wiki/wikiContent';

// Simple markdown-like renderer for wiki content
function renderContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = '';
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const ListTag = listType;
      elements.push(
        <ListTag key={elements.length} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} list-inside space-y-2 my-4 text-gray-300`}>
          {listItems.map((item, i) => (
            <li key={i} className="leading-relaxed">{renderInlineContent(item)}</li>
          ))}
        </ListTag>
      );
      listItems = [];
      listType = null;
    }
  };

  const renderInlineContent = (text: string): React.ReactNode => {
    // Handle bold, italic, code, and links
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Italic
      const italicMatch = remaining.match(/\*(.+?)\*/);
      // Inline code
      const codeMatch = remaining.match(/`(.+?)`/);
      // Links
      const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);

      const matches = [
        boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
        italicMatch ? { type: 'italic', match: italicMatch, index: italicMatch.index! } : null,
        codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index! } : null,
        linkMatch ? { type: 'link', match: linkMatch, index: linkMatch.index! } : null,
      ].filter(Boolean).sort((a, b) => a!.index - b!.index);

      if (matches.length === 0) {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }

      const first = matches[0]!;
      if (first.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, first.index)}</span>);
      }

      if (first.type === 'bold') {
        parts.push(<strong key={key++} className="font-semibold text-white">{first.match![1]}</strong>);
        remaining = remaining.slice(first.index + first.match![0].length);
      } else if (first.type === 'italic') {
        parts.push(<em key={key++} className="italic text-cyan-300">{first.match![1]}</em>);
        remaining = remaining.slice(first.index + first.match![0].length);
      } else if (first.type === 'code') {
        parts.push(
          <code key={key++} className="px-1.5 py-0.5 bg-gray-800 text-cyan-300 rounded text-sm font-mono">
            {first.match![1]}
          </code>
        );
        remaining = remaining.slice(first.index + first.match![0].length);
      } else if (first.type === 'link') {
        const isExternal = first.match![2].startsWith('http');
        parts.push(
          <a
            key={key++}
            href={first.match![2]}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 inline-flex items-center gap-1"
          >
            {first.match![1]}
            {isExternal && <ExternalLink className="w-3 h-3" />}
          </a>
        );
        remaining = remaining.slice(first.index + first.match![0].length);
      }
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={elements.length} className="my-4 p-4 bg-gray-800/80 border border-cyan-500/20 rounded-xl overflow-x-auto">
            <code className="text-sm font-mono text-gray-300">{codeContent.join('\n')}</code>
          </pre>
        );
        codeContent = [];
        inCodeBlock = false;
      } else {
        flushList();
        codeLanguage = line.slice(3);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={elements.length} className="text-2xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-cyan-500 rounded-full" />
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={elements.length} className="text-xl font-semibold text-cyan-300 mt-6 mb-3">
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    if (line.startsWith('#### ')) {
      flushList();
      elements.push(
        <h4 key={elements.length} className="text-lg font-medium text-white mt-4 mb-2">
          {line.slice(5)}
        </h4>
      );
      continue;
    }

    // Horizontal rule
    if (line === '---') {
      flushList();
      elements.push(<hr key={elements.length} className="my-8 border-cyan-500/20" />);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={elements.length} className="my-4 pl-4 border-l-4 border-cyan-500/50 text-gray-400 italic">
          {renderInlineContent(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Lists
    if (line.match(/^[-*] /)) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(line.slice(2));
      continue;
    }

    if (line.match(/^\d+\. /)) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(line.replace(/^\d+\. /, ''));
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={elements.length} className="my-4 text-gray-300 leading-relaxed">
        {renderInlineContent(line)}
      </p>
    );
  }

  flushList();

  return elements;
}

interface WikiPageProps {
  slug?: string;
}

export function WikiPage({ slug: propSlug }: WikiPageProps = {}) {
  const [location] = useLocation();
  // Extract slug from URL if not provided as prop
  const slug = propSlug || location.split('/wiki/')[1] || '';

  const article = useMemo(() => slug ? getArticleBySlug(slug) : null, [slug]);

  const categoryArticles = useMemo(() => {
    if (!article) return [];
    return getArticlesByCategory(article.category);
  }, [article]);

  const currentIndex = categoryArticles.findIndex(a => a.slug === slug);
  const prevArticle = currentIndex > 0 ? categoryArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < categoryArticles.length - 1 ? categoryArticles[currentIndex + 1] : null;

  const category = useMemo(() => {
    if (!article) return null;
    return wikiCategories.find(c => c.id === article.category);
  }, [article]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Article Not Found</h1>
        <p className="text-gray-400 mb-6">The article you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/wiki"
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wiki
        </Link>
      </div>
    );
  }

  const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/wiki" className="hover:text-cyan-400 transition-colors">Wiki</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/wiki?category=${article.category}`} className="hover:text-cyan-400 transition-colors">
          {category?.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-cyan-400 truncate">{article.title}</span>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{article.title}</h1>
        <p className="text-lg text-gray-400 mb-6">{article.summary}</p>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${difficultyColors[article.difficulty]}`}>
            {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            {article.estimatedTime}
          </span>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            {article.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* AI Prompts / Quick Questions */}
      {article.aiPrompts && article.aiPrompts.length > 0 && (
        <div className="mb-8 p-4 bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Related Questions</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {article.aiPrompts.map((prompt, i) => (
              <button
                key={i}
                className="text-sm text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-full border border-cyan-500/20 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="prose prose-invert max-w-none">
        {renderContent(article.content)}
      </article>

      {/* Article Actions */}
      <div className="mt-12 pt-8 border-t border-cyan-500/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Was this helpful?</span>
            <button className="p-2 hover:bg-green-500/10 rounded-lg transition-colors group">
              <ThumbsUp className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
            </button>
            <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group">
              <ThumbsDown className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors group" title="Share">
              <Share2 className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors group"
              title="Print"
            >
              <Printer className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {prevArticle ? (
          <Link
            to={`/wiki/${prevArticle.slug}`}
            className="group p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-cyan-500/10 hover:border-cyan-500/30 rounded-xl transition-all"
          >
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Previous
            </div>
            <p className="text-white font-medium group-hover:text-cyan-300 transition-colors">
              {prevArticle.title}
            </p>
          </Link>
        ) : (
          <div />
        )}

        {nextArticle && (
          <Link
            to={`/wiki/${nextArticle.slug}`}
            className="group p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-cyan-500/10 hover:border-cyan-500/30 rounded-xl transition-all text-right"
          >
            <div className="flex items-center justify-end gap-2 text-sm text-gray-500 mb-1">
              Next
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-white font-medium group-hover:text-cyan-300 transition-colors">
              {nextArticle.title}
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}

export default WikiPage;
