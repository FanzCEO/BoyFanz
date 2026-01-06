import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Download, Calendar, TrendingUp, Users } from "lucide-react";

export default function PaymentsReceived() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold">Payments Received</h1>
            <p className="text-muted-foreground">Track all incoming payments</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$0.00</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$0.00</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$0.00</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">All Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">$0.00</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="subscription">Subscriptions</SelectItem>
            <SelectItem value="tip">Tips</SelectItem>
            <SelectItem value="ppv">PPV</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="30">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payments received yet</p>
            <p className="text-sm">Your earnings from subscriptions, tips, and PPV will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
