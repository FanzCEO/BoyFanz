import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Plus, Trash2, CheckCircle2, Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Payments() {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved payment methods
  const { data: savedCards = [], refetch: refetchCards } = useQuery({
    queryKey: ['/api/payments/stripe/payment-methods'],
    queryFn: async () => {
      const response = await fetch('/api/payments/stripe/payment-methods', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      return data.paymentMethods || [];
    },
  });

  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    cardholderName: "",
    billingZip: ""
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/payments/stripe/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          cardNumber: cardForm.cardNumber.replace(/\s/g, ""),
          expMonth: cardForm.expMonth,
          expYear: cardForm.expYear,
          cvv: cardForm.cvv,
          cardholderName: cardForm.cardholderName,
          billingZip: cardForm.billingZip
        })
      });

      if (response.ok) {
        const data = await response.json();
        queryClient.invalidateQueries({ queryKey: ['/api/payments/stripe/payment-methods'] });
        setIsAddCardOpen(false);
        setCardForm({ cardNumber: "", expMonth: "", expYear: "", cvv: "", cardholderName: "", billingZip: "" });
        toast({ title: "Card added successfully", description: "Your payment method has been saved." });
      } else {
        const error = await response.json();
        toast({ title: "Failed to add card", description: error.message || "Please check your card details.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add payment method. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const response = await fetch(`/api/payments/stripe/payment-methods/${cardId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/payments/stripe/payment-methods'] });
        toast({ title: "Card removed", description: "Payment method has been deleted." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove card.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Payment Methods</h1>
            <p className="text-muted-foreground">Manage your payment cards</p>
          </div>
        </div>
        <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" /> Add Payment Card
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="Name on card"
                  value={cardForm.cardholderName}
                  onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardForm.cardNumber}
                  onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                  maxLength={19}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="expMonth">Month</Label>
                  <Input
                    id="expMonth"
                    placeholder="MM"
                    value={cardForm.expMonth}
                    onChange={(e) => setCardForm({ ...cardForm, expMonth: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                    maxLength={2}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expYear">Year</Label>
                  <Input
                    id="expYear"
                    placeholder="YY"
                    value={cardForm.expYear}
                    onChange={(e) => setCardForm({ ...cardForm, expYear: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                    maxLength={2}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="***"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    maxLength={4}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="billingZip">Billing ZIP Code</Label>
                <Input
                  id="billingZip"
                  placeholder="12345"
                  value={cardForm.billingZip}
                  onChange={(e) => setCardForm({ ...cardForm, billingZip: e.target.value })}
                  maxLength={10}
                  required
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Shield className="h-4 w-4" />
                <span>Your card is encrypted and processed securely. We never store your full card number.</span>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Card"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Saved Cards */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Saved Cards</CardTitle>
          <CardDescription>Cards saved for quick checkout</CardDescription>
        </CardHeader>
        <CardContent>
          {savedCards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved cards</p>
              <p className="text-sm">Add a card for faster purchases</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddCardOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Your First Card
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedCards.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">•••• •••• •••• {card.last4}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires {card.expMonth}/{card.expYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {card.isDefault && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Default</span>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Processors */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payment Processors</CardTitle>
          <CardDescription>Secure payment processing through industry-leading providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Primary Processor */}
            <div className="p-4 border-2 border-primary/50 rounded-lg bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">CCBill</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">CCBill</p>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Primary</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Credit/Debit Cards • All major cards accepted</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>

            {/* Other Card Processors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg flex items-center gap-3">
                <div className="h-10 w-16 bg-gradient-to-r from-green-600 to-teal-600 rounded flex items-center justify-center text-white font-bold text-xs">Bankful</div>
                <div>
                  <p className="font-medium text-sm">Bankful</p>
                  <p className="text-xs text-muted-foreground">Cards & Bank Transfer</p>
                </div>
              </div>
              <div className="p-3 border rounded-lg flex items-center gap-3">
                <div className="h-10 w-16 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center text-white font-bold text-xs">Epoch</div>
                <div>
                  <p className="font-medium text-sm">Epoch</p>
                  <p className="text-xs text-muted-foreground">Credit/Debit Cards</p>
                </div>
              </div>
              <div className="p-3 border rounded-lg flex items-center gap-3">
                <div className="h-10 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded flex items-center justify-center text-white font-bold text-xs">SegPay</div>
                <div>
                  <p className="font-medium text-sm">SegPay</p>
                  <p className="text-xs text-muted-foreground">Credit/Debit Cards</p>
                </div>
              </div>
              <div className="p-3 border rounded-lg flex items-center gap-3">
                <div className="h-10 w-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">Verotel</div>
                <div>
                  <p className="font-medium text-sm">Verotel</p>
                  <p className="text-xs text-muted-foreground">European Cards</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crypto Payments */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cryptocurrency Payments</CardTitle>
          <CardDescription>Pay with Bitcoin, Ethereum, and other cryptocurrencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 border rounded-lg flex items-center gap-4">
              <div className="h-12 w-20 bg-gradient-to-r from-blue-500 to-slate-500 rounded flex items-center justify-center text-white font-bold text-xs">NowPay</div>
              <div className="flex-1">
                <p className="font-medium">NOWPayments</p>
                <p className="text-xs text-muted-foreground">BTC, ETH, USDT, 100+ coins</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg flex items-center gap-4">
              <div className="h-12 w-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded flex items-center justify-center text-white font-bold text-xs">TripleA</div>
              <div className="flex-1">
                <p className="font-medium">Triple-A</p>
                <p className="text-xs text-muted-foreground">BTC, ETH, USDC, LTC</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg flex items-center gap-4">
              <div className="h-12 w-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded flex items-center justify-center text-white font-bold text-xs">CoinsPaid</div>
              <div className="flex-1">
                <p className="font-medium">CoinsPaid</p>
                <p className="text-xs text-muted-foreground">50+ cryptocurrencies</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg flex items-center gap-4">
              <div className="h-12 w-20 bg-gradient-to-r from-purple-500 to-violet-500 rounded flex items-center justify-center text-white font-bold text-xs">B2BinPay</div>
              <div className="flex-1">
                <p className="font-medium">B2BinPay</p>
                <p className="text-xs text-muted-foreground">Enterprise crypto gateway</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Secure & Discreet Billing</p>
              <p className="text-xs text-muted-foreground mt-1">
                All transactions are encrypted and processed through adult-friendly payment partners.
                Your billing statement will show a discreet charge description for privacy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
