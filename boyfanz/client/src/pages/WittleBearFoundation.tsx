import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'wouter';
import {
  Heart,
  PawPrint,
  Home,
  Users,
  HandHeart,
  Sparkles,
  Shield,
  Phone,
  Mail,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  Building2
} from "lucide-react";

const ImpactCard = ({
  icon: Icon,
  title,
  description,
  color = "pink"
}: {
  icon: any;
  title: string;
  description: string;
  color?: string;
}) => (
  <Card className={`text-center border-${color}-500/20 bg-${color}-500/5`}>
    <CardContent className="p-6">
      <div className={`w-14 h-14 rounded-full bg-${color}-500/10 flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`h-7 w-7 text-${color}-400`} />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function WittleBearFoundation() {
  return (
    <div className="container mx-auto px-4 py-8" data-testid="wittle-bear-foundation-page">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <PawPrint className="h-12 w-12 text-pink-400" />
            <Heart className="h-10 w-10 text-pink-500 fill-pink-500 animate-pulse" />
            <PawPrint className="h-12 w-12 text-pink-400 transform scale-x-[-1]" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-pink-500 to-amber-400 bg-clip-text text-transparent mb-4">
            The Wittle Bear Foundation
          </h1>
          <p className="text-xl text-pink-200/80 italic mb-2">
            In Loving Memory of Wittle Bear
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Providing shelter, hope, and love to homeless LGBTQ+ youth
            and helping animals find their forever homes.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12 border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-amber-500/5">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-pink-300">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  The Wittle Bear Foundation was created to honor the memory of a beloved companion
                  and extend that love to those who need it most. We believe everyone deserves
                  a safe place to call home and someone who cares.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our mission is twofold: to provide emergency shelter, resources, and support
                  to homeless LGBTQ+ youth who have been rejected by their families, and to
                  help shelter animals find loving homes where they'll be cherished.
                </p>
                <div className="flex items-center gap-2 text-pink-300">
                  <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />
                  <span className="font-medium">Because everyone deserves unconditional love.</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-500/20 to-amber-500/20 rounded-2xl p-8 text-center">
                <Heart className="h-20 w-20 text-pink-500 fill-pink-500 mx-auto mb-4" />
                <p className="text-2xl font-bold text-pink-300 mb-2">40%</p>
                <p className="text-muted-foreground">
                  of homeless youth identify as LGBTQ+
                </p>
                <Badge className="mt-4 bg-pink-500/20 text-pink-300 border-pink-500/30">
                  We're changing that
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Areas */}
        <h2 className="text-2xl font-bold mb-6 text-center">How We Help</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ImpactCard
            icon={Home}
            title="Emergency Shelter"
            description="Safe housing for LGBTQ+ youth in crisis situations"
            color="pink"
          />
          <ImpactCard
            icon={Users}
            title="Support Services"
            description="Counseling, job training, and life skills programs"
            color="pink"
          />
          <ImpactCard
            icon={PawPrint}
            title="Animal Rescue"
            description="Shelter partnerships and adoption assistance"
            color="amber"
          />
          <ImpactCard
            icon={HandHeart}
            title="Community"
            description="Building a network of care and acceptance"
            color="amber"
          />
        </div>

        {/* LGBTQ+ Youth Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-pink-500" />
              LGBTQ+ Youth Support Programs
            </CardTitle>
            <CardDescription>
              Comprehensive support for young people facing homelessness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-pink-400">
                  <Home className="h-5 w-5" />
                  <span className="font-semibold">Housing</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>Emergency shelter beds</li>
                  <li>Transitional housing</li>
                  <li>Permanent supportive housing</li>
                  <li>Housing first approach</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-pink-400">
                  <Heart className="h-5 w-5" />
                  <span className="font-semibold">Wellness</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>Mental health counseling</li>
                  <li>LGBTQ+ affirming care</li>
                  <li>Substance abuse support</li>
                  <li>Healthcare navigation</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-pink-400">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">Future Building</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li>Education assistance</li>
                  <li>Job training programs</li>
                  <li>Life skills workshops</li>
                  <li>Mentorship connections</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animal Rescue Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-amber-400" />
              Animal Rescue Initiative
            </CardTitle>
            <CardDescription>
              Helping shelter animals find loving forever homes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-muted-foreground mb-4">
                  In honor of Wittle Bear, we partner with animal shelters and rescue organizations
                  to help pets in need find their forever families. Every animal deserves love
                  and a safe home.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4 text-amber-400" />
                    Adoption fee assistance
                  </li>
                  <li className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4 text-amber-400" />
                    Shelter supply donations
                  </li>
                  <li className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4 text-amber-400" />
                    Spay/neuter program support
                  </li>
                  <li className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4 text-amber-400" />
                    Foster family network
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 text-center">
                <PawPrint className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  "Until one has loved an animal, a part of one's soul remains unawakened."
                </p>
                <p className="text-sm text-amber-300 mt-2">- Anatole France</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How BoyFanz Supports */}
        <Card className="mb-12 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              BoyFanz Partnership
            </CardTitle>
            <CardDescription>
              How our platform supports The Wittle Bear Foundation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3 text-primary">Ongoing Support</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 mt-0.5 text-accent" />
                    <span>A portion of platform profits directly supports the foundation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 mt-0.5 text-accent" />
                    <span>Creator donation matching programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="h-4 w-4 mt-0.5 text-accent" />
                    <span>Community fundraising events</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 mt-0.5 text-accent" />
                    <span>Awareness campaigns during Pride Month</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-secondary">By The Numbers</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-pink-400">100+</p>
                    <p className="text-xs text-muted-foreground">Youth Housed</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">250+</p>
                    <p className="text-xs text-muted-foreground">Pets Adopted</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary">50+</p>
                    <p className="text-xs text-muted-foreground">Shelter Partners</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-accent">$500K+</p>
                    <p className="text-xs text-muted-foreground">Donated</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Involved */}
        <h2 className="text-2xl font-bold mb-6 text-center">Get Involved</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <Heart className="h-10 w-10 mx-auto mb-4 text-pink-500 fill-pink-500" />
              <h3 className="font-semibold mb-2">Donate</h3>
              <p className="text-sm text-muted-foreground mb-4">
                100% of donations go directly to our programs
              </p>
              <Button className="w-full bg-pink-500 hover:bg-pink-600">
                Make a Donation
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Volunteer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share your time and skills to help our cause
              </p>
              <Button variant="outline" className="w-full">
                Join Our Team
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-amber-400" />
              <h3 className="font-semibold mb-2">Spread the Word</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Follow and share our mission on social media
              </p>
              <Button variant="outline" className="w-full">
                Follow Us
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-pink-500/10 to-amber-500/10 border-pink-500/20">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-pink-500 fill-pink-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Contact The Foundation</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              For questions about our programs, partnership opportunities, or to request assistance,
              please reach out to us.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <Badge variant="outline" className="text-sm py-2 px-4 border-pink-500/30">
                <Mail className="h-4 w-4 mr-2" />
                foundation@fanzunlimited.com
              </Badge>
              <Badge variant="outline" className="text-sm py-2 px-4 border-pink-500/30">
                <MapPin className="h-4 w-4 mr-2" />
                Sheridan, WY
              </Badge>
            </div>
            <Link href="/contact">
              <Button variant="outline" className="border-pink-500/30 hover:bg-pink-500/10">
                <Mail className="h-4 w-4 mr-2" />
                Contact Us
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-12 text-muted-foreground">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <PawPrint className="h-5 w-5 text-pink-400" />
            <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
            <PawPrint className="h-5 w-5 text-pink-400 transform scale-x-[-1]" />
          </div>
          <p className="text-sm">
            The Wittle Bear Foundation is a charitable initiative of Fanz Unlimited Network LLC.
          </p>
          <p className="text-xs mt-1 text-pink-300/60">
            In loving memory of Wittle Bear, who taught us the meaning of unconditional love.
          </p>
        </div>
      </div>
    </div>
  );
}
