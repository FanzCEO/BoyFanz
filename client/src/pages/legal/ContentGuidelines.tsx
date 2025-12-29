import { Link } from 'wouter';
import {
  Camera,
  ArrowLeft,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Users,
  Heart,
  Ban,
  Video,
  Image,
  MessageSquare,
  Flag
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export function ContentGuidelines() {
  const lastUpdated = 'December 15, 2024';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20" data-testid="content-guidelines-page">
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
              <Camera className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Content Guidelines</h1>
              <p className="text-gray-400">Rules for creating and sharing content on BoyFanz</p>
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
              Golden Rules
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>All performers must be 18+ and verified</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>You must own rights to all content you post</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>All content must be consensual</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Respect other creators and subscribers</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Guidelines */}
        <div className="prose prose-invert max-w-none">

          {/* Allowed Content */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              Allowed Content
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">You may post the following types of content on BoyFanz:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Photos & Images
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>Personal photos and selfies</li>
                      <li>Professional photoshoots</li>
                      <li>Behind-the-scenes content</li>
                      <li>Artistic and creative photography</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Videos
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>Personal vlogs and updates</li>
                      <li>Workout and fitness content</li>
                      <li>ASMR and relaxation videos</li>
                      <li>Adult entertainment (18+ verified)</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Text & Audio
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>Written posts and stories</li>
                      <li>Voice messages and audio clips</li>
                      <li>Personalized messages to fans</li>
                      <li>Creative writing and fiction</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Live Content
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>Live streaming sessions</li>
                      <li>Q&A and interactive shows</li>
                      <li>Virtual events and meetups</li>
                      <li>Pay-per-view events</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Prohibited Content */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Ban className="h-6 w-6 text-red-400" />
              Prohibited Content
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-red-300 font-semibold flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  Zero Tolerance Policy: Violations result in immediate account termination and may be reported to law enforcement.
                </p>
              </div>

              <h4 className="text-white font-semibold text-lg">Absolutely Prohibited:</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">Child Sexual Abuse Material (CSAM)</span>
                    <p className="text-xs text-gray-400">Any content involving minors in any sexual context</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">Non-Consensual Content</span>
                    <p className="text-xs text-gray-400">Revenge porn, hidden cameras, leaked content</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">Rape/Sexual Assault</span>
                    <p className="text-xs text-gray-400">Real or simulated sexual violence</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">Bestiality/Zoophilia</span>
                    <p className="text-xs text-gray-400">Any sexual content involving animals</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">Human Trafficking</span>
                    <p className="text-xs text-gray-400">Content promoting or depicting trafficking</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">Extreme Violence</span>
                    <p className="text-xs text-gray-400">Gore, mutilation, real violence</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4 bg-gray-700" />

              <h4 className="text-white font-semibold text-lg">Also Prohibited:</h4>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li><strong className="text-white">Incest content:</strong> Real or implied sexual content between family members</li>
                <li><strong className="text-white">Necrophilia:</strong> Sexual content depicting deceased individuals</li>
                <li><strong className="text-white">Self-harm promotion:</strong> Content encouraging self-injury or suicide</li>
                <li><strong className="text-white">Illegal drug use:</strong> Content promoting or depicting illegal drug activities</li>
                <li><strong className="text-white">Weapons/violence threats:</strong> Content threatening harm to individuals or groups</li>
                <li><strong className="text-white">Hate speech:</strong> Content targeting individuals based on protected characteristics</li>
                <li><strong className="text-white">Doxxing:</strong> Sharing private information without consent</li>
                <li><strong className="text-white">Fraud/Scams:</strong> Deceptive content designed to defraud users</li>
              </ul>
            </div>
          </section>

          {/* Technical Requirements */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">1</span>
              Technical Requirements
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-white mb-2">Photos</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>Formats: JPG, PNG, GIF, WebP</li>
                      <li>Max size: 50MB per image</li>
                      <li>Min resolution: 400x400px</li>
                      <li>Max: 20 images per post</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-white mb-2">Videos</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>Formats: MP4, MOV, WebM</li>
                      <li>Max size: 2GB per video</li>
                      <li>Max duration: 60 minutes</li>
                      <li>Min resolution: 720p</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Co-Performer Requirements */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">2</span>
              Co-Performer Requirements
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                When creating content with other performers, you must:
              </p>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Verify Age</h4>
                    <p className="text-sm text-gray-400">Confirm all performers are 18+ with valid government ID</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Obtain Consent</h4>
                    <p className="text-sm text-gray-400">Get written consent and release forms from all performers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Maintain Records</h4>
                    <p className="text-sm text-gray-400">Keep 2257 documentation for all performers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Tag Co-Creators</h4>
                    <p className="text-sm text-gray-400">Tag verified co-performers in collaborative content</p>
                  </div>
                </div>
              </div>
              <Button asChild className="mt-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600">
                <Link href="/release-forms">Manage Release Forms</Link>
              </Button>
            </div>
          </section>

          {/* Reporting */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Flag className="h-6 w-6 text-orange-400" />
              Reporting Violations
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                If you encounter content that violates these guidelines:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Flag className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Report Button</h4>
                    <p className="text-xs text-gray-400">Use the flag icon on any content</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Mail className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Email Report</h4>
                    <p className="text-xs text-gray-400">safety@fanz.website</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Shield className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-white mb-1">Trust & Safety</h4>
                    <p className="text-xs text-gray-400">24/7 review team</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Enforcement */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-sm">3</span>
              Enforcement Actions
            </h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-4">
              <p className="text-gray-300">
                Violations may result in the following actions, depending on severity:
              </p>
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-yellow-500/10 border-yellow-500/30">
                  <CardContent className="p-4 text-center">
                    <h4 className="text-yellow-400 font-bold text-lg mb-1">Warning</h4>
                    <p className="text-xs text-gray-300">First minor offense</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-500/10 border-orange-500/30">
                  <CardContent className="p-4 text-center">
                    <h4 className="text-orange-400 font-bold text-lg mb-1">Content Removal</h4>
                    <p className="text-xs text-gray-300">Violating content</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardContent className="p-4 text-center">
                    <h4 className="text-red-400 font-bold text-lg mb-1">Suspension</h4>
                    <p className="text-xs text-gray-300">Repeated violations</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-600/20 border-red-600/40">
                  <CardContent className="p-4 text-center">
                    <h4 className="text-red-500 font-bold text-lg mb-1">Termination</h4>
                    <p className="text-xs text-gray-300">Severe/illegal</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Contact */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Questions About Content Guidelines?</h3>
            <p className="text-gray-400 mb-4">
              Our Trust & Safety team is here to help clarify any questions.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <Button asChild className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600">
                <a href="mailto:safety@fanz.website">safety@fanz.website</a>
              </Button>
              <Button variant="outline" className="border-gray-700" asChild>
                <Link href="/help/chat">Chat with Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ContentGuidelines;
