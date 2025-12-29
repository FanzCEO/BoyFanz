import { Link } from 'wouter';
import {
  Lock,
  ArrowLeft,
  Calendar,
  Mail,
  Shield,
  Eye,
  Database,
  Globe,
  Users,
  Settings,
  Trash2,
  Download,
  Cookie,
  Server
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export function Privacy() {
  const lastUpdated = 'December 1, 2024';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20" data-testid="privacy-page">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-500/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-12">
          <Link href="/legal" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Legal Library
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-red-600 to-orange-500 rounded-full">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                  <Calendar className="h-3 w-3 mr-1" />
                  Updated {lastUpdated}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Summary */}
        <Card className="bg-red-500/10 border-red-500/30 mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" />
              Your Privacy at a Glance
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <Database className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>We collect only what's necessary to provide our services</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Your data is encrypted with industry-standard AES-256</span>
              </div>
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>We never sell your personal information to third parties</span>
              </div>
              <div className="flex items-start gap-2">
                <Settings className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>You have full control over your data and privacy settings</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Content */}
        <div className="prose prose-invert max-w-none">

          {/* Section 1 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">1</span>
              Information We Collect
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-red-400" />
                Information You Provide
              </h4>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Account Information:</strong> Email address, username, password, profile picture</li>
                <li><strong className="text-white">Creator Information:</strong> Legal name, date of birth, government ID for verification</li>
                <li><strong className="text-white">Payment Information:</strong> Billing address, payment method details (processed by third-party providers)</li>
                <li><strong className="text-white">Content:</strong> Photos, videos, messages, and other content you upload or send</li>
                <li><strong className="text-white">Communications:</strong> Support tickets, feedback, and correspondence with us</li>
              </ul>

              <Separator className="my-4 bg-gray-700" />

              <h4 className="text-white font-semibold flex items-center gap-2">
                <Server className="h-4 w-4 text-red-400" />
                Information Collected Automatically
              </h4>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Device Information:</strong> Browser type, operating system, device identifiers</li>
                <li><strong className="text-white">Usage Data:</strong> Pages visited, features used, time spent, click patterns</li>
                <li><strong className="text-white">Location:</strong> Approximate location based on IP address (not precise GPS)</li>
                <li><strong className="text-white">Cookies:</strong> Session data, preferences, and analytics (see Cookie Policy)</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">2</span>
              How We Use Your Information
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">We use your information to:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-white mb-2">Provide Services</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>Create and manage your account</li>
                      <li>Process payments and payouts</li>
                      <li>Enable content sharing and messaging</li>
                      <li>Verify creator identities</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-white mb-2">Improve & Protect</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>Enhance platform features</li>
                      <li>Prevent fraud and abuse</li>
                      <li>Enforce our Terms of Service</li>
                      <li>Comply with legal requirements</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">3</span>
              Information Sharing
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                <p className="text-green-300 font-semibold">
                  We do NOT sell your personal information. Ever.
                </p>
              </div>
              <p className="text-gray-300">We may share information with:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Service Providers:</strong> Payment processors, cloud hosting, analytics, customer support</li>
                <li><strong className="text-white">Legal Authorities:</strong> When required by law, court order, or to protect safety</li>
                <li><strong className="text-white">Business Transfers:</strong> In connection with merger, acquisition, or sale of assets</li>
                <li><strong className="text-white">With Consent:</strong> When you explicitly authorize sharing</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">4</span>
              Data Security
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Lock className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Encryption</h4>
                    <p className="text-xs text-gray-400">AES-256 encryption at rest, TLS 1.3 in transit</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Shield className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Access Controls</h4>
                    <p className="text-xs text-gray-400">Role-based access, 2FA for employees</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Eye className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Monitoring</h4>
                    <p className="text-xs text-gray-400">24/7 security monitoring and audits</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">5</span>
              Your Rights & Choices
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">You have the right to:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Download className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold">Access & Export</h4>
                    <p className="text-sm text-gray-400">Download a copy of your data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Settings className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold">Correct</h4>
                    <p className="text-sm text-gray-400">Update inaccurate information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Trash2 className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold">Delete</h4>
                    <p className="text-sm text-gray-400">Request account and data deletion</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Cookie className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold">Opt-Out</h4>
                    <p className="text-sm text-gray-400">Manage cookies and marketing preferences</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                To exercise these rights, visit Settings &gt; Privacy or contact privacy@fanz.website
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">6</span>
              Data Retention
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                We retain your data only as long as necessary to provide services and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Account Data:</strong> Retained while your account is active, deleted within 30 days of account closure</li>
                <li><strong className="text-white">Financial Records:</strong> Retained for 7 years for tax and legal compliance</li>
                <li><strong className="text-white">2257 Records:</strong> Retained for the period required by law</li>
                <li><strong className="text-white">Content:</strong> Deleted within 30 days of removal or account closure</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">7</span>
              International Transfers
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-red-400 mt-1" />
                <p className="text-gray-300">
                  Your data may be transferred to and processed in the United States and other countries.
                  We use Standard Contractual Clauses and other safeguards to protect international transfers
                  in compliance with GDPR and other applicable laws.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8 - GDPR */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">8</span>
              GDPR Rights (EU Users)
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                If you are in the European Economic Area, you have additional rights under GDPR including:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Right to data portability</li>
                <li>Right to restrict processing</li>
                <li>Right to object to processing</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>
              <p className="text-gray-400 text-sm">
                Our legal basis for processing is consent and legitimate business interests.
              </p>
            </div>
          </section>

          {/* Section 9 - CCPA */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">9</span>
              CCPA Rights (California Users)
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                California residents have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Know what personal information is collected</li>
                <li>Know if personal information is sold or disclosed</li>
                <li>Opt-out of the sale of personal information (we don't sell your data)</li>
                <li>Request deletion of personal information</li>
                <li>Non-discrimination for exercising these rights</li>
              </ul>
            </div>
          </section>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Contact */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Privacy Questions?</h3>
            <p className="text-gray-400 mb-4">
              Contact our privacy team for any concerns or to exercise your rights.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <Button asChild className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600">
                <a href="mailto:privacy@fanz.website">privacy@fanz.website</a>
              </Button>
              <Button variant="outline" className="border-gray-700" asChild>
                <Link href="/settings">Privacy Settings</Link>
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              <p><strong className="text-gray-400">Fanz Unlimited Network LLC</strong></p>
              <p>30 N Gould Street, Sheridan, Wyoming 82801</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Privacy;
