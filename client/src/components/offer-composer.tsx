import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Send, Star, Wand2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Profile, OfferType, MessageTone, MessageTemplate } from "@shared/schema";

interface OfferComposerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onSuccess: () => void;
}

export default function OfferComposer({ isOpen, onClose, profile, onSuccess }: OfferComposerProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<MessageTone>("flirty");
  const [template, setTemplate] = useState<MessageTemplate>("ai");
  const [offerType, setOfferType] = useState<OfferType>("percent");
  const [amount, setAmount] = useState(25);
  const [trialDays, setTrialDays] = useState(7);
  const [cap, setCap] = useState(100);
  const [link, setLink] = useState("https://boyfanz.com/u/your-handle");

  // Fetch AI suggestion
  const aiSuggestionQuery = useQuery({
    queryKey: ["/api/ai/suggest", tone, profile.name],
    enabled: template === "ai" && !!profile.name,
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/ai/suggest", {
        tone,
        profileName: profile.name,
      });
      return response.json();
    },
  });

  // Fetch branded templates
  const { data: brandedTemplates = [] } = useQuery<string[]>({
    queryKey: ["/api/templates/branded"],
    enabled: template === "branded",
  });

  // Update message when AI suggestion changes
  useEffect(() => {
    if (template === "ai" && aiSuggestionQuery.data?.suggestion) {
      setMessage(aiSuggestionQuery.data.suggestion);
    }
  }, [template, aiSuggestionQuery.data, tone]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (type: "like" | "star") => {
      const response = await apiRequest("POST", "/api/messages", {
        toUserId: profile.userId,
        content: message,
        tone,
        template,
        hasOffer: true,
        offer: {
          type: offerType,
          amount: offerType !== "free_trial" ? amount : undefined,
          trialDays: offerType === "free_trial" ? trialDays : undefined,
          redemptionCap: cap,
          destinationLink: link,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
        swipeType: type,
      });
      return response.json();
    },
    onSuccess: (_, type) => {
      toast({
        title: `Sent ${type} response to ${profile.name}`,
        description: "Your message and offer have been delivered!",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    },
  });

  const applyAISuggestion = (newTone: MessageTone) => {
    setTone(newTone);
    setTemplate("ai");
  };

  const applyBrandedTemplate = (templateText: string) => {
    setMessage(templateText.replace("{name}", profile.name));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0f] border-white/10 text-white max-w-2xl" data-testid="modal-offer-composer">
        <DialogHeader>
          <DialogTitle>Star Response & Offer</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-4">
            {/* Template Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Message Template</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <Button
                  variant={template === "branded" ? "default" : "secondary"}
                  className={template === "branded" ? "bg-yellow-300 text-black" : "bg-white/10"}
                  onClick={() => setTemplate("branded")}
                  data-testid="button-template-branded"
                >
                  Branded
                </Button>
                <Button
                  variant={template === "ai" ? "default" : "secondary"}
                  className={template === "ai" ? "bg-yellow-300 text-black" : "bg-white/10"}
                  onClick={() => setTemplate("ai")}
                  data-testid="button-template-ai"
                >
                  AI
                </Button>
                <Button
                  variant={template === "custom" ? "default" : "secondary"}
                  className={template === "custom" ? "bg-yellow-300 text-black" : "bg-white/10"}
                  onClick={() => setTemplate("custom")}
                  data-testid="button-template-custom"
                >
                  Custom
                </Button>
              </div>

              {/* AI Tone Buttons */}
              {template === "ai" && (
                <div className="flex flex-wrap gap-2">
                  {(["flirty", "classy", "cheeky", "vip"] as const).map((t) => (
                    <Button
                      key={t}
                      variant="secondary"
                      className="bg-white/10 hover:bg-white/15"
                      onClick={() => applyAISuggestion(t)}
                      data-testid={`button-tone-${t}`}
                    >
                      <Wand2 className="h-3 w-3 mr-1"/> {t}
                    </Button>
                  ))}
                </div>
              )}

              {/* Branded Template Selector */}
              {template === "branded" && (
                <Select onValueChange={applyBrandedTemplate}>
                  <SelectTrigger className="bg-white/10 border-white/20" data-testid="select-branded-template">
                    <SelectValue placeholder="Choose branded template" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10">
                    {brandedTemplates.map((template, i) => (
                      <SelectItem key={i} value={template} data-testid={`option-template-${i}`}>
                        {template.slice(0, 50)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Message Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Your Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message…"
                className="bg-white/10 border-white/20 min-h-[120px]"
                data-testid="textarea-message"
              />
            </div>

            {/* Offer Configuration */}
            <div>
              <label className="text-sm font-medium mb-2 block">Offer Type</label>
              <Select value={offerType} onValueChange={(v) => setOfferType(v as OfferType)}>
                <SelectTrigger className="bg-white/10 border-white/20" data-testid="select-offer-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  <SelectItem value="percent" data-testid="option-offer-percent">Percentage off</SelectItem>
                  <SelectItem value="flat" data-testid="option-offer-flat">Flat discount</SelectItem>
                  <SelectItem value="free_trial" data-testid="option-offer-trial">Free trial</SelectItem>
                  <SelectItem value="bundle" data-testid="option-offer-bundle">Bundle unlock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {offerType !== "free_trial" ? (
              <div>
                <label className="text-sm font-medium mb-2 block">Amount</label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[amount]}
                    max={90}
                    step={5}
                    onValueChange={(v) => setAmount(v[0])}
                    className="flex-1"
                    data-testid="slider-amount"
                  />
                  <span className="w-16 text-right font-semibold" data-testid="text-amount">
                    {amount}{offerType === "percent" ? "%" : "$"}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-2 block">Trial Days</label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[trialDays]}
                    max={30}
                    step={1}
                    onValueChange={(v) => setTrialDays(v[0])}
                    className="flex-1"
                    data-testid="slider-trial-days"
                  />
                  <span className="w-16 text-right font-semibold" data-testid="text-trial-days">
                    {trialDays}d
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Cap</label>
                <Input
                  type="number"
                  value={cap}
                  onChange={(e) => setCap(parseInt(e.target.value || "0", 10))}
                  className="bg-white/10 border-white/20"
                  data-testid="input-cap"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Link</label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="bg-white/10 border-white/20"
                  data-testid="input-link"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <label className="text-sm font-medium block">Preview</label>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5" data-testid="preview-message">
              <div className="text-sm text-white/80">To: {profile.name}</div>
              <div className="mt-2 text-white/90 whitespace-pre-wrap">
                {message || "(Your message will appear here)"}
              </div>
              <div className="mt-3 text-xs text-white/70">
                Offer: {offerType} {offerType === "free_trial" ? `${trialDays} days` : `${amount}${offerType === "percent" ? "%" : "$"}`} • Cap {cap}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                className="bg-green-500/20 border border-green-400/30 hover:bg-green-500/30"
                onClick={() => sendMessageMutation.mutate("like")}
                disabled={sendMessageMutation.isPending || !message.trim()}
                data-testid="button-send-like"
              >
                <Send className="h-4 w-4 mr-1"/> Send Like + Offer
              </Button>
              <Button
                className="bg-yellow-300 text-black hover:bg-yellow-200"
                onClick={() => sendMessageMutation.mutate("star")}
                disabled={sendMessageMutation.isPending || !message.trim()}
                data-testid="button-send-star"
              >
                <Star className="h-4 w-4 mr-1"/> Send Star + Offer
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            className="bg-white/10 border-white/20"
            onClick={onClose}
            data-testid="button-close-modal"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
