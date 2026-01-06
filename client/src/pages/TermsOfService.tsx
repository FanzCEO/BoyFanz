import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'wouter';
import {
  ScrollText,
  Shield,
  CreditCard,
  Users,
  Camera,
  AlertTriangle,
  Scale,
  Ban,
  Mail,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8" data-testid="terms-of-service-page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <ScrollText className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using BoyFanz
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
              <a href="#eligibility" className="text-sm text-primary hover:underline">Eligibility</a>
              <a href="#accounts" className="text-sm text-primary hover:underline">Account Terms</a>
              <a href="#content" className="text-sm text-primary hover:underline">Content Rules</a>
              <a href="#payments" className="text-sm text-primary hover:underline">Payments</a>
              <a href="#prohibited" className="text-sm text-primary hover:underline">Prohibited Content</a>
              <a href="#termination" className="text-sm text-primary hover:underline">Termination</a>
              <a href="#liability" className="text-sm text-primary hover:underline">Liability</a>
              <a href="#contact" className="text-sm text-primary hover:underline">Contact</a>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Eligibility */}
        <Card className="mb-6" id="eligibility">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              1. Eligibility Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              By accessing or using BoyFanz, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into a binding agreement</li>
              <li>You are not prohibited from using the service under applicable laws</li>
              <li>You will comply with all applicable local, state, national, and international laws</li>
              <li>If you are a creator, you have completed age and identity verification</li>
            </ul>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-4">
              <p className="text-red-400 font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Age Verification Required
              </p>
              <p className="text-sm mt-2">
                All users must be 18+ to access this platform. Creators must complete full identity verification
                including government-issued ID and 2257 compliance documentation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Account Terms */}
        <Card className="mb-6" id="accounts">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              2. Account Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>When you create an account, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Not share your account with others or allow multiple users</li>
            </ul>
            <p className="mt-4">
              We reserve the right to suspend or terminate accounts that violate these terms,
              provide false information, or engage in fraudulent activity.
            </p>
          </CardContent>
        </Card>

        {/* Section 3: Content Rules */}
        <Card className="mb-6" id="content">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              3. Content Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Creators retain ownership of their content. By uploading content, you grant BoyFanz
              a license to host, display, and distribute your content on the platform.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="font-semibold text-green-400 flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  Allowed Content
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Adult content with verified consent</li>
                  <li>• Original content you own rights to</li>
                  <li>• Content featuring adults 18+ only</li>
                  <li>• Properly tagged and categorized content</li>
                </ul>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="font-semibold text-red-400 flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4" />
                  Prohibited Content
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Any content depicting minors</li>
                  <li>• Non-consensual content</li>
                  <li>• Copyrighted material you don't own</li>
                  <li>• Content promoting violence or illegal acts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Payments */}
        <Card className="mb-6" id="payments">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              4. Payments & Payouts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              BoyFanz processes payments through adult-friendly payment processors.
              By using our payment services, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Platform fee of 20% on all transactions (creators keep 80%)</li>
              <li>Minimum payout threshold of $50 USD</li>
              <li>Payouts processed within 7 business days after request</li>
              <li>Chargebacks and fraud may result in account suspension</li>
              <li>You are responsible for reporting income and paying applicable taxes</li>
            </ul>
            <p className="mt-4 text-sm">
              We support payouts via Paxum, ePayService, CosmoPayment, Wise, and cryptocurrency options.
            </p>
          </CardContent>
        </Card>

        {/* Section 5: Prohibited Activities */}
        <Card className="mb-6" id="prohibited">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-400" />
              5. Prohibited Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>The following activities are strictly prohibited and will result in immediate termination:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Any content involving minors or appearing to involve minors</li>
              <li>Non-consensual intimate imagery or "revenge porn"</li>
              <li>Human trafficking or exploitation</li>
              <li>Bestiality or animal abuse content</li>
              <li>Incitement of violence or terrorism</li>
              <li>Fraud, scams, or deceptive practices</li>
              <li>Harassment, stalking, or doxxing</li>
              <li>Circumventing platform security or payment systems</li>
              <li>Creating fake accounts or impersonating others</li>
              <li>Scraping, data mining, or unauthorized automation</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 6: Termination */}
        <Card className="mb-6" id="termination">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              6. Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We may suspend or terminate your account at any time for violations of these terms.
              You may also terminate your account at any time.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Pending payouts will be processed before account closure (if in good standing)</li>
              <li>Content will be removed within 30 days of account termination</li>
              <li>We retain records as required by law (including 2257 records)</li>
              <li>Terminated users may be prohibited from creating new accounts</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 7: Limitation of Liability */}
        <Card className="mb-6" id="liability">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              7. Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, BOYFANZ AND ITS AFFILIATES SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Actions of other users or third parties</li>
              <li>Service interruptions or technical issues</li>
              <li>Content created or shared by users</li>
            </ul>
            <p className="mt-4">
              Our total liability for any claim shall not exceed the amount you paid to us in the
              twelve (12) months preceding the claim.
            </p>
          </CardContent>
        </Card>

        {/* Section 8: Contact */}
        <Card className="mb-6" id="contact">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              8. Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>For questions about these Terms of Service, please contact us:</p>
            <div className="bg-card border rounded-lg p-4">
              <p><strong>Email:</strong> <a href="mailto:support@fanzunlimited.com" className="text-primary hover:underline">support@fanzunlimited.com</a></p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mt-8">
          <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
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
