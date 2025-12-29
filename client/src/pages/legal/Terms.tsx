import { Link } from 'wouter';
import {
  FileText,
  ArrowLeft,
  Calendar,
  Mail,
  Scale,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  CreditCard,
  Users,
  Globe,
  Lock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function Terms() {
  const lastUpdated = 'December 1, 2024';
  const effectiveDate = 'December 1, 2024';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20" data-testid="terms-page">
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
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                  <Calendar className="h-3 w-3 mr-1" />
                  Updated {lastUpdated}
                </Badge>
                <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                  Effective {effectiveDate}
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
              <Scale className="h-5 w-5 text-red-400" />
              Quick Summary
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                You must be 18+ to use BoyFanz
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                Creators keep 100% of earnings (minus processing fees)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                You own your content, but grant us a license to display it
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                No illegal content, harassment, or unauthorized sharing
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <div className="prose prose-invert max-w-none">

          {/* Section 1 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">1</span>
              Acceptance of Terms
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                Welcome to BoyFanz, a platform operated by <strong className="text-white">Fanz Unlimited Network LLC</strong>,
                a subsidiary of FANZ Group Holdings LLC. By accessing or using our platform, you agree to be bound by
                these Terms of Service and all applicable laws and regulations.
              </p>
              <p className="text-gray-300">
                If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                The materials contained on BoyFanz are protected by applicable copyright and trademark law.
              </p>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-4">
                <p className="text-sm text-orange-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Age Requirement:</strong> You must be at least 18 years old to use BoyFanz. By using our services,
                    you represent and warrant that you are of legal age.
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">2</span>
              Account Registration
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">To use certain features, you must register for an account. When registering:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
              <p className="text-gray-300">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in
                fraudulent, abusive, or illegal activities.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">3</span>
              Creator Terms
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Creator Rights
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>100% of subscription earnings (minus processing)</li>
                      <li>Set your own subscription prices ($4.99-$49.99)</li>
                      <li>Control who can view your content</li>
                      <li>Block any user at any time</li>
                      <li>Request payouts at $20 minimum</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Creator Responsibilities
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>Complete identity verification</li>
                      <li>Maintain age records for all performers</li>
                      <li>Own rights to all content posted</li>
                      <li>Comply with all applicable laws</li>
                      <li>Report illegal content immediately</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">4</span>
              Content Ownership & License
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                <strong className="text-white">You retain ownership</strong> of all content you create and post on BoyFanz.
                However, by uploading content, you grant us a worldwide, non-exclusive, royalty-free license to:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Host, store, and display your content on our platform</li>
                <li>Create thumbnails, previews, and promotional materials</li>
                <li>Process and transcode media for optimal delivery</li>
                <li>Enforce our Terms of Service and protect users</li>
              </ul>
              <p className="text-gray-300">
                This license terminates when you delete your content or close your account, except for content that
                has been shared by others or is required for legal compliance.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">5</span>
              Prohibited Conduct
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300 font-semibold">You agree NOT to:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Post content involving minors in any context</li>
                  <li>Share non-consensual intimate content</li>
                  <li>Engage in harassment, bullying, or threats</li>
                  <li>Post content depicting illegal activities</li>
                  <li>Impersonate others or create fake accounts</li>
                </ul>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Redistribute paid content without authorization</li>
                  <li>Use automated systems to access the platform</li>
                  <li>Attempt to bypass security measures</li>
                  <li>Engage in fraud or deceptive practices</li>
                  <li>Violate intellectual property rights</li>
                </ul>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
                <p className="text-sm text-red-300">
                  <strong>Zero Tolerance:</strong> Violations of these prohibitions may result in immediate account
                  termination, forfeiture of earnings, and reporting to law enforcement where applicable.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">6</span>
              Payments & Refunds
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3 mb-4">
                <CreditCard className="h-5 w-5 text-red-400 mt-1" />
                <div>
                  <p className="text-gray-300">
                    All payments are processed through secure third-party payment processors. By making a purchase,
                    you authorize us to charge your payment method.
                  </p>
                </div>
              </div>
              <h4 className="text-white font-semibold">Refund Policy:</h4>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Subscriptions may be canceled anytime but are non-refundable</li>
                <li>Tips and one-time purchases are final and non-refundable</li>
                <li>Refunds for technical issues are handled case-by-case</li>
                <li>Chargebacks may result in account suspension</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">7</span>
              Termination
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                We may terminate or suspend your account immediately, without prior notice, for any reason,
                including breach of these Terms. Upon termination:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Your right to use the platform immediately ceases</li>
                <li>You may request a data export within 30 days</li>
                <li>Outstanding payouts will be processed per our payment terms</li>
                <li>We may retain data as required by law</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">8</span>
              Disclaimers & Limitations
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300 text-sm">
                THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES,
                EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT
                SHALL FANZ UNLIMITED NETWORK LLC BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">9</span>
              Governing Law
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                These Terms shall be governed by and construed in accordance with the laws of the State of Wyoming,
                United States, without regard to its conflict of law provisions. Any disputes shall be resolved in
                the courts of Sheridan County, Wyoming.
              </p>
            </div>
          </section>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Contact */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Questions About These Terms?</h3>
            <p className="text-gray-400 mb-4">
              Contact our legal team for clarification or concerns.
            </p>
            <div className="text-sm text-gray-500">
              <p><strong className="text-gray-400">Email:</strong> legal@fanz.website</p>
              <p className="mt-2">
                <strong className="text-gray-400">Fanz Unlimited Network LLC</strong>
              </p>
              <p>30 N Gould Street, Sheridan, Wyoming 82801</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Terms;
