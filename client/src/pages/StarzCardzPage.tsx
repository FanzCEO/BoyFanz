import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Handshake, Network, Sparkles } from "lucide-react";

export default function StarzCardzPage() {
  const [mode, setMode] = useState<"discover" | "collab" | "network">("discover");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0b0f] via-black to-[#0f0a15] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur border-b border-white/5 bg-black/60">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_30px_5px_rgba(251,191,36,0.4)] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide">StarzCardz</h1>
            <p className="text-xs text-white/50">Creator Discovery Network</p>
          </div>
          <Badge className="ml-2 bg-amber-500/20 text-amber-200 border-amber-500/40">Live</Badge>
          
          <div className="ml-auto flex items-center gap-4">
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="discover" className="gap-1.5">
                  <Users className="h-4 w-4" />
                  Discover
                </TabsTrigger>
                <TabsTrigger value="collab" className="gap-1.5">
                  <Handshake className="h-4 w-4" />
                  Collab
                </TabsTrigger>
                <TabsTrigger value="network" className="gap-1.5">
                  <Network className="h-4 w-4" />
                  Network
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">StarzCardz Mode: {mode}</h2>
        <p className="text-white/60">Creator discovery platform coming soon...</p>
      </div>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 py-6 text-xs text-white/40 border-t border-white/5">
        <span>StarzCardz · FANZ Ecosystem</span>
      </footer>
    </div>
  );
}
