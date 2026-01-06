import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  XCircle,
  DollarSign,
  Calendar,
  RotateCcw,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function CancellationPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <XCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Cancellation Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How to cancel subscriptions and understand our refund policy
          </p>
          <Badge variant="outline" className="mt-4">
            Last Updated: January 2026
          </Badge>
        </div>

        {/* Subscription Cancellation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              How to Cancel Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              You can cancel your subscriptions to creators at any time through your account settings.
              There are no cancellation fees.
            </p>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Steps to Cancel:</h4>
                <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                  <li>Navigate to your Subscriptions page</li>
                  <li>Find the creator subscription you want to cancel</li>
                  <li>Click "Cancel Subscription"</li>
                  <li>Confirm your cancellation</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">What Happens After Cancellation:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>You retain access to content until the end of your current billing period</li>
                  <li>You will not be charged again</li>
                  <li>You can re-subscribe at any time</li>
                  <li>Your messages and purchase history remain accessible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refund Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Refund Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">General Policy</h4>
                <p>
                  All subscription payments and content purchases are generally non-refundable.
                  This is because digital content is delivered immediately upon purchase.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Exceptions</h4>
                <p>Refunds may be granted in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Duplicate or erroneous charges (technical errors)</li>
                  <li>Content was not delivered as promised</li>
                  <li>Content violates platform policies</li>
                  <li>Unauthorized account access or fraudulent charges</li>
                  <li>Creator violated platform terms</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Refund Timeframe</h4>
                <p>
                  Refund requests must be submitted within 7 days of the charge.
                  Approved refunds are processed within 5-10 business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Content Requests */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Custom Content Request Cancellations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Custom content requests with escrow follow a different cancellation policy:</p>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Before Creator Accepts</h4>
                <p>Full refund available if creator has not yet accepted the request.</p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">After Creator Accepts, Before Delivery</h4>
                <p>
                  Cancellation requires mutual agreement. Platform may mediate disputes.
                  Creator may be entitled to partial compensation for work completed.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">After Delivery</h4>
                <p>
                  Payment is released to creator. Disputes handled through our dispute resolution process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Account Deletion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">How to Delete Your Account</h4>
                <p>
                  Navigate to Settings → Privacy & Data → Delete Account. This action is permanent.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">What Happens When You Delete:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>All active subscriptions are automatically canceled</li>
                  <li>Your profile and content become inaccessible</li>
                  <li>Personal data is deleted within 30 days (subject to legal retention requirements)</li>
                  <li>Some data may be retained for legal compliance (2257 records, financial records)</li>
                  <li>Transaction history may be retained for tax and accounting purposes</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Creator Accounts</h4>
                <p>
                  Creators must resolve all pending payouts and complete outstanding custom requests
                  before deleting their account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creator Cancellation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>If a Creator Deletes Their Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>If a creator you're subscribed to deletes their account:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You will not be charged again</li>
              <li>You may lose access to their content immediately</li>
              <li>No refunds for partial subscription periods</li>
              <li>Outstanding custom content requests may be refunded</li>
            </ul>
          </CardContent>
        </Card>

        {/* How to Request Refund */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              How to Request a Refund
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>To request a refund:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Contact our support team at <span className="text-foreground">billing@boyfanz.com</span></li>
              <li>Or create a support ticket at <a href="/help/tickets/new" className="text-primary hover:underline">Help Center</a></li>
              <li>Include your transaction ID, charge date, and reason for refund request</li>
              <li>Provide any relevant screenshots or documentation</li>
            </ol>

            <p className="mt-4">
              Refund requests are reviewed within 2-3 business days.
            </p>
          </CardContent>
        </Card>

        {/* Chargebacks */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Chargebacks Warning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p className="font-semibold text-warning">
              Please contact us before filing a chargeback with your bank.
            </p>
            <p>
              Initiating a chargeback instead of requesting a refund through our support team may
              result in immediate account suspension while we investigate. See our{" "}
              <a href="/transaction-policy" className="text-primary hover:underline">
                Transaction & Chargeback Policy
              </a>{" "}
              for more information.
            </p>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Have Questions?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              If you have questions about cancellations or refunds, please visit our{" "}
              <a href="/help" className="text-primary hover:underline">Help Center</a> or{" "}
              <a href="/contact" className="text-primary hover:underline">contact support</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
