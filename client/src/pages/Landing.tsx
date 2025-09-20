import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Male, DollarSign, Heart, Users } from "lucide-react";

export default function Landing() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    window.location.href = `/auth/login?email=${encodeURIComponent(email)}`;
  };

  const handleSignup = () => {
    window.location.href = "/auth/starz-signup";
  };

  return (
    <div className="min-h-screen homepage-bg" data-testid="landing-page">
      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding & Selling Points */}
          <div className="text-left space-y-8">
            {/* Logo and Branding */}
            <div className="mb-12">
              <div className="flex items-center mb-4">
                <img 
                  src="/boyfanz-logo.png" 
                  alt="BoyFanz Logo" 
                  className="h-16 w-auto glow-effect mr-4"
                />
                <div>
                  <h1 className="text-4xl font-display font-black neon-sign tracking-wide uppercase mb-2">
                    BOYFANZ
                  </h1>
                  <p className="text-xl font-display font-black neon-sign-golden tracking-wide uppercase">
                    Every Man's Playground
                  </p>
                </div>
              </div>
            </div>

            {/* Selling Points */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Male className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Built for Boyz, By Boyz</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">All Hustle, All Yours. Creators Keep 100% of their earnings.</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Every kink welcome</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">We highlight all creators, not just top 1%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="pb-4">
                <h2 className="text-xl font-semibold text-center text-gray-800">
                  Create free account here
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Username or Email</Label>
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    data-testid="email-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                    data-testid="password-input"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <button 
                    className="text-red-600 hover:text-red-700 underline"
                    onClick={() => window.location.href = "/auth/reset-password"}
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="border-gray-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-700">
                    Remember me
                  </Label>
                </div>

                <Button
                  onClick={handleLogin}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md"
                  data-testid="login-button"
                >
                  Login
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                      onClick={handleSignup}
                      className="text-red-600 hover:text-red-700 underline font-semibold"
                      data-testid="signup-link"
                    >
                      Sign up here
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-sm border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Terms & Conditions</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">About Us</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Cookies Policy</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Complaint Policy</a>
            </div>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Privacy & Age Verification</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Content Management Policy</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Legal Library & Ethics Policy</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Cancellation Policy</a>
            </div>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Adult Star Model Release: 2257</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Transaction/Chargeback Policy</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Want to Request a New Feature?</a>
              <a href="/contact" className="block text-sm text-gray-600 hover:text-gray-800">Contact us</a>
            </div>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Adult Co-Star Model Release: 2257</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Tech Support</a>
              <a href="#" className="block text-sm text-gray-600 hover:text-gray-800">Become a VIP</a>
              <a href="/blog" className="block text-sm text-gray-600 hover:text-gray-800">Blog</a>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-xs text-gray-500">
              © 2025 BoyFanz. All rights reserved. Fanz Unlimited Network (FUN) L.L.C. - Address: 30 N Gould St #45302 Sheridan, Wyoming United States
            </p>
          </div>

          <div className="flex justify-center items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">PROTECTED BY:</span>
              <div className="flex items-center space-x-1">
                <div className="bg-green-500 text-white px-2 py-1 text-xs font-bold rounded">DMCA</div>
                <span className="text-xs text-gray-600">DMCA.com COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
