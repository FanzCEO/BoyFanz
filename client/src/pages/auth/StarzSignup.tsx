import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Star, Zap, Camera, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

export default function StarzSignup() {
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

    // Register as creator role for Starz
    registerMutation.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: "creator",
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
        <Card className="w-full max-w-md mx-auto bg-card/50 border-primary/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-primary neon-heartbeat" />
            </div>
            <CardTitle className="text-3xl font-bold font-heading neon-crimson-heading neon-flicker">
              Join as a Starz
            </CardTitle>
            <CardDescription className="text-lg neon-white-body neon-breathe">
              Become a creator and build your empire
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="starz-username" className="neon-white-body">Creator Username</Label>
                <Input
                  id="starz-username"
                  type="text"
                  placeholder="@yourcreatorname"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="bg-background/80 border-primary/30 text-foreground"
                  data-testid="input-starz-username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="starz-display-name" className="neon-white-body">Display Name</Label>
                <Input
                  id="starz-display-name"
                  type="text"
                  placeholder="Your stage name"
                  value={formData.displayName}
                  onChange={(e) => handleChange("displayName", e.target.value)}
                  className="bg-background/80 border-primary/30 text-foreground"
                  data-testid="input-starz-display-name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="starz-email" className="neon-white-body">Email</Label>
                <Input
                  id="starz-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-background/80 border-primary/30 text-foreground"
                  data-testid="input-starz-email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="starz-password" className="neon-white-body">Password</Label>
                <Input
                  id="starz-password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="bg-background/80 border-primary/30 text-foreground"
                  data-testid="input-starz-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="starz-confirm-password" className="neon-white-body">Confirm Password</Label>
                <Input
                  id="starz-confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="bg-background/80 border-primary/30 text-foreground"
                  data-testid="input-starz-confirm-password"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="over18"
                    checked={formData.over18}
                    onCheckedChange={(checked) => handleChange("over18", !!checked)}
                    data-testid="checkbox-over18"
                  />
                  <Label htmlFor="over18" className="text-sm neon-white-body">
                    I am 18 years or older
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agree-terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleChange("agreeToTerms", !!checked)}
                    data-testid="checkbox-agree-terms"
                  />
                  <Label htmlFor="agree-terms" className="text-sm neon-white-body">
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 glow-effect"
                disabled={registerMutation.isPending}
                data-testid="button-starz-signup"
              >
                {registerMutation.isPending ? "Creating Account..." : "Start Your Star Journey"}
              </Button>
            </form>

            {/* Social Signup Options */}
            <div className="mt-6">
              <SocialLoginButtons mode="signup" variant="outline" className="w-full" role="creator" />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm neon-white-body">
                Already have an account?{" "}
                <Link href="/auth/login">
                  <a className="text-primary hover:underline font-semibold" data-testid="link-login">
                    Sign In
                  </a>
                </Link>
              </p>
              <p className="text-sm neon-white-body mt-2">
                Want to join as a fan?{" "}
                <Link href="/auth/fanz-signup">
                  <a className="text-secondary hover:underline font-semibold" data-testid="link-fanz-signup">
                    Join as Fanz
                  </a>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right side - Hero Section */}
        <div className="flex flex-col justify-center space-y-8 p-8">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold font-heading mb-4 neon-crimson-heading neon-dying">
              Unleash Your Inner Star
            </h1>
            <p className="text-xl neon-white-body neon-breathe mb-8">
              Join the most exclusive creator platform where your content becomes your empire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Camera className="h-8 w-8 text-primary neon-buzz flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold neon-crimson-heading neon-flicker">Premium Content</h3>
                <p className="text-sm neon-white-body">Upload photos, videos, and exclusive content</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <DollarSign className="h-8 w-8 text-accent neon-heartbeat flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold neon-crimson-heading neon-buzz">Instant Payouts</h3>
                <p className="text-sm neon-white-body">Get paid immediately for your content</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="h-8 w-8 text-secondary neon-dying flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold neon-crimson-heading neon-strobe">Fan Management</h3>
                <p className="text-sm neon-white-body">Build lasting relationships with your audience</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Zap className="h-8 w-8 text-primary neon-strobe flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold neon-crimson-heading neon-heartbeat">Real-time Updates</h3>
                <p className="text-sm neon-white-body">Live notifications and instant engagement</p>
              </div>
            </div>
          </div>

          <div className="bg-card/30 rounded-lg p-6 border border-primary/20">
            <div className="flex items-center space-x-3 mb-3">
              <Star className="h-6 w-6 text-accent neon-heartbeat" />
              <h3 className="font-semibold neon-crimson-heading neon-breathe">Starz Benefits</h3>
            </div>
            <ul className="space-y-2 text-sm neon-white-body">
              <li>• 100% of your earnings - no platform fees</li>
              <li>• Advanced analytics and insights</li>
              <li>• Direct messaging with your fans</li>
              <li>• Subscription and pay-per-view options</li>
              <li>• Tip and gift monetization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}