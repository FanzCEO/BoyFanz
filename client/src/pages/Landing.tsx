import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    // Redirect to unified login page instead of direct Replit auth
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground homepage-bg" data-testid="landing-page">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <img 
                src="/boyfanz-logo.png" 
                alt="BoyFanz Logo" 
                className="h-32 w-auto glow-effect rounded-lg"
              />
            </div>
            <p className="text-2xl mb-8 max-w-2xl mx-auto">
              <span className="text-5xl font-display font-black seedy-neon-golden block mb-3 tracking-wide uppercase">Every Man's Playground</span>
              <span className="font-body seedy-neon-white">The ultimate creator economy platform. Upload, monetize, and connect with your fans 
              while maintaining full compliance and security.</span>
            </p>
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="glow-effect font-semibold text-lg px-8 py-4"
              data-testid="login-button"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-card/30 club-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold font-heading mb-4 tracking-tight seedy-neon-red">
              Everything You Need to Succeed
            </h2>
            <p className="text-2xl font-body seedy-neon-white">
              Powerful tools for the modern creator economy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-cloud-upload-alt text-primary text-xl"></i>
                </div>
                <CardTitle className="seedy-neon-red">Secure Media Upload</CardTitle>
                <CardDescription className="seedy-neon-white">
                  Upload and store your content securely with enterprise-grade encryption and compliance features.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-shield-alt text-secondary text-xl"></i>
                </div>
                <CardTitle className="seedy-neon-blue">KYC Compliance</CardTitle>
                <CardDescription className="seedy-neon-white">
                  Built-in identity verification and compliance tools to meet regulatory requirements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-dollar-sign text-accent text-xl"></i>
                </div>
                <CardTitle className="seedy-neon-golden">Instant Payouts</CardTitle>
                <CardDescription className="seedy-neon-white">
                  Get paid quickly with our streamlined payout system and multiple payment options.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-users text-primary text-xl"></i>
                </div>
                <CardTitle className="seedy-neon-red">Fan Management</CardTitle>
                <CardDescription className="seedy-neon-white">
                  Connect with your audience and build lasting relationships with powerful fan management tools.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-chart-line text-secondary text-xl"></i>
                </div>
                <CardTitle className="seedy-neon-blue">Analytics & Insights</CardTitle>
                <CardDescription className="seedy-neon-white">
                  Track your performance with detailed analytics and insights to grow your business.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-bolt text-accent text-xl"></i>
                </div>
                <CardTitle className="seedy-neon-golden">Real-time Updates</CardTitle>
                <CardDescription className="seedy-neon-white">
                  Stay connected with real-time notifications and live updates on your content and earnings.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold font-heading mb-6 tracking-tight seedy-neon-red">
            Ready to Start Your Journey?
          </h2>
          <p className="text-2xl mb-8 font-body seedy-neon-white">
            Join thousands of creators who are already building their empire on <span className="font-display font-black seedy-neon-golden tracking-wide">BoyFanz</span>.
          </p>
          <Button 
            onClick={handleLogin} 
            size="lg" 
            className="glow-effect font-semibold text-lg px-8 py-4"
            data-testid="cta-login-button"
          >
            Start Creating Today
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-sm border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <a href="/compliance" className="block text-sm text-gray-600 hover:text-gray-800">Terms & Conditions</a>
              <a href="/blog" className="block text-sm text-gray-600 hover:text-gray-800">About Us</a>
              <a href="/compliance" className="block text-sm text-gray-600 hover:text-gray-800">Cookies Policy</a>
              <a href="/contact" className="block text-sm text-gray-600 hover:text-gray-800">Complaint Policy</a>
            </div>
            <div className="space-y-2">
              <a href="/compliance" className="block text-sm text-gray-600 hover:text-gray-800">Privacy & Age Verification</a>
              <a href="/compliance" className="block text-sm text-gray-600 hover:text-gray-800">Content Management Policy and Data Governance Procedures</a>
              <a href="/compliance" className="block text-sm text-gray-600 hover:text-gray-800">Legal Library & Ethics Policy</a>
              <a href="/compliance" className="block text-sm text-gray-600 hover:text-gray-800">Cancellation Policy</a>
            </div>
            <div className="space-y-2">
              <a href="/release-forms" className="block text-sm text-gray-600 hover:text-gray-800">Adult Star Model Release: 2257 and Agreement with Fanz™ Unlimited Network LLC</a>
              <a href="/compliance" className="block text-sm text-gray-600 hover:text-gray-800">Transaction/Chargeback Policy</a>
              <a href="/contact" className="block text-sm text-gray-600 hover:text-gray-800">Want to Request a New Feature?</a>
              <a href="/contact" className="block text-sm text-gray-600 hover:text-gray-800">Contact us</a>
            </div>
            <div className="space-y-2">
              <a href="/release-forms" className="block text-sm text-gray-600 hover:text-gray-800">Adult Co-Star Model Release: 2257 and Agreement with Fanz™ Unlimited Network LLC</a>
              <a href="/contact" className="block text-sm text-gray-600 hover:text-gray-800">Tech Support</a>
              <a href="/subscriptions" className="block text-sm text-gray-600 hover:text-gray-800">Become a VIP</a>
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