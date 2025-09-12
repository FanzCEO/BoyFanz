import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground smoky-bg" data-testid="landing-page">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <img 
                src="/boyfanz-logo.png" 
                alt="BoyFanz Logo" 
                className="h-64 w-auto glow-effect rounded-lg"
              />
            </div>
            <h1 className="text-6xl font-bold font-heading mb-6 tracking-tight">
              <span className="neon-sign font-display tracking-wider">BoyFanz</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              <span className="text-2xl font-display font-black neon-sign-golden block mb-3 tracking-wide uppercase">Every Man's Playground</span>
              <span className="font-body">The ultimate creator economy platform. Upload, monetize, and connect with your fans 
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
            <h2 className="text-4xl font-bold font-heading mb-4 tracking-tight">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground font-body">
              Powerful tools for the modern creator economy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-cloud-upload-alt text-primary text-xl"></i>
                </div>
                <CardTitle>Secure Media Upload</CardTitle>
                <CardDescription>
                  Upload and store your content securely with enterprise-grade encryption and compliance features.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-shield-alt text-secondary text-xl"></i>
                </div>
                <CardTitle>KYC Compliance</CardTitle>
                <CardDescription>
                  Built-in identity verification and compliance tools to meet regulatory requirements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-dollar-sign text-accent text-xl"></i>
                </div>
                <CardTitle>Instant Payouts</CardTitle>
                <CardDescription>
                  Get paid quickly with our streamlined payout system and multiple payment options.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-users text-primary text-xl"></i>
                </div>
                <CardTitle>Fan Management</CardTitle>
                <CardDescription>
                  Connect with your audience and build lasting relationships with powerful fan management tools.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-chart-line text-secondary text-xl"></i>
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track your performance with detailed analytics and insights to grow your business.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-bolt text-accent text-xl"></i>
                </div>
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
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
          <h2 className="text-4xl font-bold font-heading mb-6 tracking-tight">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 font-body">
            Join thousands of creators who are already building their empire on <span className="font-display font-black text-primary tracking-wide">BoyFanz</span>.
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
    </div>
  );
}
