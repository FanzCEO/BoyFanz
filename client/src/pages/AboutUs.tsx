import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'wouter';
import {
  Heart,
  Users,
  Shield,
  Sparkles,
  Target,
  Globe,
  Award,
  Building
} from "lucide-react";

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Heart className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            About BoyFanz
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Building the future of creator-fan connections in the adult entertainment industry
          </p>
          <Badge variant="outline" className="mt-4">
            Part of FANZ Unlimited Network
          </Badge>
        </div>

        {/* Mission */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              BoyFanz is a premium creator platform dedicated to empowering male content creators
              and connecting them with their fans in a safe, secure, and profitable environment.
            </p>
            <p>
              We believe in creator freedom, fan satisfaction, and building a community where
              authentic connections thrive.
            </p>
          </CardContent>
        </Card>

        {/* What We Offer */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              What We Offer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">For Creators</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Premium subscription management</li>
                  <li>Custom content requests with escrow</li>
                  <li>Live streaming capabilities</li>
                  <li>Direct messaging with fans</li>
                  <li>Multiple payment processors</li>
                  <li>85% revenue share</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">For Fans</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Exclusive content access</li>
                  <li>Direct creator interaction</li>
                  <li>Custom content requests</li>
                  <li>Live stream viewing</li>
                  <li>Secure payment options</li>
                  <li>Privacy protection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Our Values
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Creator First</h4>
                <p>We prioritize creator autonomy, fair compensation, and platform tools that help you succeed.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Safety & Compliance</h4>
                <p>Full 2257 compliance, age verification, and robust content moderation to protect everyone.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Privacy Focused</h4>
                <p>Advanced privacy controls, anonymous browsing options, and data protection.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Community Driven</h4>
                <p>Building a respectful, inclusive community where everyone feels welcome.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              <strong className="text-foreground">Company:</strong> Fanz Unlimited Network (FUN) L.L.C.
            </p>
            <p>
              <strong className="text-foreground">Address:</strong> 30 N Gould St #45302, Sheridan, Wyoming 82801, United States
            </p>
            <p>
              <strong className="text-foreground">Platform:</strong> BoyFanz is part of the FANZ ecosystem,
              which includes multiple niche creator platforms serving diverse communities.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Get In Touch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Have questions or want to learn more?</p>
            <div className="flex gap-4">
              <Link href="/contact" className="text-primary hover:underline">
                Contact Us
              </Link>
              <Link href="/help" className="text-primary hover:underline">
                Help Center
              </Link>
              <Link href="/blog" className="text-primary hover:underline">
                Read Our Blog
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
