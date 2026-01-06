// @ts-nocheck
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  Image,
  Video,
  Mic,
  Package,
  Clock,
  Zap,
  Lock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

type CreatorSettings = {
  isAcceptingRequests: boolean;
  minimumPriceCents: number;
  maximumPriceCents: number;
  standardDeliveryDays: number;
  rushDeliveryDays: number;
  rushSurchargePct: number;
  exclusiveSurchargePct: number;
  allowedTypes: string[];
};

type Creator = {
  id: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  bio?: string;
};

const requestTypes = [
  { value: 'photo_set', label: 'Photo Set', icon: Image, description: 'A collection of photos' },
  { value: 'video', label: 'Video', icon: Video, description: 'A custom video' },
  { value: 'voice_message', label: 'Voice Message', icon: Mic, description: 'An audio recording' },
  { value: 'video_message', label: 'Video Message', icon: Video, description: 'A personalized video message' },
  { value: 'custom_content', label: 'Custom Content', icon: Package, description: 'Something else specific' },
];

export default function CreateCustomRequest() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [type, setType] = useState('photo_set');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [requestedDeliveryDays, setRequestedDeliveryDays] = useState(7);
  const [isExclusive, setIsExclusive] = useState(false);
  const [isRush, setIsRush] = useState(false);

  // Fetch creator info
  const { data: creator, isLoading: creatorLoading } = useQuery<Creator>({
    queryKey: [`/api/creators/${creatorId}/profile`],
    enabled: !!creatorId,
  });

  // Fetch creator's request settings
  const { data: settings, isLoading: settingsLoading } = useQuery<CreatorSettings>({
    queryKey: [`/api/custom-requests/creator/${creatorId}/settings`],
    enabled: !!creatorId,
  });

  // Set default price based on creator's minimum
  useEffect(() => {
    if (settings && !offeredPrice) {
      setOfferedPrice((settings.minimumPriceCents / 100).toString());
      setRequestedDeliveryDays(settings.standardDeliveryDays);
    }
  }, [settings]);

  // Calculate final price
  const calculatePrice = () => {
    const basePrice = parseFloat(offeredPrice) || 0;
    let multiplier = 1;

    if (isRush && settings) {
      multiplier += settings.rushSurchargePct / 100;
    }
    if (isExclusive && settings) {
      multiplier += settings.exclusiveSurchargePct / 100;
    }

    return (basePrice * multiplier).toFixed(2);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/custom-requests', {
        creatorId,
        type,
        title,
        description,
        offeredPriceCents: Math.round(parseFloat(offeredPrice) * 100),
        requestedDeliveryDays,
        isExclusive,
        isRush,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Request submitted!',
        description: 'The creator will review your request and respond soon.',
      });
      navigate(`/custom-requests`);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to submit request',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const isLoading = creatorLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (settings && !settings.isAcceptingRequests) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-bold mb-2">Not Accepting Requests</h2>
            <p className="text-muted-foreground">
              {creator?.displayName || 'This creator'} is not currently accepting custom content requests.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const minPrice = settings ? settings.minimumPriceCents / 100 : 10;
  const maxPrice = settings ? settings.maximumPriceCents / 100 : 10000;
  const priceValue = parseFloat(offeredPrice) || 0;
  const isPriceValid = priceValue >= minPrice && priceValue <= maxPrice;
  const finalPrice = calculatePrice();

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={creator?.profileImageUrl} />
              <AvatarFallback className="text-xl">
                {creator?.displayName?.charAt(0) || creator?.username?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">Request Custom Content</CardTitle>
              <CardDescription>from @{creator?.username}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Content Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">What type of content?</Label>
            <RadioGroup value={type} onValueChange={setType} className="grid gap-3">
              {requestTypes.map((t) => {
                const Icon = t.icon;
                const isAllowed = !settings?.allowedTypes || settings.allowedTypes.includes(t.value);
                return (
                  <label
                    key={t.value}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      type === t.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    } ${!isAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <RadioGroupItem value={t.value} disabled={!isAllowed} />
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{t.label}</p>
                      <p className="text-sm text-muted-foreground">{t.description}</p>
                    </div>
                    {!isAllowed && <Badge variant="secondary">Not Available</Badge>}
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          <Separator />

          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give your request a clear title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe exactly what you want. Be specific about poses, outfits, scenarios, or any other details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/2000 characters
              </p>
            </div>
          </div>

          <Separator />

          {/* Price */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Your Offer</Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  className="pl-9"
                  min={minPrice}
                  max={maxPrice}
                />
              </div>
            </div>
            {!isPriceValid && offeredPrice && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Price must be between ${minPrice.toFixed(2)} and ${maxPrice.toFixed(2)}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Creator's range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
            </p>
          </div>

          {/* Delivery Time */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Delivery Time</Label>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  !isRush ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setIsRush(false);
                  setRequestedDeliveryDays(settings?.standardDeliveryDays || 7);
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Standard</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {settings?.standardDeliveryDays || 7} days
                </p>
              </div>
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  isRush ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setIsRush(true);
                  setRequestedDeliveryDays(settings?.rushDeliveryDays || 2);
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Rush</span>
                  <Badge variant="secondary" className="ml-auto">
                    +{settings?.rushSurchargePct || 50}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {settings?.rushDeliveryDays || 2} days
                </p>
              </div>
            </div>
          </div>

          {/* Exclusive Option */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Make it Exclusive</p>
                <p className="text-sm text-muted-foreground">
                  Only you will have access to this content
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">+{settings?.exclusiveSurchargePct || 100}%</Badge>
              <Switch checked={isExclusive} onCheckedChange={setIsExclusive} />
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-primary" />
              <span className="font-semibold">Order Summary</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Base Price</span>
              <span>${offeredPrice || '0.00'}</span>
            </div>
            {isRush && (
              <div className="flex justify-between text-sm text-yellow-500">
                <span>Rush Delivery (+{settings?.rushSurchargePct || 50}%)</span>
                <span>+${((parseFloat(offeredPrice) || 0) * (settings?.rushSurchargePct || 50) / 100).toFixed(2)}</span>
              </div>
            )}
            {isExclusive && (
              <div className="flex justify-between text-sm text-yellow-500">
                <span>Exclusive Content (+{settings?.exclusiveSurchargePct || 100}%)</span>
                <span>+${((parseFloat(offeredPrice) || 0) * (settings?.exclusiveSurchargePct || 100) / 100).toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-green-500">${finalPrice}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Payment is held in escrow until you approve the delivered content
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            onClick={() => createMutation.mutate()}
            disabled={
              createMutation.isPending ||
              !title.trim() ||
              !description.trim() ||
              !isPriceValid
            }
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Submit Request (${finalPrice})
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
