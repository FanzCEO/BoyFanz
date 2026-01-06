import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  AlertTriangle,
  Shield,
  DollarSign,
  RefreshCw,
  Lock
} from "lucide-react";

export default function TransactionPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <CreditCard className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Transaction & Chargeback Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Payment processing, billing practices, and chargeback procedures
          </p>
          <Badge variant="outline" className="mt-4">
            Last Updated: January 2026
          </Badge>
        </div>

        {/* Payment Processing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Secure Payment Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              BoyFanz uses industry-leading payment processors to handle all transactions securely:
            </p>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Payment Methods Accepted</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Credit cards (Visa, Mastercard, American Express, Discover)</li>
                  <li>Debit cards</li>
                  <li>Digital wallets (Apple Pay, Google Pay)</li>
                  <li>Cryptocurrency (Bitcoin, Ethereum, USDT)</li>
                  <li>ACH bank transfers (for larger transactions)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Security Standards</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>PCI-DSS Level 1 compliant payment processing</li>
                  <li>256-bit SSL encryption for all transactions</li>
                  <li>Tokenization of payment information</li>
                  <li>3D Secure authentication for added security</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Practices */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Billing Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Subscription Billing</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Subscriptions renew automatically on your renewal date</li>
                  <li>You'll be charged the current subscription price at renewal</li>
                  <li>Email notifications are sent 3 days before renewal</li>
                  <li>Cancel anytime before renewal to avoid being charged</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">One-Time Purchases</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Tips, pay-per-view content, and custom requests are one-time charges</li>
                  <li>Charges appear immediately upon purchase</li>
                  <li>No recurring billing for one-time purchases</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Statement Descriptors</h4>
                <p>
                  Charges will appear on your statement as one of the following:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>"FANZNETWORK*BOYFANZ"</li>
                  <li>"FUN LLC - Digital Content"</li>
                  <li>"CCBill.com*BoyFanz" (for CCBill processed payments)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Failed Payments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Failed Payment Handling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>If a payment fails:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>You'll receive an email notification immediately</li>
              <li>We'll automatically retry the payment after 3 days</li>
              <li>If the retry fails, subscription access may be suspended</li>
              <li>Update your payment method to restore access</li>
              <li>After 14 days of failed payments, the subscription will be canceled</li>
            </ol>
          </CardContent>
        </Card>

        {/* Chargebacks */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-warning" />
              Chargeback Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <p className="text-warning font-semibold">Important: Contact Us Before Filing a Chargeback</p>
              <p className="text-sm mt-2">
                Initiating a chargeback without first contacting us may result in immediate
                account suspension and permanent ban from the platform.
              </p>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <h4 className="font-semibold text-foreground">What is a Chargeback?</h4>
                <p>
                  A chargeback occurs when you dispute a charge with your bank or card issuer,
                  requesting them to reverse the transaction.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">When Chargebacks Are Appropriate</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Unauthorized charges due to stolen card or account breach</li>
                  <li>You were charged but did not receive the service</li>
                  <li>Duplicate charges for the same purchase</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">When to Contact Us Instead</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You forgot you made the purchase</li>
                  <li>You want a refund for dissatisfaction</li>
                  <li>You don't recognize the charge descriptor</li>
                  <li>You want to cancel future charges</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chargeback Consequences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Consequences of Chargebacks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p className="font-semibold text-foreground">
              Filing a chargeback may result in:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Immediate suspension of your account while we investigate</li>
              <li>Loss of access to all purchased content</li>
              <li>Cancellation of all active subscriptions</li>
              <li>Permanent account termination if chargeback is deemed fraudulent</li>
              <li>Reporting to fraud prevention databases</li>
              <li>Legal action in cases of chargeback fraud</li>
            </ul>

            <p className="mt-4">
              If the chargeback is resolved in our favor, your account may be restored upon
              payment of the original charge plus any chargeback fees incurred ($25-50).
            </p>
          </CardContent>
        </Card>

        {/* Fraud Prevention */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Fraud Prevention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>We employ multiple fraud prevention measures:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Real-time fraud detection algorithms</li>
              <li>Address verification system (AVS)</li>
              <li>Card verification value (CVV) checks</li>
              <li>IP address and device fingerprinting</li>
              <li>Velocity checks for unusual spending patterns</li>
            </ul>

            <p className="mt-4">
              Suspicious transactions may be held for manual review or declined for security purposes.
            </p>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dispute Resolution Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>If you have a billing issue:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Contact our billing support at <span className="text-foreground">billing@boyfanz.com</span></li>
              <li>Provide your transaction ID and describe the issue</li>
              <li>We'll investigate within 2-3 business days</li>
              <li>If the charge was an error, we'll issue a refund immediately</li>
              <li>If you disagree with our decision, you may escalate to senior support</li>
            </ol>

            <p className="mt-4 font-semibold text-foreground">
              We resolve 95% of billing disputes within 48 hours without requiring chargebacks.
            </p>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Taxes & Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground">Sales Tax</h4>
                <p>
                  Sales tax may be charged based on your billing address location as required by law.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">Platform Fees</h4>
                <p>
                  All prices displayed include platform fees. There are no hidden charges.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground">International Transactions</h4>
                <p>
                  International cards may be subject to foreign transaction fees from your bank
                  (not charged by BoyFanz).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Billing Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>For billing questions or disputes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email: <span className="text-foreground">billing@boyfanz.com</span></li>
              <li>Support tickets: <a href="/help/tickets/new" className="text-primary hover:underline">Help Center</a></li>
              <li>Response time: Within 24 hours</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
