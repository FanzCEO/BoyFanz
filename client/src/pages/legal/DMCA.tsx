import { Link } from 'wouter';
import {
  Shield,
  ArrowLeft,
  Calendar,
  Mail,
  AlertTriangle,
  FileText,
  CheckCircle,
  Send,
  Scale,
  Clock,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export function DMCA() {
  const lastUpdated = 'November 15, 2024';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20" data-testid="dmca-page">
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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">DMCA Policy</h1>
              <p className="text-gray-400">Digital Millennium Copyright Act Compliance</p>
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
        {/* Overview */}
        <Card className="bg-red-500/10 border-red-500/30 mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Scale className="h-5 w-5 text-red-400" />
              Our Commitment to Copyright Protection
            </h3>
            <p className="text-gray-300 text-sm">
              BoyFanz respects intellectual property rights and expects our users to do the same.
              We comply with the Digital Millennium Copyright Act (DMCA) and respond promptly to
              valid takedown notices. We also protect creators from false claims through our counter-notification process.
            </p>
          </CardContent>
        </Card>

        {/* DMCA Content */}
        <div className="prose prose-invert max-w-none">

          {/* Section 1 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">1</span>
              Filing a DMCA Takedown Notice
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                If you believe your copyrighted work has been infringed on BoyFanz, you may submit a DMCA takedown notice.
                Your notice must include:
              </p>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Physical or Electronic Signature</h4>
                    <p className="text-sm text-gray-400">Signature of the copyright owner or authorized representative</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Identification of Copyrighted Work</h4>
                    <p className="text-sm text-gray-400">Description or link to the original copyrighted work</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Location of Infringing Material</h4>
                    <p className="text-sm text-gray-400">URL(s) where the infringing content is located on BoyFanz</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Contact Information</h4>
                    <p className="text-sm text-gray-400">Your name, address, phone number, and email address</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Good Faith Statement</h4>
                    <p className="text-sm text-gray-400">Statement that you believe in good faith the use is not authorized</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Accuracy Statement</h4>
                    <p className="text-sm text-gray-400">Statement under penalty of perjury that the information is accurate</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">2</span>
              How to Submit a Notice
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">Send your DMCA takedown notice to our designated agent:</p>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <h4 className="text-white font-semibold mb-2">DMCA Designated Agent</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><strong className="text-gray-400">Name:</strong> Legal Department - DMCA Agent</p>
                    <p><strong className="text-gray-400">Company:</strong> Fanz Unlimited Network LLC</p>
                    <p><strong className="text-gray-400">Address:</strong> 30 N Gould Street, Sheridan, WY 82801</p>
                    <p><strong className="text-gray-400">Email:</strong> dmca@fanz.website</p>
                  </div>
                </CardContent>
              </Card>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <p className="text-sm text-orange-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Warning:</strong> Filing a false DMCA notice is a federal crime under 17 U.S.C. 512(f).
                    You may be liable for damages, including attorney's fees, if you knowingly misrepresent that material is infringing.
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">3</span>
              Counter-Notification Process
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                If you believe your content was removed in error, you may file a counter-notification.
                Your counter-notice must include:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Your physical or electronic signature</li>
                <li>Identification of the material that was removed and its previous location</li>
                <li>Statement under penalty of perjury that you believe the material was removed by mistake</li>
                <li>Your name, address, and phone number</li>
                <li>Consent to jurisdiction of federal court in Wyoming or your home district</li>
                <li>Statement that you will accept service of process from the original complainant</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">4</span>
              Our Response Process
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-400 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Receive Notice</h4>
                    <p className="text-sm text-gray-400">We review all DMCA notices within 24-48 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-400 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Remove Content</h4>
                    <p className="text-sm text-gray-400">Valid notices result in immediate content removal</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-400 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Notify Uploader</h4>
                    <p className="text-sm text-gray-400">We inform the content uploader of the takedown and their options</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Counter-Notice Period</h4>
                    <p className="text-sm text-gray-400">10-14 business days for counter-notification before potential restoration</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">5</span>
              Repeat Infringer Policy
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                BoyFanz maintains a strict repeat infringer policy:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-yellow-500/10 border-yellow-500/30">
                  <CardContent className="p-4 text-center">
                    <h4 className="text-yellow-400 font-bold text-2xl mb-1">1st Strike</h4>
                    <p className="text-sm text-gray-300">Warning + Content Removal</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-500/10 border-orange-500/30">
                  <CardContent className="p-4 text-center">
                    <h4 className="text-orange-400 font-bold text-2xl mb-1">2nd Strike</h4>
                    <p className="text-sm text-gray-300">Temporary Suspension</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardContent className="p-4 text-center">
                    <h4 className="text-red-400 font-bold text-2xl mb-1">3rd Strike</h4>
                    <p className="text-sm text-gray-300">Permanent Ban</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">6</span>
              Protecting Your Content
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">BoyFanz provides tools to help protect your content:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Digital Watermarking:</strong> Optional visible watermarks on your content</li>
                <li><strong className="text-white">Screenshot Detection:</strong> Alerts when screenshots are attempted</li>
                <li><strong className="text-white">Content ID:</strong> Automated detection of re-uploaded content</li>
                <li><strong className="text-white">DMCA Support:</strong> Assistance filing takedowns on other platforms</li>
              </ul>
              <Button asChild className="mt-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600">
                <Link href="/settings">Manage Content Protection</Link>
              </Button>
            </div>
          </section>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Contact */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Submit a DMCA Notice</h3>
            <p className="text-gray-400 mb-4">
              Report copyright infringement or submit a counter-notification.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <Button asChild className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600">
                <a href="mailto:dmca@fanz.website">dmca@fanz.website</a>
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              <p>Response time: 24-48 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DMCA;
