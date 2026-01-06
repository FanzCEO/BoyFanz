import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, ArrowUpRight, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function Withdrawals() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <ArrowUpRight className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Withdrawals</h1>
          <p className="text-muted-foreground">Request a withdrawal of your earnings</p>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="mb-8 bg-gradient-to-br from-primary/20 to-primary/5">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Available for Withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">$0.00</p>
          <p className="text-sm text-muted-foreground mt-2">Minimum withdrawal: $20.00</p>
        </CardContent>
      </Card>

      {/* Withdrawal Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
          <CardDescription>Choose your payout method and amount</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Payout Method</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select payout method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Transfer (ACH)</SelectItem>
                <SelectItem value="wire">International Wire</SelectItem>
                <SelectItem value="paxum">Paxum</SelectItem>
                <SelectItem value="cosmo">Cosmo Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input type="number" placeholder="0.00" className="pl-7" />
            </div>
          </div>
          <Button className="w-full" disabled>
            <Wallet className="h-4 w-4 mr-2" /> Request Withdrawal
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Withdrawals are processed within 3-5 business days
          </p>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No withdrawal history</p>
            <p className="text-sm">Your past withdrawals will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
