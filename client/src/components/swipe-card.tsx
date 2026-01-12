import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, X, ShieldCheck, MapPin, Users, TrendingUp, DollarSign, Handshake } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import OfferComposer from "./offer-composer";
import type { Profile, SwipeDirection } from "@shared/schema";

export default function SwipeCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [openOffer, setOpenOffer] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Fetch discoverable profiles
  const { data: profiles = [], isLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles/discover"],
    enabled: !!user,
  });

  // Fetch daily stats
  const { data: stats } = useQuery({
    queryKey: ["/api/stats/daily"],
    enabled: !!user,
  });

  const current = profiles[index % profiles.length];

  // Swipe mutation
  const swipeMutation = useMutation({
    mutationFn: async ({ toProfileId, direction }: { toProfileId: string; direction: SwipeDirection }) => {
      const response = await apiRequest("POST", "/api/swipes", {
        toProfileId,
        direction,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
    },
  });

  // Framer Motion drag setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacityRight = useTransform(x, [50, 150], [0, 1]);
  const opacityLeft = useTransform(x, [-150, -50], [1, 0]);
  const opacityUp = useTransform(y, [-160, -60], [1, 0]);

  const onSwipe = async (direction: SwipeDirection) => {
    if (!current) return;

    try {
      await swipeMutation.mutateAsync({
        toProfileId: current.id,
        direction,
      });

      if (direction === "left") {
        toast({ title: `Passed on ${current.name}` });
      } else if (direction === "right") {
        toast({ title: `Liked ${current.name}` });
      } else if (direction === "star") {
        setSelectedProfile(current);
        setOpenOffer(true);
        return; // Don't advance to next card yet
      }

      setIndex((i) => i + 1);
      x.set(0);
      y.set(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record swipe. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="relative h-[72vh] md:h-[78vh]">
          <Card className="absolute inset-0 bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden rounded-2xl">
            <CardContent className="p-0 h-full flex items-center justify-center">
              <div className="text-white/60">Loading profiles...</div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-5">
          <div className="h-32 bg-white/5 border-white/10 rounded-lg animate-pulse" />
          <div className="h-48 bg-white/5 border-white/10 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <div className="text-white/60 mb-4">No more profiles to discover!</div>
        <Button
          onClick={() => {
            setIndex(0);
            queryClient.invalidateQueries({ queryKey: ["/api/profiles/discover"] });
          }}
          className="bg-yellow-300 text-black hover:bg-yellow-200"
          data-testid="button-refresh"
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-[1.2fr_0.8fr] gap-8">
        {/* Swipe stack */}
        <div className="relative h-[72vh] md:h-[78vh]" data-testid="swipe-container">
          {/* Background cards for stacking effect */}
          <div className="absolute inset-0 bg-white/5 border-white/10 rounded-2xl -z-10 scale-95 opacity-60"></div>
          <div className="absolute inset-0 bg-white/5 border-white/10 rounded-2xl -z-20 scale-90 opacity-40"></div>

          {/* Current Profile Card */}
          <Card className="absolute inset-0 bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden rounded-2xl">
            <CardContent className="p-0 h-full">
              <div className="relative h-full">
                <img
                  src={current.heroImageUrl || "https://images.unsplash.com/photo-1520974722031-3e6cef1ca02a?q=80&w=1800&auto=format&fit=crop"}
                  alt={current.name}
                  className="object-cover w-full h-full opacity-70"
                  data-testid={`img-profile-${current.id}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold drop-shadow" data-testid={`text-name-${current.id}`}>
                      {current.name}
                    </h2>
                    {current.verified && (
                      <ShieldCheck className="h-5 w-5 text-cyan-300" data-testid={`icon-verified-${current.id}`} />
                    )}
                    {current.isTop && (
                      <Badge className="bg-yellow-300 text-black" data-testid={`badge-top-${current.id}`}>
                        Top Creator
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 text-white/80 text-sm" data-testid={`text-details-${current.id}`}>
                    {current.pronouns && `${current.pronouns} • `}{current.city}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {current.tags?.map((tag, i) => (
                      <Badge
                        key={i}
                        className="bg-pink-500/20 text-pink-100 border-pink-500/40"
                        data-testid={`tag-${tag}-${current.id}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Draggable overlay for gesture feedback */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            style={{ x, y, rotate }}
            onDragEnd={(_, info) => {
              const { offset } = info;
              if (offset.y < -160) return onSwipe("star");
              if (offset.x > 160) return onSwipe("right");
              if (offset.x < -160) return onSwipe("left");
            }}
            data-testid="swipe-overlay"
          >
            {/* Swipe feedback labels */}
            <div className="absolute top-6 left-6">
              <motion.div
                style={{ opacity: opacityRight }}
                className="px-3 py-1 rounded-md border border-green-400/70 text-green-300 font-bold tracking-widest"
                data-testid="label-like"
              >
                LIKE
              </motion.div>
            </div>
            <div className="absolute top-6 right-6">
              <motion.div
                style={{ opacity: opacityLeft }}
                className="px-3 py-1 rounded-md border border-red-400/70 text-red-300 font-bold tracking-widest"
                data-testid="label-pass"
              >
                PASS
              </motion.div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-20">
              <motion.div
                style={{ opacity: opacityUp }}
                className="px-4 py-2 rounded-md border border-yellow-300/80 text-yellow-200 font-black tracking-widest"
                data-testid="label-star"
              >
                ★ STAR
              </motion.div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <Button
              variant="secondary"
              className="bg-white/10 border-white/20 hover:bg-white/15"
              onClick={() => onSwipe("left")}
              disabled={swipeMutation.isPending}
              data-testid="button-pass"
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              className="bg-green-500/20 border border-green-400/30 hover:bg-green-500/30"
              onClick={() => onSwipe("right")}
              disabled={swipeMutation.isPending}
              data-testid="button-like"
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button
              className="bg-yellow-300 text-black hover:bg-yellow-200 shadow-[0_0_35px_6px_rgba(255,228,77,0.45)]"
              onClick={() => onSwipe("star")}
              disabled={swipeMutation.isPending}
              data-testid="button-star"
            >
              <Star className="h-5 w-5 mr-1" /> Star & Respond
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Daily Stats */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Today's Activity
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300" data-testid="stat-likes">
                    {stats?.likes || 0}
                  </div>
                  <div className="text-xs text-white/60">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400" data-testid="stat-stars">
                    {stats?.stars || 0}
                  </div>
                  <div className="text-xs text-white/60">Stars</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400" data-testid="stat-earned">
                    ${stats?.earned || 0}
                  </div>
                  <div className="text-xs text-white/60">Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400" data-testid="stat-collabs">
                    {stats?.collabs || 0}
                  </div>
                  <div className="text-xs text-white/60">Collabs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mode Info */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Users className="h-4 w-4"/> Discovery Mode
              </h3>
              <p className="text-sm text-white/70">
                You're discovering creators. Likes and Stars will notify them instantly.
                Star responses include offers and drive engagement.
              </p>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin className="h-4 w-4"/> Privacy grid active. Exact location is never shared.
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Offer Composer Modal */}
      {selectedProfile && (
        <OfferComposer
          isOpen={openOffer}
          onClose={() => {
            setOpenOffer(false);
            setSelectedProfile(null);
          }}
          profile={selectedProfile}
          onSuccess={() => {
            setOpenOffer(false);
            setSelectedProfile(null);
            setIndex((i) => i + 1);
            x.set(0);
            y.set(0);
            queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
          }}
        />
      )}
    </>
  );
}
