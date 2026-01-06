import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Database
} from "lucide-react";

export default function ContentPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Content Management Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Guidelines for content creation, moderation, and data governance on BoyFanz
          </p>
          <Badge variant="outline" className="mt-4">
            Last Updated: January 2026
          </Badge>
        </div>

        {/* Content Standards */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Acceptable Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>BoyFanz allows adult content that meets the following criteria:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All participants are 18 years or older with verified age documentation</li>
              <li>Content is created with full consent of all parties</li>
              <li>Proper 2257 compliance documentation is maintained</li>
              <li>Content does not violate platform rules or applicable laws</li>
              <li>Content is clearly labeled and categorized appropriately</li>
            </ul>
          </CardContent>
        </Card>

        {/* Prohibited Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Prohibited Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p className="font-semibold text-foreground">
              The following content is strictly prohibited and will result in immediate account termination:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Content involving minors or appearing to involve minors</li>
              <li>Non-consensual content or revenge porn</li>
              <li>Content depicting violence, gore, or extreme harm</li>
              <li>Bestiality or animal abuse</li>
              <li>Content promoting illegal activities</li>
              <li>Hate speech, harassment, or discriminatory content</li>
              <li>Content that violates intellectual property rights</li>
              <li>Misleading or fraudulent content</li>
            </ul>
          </CardContent>
        </Card>

        {/* Moderation Process */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Content Moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Automated Screening</h4>
                <p>All uploads are scanned using AI and hash-matching technology to detect prohibited content.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Human Review</h4>
                <p>Flagged content is reviewed by trained moderation staff within 24 hours.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">User Reports</h4>
                <p>Community members can report violations, which are prioritized for review.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Appeals Process</h4>
                <p>Creators can appeal moderation decisions through our support system.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Governance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Data Governance Procedures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Content Storage</h4>
                <p>All content is encrypted at rest and in transit using industry-standard protocols.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Access Controls</h4>
                <p>Content access is restricted based on subscription status and creator permissions.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Data Retention</h4>
                <p>Active content is retained indefinitely. Deleted content is purged within 30 days.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Compliance Records</h4>
                <p>2257 records are maintained for 7 years as required by federal law.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Backup & Recovery</h4>
                <p>Daily encrypted backups are maintained with 99.9% uptime guarantee.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enforcement */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Policy Enforcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Violations of this policy may result in:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Content removal</li>
              <li>Account warning</li>
              <li>Temporary account suspension</li>
              <li>Permanent account termination</li>
              <li>Reporting to law enforcement (for illegal content)</li>
            </ul>
            <p className="mt-4">
              The severity of enforcement depends on the nature and frequency of violations.
            </p>
          </CardContent>
        </Card>

        {/* Creator Responsibilities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Creator Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>As a creator on BoyFanz, you are responsible for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Obtaining and maintaining valid 2257 documentation for all performers</li>
              <li>Ensuring all content complies with platform policies</li>
              <li>Properly categorizing and tagging your content</li>
              <li>Responding to takedown requests promptly</li>
              <li>Maintaining accurate account and payment information</li>
              <li>Reporting any suspected policy violations</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
