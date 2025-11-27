"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-background fight-atmosphere relative">
      {/* Cage Pattern Overlay */}
      <div className="cage-pattern absolute inset-0 pointer-events-none opacity-30" />

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="fight-display text-6xl md:text-8xl mb-6 animate-neon-flicker">
            BOYFANZ
          </h1>
          <p className="fight-heading-gold text-3xl md:text-4xl mb-4">
            UNDERGROUND FIGHT RING AESTHETIC
          </p>
          <p className="fight-body-text text-lg max-w-3xl mx-auto">
            Experience the raw, aggressive energy of the underground with blood-red neon,
            industrial steel, and maximum intensity styling.
          </p>
        </div>

        {/* Button Showcase */}
        <section className="mb-16">
          <h2 className="fight-heading-red text-4xl mb-8">BUTTON VARIANTS</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-foreground/70 mb-3 text-sm uppercase tracking-wider">Primary</p>
              <Button variant="primary" size="lg" className="w-full">
                Join Now
              </Button>
            </div>

            <div>
              <p className="text-foreground/70 mb-3 text-sm uppercase tracking-wider">Secondary</p>
              <Button variant="secondary" size="lg" className="w-full">
                Go Premium
              </Button>
            </div>

            <div>
              <p className="text-foreground/70 mb-3 text-sm uppercase tracking-wider">Neon</p>
              <Button variant="neon" size="lg" className="w-full">
                Fight Ring
              </Button>
            </div>

            <div>
              <p className="text-foreground/70 mb-3 text-sm uppercase tracking-wider">Gold</p>
              <Button variant="gold" size="lg" className="w-full">
                VIP Access
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-foreground/70 mb-3 text-sm uppercase tracking-wider">Outline</p>
              <Button variant="outline" size="md" className="w-full">
                Learn More
              </Button>
            </div>

            <div>
              <p className="text-foreground/70 mb-3 text-sm uppercase tracking-wider">Fight</p>
              <Button variant="fight" size="md" className="w-full">
                Enter Ring
              </Button>
            </div>

            <div>
              <p className="text-foreground/70 mb-3 text-sm uppercase tracking-wider">With Glow</p>
              <Button variant="primary" size="md" glow className="w-full">
                Glowing
              </Button>
            </div>

            <div>
              <p className="text-foreground/70 mb-3 text-sm uppercase tracking-wider">With Pulse</p>
              <Button variant="primary" size="md" pulse className="w-full">
                Pulsing
              </Button>
            </div>
          </div>
        </section>

        {/* Card Showcase */}
        <section className="mb-16">
          <h2 className="fight-heading-red text-4xl mb-8">CARD VARIANTS</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader>
                <h3 className="fight-heading-red text-2xl">Default Card</h3>
              </CardHeader>
              <CardContent>
                <p className="fight-body-text">
                  Industrial steel gradient with shadow effects and hover animations.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="glass-red" glow>
              <CardHeader>
                <h3 className="fight-heading-red text-2xl">Glass Red</h3>
              </CardHeader>
              <CardContent>
                <p className="fight-body-text">
                  Blood-red neon borders with frosted glass effect and aggressive glow.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="neon" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="glass-gold">
              <CardHeader>
                <h3 className="fight-heading-gold text-2xl">Glass Gold</h3>
              </CardHeader>
              <CardContent>
                <p className="fight-body-text">
                  Fight gold accents with industrial glass morphism effects.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="gold" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="steel">
              <CardHeader>
                <h3 className="text-foreground text-2xl font-display">Steel Card</h3>
              </CardHeader>
              <CardContent>
                <p className="fight-body-text">
                  Pure industrial steel with metal gradients and shadow depth.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="steel" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="fight" pulse>
              <CardHeader>
                <h3 className="fight-heading-red text-2xl">Fight Card</h3>
              </CardHeader>
              <CardContent>
                <p className="fight-body-text">
                  Underground fight ring styling with pulsing neon animations.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="fight" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="neon">
              <CardHeader>
                <h3 className="fight-heading-red text-2xl">Neon Card</h3>
              </CardHeader>
              <CardContent>
                <p className="fight-body-text">
                  Maximum intensity neon with aggressive red glow and lift animations.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="neon" size="sm">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Typography Showcase */}
        <section className="mb-16">
          <h2 className="fight-heading-red text-4xl mb-8">TYPOGRAPHY STYLES</h2>

          <div className="space-y-8">
            <div className="glass-card p-8">
              <h1 className="fight-display text-6xl mb-4">FIGHT DISPLAY</h1>
              <p className="text-foreground/60 text-sm">
                Massive hero text with maximum neon intensity - 900 weight, 0.15em spacing
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="fight-heading-red text-5xl mb-4">BLOOD RED HEADING</h2>
              <p className="text-foreground/60 text-sm">
                Aggressive red neon with 6-layer text shadow - Bebas Neue, 700 weight
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="fight-heading-gold text-5xl mb-4">FIGHT GOLD HEADING</h2>
              <p className="text-foreground/60 text-sm">
                Premium gold neon with multi-layer glow - Bebas Neue, 700 weight
              </p>
            </div>

            <div className="glass-card p-8">
              <h3 className="fight-subheading text-3xl mb-4">INDUSTRIAL SUBHEADING</h3>
              <p className="text-foreground/60 text-sm">
                Clean white neon with red accent shadows - Bebas Neue, 600 weight
              </p>
            </div>

            <div className="glass-card p-8">
              <p className="fight-body-text text-lg leading-relaxed">
                Body text remains clean and readable with Inter font family. This ensures
                content is accessible while maintaining the aggressive underground aesthetic
                for headings and UI elements. Line height is set to 1.7 for optimal readability.
              </p>
            </div>
          </div>
        </section>

        {/* Effects Showcase */}
        <section className="mb-16">
          <h2 className="fight-heading-red text-4xl mb-8">NEON EFFECTS</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-neon-red p-8 text-center">
              <div className="neon-text text-4xl mb-4 font-display">NEON TEXT</div>
              <p className="text-foreground/70 text-sm">
                Standard neon with aggressive pulse animation
              </p>
            </div>

            <div className="glass-neon-gold p-8 text-center">
              <div className="neon-sign-golden text-4xl mb-4 font-display">GOLD NEON</div>
              <p className="text-foreground/70 text-sm">
                Fight gold variant with warm glow
              </p>
            </div>

            <div className="glass-effect p-8 text-center">
              <div className="underground-glow text-4xl mb-4 font-display text-primary">
                FIGHT GLOW
              </div>
              <p className="text-foreground/70 text-sm">
                Underground aesthetic with red halo
              </p>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="fight-heading-red text-4xl mb-8">COLOR PALETTE</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-6 text-center">
              <div className="w-full h-24 bg-[#ff0000] rounded mb-3 shadow-glow-xl"></div>
              <h4 className="font-display text-sm mb-1">BLOOD RED</h4>
              <p className="text-foreground/60 text-xs">#ff0000</p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-full h-24 bg-[hsl(45,90%,60%)] rounded mb-3 shadow-golden-glow"></div>
              <h4 className="font-display text-sm mb-1">FIGHT GOLD</h4>
              <p className="text-foreground/60 text-xs">hsl(45, 90%, 60%)</p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-full h-24 bg-[#000000] border border-border rounded mb-3"></div>
              <h4 className="font-display text-sm mb-1">SHADOW BLACK</h4>
              <p className="text-foreground/60 text-xs">#000000</p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-full h-24 bg-[hsl(0,0%,25%)] rounded mb-3"></div>
              <h4 className="font-display text-sm mb-1">STEEL GRAY</h4>
              <p className="text-foreground/60 text-xs">hsl(0, 0%, 25%)</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-12 border-t-2 border-primary/20">
          <p className="fight-heading-red text-2xl mb-4">
            UNDERGROUND FIGHT RING AESTHETIC
          </p>
          <p className="fight-body-text">
            Maximum intensity neon • Industrial typography • Raw masculine energy
          </p>
          <div className="mt-8">
            <Button variant="neon" size="xl" glow pulse>
              EXPERIENCE THE RING
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
