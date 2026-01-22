import { Users, Star, Lock, Shield, DollarSign, Eye, Zap, Heart, PawPrint, ChevronRight, Flame } from "lucide-react";
import AIChatBot from "@/components/AIChatBot";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleLogin = () => setLocation("/auth/login");
  const handleFanzSignup = () => setLocation("/fan-signup");
  const handleStarzSignup = () => setLocation("/creator-signup");

  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* ═══════════════════════════════════════════════════════════════
          ZONE 1: ENTRY CHAMBER
          ═══════════════════════════════════════════════════════════════ */}
      <section className="dungeon-section relative min-h-screen flex items-center justify-center">
        {/* Ambient glow layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,246,255,0.15),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(255,26,26,0.08),transparent_50%)]"></div>
        
        {/* Slow scan line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-scan-slow"></div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6">
          <div className="dungeon-panel p-10 md:p-16">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src="/boyfanz-logo.png" 
                alt="BoyFanz" 
                className="h-32 md:h-48 w-auto"
                style={{ filter: 'drop-shadow(0 0 30px rgba(0,246,255,0.4)) drop-shadow(0 0 60px rgba(255,26,26,0.2))' }}
              />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-display text-center tracking-widest mb-4" style={{
              textShadow: '0 0 40px rgba(0,246,255,0.6), 0 0 80px rgba(0,246,255,0.3)'
            }}>
              EVERY MAN'S PLAYGROUND
            </h1>
            
            <p className="text-center text-lg md:text-xl text-cyan-100/60 tracking-wide mb-10 max-w-2xl mx-auto">
              A private creator economy built for power, control, and connection.
            </p>

            {/* Access Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <button onClick={handleLogin} className="access-button">
                <Lock className="w-5 h-5" />
                <span>Enter</span>
              </button>
              
              <button onClick={handleStarzSignup} className="access-button access-button-red">
                <Flame className="w-5 h-5" />
                <span>Become a Star</span>
              </button>
            </div>

            <p className="text-center text-xs text-cyan-600/60 tracking-[0.25em] uppercase">
              Access is restricted. Verification required.
            </p>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <ChevronRight className="w-6 h-6 text-cyan-500/40 rotate-90" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ZONE 2: LOCKER ROOM - Fan vs Star
          ═══════════════════════════════════════════════════════════════ */}
      <section className="dungeon-section relative py-24">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-display text-center mb-4" style={{
            textShadow: '0 0 30px rgba(255,26,26,0.5)'
          }}>
            CHOOSE YOUR SIDE
          </h2>
          <p className="text-center text-cyan-500/50 tracking-[0.3em] text-xs mb-16 uppercase">
            This is not for everyone
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* FAN PANEL */}
            <div onClick={handleFanzSignup} className="dungeon-panel p-8 md:p-10 cursor-pointer group transition-all duration-500 hover:scale-[1.02]">
              <Users className="w-10 h-10 text-cyan-400 mb-6" style={{ filter: 'drop-shadow(0 0 10px rgba(0,246,255,0.5))' }} />
              <h3 className="text-2xl md:text-3xl font-display text-cyan-300 mb-3">WATCH. CONNECT. SUPPORT.</h3>
              <p className="text-cyan-100/50 mb-8">
                Get access to creators who don't play by mainstream rules.
              </p>
              <div className="flex items-center gap-2 text-cyan-400 text-sm tracking-widest uppercase">
                <span>Unlock Fan Access</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* STAR PANEL */}
            <div onClick={handleStarzSignup} className="dungeon-panel dungeon-panel-red p-8 md:p-10 cursor-pointer group transition-all duration-500 hover:scale-[1.02]">
              <Star className="w-10 h-10 text-red-400 mb-6" style={{ filter: 'drop-shadow(0 0 10px rgba(255,26,26,0.5))' }} />
              <h3 className="text-2xl md:text-3xl font-display text-red-300 mb-3">CREATE. CONTROL. DOMINATE.</h3>
              <p className="text-red-100/50 mb-8">
                Own your content. Keep your money. Build your following.
              </p>
              <div className="flex items-center gap-2 text-red-400 text-sm tracking-widest uppercase">
                <span>Claim Star Status</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ZONE 3: PLAY FLOOR - Arsenal
          ═══════════════════════════════════════════════════════════════ */}
      <section className="dungeon-section relative py-24">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/15 to-transparent"></div>
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(0,246,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,246,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }}></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-display text-center mb-4" style={{
            textShadow: '0 0 30px rgba(0,246,255,0.5)'
          }}>
            YOUR ARSENAL
          </h2>
          <p className="text-center text-cyan-500/50 tracking-[0.3em] text-xs mb-16 uppercase">
            Tools. Not features.
          </p>

          {/* Staggered grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large block */}
            <div className="md:col-span-2 dungeon-panel p-8">
              <Shield className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-display text-cyan-200 mb-2">FORTRESS-GRADE SECURITY</h3>
              <p className="text-cyan-100/40">Your content stays yours. Locked. Encrypted. Protected.</p>
            </div>
            
            {/* Small block */}
            <div className="dungeon-panel dungeon-panel-red p-8">
              <DollarSign className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-xl font-display text-red-200 mb-2">FAST MONEY</h3>
              <p className="text-red-100/40">Multiple rails. You decide when.</p>
            </div>

            {/* Small block */}
            <div className="dungeon-panel p-8">
              <Eye className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-display text-cyan-200 mb-2">ANALYTICS</h3>
              <p className="text-cyan-100/40">Know who's watching. Control what they see.</p>
            </div>

            {/* Large block */}
            <div className="md:col-span-2 dungeon-panel dungeon-panel-red p-8">
              <Zap className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-xl font-display text-red-200 mb-2">AI-POWERED INTELLIGENCE</h3>
              <p className="text-red-100/40">24/7 assistance. Real-time updates. Always active.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ZONE 4: INITIATION - Final CTA
          ═══════════════════════════════════════════════════════════════ */}
      <section className="dungeon-section relative py-32">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        
        {/* Red/cyan clash */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_30%_50%,rgba(255,26,26,0.1),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_70%_50%,rgba(0,246,255,0.08),transparent_60%)]"></div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="dungeon-panel p-12 md:p-16">
            <h2 className="text-5xl md:text-7xl font-display mb-6" style={{
              background: 'linear-gradient(135deg, #ff3333 0%, #ffffff 50%, #00f6ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              READY?
            </h2>
            
            <p className="text-xl text-gray-400 mb-10">
              Thousands already have.
            </p>

            <button onClick={handleLogin} className="access-button access-button-red text-lg px-10 py-4">
              <span>Start Creating Now</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ZONE 5: QUIET ROOM - Foundation
          ═══════════════════════════════════════════════════════════════ */}
      <section className="dungeon-section relative py-20">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/15 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="flex justify-center items-center gap-3 mb-4">
              <PawPrint className="w-6 h-6 text-pink-400" />
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500 animate-pulse" />
              <PawPrint className="w-6 h-6 text-pink-400 scale-x-[-1]" />
            </div>
            <h2 className="text-3xl font-display bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent">
              THE WITTLE BEAR FOUNDATION
            </h2>
            <p className="text-pink-200/50 text-sm italic">In loving memory</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="dungeon-panel p-6" style={{ borderColor: 'rgba(236,72,153,0.2)', boxShadow: '0 0 20px rgba(236,72,153,0.1)' }}>
              <Heart className="w-6 h-6 text-pink-400 mb-3" />
              <h3 className="font-display text-pink-300 mb-2">SUPPORTING LGBTQ+ YOUTH</h3>
              <p className="text-sm text-pink-100/50">
                Providing shelter and hope to LGBTQ+ youth facing rejection.
              </p>
            </div>
            <div className="dungeon-panel p-6" style={{ borderColor: 'rgba(251,191,36,0.2)', boxShadow: '0 0 20px rgba(251,191,36,0.1)' }}>
              <PawPrint className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="font-display text-amber-300 mb-2">RESCUING SHELTER ANIMALS</h3>
              <p className="text-sm text-amber-100/50">
                Every creature deserves love. A portion of profits helps animals.
              </p>
            </div>
          </div>

          <p className="text-center text-pink-200/40 text-xs mt-8">
            <Heart className="w-3 h-3 inline text-pink-500 fill-pink-500" /> Because no one should feel alone <Heart className="w-3 h-3 inline text-pink-500 fill-pink-500" />
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <footer className="relative py-10 border-t border-cyan-900/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-xs">
            <div className="space-y-2">
              <a href="/terms" className="block text-gray-500 hover:text-cyan-400">Terms</a>
              <a href="/privacy" className="block text-gray-500 hover:text-cyan-400">Privacy</a>
              <a href="/safety" className="block text-gray-500 hover:text-cyan-400">2257 Compliance</a>
            </div>
            <div className="space-y-2">
              <a href="/safety" className="block text-gray-500 hover:text-cyan-400">Content Policy</a>
              <a href="/contact" className="block text-gray-500 hover:text-cyan-400">Support</a>
              <a href="/blog" className="block text-gray-500 hover:text-cyan-400">Blog</a>
            </div>
            <div className="space-y-2">
              <a href="/contact" className="block text-gray-500 hover:text-cyan-400">Contact</a>
              <a href="/wittle-bear-foundation" className="block text-gray-500 hover:text-cyan-400">Foundation</a>
            </div>
            <div>
              <span className="text-gray-600 text-[10px]">PROTECTED BY</span>
              <span className="block text-green-500 text-xs font-bold">DMCA</span>
            </div>
          </div>
          <div className="text-center text-gray-600 text-[10px]">
            © 2025 BoyFanz. FANZ L.L.C. - Sheridan, WY
          </div>
        </div>
      </footer>
      
      <AIChatBot />
    </div>
  );
}
