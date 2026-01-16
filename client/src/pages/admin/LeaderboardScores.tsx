import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { Trophy, TrendingUp, Award, Star } from "lucide-react";

export default function LeaderboardScores() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-400 flex items-center gap-2">
          <Trophy className="h-8 w-8" />
          Leaderboard Scores
        </h1>
        <p className="text-gray-400 mt-2">Top creators and engagement metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-slate-500/20">
          <CardHeader>
            <CardTitle className="text-slate-400 text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Earners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-500/20">#{i}</Badge>
                    <span>Creator {i}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">${(10000 - i * 1000).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-slate-500/20">
          <CardHeader>
            <CardTitle className="text-slate-400 text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Most Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-500/20">#{i}</Badge>
                    <span>Creator {i}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">{(5000 - i * 500).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-slate-500/20">
          <CardHeader>
            <CardTitle className="text-slate-400 text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Most Engaged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-slate-500/20">#{i}</Badge>
                    <span>Creator {i}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">{(95 - i * 5)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
