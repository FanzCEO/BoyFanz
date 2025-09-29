import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Sparkles, MessageCircle, Gift, Eye, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

export default function FanzSignup() {
  const [, setLocation] = useLocation();
  const { registerMutation, user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    agreeToTerms: false,
    over18: false
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms || !formData.over18) {
      toast({
        title: "Agreement Required",
        description: "You must agree to the terms and confirm you are 18+",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Register as fan role for Fanz
    registerMutation.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: "fan",
      firstName: formData.displayName.split(" ")[0] || formData.displayName,
      lastName: formData.displayName.split(" ").slice(1).join(" ") || "",
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left side - Signup Form */}
        <Card className="w-full max-w-md mx-auto bg-card/50 border-secondary/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-secondary neon-heartbeat" />
            </div>
            <CardTitle className="text-3xl font-bold font-heading neon-crimson-heading neon-buzz">
              Join as a Fanz
            </CardTitle>
            <CardDescription className="text-lg neon-white-body neon-breathe">
              Discover exclusive content and connect with creators
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fanz-username" className="neon-white-body">Username</Label>
                <Input
                  id="fanz-username"
                  type="text"
                  placeholder="@yourusername"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="bg-background/80 border-secondary/30 text-foreground"
                  data-testid="input-fanz-username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fanz-display-name" className="neon-white-body">Display Name</Label>
                <Input
                  id="fanz-display-name"
                  type="text"
                  placeholder="Your name"
                  value={formData.displayName}
                  onChange={(e) => handleChange("displayName", e.target.value)}
                  className="bg-background/80 border-secondary/30 text-foreground"
                  data-testid="input-fanz-display-name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fanz-email" className="neon-white-body">Email</Label>
                <Input
                  id="fanz-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-background/80 border-secondary/30 text-foreground"
                  data-testid="input-fanz-email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fanz-password" className="neon-white-body">Password</Label>
                <Input
                  id="fanz-password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="bg-background/80 border-secondary/30 text-foreground"
                  data-testid="input-fanz-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fanz-confirm-password" className="neon-white-body">Confirm Password</Label>
                <Input
                  id="fanz-confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="bg-background/80 border-secondary/30 text-foreground"
                  data-testid="input-fanz-confirm-password"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fanz-over18"
                    checked={formData.over18}
                    onCheckedChange={(checked) => handleChange("over18", !!checked)}
                    data-testid="checkbox-fanz-over18"
                  />
                  <Label htmlFor="fanz-over18" className="text-sm neon-white-body">
                    I am 18 years or older
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fanz-agree-terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleChange("agreeToTerms", !!checked)}
                    data-testid="checkbox-fanz-agree-terms"
                  />
                  <Label htmlFor="fanz-agree-terms" className="text-sm neon-white-body">
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-secondary hover:bg-secondary/80 text-white font-semibold py-3 glow-effect"
                disabled={registerMutation.isPending}
                data-testid="button-fanz-signup"
              >
                {registerMutation.isPending ? "Creating Account..." : "Join the Playground"}
              </Button>
            </form>

            {/* Social Signup Options */}
            <div className="mt-6">
              <SocialLoginButtons mode="signup" variant="outline" className="w-full" role="fan" />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm neon-white-body">
                Already have an account?{" "}
                <Link href="/auth/login">
                  <a className="text-secondary hover:underline font-semibold" data-testid="link-login">
                    Sign In
                  </a>
                </Link>
              </p>
              <p className="text-sm neon-white-body mt-2">
                Want to become a creator?{" "}
                <Link href="/auth/starz-signup">
                  <a className="text-primary hover:underline font-semibold" data-testid="link-starz-signup">
                    Join as Starz
                  </a>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right side - Hero Section */}
        <div className="flex flex-col justify-center space-y-8 p-8">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold font-heading mb-4 neon-crimson-heading neon-strobe">
              Discover Your Desires
            </h1>
            <p className="text-xl neon-white-body neon-breathe mb-8">
              Access exclusive content from the hottest creators on the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Eye className="h-8 w-8 text-secondary neon-flicker flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold neon-crimson-heading neon-buzz">Exclusive Content</h3>
                <p className="text-sm neon-white-body">Access premium photos, videos, and live streams</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MessageCircle className="h-8 w-8 text-accent neon-dying flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold neon-crimson-heading neon-heartbeat">Direct Messaging</h3>
                <p className="text-sm neon-white-body">Chat privately with your favorite creators</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Gift className="h-8 w-8 text-primary neon-heartbeat flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold neon-crimson-heading neon-flicker">Tips & Gifts</h3>
                <p className="text-sm neon-white-body">Show appreciation with tips and virtual gifts</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Sparkles className="h-8 w-8 text-secondary neon-strobe flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold neon-crimson-heading neon-breathe">Custom Requests</h3>
                <p className="text-sm neon-white-body">Request personalized content from creators</p>
              </div>
            </div>
          </div>

          <div className="bg-card/30 rounded-lg p-6 border border-secondary/20">
            <div className="flex items-center space-x-3 mb-3">
              <Star className="h-6 w-6 text-accent neon-heartbeat" />
              <h3 className="font-semibold neon-crimson-heading neon-dying">Fanz Benefits</h3>
            </div>
            <ul className="space-y-2 text-sm neon-white-body">
              <li>• Access to thousands of exclusive creators</li>
              <li>• Subscribe to unlimited creators</li>
              <li>• Pay-per-view premium content</li>
              <li>• Live streaming and real-time interaction</li>
              <li>• Private messaging and custom requests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}