import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  FileText,
  Clock,
  MessageSquare,
  CheckCircle,
  Shield
} from "lucide-react";

export default function ComplaintPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <AlertTriangle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Complaint Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How to report issues and our complaint resolution process
          </p>
          <Badge variant="outline" className="mt-4">
            Last Updated: January 2026
          </Badge>
        </div>

        {/* How to File a Complaint */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              How to File a Complaint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>You can file a complaint through several channels:</p>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Support Ticket System</h4>
                <p>
                  Submit a detailed complaint through our <a href="/help/tickets/new" className="text-primary hover:underline">support ticket system</a>.
                  This is the fastest way to receive assistance.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">In-Platform Reporting</h4>
                <p>
                  Use the "Report" button on any content or profile to flag policy violations.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Email</h4>
                <p>
                  Send complaints to <span className="text-foreground">complaints@boyfanz.com</span> with
                  detailed information about the issue.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Contact Form</h4>
                <p>
                  Fill out our <a href="/contact" className="text-primary hover:underline">contact form</a> and
                  select "Complaint" as the subject.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Types of Complaints */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Types of Complaints We Handle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Policy violations (content, conduct, or account violations)</li>
              <li>Copyright or intellectual property infringement (DMCA)</li>
              <li>Non-consensual content or privacy violations</li>
              <li>Payment or billing disputes</li>
              <li>Account access or security issues</li>
              <li>Harassment or abusive behavior</li>
              <li>Technical platform issues</li>
              <li>Customer service concerns</li>
            </ul>
          </CardContent>
        </Card>

        {/* Complaint Process */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Complaint Resolution Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Step 1: Acknowledgment (24 hours)</h4>
                <p>
                  You will receive an automated acknowledgment email with your complaint reference number.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Step 2: Initial Review (48-72 hours)</h4>
                <p>
                  Our support team will review your complaint and may request additional information.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Step 3: Investigation (5-10 business days)</h4>
                <p>
                  We will thoroughly investigate the issue, which may include reviewing logs, content,
                  and communications.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Step 4: Resolution (varies)</h4>
                <p>
                  We will take appropriate action and notify you of the outcome. Complex cases may
                  require additional time.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Step 5: Appeals (if applicable)</h4>
                <p>
                  If you disagree with our decision, you may appeal within 14 days of the resolution notice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What to Include */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              What to Include in Your Complaint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>To help us process your complaint quickly, please include:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your account username or email address</li>
              <li>A clear description of the issue</li>
              <li>When the issue occurred (date and time)</li>
              <li>URLs or screenshots of relevant content or profiles</li>
              <li>Any supporting documentation</li>
              <li>What outcome you are seeking</li>
            </ul>
          </CardContent>
        </Card>

        {/* Priority Complaints */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Priority Complaints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p className="font-semibold text-foreground">
              The following complaints receive immediate priority attention:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Content involving minors or suspected child exploitation</li>
              <li>Non-consensual content (revenge porn)</li>
              <li>Imminent threats of violence or self-harm</li>
              <li>Human trafficking or coercion</li>
              <li>Account security breaches</li>
            </ul>
            <p className="mt-4 font-semibold text-warning">
              For emergencies involving illegal activity or immediate danger, contact law enforcement
              (911 in the US) before filing a platform complaint.
            </p>
          </CardContent>
        </Card>

        {/* DMCA Takedowns */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Copyright (DMCA) Complaints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Copyright infringement complaints must include all information required by the DMCA.
              See our <a href="/terms" className="text-primary hover:underline">Terms of Service</a> for
              DMCA notice requirements and our designated agent information.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>When filing a complaint, you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Receive acknowledgment of your complaint</li>
              <li>Be kept informed of the investigation progress</li>
              <li>Receive a written explanation of our decision</li>
              <li>Appeal decisions you disagree with</li>
              <li>Request case escalation to senior support staff</li>
            </ul>
          </CardContent>
        </Card>

        {/* External Resources */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>External Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>If you are not satisfied with our complaint resolution, you may contact:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your local consumer protection agency</li>
              <li>The Better Business Bureau</li>
              <li>The Federal Trade Commission (FTC)</li>
              <li>State attorney general's office</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
