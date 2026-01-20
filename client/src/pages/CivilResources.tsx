import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Phone,
  Home,
  Users,
  Shield,
  Utensils,
  Briefcase,
  GraduationCap,
  Activity,
  MessageCircle,
  ExternalLink,
  MapPin,
  Clock,
  Globe,
  Pill,
  Waves,
  Rainbow
} from "lucide-react";

interface Resource {
  name: string;
  description: string;
  phone?: string;
  website?: string;
  hours?: string;
  type: string;
}

const ResourceCard = ({ resource }: { resource: Resource }) => (
  <Card className="bg-gray-900 border-cyan-500/20 hover:border-cyan-500/40 transition-all">
    <CardHeader>
      <CardTitle className="text-cyan-400 text-lg">{resource.name}</CardTitle>
      <CardDescription className="text-gray-400">{resource.description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {resource.phone && (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-cyan-400" />
          <a href={`tel:${resource.phone}`} className="text-white hover:text-cyan-400">
            {resource.phone}
          </a>
        </div>
      )}
      {resource.website && (
        <div className="flex items-center gap-2 text-sm">
          <Globe className="h-4 w-4 text-cyan-400" />
          <a
            href={resource.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-cyan-400 flex items-center gap-1"
          >
            Visit Website
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
      {resource.hours && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          {resource.hours}
        </div>
      )}
      <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
        {resource.type}
      </Badge>
    </CardContent>
  </Card>
);

export default function CivilResources() {
  const crisisResources: Resource[] = [
    {
      name: "988 Suicide & Crisis Lifeline",
      description: "24/7 free and confidential support for people in distress",
      phone: "988",
      website: "https://988lifeline.org",
      hours: "24/7",
      type: "Crisis Support"
    },
    {
      name: "Trevor Project (LGBTQ+ Youth)",
      description: "Crisis intervention and suicide prevention for LGBTQ+ young people",
      phone: "1-866-488-7386",
      website: "https://www.thetrevorproject.org",
      hours: "24/7",
      type: "LGBTQ+ Crisis"
    },
    {
      name: "Trans Lifeline",
      description: "Peer support hotline run by and for trans people",
      phone: "1-877-565-8860",
      website: "https://translifeline.org",
      hours: "8am-2am PT",
      type: "Trans Support"
    },
    {
      name: "RAINN (Sexual Assault Hotline)",
      description: "Confidential support for survivors of sexual assault",
      phone: "1-800-656-4673",
      website: "https://www.rainn.org",
      hours: "24/7",
      type: "Sexual Assault"
    },
    {
      name: "National Domestic Violence Hotline",
      description: "Support for domestic violence survivors",
      phone: "1-800-799-7233",
      website: "https://www.thehotline.org",
      hours: "24/7",
      type: "Domestic Violence"
    }
  ];

  const lgbtqResources: Resource[] = [
    {
      name: "The LGBT National Help Center",
      description: "Peer counseling, information, and local resources",
      phone: "1-888-843-4564",
      website: "https://www.lgbthotline.org",
      hours: "1pm-9pm PT Mon-Fri, 9am-2pm Sat",
      type: "LGBTQ+ Support"
    },
    {
      name: "PFLAG",
      description: "Support for LGBTQ+ people, families, and allies",
      website: "https://pflag.org",
      type: "Family Support"
    },
    {
      name: "GLAAD",
      description: "LGBTQ+ media advocacy and cultural change",
      website: "https://www.glaad.org",
      type: "Advocacy"
    },
    {
      name: "Human Rights Campaign",
      description: "Civil rights organization for LGBTQ+ equality",
      website: "https://www.hrc.org",
      type: "Civil Rights"
    },
    {
      name: "GLSEN",
      description: "Creating safe schools for LGBTQ+ youth",
      website: "https://www.glsen.org",
      type: "Education"
    }
  ];

  const recoveryResources: Resource[] = [
    {
      name: "RecoveryFanz.com",
      description: "FREE platform by FANZ for recovery support and community (our gift to you)",
      website: "https://recoveryfanz.com",
      hours: "24/7 Community Access",
      type: "Recovery Platform"
    },
    {
      name: "SAMHSA National Helpline",
      description: "Treatment referral and information service",
      phone: "1-800-662-4357",
      website: "https://www.samhsa.gov",
      hours: "24/7",
      type: "Substance Abuse"
    },
    {
      name: "AA (Alcoholics Anonymous)",
      description: "Find local AA meetings and support",
      website: "https://www.aa.org",
      type: "Alcohol Recovery"
    },
    {
      name: "NA (Narcotics Anonymous)",
      description: "Find local NA meetings and support",
      website: "https://www.na.org",
      type: "Drug Recovery"
    },
    {
      name: "SMART Recovery",
      description: "Self-empowering addiction recovery support",
      website: "https://www.smartrecovery.org",
      type: "Recovery Support"
    }
  ];

  const housingFoodResources: Resource[] = [
    {
      name: "211 (Community Resources)",
      description: "Find local food banks, shelters, and assistance",
      phone: "211",
      website: "https://www.211.org",
      hours: "24/7",
      type: "General Assistance"
    },
    {
      name: "Feeding America",
      description: "Locate food banks across the United States",
      website: "https://www.feedingamerica.org/find-your-local-foodbank",
      type: "Food Assistance"
    },
    {
      name: "National Coalition for the Homeless",
      description: "Resources and advocacy for homeless individuals",
      website: "https://nationalhomeless.org",
      type: "Housing Support"
    },
    {
      name: "SNAP (Food Stamps)",
      description: "Apply for food assistance benefits",
      website: "https://www.fns.usda.gov/snap",
      type: "Food Benefits"
    },
    {
      name: "The Ali Forney Center (LGBTQ+ Youth Housing)",
      description: "Housing and support for LGBTQ+ homeless youth",
      website: "https://www.aliforneycenter.org",
      phone: "1-212-222-3427",
      type: "LGBTQ+ Housing"
    }
  ];

  const healthMentalResources: Resource[] = [
    {
      name: "NAMI (Mental Health)",
      description: "Mental health education, support, and advocacy",
      phone: "1-800-950-6264",
      website: "https://www.nami.org",
      hours: "10am-10pm ET Mon-Fri",
      type: "Mental Health"
    },
    {
      name: "Planned Parenthood",
      description: "Sexual health care and education",
      website: "https://www.plannedparenthood.org",
      type: "Sexual Health"
    },
    {
      name: "FOLX Health (LGBTQ+ Healthcare)",
      description: "Telehealth for LGBTQ+ community including HRT",
      website: "https://www.folxhealth.com",
      type: "LGBTQ+ Healthcare"
    },
    {
      name: "Plume (Trans Healthcare)",
      description: "Affordable gender-affirming hormone therapy",
      website: "https://getplume.co",
      type: "Trans Healthcare"
    },
    {
      name: "Psychology Today",
      description: "Find LGBTQ+-friendly therapists near you",
      website: "https://www.psychologytoday.com/us/therapists/gay",
      type: "Therapy"
    }
  ];

  const legalResources: Resource[] = [
    {
      name: "Lambda Legal",
      description: "Legal advocacy for LGBTQ+ rights and HIV+",
      phone: "1-866-542-8336",
      website: "https://www.lambdalegal.org",
      type: "Legal Aid"
    },
    {
      name: "National Center for Transgender Equality",
      description: "Policy advocacy and legal resources for trans people",
      website: "https://transequality.org",
      type: "Trans Legal"
    },
    {
      name: "ACLU",
      description: "Civil liberties and rights protection",
      website: "https://www.aclu.org",
      type: "Civil Rights"
    },
    {
      name: "Transgender Law Center",
      description: "Legal services for transgender community",
      website: "https://transgenderlawcenter.org",
      type: "Trans Legal"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Rainbow className="h-10 w-10 text-cyan-400" />
            <Heart className="h-10 w-10 text-pink-400" />
          </div>
          <h1 className="text-4xl font-bold text-cyan-400 mb-4">
            Civil Resources & Community Support
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            FREE resources for LGBTQ+ community, recovery support, crisis assistance, food/housing help,
            healthcare, and legal aid. We're here for you, always.
          </p>
        </div>

        {/* Featured Resource */}
        <Card className="bg-gradient-to-r from-cyan-900/40 to-pink-900/40 border-cyan-500/50 mb-8">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-pink-400" />
            <h2 className="text-2xl font-bold text-white mb-2">RecoveryFanz.com</h2>
            <p className="text-gray-300 mb-4">
              Our FREE recovery platform - FANZ's gift to you. 24/7 community support, resources,
              and a safe space for your journey.
            </p>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-pink-500"
              onClick={() => window.open('https://recoveryfanz.com', '_blank')}
            >
              Visit RecoveryFanz.com
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Resources Tabs */}
        <Tabs defaultValue="crisis" className="space-y-6">
          <TabsList className="bg-gray-900 border border-cyan-500/20 grid grid-cols-3 md:grid-cols-6 gap-2">
            <TabsTrigger value="crisis">Crisis</TabsTrigger>
            <TabsTrigger value="lgbtq">LGBTQ+</TabsTrigger>
            <TabsTrigger value="recovery">Recovery</TabsTrigger>
            <TabsTrigger value="housing">Housing/Food</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>

          <TabsContent value="crisis" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-red-400" />
              <h2 className="text-2xl font-bold text-white">Crisis Support - Immediate Help</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crisisResources.map((resource) => (
                <ResourceCard key={resource.name} resource={resource} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lgbtq" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Rainbow className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">LGBTQ+ Support & Advocacy</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lgbtqResources.map((resource) => (
                <ResourceCard key={resource.name} resource={resource} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recovery" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Waves className="h-6 w-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Recovery & Sobriety Support</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recoveryResources.map((resource) => (
                <ResourceCard key={resource.name} resource={resource} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="housing" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-6 w-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Housing & Food Assistance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {housingFoodResources.map((resource) => (
                <ResourceCard key={resource.name} resource={resource} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-6 w-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">Healthcare & Mental Health</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthMentalResources.map((resource) => (
                <ResourceCard key={resource.name} resource={resource} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-6 w-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Legal Aid & Advocacy</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {legalResources.map((resource) => (
                <ResourceCard key={resource.name} resource={resource} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Message */}
        <Card className="bg-gray-900 border-cyan-500/20 mt-8">
          <CardContent className="p-6 text-center">
            <Heart className="h-8 w-8 mx-auto mb-3 text-pink-400" />
            <p className="text-gray-400">
              You are valued. You are loved. You are not alone. These resources are always here for you,
              and so is the FANZ community. 🏳️‍🌈🏳️‍⚧️
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
