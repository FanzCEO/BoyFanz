import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  FileSignature,
  Users,
  Crown,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function NetworkMode() {
  const { user } = useAuth();
  const [consentReceipts, setConsentReceipts] = useState(true);
  const [antiGhosting, setAntiGhosting] = useState(false);
  const [timeboxedDMs, setTimeboxedDMs] = useState(true);

  // Fetch user's trust metrics (mock for now)
  const trustScore = 98;
  const trustTier = "Gold Verified";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Professional Network</h2>
        <p className="text-white/70">Build industry connections and grow your professional presence</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trust Metrics */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              Trust Score
            </h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-green-400" data-testid="text-trust-score">
                {trustScore}
              </div>
              <div className="text-sm text-white/70">Excellent</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Verified Identity</span>
                <ShieldCheck className="h-4 w-4 text-green-400" data-testid="icon-verified-identity" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Payment History</span>
                <ShieldCheck className="h-4 w-4 text-green-400" data-testid="icon-payment-verified" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Consent Records</span>
                <ShieldCheck className="h-4 w-4 text-green-400" data-testid="icon-consent-verified" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Community Reviews</span>
                <span className="text-yellow-400" data-testid="text-community-rating">4.9★</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-xs text-white/70 mb-2">Trust Tier</div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-400/20 text-yellow-300 border-yellow-400/40" data-testid="badge-trust-tier">
                  {trustTier}
                </Badge>
                <Crown className="h-4 w-4 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Networking Tools */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              Network Tools
            </h3>
            <div className="space-y-3">
              <Button className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 justify-start" data-testid="button-mutuals-heatmap">
                <MapPin className="h-4 w-4 text-purple-400" />
                <div>
                  <div className="font-medium">Mutuals Heatmap</div>
                  <div className="text-xs text-white/60">See connections nearby</div>
                </div>
              </Button>
              <Button className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 justify-start" data-testid="button-availability-sync">
                <Calendar className="h-4 w-4 text-green-400" />
                <div>
                  <div className="font-medium">Availability Sync</div>
                  <div className="text-xs text-white/60">Share open dates</div>
                </div>
              </Button>
              <Button className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 justify-start" data-testid="button-quick-legal">
                <FileSignature className="h-4 w-4 text-yellow-400" />
                <div>
                  <div className="font-medium">Quick NDA/Release</div>
                  <div className="text-xs text-white/60">One-click legal docs</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Controls */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              Privacy Controls
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Consent Receipts 2.0</span>
                <Button
                  variant="ghost"
                  onClick={() => setConsentReceipts(!consentReceipts)}
                  className="p-0 h-auto hover:bg-transparent"
                  data-testid="toggle-consent-receipts"
                >
                  {consentReceipts ? (
                    <ToggleRight className="h-5 w-5 text-yellow-300" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-white/40" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Anti-Ghosting Boost</span>
                <Button
                  variant="ghost"
                  onClick={() => setAntiGhosting(!antiGhosting)}
                  className="p-0 h-auto hover:bg-transparent"
                  data-testid="toggle-anti-ghosting"
                >
                  {antiGhosting ? (
                    <ToggleRight className="h-5 w-5 text-yellow-300" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-white/40" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Time-boxed DMs</span>
                <Button
                  variant="ghost"
                  onClick={() => setTimeboxedDMs(!timeboxedDMs)}
                  className="p-0 h-auto hover:bg-transparent"
                  data-testid="toggle-timebox-dms"
                >
                  {timeboxedDMs ? (
                    <ToggleRight className="h-5 w-5 text-yellow-300" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-white/40" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Stats */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-center">Your Network Impact</h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-pink-400" data-testid="stat-connections">127</div>
                <div className="text-xs text-white/70">Connections</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400" data-testid="stat-mutuals">23</div>
                <div className="text-xs text-white/70">Mutuals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400" data-testid="stat-verified-connections">89</div>
                <div className="text-xs text-white/70">Verified</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400" data-testid="stat-active-collabs">5</div>
                <div className="text-xs text-white/70">Active Collabs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
