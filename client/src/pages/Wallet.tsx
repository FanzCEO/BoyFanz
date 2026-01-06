import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, History } from "lucide-react";

export default function Wallet() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <WalletIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">Manage your funds and payment methods</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0.00</p>
            <Button size="sm" className="mt-4 w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Funds
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0.00</p>
            <p className="text-xs text-muted-foreground mt-2">Clears in 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Lifetime Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0.00</p>
            <p className="text-xs text-muted-foreground mt-2">Since joining</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Button variant="outline" className="h-20 flex-col gap-2">
          <ArrowUpRight className="h-5 w-5" />
          <span>Withdraw</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <ArrowDownLeft className="h-5 w-5" />
          <span>Deposit</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <CreditCard className="h-5 w-5" />
          <span>Cards</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <History className="h-5 w-5" />
          <span>History</span>
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
