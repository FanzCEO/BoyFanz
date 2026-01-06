import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Flame, Star, TrendingUp, Eye, Heart, ChevronUp, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";

interface BoostedPost {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  isExplicit: boolean;
  likes: number;
  views: number;
  referralCount: number;
}

interface BoostedPostsCarouselProps {
  className?: string;
}

export function BoostedPostsCarousel({ className }: BoostedPostsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setLocation] = useLocation();

  // Fetch boosted posts from creators with 3+ referrals
  const { data: posts, isLoading } = useQuery<BoostedPost[]>({
    queryKey: ['/api/posts/boosted'],
    queryFn: () => apiRequest<BoostedPost[]>('GET', '/api/posts/boosted'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  // Auto-rotate posts every 5 seconds
  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [posts]);

  const handleNext = () => {
    if (posts) {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }
  };

  const handlePrev = () => {
    if (posts) {
      setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
    }
  };

  const handlePostClick = (post: BoostedPost) => {
    setLocation(`/post/${post.id}`);
  };

  if (isLoading || !posts || posts.length === 0) {
    return null;
  }

  const currentPost = posts[currentIndex];

  return (
    <div className={cn("relative", className)}>
      {/* Header */}
      <div className="mb-2 px-1">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Flame className="w-3 h-3 text-red-500 animate-pulse" />
          <Star className="w-3 h-3 text-yellow-500" />
        </div>
        <p className="text-[9px] text-center text-muted-foreground uppercase tracking-wider font-bold">
          Boosted
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-black/40 border border-red-500/30 shadow-lg shadow-red-500/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPost.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 cursor-pointer group"
            onClick={() => handlePostClick(currentPost)}
          >
            {/* Media */}
            <div className="relative w-full h-full">
              {currentPost.mediaType === 'image' ? (
                <img
                  src={currentPost.mediaUrl}
                  alt="Boosted content"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <video
                  src={currentPost.mediaUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

              {/* Explicit Badge */}
              {currentPost.isExplicit && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-600/90 rounded text-[8px] font-bold text-white uppercase">
                  18+
                </div>
              )}

              {/* Referral Badge */}
              <div className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded text-[8px] font-bold text-black uppercase">
                <Star className="w-2 h-2 fill-black" />
                <span>{currentPost.referralCount}</span>
              </div>

              {/* Stats Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <div className="flex items-center gap-1 mb-1">
                  <img
                    src={currentPost.creatorAvatar || '/default-avatar.png'}
                    alt={currentPost.creatorUsername}
                    className="w-5 h-5 rounded-full border border-white/30"
                  />
                  <span className="text-[10px] font-semibold text-white truncate flex-1">
                    @{currentPost.creatorUsername}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[9px] text-white/80">
                  <div className="flex items-center gap-1">
                    <Eye className="w-2.5 h-2.5" />
                    <span>{currentPost.views >= 1000 ? `${(currentPost.views / 1000).toFixed(1)}k` : currentPost.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-red-500 text-red-500" />
                    <span>{currentPost.likes >= 1000 ? `${(currentPost.likes / 1000).toFixed(1)}k` : currentPost.likes}</span>
                  </div>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {posts.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute top-1 left-1/2 -translate-x-1/2 z-10 p-1 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
              aria-label="Previous post"
            >
              <ChevronUp className="w-3 h-3 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10 p-1 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
              aria-label="Next post"
            >
              <ChevronDown className="w-3 h-3 text-white" />
            </button>
          </>
        )}

        {/* Progress Indicators */}
        {posts.length > 1 && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {posts.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-1 h-1 rounded-full transition-all duration-300",
                  idx === currentIndex
                    ? "bg-white w-3"
                    : "bg-white/40 hover:bg-white/60"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Referral Program CTA */}
      <div
        className="mt-2 p-2 rounded-lg bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 cursor-pointer hover:border-red-500/50 transition-colors"
        onClick={() => setLocation('/referrals')}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-red-400" />
            <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider">
              Get Boosted
            </p>
          </div>
          <p className="text-[8px] text-center text-muted-foreground">
            Refer 3 creators
          </p>
        </div>
      </div>
    </div>
  );
}
