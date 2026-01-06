import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cookie,
  Settings,
  Eye,
  BarChart,
  Shield,
  Zap
} from "lucide-react";

export default function CookiesPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Cookie className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Cookies Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How we use cookies and similar technologies on BoyFanz
          </p>
          <Badge variant="outline" className="mt-4">
            Last Updated: January 2026
          </Badge>
        </div>

        {/* What Are Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              What Are Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Cookies are small text files stored on your device when you visit our website.
              They help us provide you with a better experience by remembering your preferences
              and understanding how you use our platform.
            </p>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Types of Cookies We Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Essential Cookies (Required)
                </h4>
                <p>These cookies are necessary for the platform to function:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Session management and authentication</li>
                  <li>Security and fraud prevention</li>
                  <li>Load balancing and performance</li>
                  <li>Age verification status</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Functional Cookies
                </h4>
                <p>These cookies enhance your experience:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Language and regional preferences</li>
                  <li>Theme settings (light/dark mode)</li>
                  <li>Content filter preferences</li>
                  <li>Video quality settings</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Analytics Cookies
                </h4>
                <p>These help us understand how users interact with our platform:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Page views and navigation patterns</li>
                  <li>Feature usage statistics</li>
                  <li>Error tracking and debugging</li>
                  <li>Performance monitoring</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Advertising Cookies (Optional)
                </h4>
                <p>With your consent, we may use cookies for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Showing relevant content recommendations</li>
                  <li>Measuring ad campaign effectiveness</li>
                  <li>Limiting ad frequency</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Duration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cookie Duration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Session Cookies</h4>
                <p>Temporary cookies deleted when you close your browser.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Persistent Cookies</h4>
                <p>Remain on your device for a set period (typically 30 days to 1 year) or until you delete them.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Managing Your Cookie Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>You have several options to control cookies:</p>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Platform Settings</h4>
                <p>Manage your cookie preferences in your account settings under Privacy & Data.</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Browser Settings</h4>
                <p>Most browsers allow you to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>View and delete existing cookies</li>
                  <li>Block all cookies</li>
                  <li>Block third-party cookies</li>
                  <li>Clear cookies when closing the browser</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Third-Party Tools</h4>
                <p>Use browser extensions or privacy tools to manage tracking technologies.</p>
              </div>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mt-4">
              <p className="text-warning-foreground font-semibold">Note:</p>
              <p className="text-sm mt-1">
                Blocking essential cookies may prevent you from using certain features of the platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We use the following third-party services that may set cookies:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Payment processors (Stripe, etc.)</li>
              <li>Analytics platforms (privacy-focused)</li>
              <li>Content delivery networks (CDN)</li>
              <li>Customer support tools</li>
            </ul>
            <p className="mt-4">
              These services have their own privacy policies and cookie practices.
            </p>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Policy Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We may update this Cookies Policy from time to time. Changes will be posted on this page
              with an updated "Last Updated" date. We encourage you to review this policy periodically.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Questions?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              If you have questions about our use of cookies, please contact us at{" "}
              <a href="/contact" className="text-primary hover:underline">
                our contact page
              </a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
