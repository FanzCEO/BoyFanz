import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'wouter';
import {
  Lock,
  Eye,
  Database,
  Share2,
  Shield,
  Cookie,
  Bell,
  UserX,
  Mail,
  FileText,
  Globe,
  Server
} from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8" data-testid="privacy-policy-page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy matters. Learn how we collect, use, and protect your information.
          </p>
          <Badge variant="outline" className="mt-4">
            Last Updated: December 2024
          </Badge>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <a href="#collection" className="text-sm text-primary hover:underline">Data Collection</a>
              <a href="#usage" className="text-sm text-primary hover:underline">How We Use Data</a>
              <a href="#sharing" className="text-sm text-primary hover:underline">Data Sharing</a>
              <a href="#cookies" className="text-sm text-primary hover:underline">Cookies</a>
              <a href="#security" className="text-sm text-primary hover:underline">Security</a>
              <a href="#rights" className="text-sm text-primary hover:underline">Your Rights</a>
              <a href="#retention" className="text-sm text-primary hover:underline">Data Retention</a>
              <a href="#contact" className="text-sm text-primary hover:underline">Contact</a>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Data Collection */}
        <Card className="mb-6" id="collection">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              1. Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We collect information you provide directly and automatically when using our platform:</p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Account Information</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email address and username</li>
                  <li>Password (encrypted)</li>
                  <li>Profile information (bio, photos, preferences)</li>
                  <li>Payment and payout information</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Verification Data (Creators)</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Government-issued ID for age verification</li>
                  <li>Selfie for identity matching</li>
                  <li>2257 compliance records</li>
                  <li>Tax information (W-9/W-8BEN)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Automatically Collected</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and settings</li>
                  <li>Usage data and interaction patterns</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: How We Use Data */}
        <Card className="mb-6" id="usage">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              2. How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and maintain our services</li>
              <li>Process transactions and send payment-related notices</li>
              <li>Verify your identity and age (required by law)</li>
              <li>Send service updates and security alerts</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>Detect, prevent, and address fraud and abuse</li>
              <li>Comply with legal obligations including 2257 record-keeping</li>
              <li>Improve and personalize your experience</li>
              <li>Analyze usage to enhance our platform</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 3: Data Sharing */}
        <Card className="mb-6" id="sharing">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              3. Information Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We may share your information with:</p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Service Providers</h4>
                <p className="text-sm">Payment processors, hosting providers, and other third parties who assist in operating our platform.</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Legal Requirements</h4>
                <p className="text-sm">When required by law, subpoena, or to protect our rights and safety.</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Business Transfers</h4>
                <p className="text-sm">In connection with a merger, acquisition, or sale of assets.</p>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
              <p className="text-green-400 font-semibold">We Never Sell Your Data</p>
              <p className="text-sm mt-1">
                We do not sell your personal information to third parties for marketing or advertising purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Cookies */}
        <Card className="mb-6" id="cookies">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              4. Cookies & Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We use cookies and similar technologies for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for login and core functionality</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Understand how you use our platform</li>
              <li><strong>Security Cookies:</strong> Detect and prevent fraud</li>
            </ul>
            <p className="mt-4">
              You can manage cookie preferences in your browser settings. Note that disabling
              certain cookies may affect platform functionality.
            </p>
          </CardContent>
        </Card>

        {/* Section 5: Security */}
        <Card className="mb-6" id="security">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              5. Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We implement industry-standard security measures including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>SSL/TLS encryption for all data in transit</li>
              <li>AES-256 encryption for sensitive data at rest</li>
              <li>Regular security audits and penetration testing</li>
              <li>Two-factor authentication (2FA) options</li>
              <li>Secure payment processing through PCI-compliant providers</li>
              <li>Access controls and employee training</li>
              <li>DRM protection for creator content</li>
            </ul>
            <p className="mt-4 text-sm">
              While we take extensive measures to protect your data, no system is 100% secure.
              Please use strong passwords and enable 2FA for additional protection.
            </p>
          </CardContent>
        </Card>

        {/* Section 6: Your Rights */}
        <Card className="mb-6" id="rights">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-primary" />
              6. Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:support@fanzunlimited.com" className="text-primary hover:underline">
                support@fanzunlimited.com
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Section 7: Data Retention */}
        <Card className="mb-6" id="retention">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              7. Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We retain your information for as long as:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your account remains active</li>
              <li>Required to provide our services</li>
              <li>Necessary to comply with legal obligations</li>
              <li>Required to resolve disputes or enforce agreements</li>
            </ul>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
              <p className="text-yellow-400 font-semibold">2257 Record Keeping</p>
              <p className="text-sm mt-1">
                As required by U.S. federal law (18 U.S.C. § 2257), we maintain age verification
                records for all content creators. These records are retained for the legally
                required period after content removal.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 8: International */}
        <Card className="mb-6" id="international">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              8. International Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Your information may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place for international transfers, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Standard contractual clauses approved by relevant authorities</li>
              <li>Data processing agreements with service providers</li>
              <li>Compliance with applicable data protection laws</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 9: Contact */}
        <Card className="mb-6" id="contact">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              9. Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>For privacy-related questions or to exercise your rights, contact us:</p>
            <div className="bg-card border rounded-lg p-4">
              <p><strong>Email:</strong> <a href="mailto:support@fanzunlimited.com" className="text-primary hover:underline">support@fanzunlimited.com</a></p>
            </div>
            <p className="text-sm mt-4">
              We will respond to your request within 30 days. For EU/UK residents, you also have
              the right to lodge a complaint with your local data protection authority.
            </p>
          </CardContent>
        </Card>

        {/* Section 10: Changes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              10. Changes to This Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Posting the updated policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending an email notification for significant changes</li>
            </ul>
            <p className="mt-4">
              Your continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mt-8">
          <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          <span>•</span>
          <Link href="/safety" className="hover:text-primary">Safety Center</Link>
          <span>•</span>
          <Link href="/help" className="hover:text-primary">Help Center</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-primary">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
