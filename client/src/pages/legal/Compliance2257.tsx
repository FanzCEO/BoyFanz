import { Link } from 'wouter';
import {
  Eye,
  ArrowLeft,
  Calendar,
  Mail,
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  Users,
  Database,
  Lock,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export function Compliance2257() {
  const lastUpdated = 'December 1, 2024';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20" data-testid="2257-page">
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
              <Eye className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">18 U.S.C. 2257 Compliance</h1>
              <p className="text-gray-400">Age Verification & Record-Keeping Statement</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                  <Calendar className="h-3 w-3 mr-1" />
                  Updated {lastUpdated}
                </Badge>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  Compliant
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Important Notice */}
        <Card className="bg-orange-500/10 border-orange-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Federal Compliance Notice</h3>
                <p className="text-gray-300 text-sm">
                  In compliance with 18 U.S.C. 2257 and related regulations, BoyFanz maintains records
                  verifying that all performers depicted in visual content on this platform are adults (18+).
                  This statement is made pursuant to 18 U.S.C. 2257A.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2257 Content */}
        <div className="prose prose-invert max-w-none">

          {/* Section 1 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">1</span>
              Custodian of Records
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                The records required by 18 U.S.C. 2257 and 28 C.F.R. 75 are maintained by the following
                Custodian of Records:
              </p>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="text-gray-300 space-y-2">
                    <p><strong className="text-white">Custodian of Records</strong></p>
                    <p>Fanz Unlimited Network LLC</p>
                    <p>30 N Gould Street</p>
                    <p>Sheridan, Wyoming 82801</p>
                    <p>United States of America</p>
                  </div>
                </CardContent>
              </Card>
              <p className="text-gray-400 text-sm">
                Records are available for inspection during normal business hours at the above address.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">2</span>
              Age Verification Requirements
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                All content creators ("performers") on BoyFanz must complete our comprehensive age verification process before posting any content:
              </p>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Government-Issued ID</h4>
                    <p className="text-sm text-gray-400">Valid passport, driver's license, or national ID card showing proof of age (18+)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Selfie Verification</h4>
                    <p className="text-sm text-gray-400">Live selfie holding ID to confirm identity match</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Third-Party Verification</h4>
                    <p className="text-sm text-gray-400">Automated ID verification through VerifyMyAge or equivalent service</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Co-Performer Documentation</h4>
                    <p className="text-sm text-gray-400">Release forms and ID verification required for all performers in content</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">3</span>
              Records Maintained
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                In accordance with 18 U.S.C. 2257 and 28 C.F.R. 75, we maintain the following records for each performer:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-red-400" />
                      Identity Information
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>Legal name</li>
                      <li>Date of birth</li>
                      <li>Stage name(s) used</li>
                      <li>Government ID copy</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Database className="h-4 w-4 text-red-400" />
                      Content Records
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>Content identifier/URL</li>
                      <li>Date of production</li>
                      <li>Date of upload</li>
                      <li>Cross-reference to ID</li>
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
              Secondary Producer Exemption
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                BoyFanz operates as a "secondary producer" as defined in 28 C.F.R. 75.1(c)(2), as we do not
                actually produce visual depictions of sexually explicit conduct. Content is uploaded by individual
                creators ("primary producers") who are responsible for maintaining their own 2257 records.
              </p>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-300">
                  As a secondary producer, BoyFanz maintains records demonstrating we have obtained statements
                  from each creator confirming their compliance with 2257 requirements.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">5</span>
              Creator Responsibilities
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                All creators (primary producers) on BoyFanz must:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Maintain their own 2257 records for all content they produce</li>
                <li>Verify and document the age of all performers in their content</li>
                <li>Provide copies of performer IDs and consent forms upon request</li>
                <li>Keep records for the period required by law</li>
                <li>Update records when content is modified or re-released</li>
              </ul>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
                <p className="text-sm text-red-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Failure to comply</strong> with 2257 requirements may result in immediate
                    account termination and reporting to federal authorities.
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">6</span>
              Record Security
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Lock className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Encrypted Storage</h4>
                    <p className="text-xs text-gray-400">AES-256 encryption at rest</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Shield className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Access Controls</h4>
                    <p className="text-xs text-gray-400">Limited to authorized personnel</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Audit Trail</h4>
                    <p className="text-xs text-gray-400">All access is logged</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">7</span>
              Record Retention
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                Records are maintained for the following periods as required by 28 C.F.R. 75.5:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>During the time the content is publicly available on BoyFanz</li>
                <li>For 7 years following removal of content from the platform</li>
                <li>Additional retention as required by law enforcement requests or legal holds</li>
              </ul>
            </div>
          </section>

          {/* Exemption Statement */}
          <section className="mb-10">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  Exemption Statement
                </h3>
                <p className="text-gray-300 text-sm">
                  Some visual depictions on BoyFanz are exempt from 18 U.S.C. 2257 record-keeping requirements
                  because they do not portray conduct as specifically listed in 18 U.S.C. 2256(2)(A)-(E).
                  For non-exempt content, all required records are maintained and available for inspection.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Contact */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Compliance Questions?</h3>
            <p className="text-gray-400 mb-4">
              Contact our compliance department for 2257-related inquiries.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <Button asChild className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600">
                <a href="mailto:compliance@fanz.website">compliance@fanz.website</a>
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

export default Compliance2257;
