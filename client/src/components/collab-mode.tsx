import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Handshake, Users, Calendar, FileSignature, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import type { Collaboration, Profile } from "@shared/schema";

export default function CollabMode() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openNewCollab, setOpenNewCollab] = useState(false);
  const [newCollabTitle, setNewCollabTitle] = useState("");
  const [newCollabDescription, setNewCollabDescription] = useState("");
  const [selectedCreatorId, setSelectedCreatorId] = useState("");

  // Fetch collaboration requests
  const { data: collaborations = [], isLoading } = useQuery<Collaboration[]>({
    queryKey: ["/api/collaborations"],
    enabled: !!user,
  });

  // Fetch available creators (excluding current user)
  const { data: availableCreators = [] } = useQuery<Profile[]>({
    queryKey: ["/api/profiles/discover"],
    enabled: !!user,
  });

  // Create collaboration mutation
  const createCollabMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/collaborations", {
        toUserId: selectedCreatorId,
        title: newCollabTitle,
        description: newCollabDescription,
        proposedDate: new Date(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Collaboration request sent!" });
      setOpenNewCollab(false);
      setNewCollabTitle("");
      setNewCollabDescription("");
      setSelectedCreatorId("");
      queryClient.invalidateQueries({ queryKey: ["/api/collaborations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send collaboration request",
        variant: "destructive"
      });
    },
  });

  // Update collaboration status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/collaborations/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collaborations"] });
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center text-white/60">Loading collaborations...</div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Creator Collaboration</h2>
          <p className="text-white/70">Connect with other creators, propose scenes, and build your network</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Collaboration Requests */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-pink-400" />
                  Collaboration Requests
                </h3>
                <Button
                  onClick={() => setOpenNewCollab(true)}
                  className="bg-yellow-300 text-black hover:bg-yellow-200 text-sm"
                  data-testid="button-new-collaboration"
                >
                  New Request
                </Button>
              </div>

              <div className="space-y-3">
                {collaborations.length === 0 ? (
                  <div className="text-white/60 text-sm text-center py-8">
                    No collaboration requests yet
                  </div>
                ) : (
                  collaborations.map((collab) => (
                    <div key={collab.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg" data-testid={`collaboration-${collab.id}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium" data-testid={`text-collab-title-${collab.id}`}>{collab.title}</div>
                        <div className="text-sm text-white/70" data-testid={`text-collab-description-${collab.id}`}>
                          {collab.description}
                        </div>
                        <div className="text-xs text-white/50 mt-1">
                          {new Date(collab.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {collab.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => updateStatusMutation.mutate({ id: collab.id, status: "declined" })}
                              data-testid={`button-decline-${collab.id}`}
                            >
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-500/20 border border-green-400/30 hover:bg-green-500/30"
                              onClick={() => updateStatusMutation.mutate({ id: collab.id, status: "accepted" })}
                              data-testid={`button-accept-${collab.id}`}
                            >
                              Accept
                            </Button>
                          </>
                        )}
                        {collab.status !== "pending" && (
                          <Badge
                            className={
                              collab.status === "accepted"
                                ? "bg-green-500/20 text-green-300 border-green-500/40"
                                : "bg-red-500/20 text-red-300 border-red-500/40"
                            }
                            data-testid={`status-${collab.id}`}
                          >
                            {collab.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Creators */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                Available Creators
              </h3>
              <div className="space-y-3">
                {availableCreators.length === 0 ? (
                  <div className="text-white/60 text-sm text-center py-8">
                    No creators available
                  </div>
                ) : (
                  availableCreators.slice(0, 5).map((creator) => (
                    <div key={creator.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg" data-testid={`creator-${creator.id}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        {creator.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium" data-testid={`text-creator-name-${creator.id}`}>
                          {creator.name}
                        </div>
                        <div className="text-sm text-white/70" data-testid={`text-creator-location-${creator.id}`}>
                          {creator.roles?.join(", ")} • {creator.city}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {creator.tags?.slice(0, 2).map((tag, i) => (
                            <Badge
                              key={i}
                              className="bg-pink-500/20 text-pink-100 border-pink-500/40 text-xs"
                              data-testid={`tag-${tag}-${creator.id}`}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-pink-500/20 border border-pink-400/30 hover:bg-pink-500/30"
                        onClick={() => {
                          setSelectedCreatorId(creator.userId);
                          setOpenNewCollab(true);
                        }}
                        data-testid={`button-connect-${creator.id}`}
                      >
                        Connect
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <Button className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 justify-start" data-testid="button-availability">
                <Calendar className="h-4 w-4 text-green-400" />
                <div>
                  <div className="font-medium">Share Availability</div>
                  <div className="text-xs text-white/60">Sync your calendar</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <Button className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 justify-start" data-testid="button-nda">
                <FileSignature className="h-4 w-4 text-yellow-400" />
                <div>
                  <div className="font-medium">Quick NDA/Release</div>
                  <div className="text-xs text-white/60">One-click legal docs</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <Button className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 justify-start" data-testid="button-ratecard">
                <Send className="h-4 w-4 text-blue-400" />
                <div>
                  <div className="font-medium">Auto-Ratecard</div>
                  <div className="text-xs text-white/60">Share pricing info</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Collaboration Modal */}
      <Dialog open={openNewCollab} onOpenChange={setOpenNewCollab}>
        <DialogContent className="bg-[#0b0b0f] border-white/10 text-white" data-testid="modal-new-collaboration">
          <DialogHeader>
            <DialogTitle>New Collaboration Request</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Collaboration Title</label>
              <Input
                value={newCollabTitle}
                onChange={(e) => setNewCollabTitle(e.target.value)}
                placeholder="e.g., Outdoor photoshoot collaboration"
                className="bg-white/10 border-white/20"
                data-testid="input-collab-title"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={newCollabDescription}
                onChange={(e) => setNewCollabDescription(e.target.value)}
                placeholder="Describe your collaboration idea..."
                className="bg-white/10 border-white/20 min-h-[100px]"
                data-testid="textarea-collab-description"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpenNewCollab(false)}
              className="bg-white/10 border-white/20"
              data-testid="button-cancel-collab"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createCollabMutation.mutate()}
              disabled={!newCollabTitle.trim() || !selectedCreatorId || createCollabMutation.isPending}
              className="bg-yellow-300 text-black hover:bg-yellow-200"
              data-testid="button-send-collab"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
