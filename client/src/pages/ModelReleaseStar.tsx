import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck,
  Shield,
  AlertTriangle,
  CheckCircle,
  User
} from "lucide-react";

export default function ModelReleaseStar() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <FileCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Adult Star Model Release
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            2257 Compliance Agreement with Fanz™ Unlimited Network LLC
          </p>
          <Badge variant="outline" className="mt-4">
            Last Updated: January 2026
          </Badge>
        </div>

        {/* Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Adult Star Model Release Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              This model release form is required for all primary performers (stars) creating adult
              content on BoyFanz. It ensures compliance with 18 U.S.C. § 2257 recordkeeping requirements.
            </p>
            <p className="font-semibold text-foreground">
              By submitting content to BoyFanz, you certify that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You are at least 18 years of age</li>
              <li>You consent to being depicted in sexually explicit content</li>
              <li>You have provided valid government-issued identification</li>
              <li>You grant BoyFanz rights to host and distribute your content</li>
            </ul>
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
            <p>To complete the Adult Star Model Release, you must provide:</p>

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
            </div>
          </CardContent>
        </Card>

        {/* Rights Granted */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rights and Licenses Granted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>By signing this release, you grant Fanz™ Unlimited Network LLC and BoyFanz:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Right to host, store, and distribute your content on the platform</li>
              <li>Right to use your stage name and likeness in connection with your content</li>
              <li>Right to process payments on your behalf</li>
              <li>Right to enforce copyright and DMCA takedowns on your behalf</li>
              <li>Right to maintain 2257 records as required by law</li>
            </ul>
            <p className="mt-4 font-semibold text-foreground">
              You retain ownership of your content and can revoke these rights by deleting your account.
            </p>
          </CardContent>
        </Card>

        {/* Performer Certifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Performer Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p className="font-semibold text-foreground">You certify that:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You are at least 18 years of age</li>
              <li>All information provided is true and accurate</li>
              <li>You have the right to grant the licenses described in this release</li>
              <li>Your content does not violate any third-party rights</li>
              <li>You appear in the content voluntarily with full consent</li>
              <li>You understand your content will be publicly accessible</li>
              <li>You understand you may be compensated based on platform terms</li>
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
              All records required by 18 U.S.C. § 2257 and 28 C.F.R. 75 are kept by the following
              Custodian of Records:
            </p>
            <div className="bg-muted p-4 rounded-lg mt-4">
              <p className="font-semibold text-foreground">Custodian of Records</p>
              <p className="mt-2">Fanz Unlimited Network (FUN) L.L.C.</p>
              <p>Compliance Department</p>
              <p>30 N Gould St #45302</p>
              <p>Sheridan, Wyoming 82801</p>
              <p>United States</p>
            </div>
          </CardContent>
        </Card>

        {/* Consent & Revocation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Consent & Revocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Ongoing Consent</h4>
                <p>
                  Your consent to this release continues as long as your content remains on the platform.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Revoking Consent</h4>
                <p>
                  You may revoke this release at any time by deleting your content and account.
                  Content will be removed within 24-48 hours, though cached copies may persist
                  temporarily.
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
            <p>
              This release is completed automatically during the creator verification process:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Navigate to Creator Dashboard → Verification</li>
              <li>Upload your government-issued ID</li>
              <li>Complete identity verification</li>
              <li>Review and electronically sign the model release</li>
              <li>Wait for verification approval (typically 24-48 hours)</li>
            </ol>

            <p className="mt-4 font-semibold text-warning">
              You cannot upload or sell adult content until this release is completed and approved.
            </p>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Questions About Model Release?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              If you have questions about the Adult Star Model Release or 2257 compliance,
              contact our compliance team at <span className="text-foreground">compliance@boyfanz.com</span> or
              visit our <a href="/help" className="text-primary hover:underline">Help Center</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
