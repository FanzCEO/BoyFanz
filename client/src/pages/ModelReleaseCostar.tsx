import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck,
  Shield,
  AlertTriangle,
  CheckCircle,
  Users
} from "lucide-react";

export default function ModelReleaseCostar() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Adult Co-Star Model Release
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            2257 Compliance Agreement for Co-Performers with Fanz™ Unlimited Network LLC
          </p>
          <Badge variant="outline" className="mt-4">
            Last Updated: January 2026
          </Badge>
        </div>

        {/* Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Co-Star Model Release Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              This model release form is required for all co-performers (co-stars) appearing in
              content created by another creator on BoyFanz. It ensures compliance with 18 U.S.C. § 2257
              recordkeeping requirements.
            </p>
            <p className="font-semibold text-foreground">
              Important: Even if you're not the primary creator, you must complete this release if you appear in adult content.
            </p>
          </CardContent>
        </Card>

        {/* Who Needs This */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Who Needs This Release?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>You need to complete the Co-Star Model Release if:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You appear in content created by another BoyFanz creator</li>
              <li>You participate in collaborative content</li>
              <li>You are featured in custom content requests</li>
              <li>You appear in any sexually explicit material on the platform</li>
            </ul>

            <div className="bg-info/10 border border-info/20 rounded-lg p-4 mt-4">
              <p className="text-info-foreground font-semibold">Note:</p>
              <p className="text-sm mt-1">
                If you are creating your own content as the primary performer, you need the{" "}
                <a href="/model-release-star" className="text-primary hover:underline">Adult Star Model Release</a> instead.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Required Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Required Information & Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>To complete the Co-Star Model Release, you must provide:</p>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Personal Information</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Full legal name (as appears on government ID)</li>
                  <li>All aliases, stage names, or screen names used</li>
                  <li>Date of birth</li>
                  <li>Current address</li>
                  <li>Contact information (email, phone)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Government-Issued ID</h4>
                <p>Clear copy of one of the following:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Driver's license</li>
                  <li>Passport</li>
                  <li>State-issued ID card</li>
                  <li>Other government-issued photo ID with date of birth</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Identity Verification</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Selfie holding your ID for visual comparison</li>
                  <li>Video verification (if requested)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Content Information</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name of primary creator you're collaborating with</li>
                  <li>Description of content you'll appear in</li>
                  <li>Date(s) content was/will be filmed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rights Granted */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rights and Licenses Granted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>By signing this release, you grant Fanz™ Unlimited Network LLC and the primary creator:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Right to host, store, and distribute content featuring your appearance</li>
              <li>Right to use your stage name and likeness in connection with the content</li>
              <li>Right to monetize the content (compensation terms agreed separately with creator)</li>
              <li>Right to maintain 2257 records as required by law</li>
            </ul>
            <p className="mt-4 font-semibold text-foreground">
              Note: Revenue sharing arrangements are between you and the primary creator, not BoyFanz.
            </p>
          </CardContent>
        </Card>

        {/* Co-Star Certifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Co-Star Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p className="font-semibold text-foreground">You certify that:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You are at least 18 years of age</li>
              <li>All information provided is true and accurate</li>
              <li>You voluntarily consent to appear in the content</li>
              <li>You understand the content will be publicly distributed</li>
              <li>You have not been coerced or forced to participate</li>
              <li>You understand you may not directly profit from the content (unless agreed with creator)</li>
              <li>You have reached agreement with the primary creator regarding your participation</li>
            </ul>
          </CardContent>
        </Card>

        {/* 2257 Compliance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>18 U.S.C. § 2257 Compliance Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              All records required by 18 U.S.C. § 2257 and 28 C.F.R. 75 for co-performers are kept
              by the following Custodian of Records:
            </p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="font-semibold text-foreground">Custodian of Records</p>
              <p className="mt-2">Fanz Unlimited Network (FUN) L.L.C.</p>
              <p>Compliance Department</p>
              <p>30 N Gould St #45302</p>
              <p>Sheridan, Wyoming 82801</p>
              <p>United States</p>
            </div>
            <p className="mt-4">
              Your 2257 documentation will be maintained alongside the primary creator's records
              for all content you appear in.
            </p>
          </CardContent>
        </Card>

        {/* Content Removal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Consent Revocation & Content Removal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Revoking Consent</h4>
                <p>
                  You may request removal of content featuring your appearance at any time by
                  contacting <span className="text-foreground">compliance@boyfanz.com</span>.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Removal Process</h4>
                <p>
                  Upon receiving your request, we will remove the content within 48 hours.
                  The primary creator will be notified and content will be made inaccessible.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Record Retention</h4>
                <p>
                  2257 compliance records will be maintained for 7 years after content removal
                  as required by federal law.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Complete */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              How to Complete This Release
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>The Co-Star Model Release can be completed in two ways:</p>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Option 1: Creator Invites You</h4>
                <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                  <li>Receive email invitation from the creator</li>
                  <li>Click the verification link</li>
                  <li>Upload your ID and complete verification</li>
                  <li>Review and sign the co-star release</li>
                  <li>Wait for approval (typically 24-48 hours)</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Option 2: Submit Directly</h4>
                <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                  <li>Navigate to Release Forms in your account</li>
                  <li>Select "Co-Star Model Release"</li>
                  <li>Enter creator information and upload documentation</li>
                  <li>Review and electronically sign the release</li>
                  <li>Wait for verification approval</li>
                </ol>
              </div>
            </div>

            <p className="mt-4 font-semibold text-warning">
              Content featuring co-stars cannot be published until all co-star releases are approved.
            </p>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Questions About Co-Star Release?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              If you have questions about the Co-Star Model Release or 2257 compliance,
              contact our compliance team at <span className="text-foreground">compliance@boyfanz.com</span> or
              visit our <a href="/help" className="text-primary hover:underline">Help Center</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
