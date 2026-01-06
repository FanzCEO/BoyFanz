import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'wouter';
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  UserX,
  FileWarning,
  Fingerprint,
  Camera,
  MessageSquareWarning,
  Ban,
  KeyRound,
  ShieldCheck,
  Mail,
  Phone,
  HelpCircle,
  ExternalLink,
  Heart,
  PawPrint
} from "lucide-react";

const SafetyCard = ({
  icon: Icon,
  title,
  description,
  features,
  color = "primary"
}: {
  icon: any;
  title: string;
  description: string;
  features: string[];
  color?: string;
}) => (
  <Card className="h-full">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className={`h-12 w-12 bg-${color}/10 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export default function SafetyCenter() {
  return (
    <div className="container mx-auto px-4 py-8" data-testid="safety-center-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Safety Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your safety is our top priority. Learn about the measures we take to protect
            creators, fans, and content on BoyFanz.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-red-400" />
              <h3 className="font-semibold mb-2">Report Abuse</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Report harassment, illegal content, or safety violations
              </p>
              <Link href="/help/tickets/new">
                <Button variant="outline" size="sm" className="border-red-500/20 hover:bg-red-500/10">
                  Report Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-yellow-500/5 border-yellow-500/20">
            <CardContent className="p-6 text-center">
              <FileWarning className="h-8 w-8 mx-auto mb-3 text-yellow-400" />
              <h3 className="font-semibold mb-2">DMCA Takedown</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Report stolen content or copyright infringement
              </p>
              <a href="mailto:dmca@fanzunlimited.com">
                <Button variant="outline" size="sm" className="border-yellow-500/20 hover:bg-yellow-500/10">
                  Submit Request
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <HelpCircle className="h-8 w-8 mx-auto mb-3 text-blue-400" />
              <h3 className="font-semibold mb-2">Get Help</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Contact our safety team for immediate assistance
              </p>
              <Link href="/help/chat">
                <Button variant="outline" size="sm" className="border-blue-500/20 hover:bg-blue-500/10">
                  Contact Support
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Safety Features Grid */}
        <h2 className="text-2xl font-bold mb-6">How We Protect You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <SafetyCard
            icon={Camera}
            title="Content Protection"
            description="Advanced technology to protect your content"
            features={[
              "Forensic watermarking on all media",
              "Screenshot detection and prevention",
              "Automated DMCA protection",
              "Content fingerprinting",
              "Leak detection scanning"
            ]}
          />

          <SafetyCard
            icon={Lock}
            title="Privacy Controls"
            description="You control who sees your content"
            features={[
              "Geo-blocking by country",
              "IP address masking",
              "Hidden username options",
              "Profile visibility controls",
              "Restrict specific users"
            ]}
          />

          <SafetyCard
            icon={Fingerprint}
            title="Identity Verification"
            description="Verified creators and age checks"
            features={[
              "Government ID verification",
              "18+ age verification required",
              "Verified creator badges",
              "Secure KYC processing",
              "Annual re-verification"
            ]}
          />

          <SafetyCard
            icon={UserX}
            title="User Safety Tools"
            description="Protect yourself from unwanted contact"
            features={[
              "Block and mute users",
              "Message filtering",
              "Restrict comments",
              "Hide from specific users",
              "Report abuse easily"
            ]}
          />

          <SafetyCard
            icon={KeyRound}
            title="Account Security"
            description="Keep your account secure"
            features={[
              "Two-factor authentication",
              "Login activity monitoring",
              "Suspicious activity alerts",
              "Session management",
              "Secure password requirements"
            ]}
          />

          <SafetyCard
            icon={Ban}
            title="Content Moderation"
            description="AI and human moderation"
            features={[
              "24/7 content monitoring",
              "AI-powered detection",
              "Human moderation team",
              "Zero tolerance for illegal content",
              "Quick response to reports"
            ]}
          />
        </div>

        {/* For Creators Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Creator Safety Guidelines
            </CardTitle>
            <CardDescription>
              Best practices to protect yourself and your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-primary">Protect Your Identity</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <Eye className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    Never share personal info (real name, address, phone)
                  </li>
                  <li className="flex items-start gap-2">
                    <Eye className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    Use a stage name or pseudonym
                  </li>
                  <li className="flex items-start gap-2">
                    <Eye className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    Be careful with identifying backgrounds
                  </li>
                  <li className="flex items-start gap-2">
                    <Eye className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    Remove metadata from photos before uploading
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-secondary">Content Security</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    Enable all content protection features
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    Use geo-blocking for sensitive regions
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    Report leaks immediately via DMCA
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    Use watermarks in visible locations
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* For Fans Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Fan Safety Guidelines
            </CardTitle>
            <CardDescription>
              Stay safe while supporting your favorite creators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-primary">Protect Yourself</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 mt-0.5 text-accent" />
                    Never share payment info outside the platform
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 mt-0.5 text-accent" />
                    Use a unique password for your account
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 mt-0.5 text-accent" />
                    Enable two-factor authentication
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 mt-0.5 text-accent" />
                    Be wary of requests to move off-platform
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-secondary">Respect Creators</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <Heart className="h-4 w-4 mt-0.5 text-pink-500" />
                    Never share or redistribute content
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="h-4 w-4 mt-0.5 text-pink-500" />
                    Respect creator boundaries
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="h-4 w-4 mt-0.5 text-pink-500" />
                    Report harassment you witness
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="h-4 w-4 mt-0.5 text-pink-500" />
                    Don't screenshot or record content
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20 mb-12">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-16 w-16 text-red-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">Emergency? Need Immediate Help?</h3>
                <p className="text-muted-foreground mb-4">
                  If you're in immediate danger or experiencing a crisis, please contact emergency services
                  or reach out to these resources:
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Badge variant="outline" className="text-sm py-2 px-4">
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency: 911
                  </Badge>
                  <Badge variant="outline" className="text-sm py-2 px-4">
                    <Phone className="h-4 w-4 mr-2" />
                    Crisis Line: 988
                  </Badge>
                  <Badge variant="outline" className="text-sm py-2 px-4">
                    <MessageSquareWarning className="h-4 w-4 mr-2" />
                    Text HOME to 741741
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Questions About Safety?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Our safety team is available 24/7 to help with any concerns.
            Don't hesitate to reach out.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Contact Us
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help Center
              </Button>
            </Link>
          </div>
        </div>

        {/* Wittle Bear Foundation Tie-in */}
        <Card className="mt-12 border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-amber-500/5">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-3">
              <PawPrint className="h-6 w-6 text-pink-400" />
              <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
              <PawPrint className="h-6 w-6 text-pink-400 transform scale-x-[-1]" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent mb-2">
              Supporting LGBTQ+ Youth Safety
            </h3>
            <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
              A portion of BoyFanz profits supports The Wittle Bear Foundation, providing safe housing
              and resources for homeless LGBTQ+ youth.
            </p>
            <Link href="/wittle-bear-foundation">
              <Button variant="outline" className="border-pink-500/30 hover:bg-pink-500/10">
                <Heart className="h-4 w-4 mr-2 fill-pink-500 text-pink-500" />
                Learn About Our Foundation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
