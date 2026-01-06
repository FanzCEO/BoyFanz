import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  BookOpen,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function LegalEthicsPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Scale className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Legal Library & Ethics Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our commitment to legal compliance and ethical business practices
          </p>
          <Badge variant="outline" className="mt-4">
            Last Updated: January 2026
          </Badge>
        </div>

        {/* Legal Compliance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Legal Compliance Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              BoyFanz operates in full compliance with all applicable federal, state, and local laws
              governing adult content platforms.
            </p>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">18 U.S.C. § 2257 Compliance</h4>
                <p>
                  We maintain strict records of age verification and consent documentation for all
                  performers appearing in content on our platform, in accordance with federal recordkeeping requirements.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">DMCA Compliance</h4>
                <p>
                  We respond promptly to valid Digital Millennium Copyright Act (DMCA) takedown notices
                  and maintain a registered DMCA agent.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Payment Card Industry (PCI) Compliance</h4>
                <p>
                  All payment processing meets PCI-DSS standards for secure handling of payment card data.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Data Protection Laws</h4>
                <p>
                  We comply with GDPR, CCPA, and other applicable data protection regulations to protect user privacy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ethical Standards */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Ethical Business Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Consent & Autonomy</h4>
                <p>
                  We prioritize performer consent and autonomy. Creators maintain full control over
                  their content, pricing, and subscriber interactions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Fair Compensation</h4>
                <p>
                  Creators receive 85% of revenue generated from their content, with transparent
                  payout schedules and no hidden fees.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Safety First</h4>
                <p>
                  We provide resources, support, and tools to help creators maintain their safety
                  and well-being while using the platform.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Zero Tolerance for Exploitation</h4>
                <p>
                  We have zero tolerance for human trafficking, coercion, or exploitation.
                  Suspicious activity is reported to the National Center for Missing & Exploited Children (NCMEC).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Resources */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Legal Resource Library
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Access our comprehensive legal documentation:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><a href="/terms" className="text-primary hover:underline">Terms of Service</a></li>
              <li><a href="/privacy" className="text-primary hover:underline">Privacy Policy</a></li>
              <li><a href="/content-policy" className="text-primary hover:underline">Content Management Policy</a></li>
              <li><a href="/model-release-star" className="text-primary hover:underline">Adult Star Model Release Form</a></li>
              <li><a href="/model-release-costar" className="text-primary hover:underline">Adult Co-Star Model Release Form</a></li>
              <li><a href="/complaint-policy" className="text-primary hover:underline">Complaint Policy</a></li>
              <li><a href="/transaction-policy" className="text-primary hover:underline">Transaction & Chargeback Policy</a></li>
              <li><a href="/cancellation" className="text-primary hover:underline">Cancellation Policy</a></li>
            </ul>
          </CardContent>
        </Card>

        {/* Law Enforcement Cooperation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Law Enforcement Cooperation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We cooperate fully with law enforcement agencies investigating illegal activity.
              Valid legal requests for information are processed in accordance with applicable law.
            </p>
            <p>
              We maintain detailed audit logs and 2257 records available for lawful inspection.
            </p>
          </CardContent>
        </Card>

        {/* Reporting Violations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Reporting Legal or Ethical Violations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>If you become aware of content or activity that may violate our legal or ethical standards:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Report content violations using the in-platform reporting tools</li>
              <li>Contact our compliance team at <span className="text-foreground">compliance@boyfanz.com</span></li>
              <li>Submit a formal complaint through our <a href="/complaint-policy" className="text-primary hover:underline">complaint process</a></li>
              <li>For emergencies or illegal content, contact law enforcement immediately</li>
            </ul>
          </CardContent>
        </Card>

        {/* Independent Audits */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Transparency & Accountability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We conduct regular internal audits of our compliance procedures and maintain
              transparency in our business operations.
            </p>
            <p>
              Our 2257 records custodian information is publicly available and our
              compliance documentation is available for lawful inspection.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
