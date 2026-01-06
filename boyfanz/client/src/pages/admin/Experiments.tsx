import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  FlaskConical,
  Play,
  Pause,
  Plus,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useState } from "react";

interface Experiment {
  id: number;
  name: string;
  description: string;
  hypothesis: string;
  variants: any;
  targetAudience: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface ExperimentResults {
  experiment: Experiment;
  variants: {
    name: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    isWinner: boolean;
  }[];
  statisticalSignificance: number;
  recommendation: string;
}

export default function Experiments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [newExperiment, setNewExperiment] = useState({
    name: "",
    description: "",
    hypothesis: "",
    targetAudience: "all",
    variants: [
      { name: "Control", percentage: 50 },
      { name: "Variant A", percentage: 50 }
    ]
  });

  const { data: experiments, isLoading: experimentsLoading } = useQuery<Experiment[]>({
    queryKey: ["/api/admin/experiments"],
  });

  const { data: results, isLoading: resultsLoading } = useQuery<ExperimentResults>({
    queryKey: ["/api/admin/experiments", selectedExperiment?.id, "results"],
    enabled: !!selectedExperiment,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newExperiment) => {
      return apiRequest("POST", "/api/admin/experiments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiments"] });
      setShowNewDialog(false);
      setNewExperiment({
        name: "",
        description: "",
        hypothesis: "",
        targetAudience: "all",
        variants: [
          { name: "Control", percentage: 50 },
          { name: "Variant A", percentage: 50 }
        ]
      });
      toast({ title: "Experiment created", description: "Your A/B test has been created successfully." });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ experimentId, action }: { experimentId: number; action: string }) => {
      return apiRequest("POST", `/api/admin/experiments/${experimentId}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experiments"] });
      toast({ title: "Status updated", description: "Experiment status has been updated." });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-500";
      case "paused": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      case "draft": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const runningExperiments = experiments?.filter(e => e.status === "running") || [];
  const completedExperiments = experiments?.filter(e => e.status === "completed") || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">A/B Testing & Experiments</h1>
          <p className="text-muted-foreground">Create and manage platform experiments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/experiments"] })} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Experiment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Experiment</DialogTitle>
                <DialogDescription>
                  Set up a new A/B test to optimize platform features
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Experiment Name</Label>
                  <Input
                    placeholder="e.g., New Checkout Flow Test"
                    value={newExperiment.name}
                    onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="What does this experiment test?"
                    value={newExperiment.description}
                    onChange={(e) => setNewExperiment({ ...newExperiment, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Hypothesis</Label>
                  <Textarea
                    placeholder="We believe that... will result in..."
                    value={newExperiment.hypothesis}
                    onChange={(e) => setNewExperiment({ ...newExperiment, hypothesis: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                <Button onClick={() => createMutation.mutate(newExperiment)}>Create Experiment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Total Experiments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiments?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Play className="h-4 w-4 text-green-500" />
              Running
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{runningExperiments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{completedExperiments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Total Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">-</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Experiments List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Experiments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {experimentsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">Loading experiments...</TableCell>
                    </TableRow>
                  ) : experiments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">No experiments found</TableCell>
                    </TableRow>
                  ) : (
                    experiments?.map((experiment) => (
                      <TableRow
                        key={experiment.id}
                        className={`cursor-pointer hover:bg-muted ${selectedExperiment?.id === experiment.id ? "bg-muted" : ""}`}
                        onClick={() => setSelectedExperiment(experiment)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{experiment.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {experiment.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(experiment.status)}>{experiment.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {Array.isArray(experiment.variants) ? experiment.variants.length : 2} variants
                        </TableCell>
                        <TableCell>{new Date(experiment.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {experiment.status === "draft" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  statusMutation.mutate({ experimentId: experiment.id, action: "start" });
                                }}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                            {experiment.status === "running" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  statusMutation.mutate({ experimentId: experiment.id, action: "stop" });
                                }}
                              >
                                <Pause className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Experiment Details */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {selectedExperiment ? "Experiment Results" : "Select Experiment"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedExperiment ? (
                <div className="text-center py-8 text-muted-foreground">
                  Click on an experiment to view results
                </div>
              ) : resultsLoading ? (
                <div className="text-center py-8">Loading results...</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{selectedExperiment.name}</h3>
                    <Badge className={getStatusColor(selectedExperiment.status)}>{selectedExperiment.status}</Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Hypothesis</h4>
                    <p className="text-sm text-muted-foreground">{selectedExperiment.hypothesis || "No hypothesis defined"}</p>
                  </div>

                  {results?.variants && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Variant Performance</h4>
                      {results.variants.map((variant, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium flex items-center gap-2">
                              {variant.name}
                              {variant.isWinner && <Badge className="bg-green-500 text-xs">Winner</Badge>}
                            </span>
                            <span className="text-sm font-bold">{variant.conversionRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={variant.conversionRate} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{variant.participants} participants</span>
                            <span>{variant.conversions} conversions</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results?.statisticalSignificance !== undefined && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Statistical Significance</h4>
                      <div className="flex items-center gap-2">
                        <Progress value={results.statisticalSignificance} className="h-2 flex-1" />
                        <span className="text-sm font-bold">{results.statisticalSignificance}%</span>
                      </div>
                      {results.statisticalSignificance >= 95 && (
                        <p className="text-xs text-green-600 mt-1">Results are statistically significant!</p>
                      )}
                    </div>
                  )}

                  {results?.recommendation && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Recommendation</h4>
                      <p className="text-sm text-blue-700">{results.recommendation}</p>
                    </div>
                  )}

                  {selectedExperiment.startDate && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Started: {new Date(selectedExperiment.startDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
