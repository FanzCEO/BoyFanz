# BoyFanz Fight Ring Components Guide

## 🎯 Overview

This guide covers all the enhanced UI components with the underground fight ring aesthetic. All components feature aggressive neon styling, industrial typography, and raw masculine energy.

---

## 🔘 Button Component

### Import
```tsx
import { Button } from '@/components/ui/Button';
```

### Props
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'neon' | 'gold' | 'fight' | 'steel';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
  // ... extends React.ButtonHTMLAttributes
}
```

### Variants

#### Primary (Default)
Blood-red neon with aggressive glow and lift animation.
```tsx
<Button variant="primary" size="lg">
  Join Now
</Button>
```

#### Secondary
Fight gold with warm glow and premium feel.
```tsx
<Button variant="secondary" size="lg">
  Go Premium
</Button>
```

#### Neon
Pure neon button using custom `.neon-button` class from CSS.
```tsx
<Button variant="neon" size="lg">
  Fight Ring
</Button>
```

#### Gold
Fight gold button using custom `.gold-button` class.
```tsx
<Button variant="gold" size="lg">
  VIP Access
</Button>
```

#### Fight
Industrial glass button with maximum hover effects.
```tsx
<Button variant="fight" size="lg">
  Enter Ring
</Button>
```

#### Steel
Industrial metal gradient with steel-gray borders.
```tsx
<Button variant="steel" size="lg">
  Settings
</Button>
```

#### Outline
Transparent with red border, fills on hover.
```tsx
<Button variant="outline" size="md">
  Learn More
</Button>
```

#### Ghost
Minimal transparent button with subtle hover.
```tsx
<Button variant="ghost" size="sm">
  Cancel
</Button>
```

### Sizes
- `sm`: Small (px-4 py-2 text-xs)
- `md`: Medium (px-6 py-3 text-sm) - Default
- `lg`: Large (px-8 py-4 text-base)
- `xl`: Extra Large (px-10 py-5 text-lg)

### Special Props

#### Glow
Adds aggressive glow animation that pulses continuously.
```tsx
<Button variant="primary" glow>
  Glowing Button
</Button>
```

#### Pulse
Adds fight-pulse animation to text shadow.
```tsx
<Button variant="primary" pulse>
  Pulsing Button
</Button>
```

#### Combined
```tsx
<Button variant="neon" size="xl" glow pulse>
  Maximum Effect
</Button>
```

### Styling Features
- **Font**: Bebas Neue (display font)
- **Weight**: 700 (bold)
- **Transform**: UPPERCASE
- **Letter Spacing**: 0.1em (tracking-wider)
- **Border**: 2px solid
- **Hover**: Scale(1.05) + TranslateY(-1px to -2px)
- **Focus**: Red ring with offset
- **Text Shadow**: Multi-layer neon glow

---

## 🃏 Card Component

### Import
```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
```

### Props
```typescript
interface CardProps {
  variant?: 'default' | 'neon' | 'surface' | 'glass' | 'glass-red' | 'glass-gold' | 'fight' | 'steel';
  glow?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
  // ... extends React.HTMLAttributes<HTMLDivElement>
}
```

### Variants

#### Default
Industrial steel gradient with shadow effects.
```tsx
<Card variant="default">
  <CardHeader>
    <h3 className="fight-heading-red text-2xl">Title</h3>
  </CardHeader>
  <CardContent>
    <p className="fight-body-text">Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

#### Glass
Industrial glass card with backdrop blur.
```tsx
<Card variant="glass">
  {/* content */}
</Card>
```

#### Glass-Red
Blood-red neon borders with glass effect.
```tsx
<Card variant="glass-red" glow>
  {/* content */}
</Card>
```

#### Glass-Gold
Fight gold borders with frosted glass.
```tsx
<Card variant="glass-gold">
  {/* content */}
</Card>
```

#### Neon
Intense red neon with aggressive glow.
```tsx
<Card variant="neon">
  {/* content */}
</Card>
```

#### Fight
Underground fight ring styling using `.card` class.
```tsx
<Card variant="fight" pulse>
  {/* content */}
</Card>
```

#### Steel
Pure industrial steel with metal textures.
```tsx
<Card variant="steel">
  {/* content */}
</Card>
```

#### Surface
Lighter background with subtle borders.
```tsx
<Card variant="surface">
  {/* content */}
</Card>
```

### Sub-components

#### CardHeader
Top section of the card, typically for titles.
```tsx
<CardHeader>
  <h3 className="fight-heading-red text-2xl">Card Title</h3>
  <p className="text-foreground/60 text-sm">Subtitle</p>
</CardHeader>
```

#### CardContent
Main content area with padding.
```tsx
<CardContent>
  <p className="fight-body-text">
    Your content here...
  </p>
</CardContent>
```

#### CardFooter
Bottom section with flex layout for actions.
```tsx
<CardFooter>
  <Button variant="ghost">Cancel</Button>
  <Button variant="primary">Confirm</Button>
</CardFooter>
```

### Styling Features
- **Border Radius**: 0.125rem (sharp, industrial)
- **Transitions**: 300ms all properties
- **Hover**: TranslateY(-2px) + Scale(1.02)
- **Backdrop Blur**: 12-20px (on glass variants)
- **Shadows**: Multi-layer steel and neon effects

---

## 🎨 Typography Classes

### Display Text (Massive Headlines)

#### Fight Display
```tsx
<h1 className="fight-display text-6xl">
  MASSIVE HEADLINE
</h1>
```
- Font: Bebas Neue, Teko
- Weight: 900
- Spacing: 0.15em
- Effect: Maximum neon intensity with 6+ shadow layers
- Animation: Optional neon-flicker

#### Neon Display
```tsx
<h1 className="neon-display text-6xl">
  NEON HERO TEXT
</h1>
```
- Same as fight-display with automatic flicker animation

### Headings

#### Fight Heading Red
```tsx
<h2 className="fight-heading-red text-4xl">
  BLOOD RED HEADING
</h2>
```
- Color: Blood red (#ff0000)
- Effect: Aggressive 6-layer text shadow
- Weight: 700

#### Fight Heading Gold
```tsx
<h2 className="fight-heading-gold text-4xl">
  FIGHT GOLD HEADING
</h2>
```
- Color: Fight gold (hsl(45, 90%, 60%))
- Effect: Warm golden glow
- Weight: 700

#### Fight Subheading
```tsx
<h3 className="fight-subheading text-2xl">
  INDUSTRIAL SUBHEADING
</h3>
```
- Color: White with red accent shadows
- Weight: 600
- Spacing: 0.15em

### Body Text

#### Fight Body Text
```tsx
<p className="fight-body-text">
  Clean, readable body text with Inter font.
</p>
```
- Font: Inter
- Weight: 400
- Line Height: 1.7
- Color: Light gray (#f5f5f5 → 90%)

### Neon Effects

#### Neon Text
```tsx
<span className="neon-text">Red Neon</span>
```
- Blood-red with pulsing animation

#### Neon Sign Golden
```tsx
<span className="neon-sign-golden">Gold Neon</span>
```
- Fight gold with warm glow

#### Underground Glow
```tsx
<span className="underground-glow text-primary">
  Fight Glow
</span>
```
- Adds aggressive red halo effect

---

## 🎭 Layout & Effects

### Background Patterns

#### Fight Atmosphere
```tsx
<div className="fight-atmosphere min-h-screen">
  {/* Blood-red radial gradient background */}
</div>
```

#### Cage Pattern
```tsx
<div className="cage-pattern">
  {/* Adds chain-link fence overlay */}
</div>
```

### Glass Effects

#### Glass Effect
```tsx
<div className="glass-effect p-8">
  {/* Base frosted glass */}
</div>
```

#### Glass Card
```tsx
<div className="glass-card p-8">
  {/* Industrial glass with red tint */}
</div>
```

#### Glass Neon Red
```tsx
<div className="glass-neon-red p-8">
  {/* Blood-red borders + glass */}
</div>
```

#### Glass Neon Gold
```tsx
<div className="glass-neon-gold p-8">
  {/* Fight gold borders + glass */}
</div>
```

### Border Effects

#### Neon Border
```tsx
<div className="neon-border p-4">
  {/* Aggressive red border with glow */}
</div>
```

---

## 🎬 Animations

### CSS Animations

#### Aggressive Pulse
```tsx
<div className="animate-fight-pulse">
  Pulsing Element
</div>
```
Duration: 3s

#### Neon Flicker
```tsx
<div className="animate-neon-flicker">
  Flickering Neon
</div>
```
Duration: 8s

#### Glow Animation
```tsx
<div className="animate-glow">
  Glowing Element
</div>
```
Duration: 2s

### Pulse Red
```tsx
<div className="pulse-red">
  Red Pulsing Box Shadow
</div>
```

---

## 🎨 Utility Classes

### Text Shadows

```tsx
<h1 className="text-shadow-neon">Neon Text</h1>
<h1 className="text-shadow-neon-strong">Strong Neon</h1>
<h1 className="text-shadow-golden">Gold Text</h1>
<h1 className="text-shadow-fight">Fight Ring Text</h1>
```

### Backgrounds

```tsx
<div className="bg-gradient-neon">Red to Gold</div>
<div className="bg-gradient-fight">Dark Red Gradient</div>
```

### Borders

```tsx
<div className="border-blood-glow">Red Border + Glow</div>
<div className="border-golden-glow">Gold Border + Glow</div>
```

### Box Shadows

```tsx
<div className="shadow-glow">Standard Glow</div>
<div className="shadow-glow-lg">Large Glow</div>
<div className="shadow-glow-xl">XL Glow</div>
<div className="shadow-fight-ring">Fight Ring Shadow</div>
<div className="shadow-steel">Industrial Steel</div>
```

---

## 📐 Example Layouts

### Hero Section
```tsx
<section className="fight-atmosphere min-h-screen relative">
  <div className="cage-pattern absolute inset-0 opacity-30" />

  <div className="relative z-10 container mx-auto px-6 py-20">
    <h1 className="fight-display text-8xl mb-6 text-center animate-neon-flicker">
      BOYFANZ
    </h1>
    <p className="fight-heading-gold text-4xl text-center mb-8">
      EVERY MAN'S PLAYGROUND
    </p>
    <div className="flex justify-center gap-4">
      <Button variant="neon" size="xl" glow>
        Enter Ring
      </Button>
      <Button variant="gold" size="xl">
        Go Premium
      </Button>
    </div>
  </div>
</section>
```

### Content Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card variant="glass-red" glow>
    <CardHeader>
      <h3 className="fight-heading-red text-2xl">Feature 1</h3>
    </CardHeader>
    <CardContent>
      <p className="fight-body-text">Description here...</p>
    </CardContent>
    <CardFooter>
      <Button variant="neon" size="sm">Learn More</Button>
    </CardFooter>
  </Card>

  {/* Repeat for more cards */}
</div>
```

### Profile Card
```tsx
<Card variant="steel" className="max-w-md">
  <CardHeader>
    <div className="flex items-center gap-4">
      <img
        src="/avatar.jpg"
        alt="User"
        className="w-16 h-16 rounded border-2 border-primary shadow-glow"
      />
      <div>
        <h3 className="fight-heading-red text-xl">Username</h3>
        <p className="text-foreground/60 text-sm">@handle</p>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <p className="fight-body-text">
      User bio and description...
    </p>
  </CardContent>
  <CardFooter>
    <Button variant="ghost" size="sm">Message</Button>
    <Button variant="primary" size="sm">Follow</Button>
  </CardFooter>
</Card>
```

---

## 🎯 Best Practices

### Do's ✅
- Use `fight-heading-red` or `fight-heading-gold` for all major headings
- Apply `fight-body-text` to all paragraph content
- Use `font-display` class for uppercase text elements
- Combine `glow` and `pulse` props for maximum impact
- Layer glass effects for depth
- Use steel variants for settings/admin sections

### Don'ts ❌
- Don't mix too many neon colors in one area
- Avoid using regular colors - stick to blood-red, fight-gold, or steel
- Don't overuse pulse animations (save for CTAs)
- Avoid light backgrounds - stay dark and industrial
- Don't use rounded corners - keep edges sharp (rounded-sm or rounded)

### Performance Tips
- Limit animated elements per viewport
- Use `will-change` sparingly on frequently animated elements
- Prefer CSS animations over JavaScript
- Use backdrop-filter judiciously (expensive)

---

## 🚀 Quick Start Example

```tsx
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export default function MyPage() {
  return (
    <div className="min-h-screen fight-atmosphere">
      <div className="container mx-auto px-6 py-12">
        <h1 className="fight-display text-6xl mb-8 text-center">
          MY PAGE
        </h1>

        <Card variant="glass-red" glow>
          <CardHeader>
            <h2 className="fight-heading-red text-3xl">
              Welcome to the Ring
            </h2>
          </CardHeader>
          <CardContent>
            <p className="fight-body-text mb-6">
              Experience the underground with aggressive styling.
            </p>
            <Button variant="neon" size="lg" pulse>
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 📚 Resources

- **Showcase Page**: Visit `/showcase` to see all components in action
- **Tailwind Config**: `/tailwind.config.ts` for custom utilities
- **Global Styles**: `/client/src/index.css` for fight ring CSS
- **Complete Guide**: `UNDERGROUND_AESTHETIC_COMPLETE.md`

---

**Created**: 2025-11-12
**Version**: 1.0.0
**Theme**: Underground Fight Ring - Maximum Neon Intensity
