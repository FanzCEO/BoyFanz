import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CheckCircle, AlertCircle, Clock, FileText, ExternalLink, Upload, Camera, Fingerprint, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Compliance2257Form } from "@/components/compliance/Compliance2257Form";
import { ContentCreatorVerificationForm } from "@/components/ContentCreatorVerificationForm";

interface KycStatus {
  status: string;
  provider?: string;
  updatedAt?: string;
  is2257Complete?: boolean;
}

export default function Compliance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [show2257Form, setShow2257Form] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  const { data: kycStatus, isLoading: kycLoading } = useQuery<KycStatus>({
    queryKey: ['/api/kyc/status'],
  });

  const initiateKycMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/kyc/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to initiate verification');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
      }
      toast({ title: "Verification Started", description: "Please complete the verification process in the new window." });
      queryClient.invalidateQueries({ queryKey: ['/api/kyc/status'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start verification. Please try again.", variant: "destructive" });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-accent text-accent-foreground';
      case 'pending': return 'bg-yellow-500 text-yellow-50';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      case 'expired': return 'bg-orange-500 text-orange-50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5" />;
      case 'rejected': return <AlertCircle className="h-5 w-5" />;
      case 'pending': return <Clock className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6" data-testid="compliance-page">
      <div>
        <h1 className="text-3xl font-bold font-display" data-testid="page-title">Compliance</h1>
        <p className="text-muted-foreground" data-testid="page-description">
          Manage your identity verification and compliance documentation
        </p>
      </div>

      {/* KYC Status Alert */}
      {kycStatus?.status !== 'approved' && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10" data-testid="kyc-alert">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">Action Required</AlertTitle>
          <AlertDescription>
            {kycStatus?.status === 'pending' 
              ? 'Your identity verification is being processed. This may take 1-3 business days.'
              : 'Complete your identity verification to enable all platform features.'
            }
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KYC Status Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Identity Verification (KYC)</CardTitle>
                <CardDescription>
                  Verify your identity to comply with regulations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {kycLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Status</span>
                  <Badge className={getStatusColor(kycStatus?.status || 'pending')} data-testid="kyc-status-badge">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(kycStatus?.status || 'pending')}
                      {kycStatus?.status || 'Not Started'}
                    </div>
                  </Badge>
                </div>
                
                {kycStatus?.provider && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Provider:</span> {kycStatus.provider}
                  </div>
                )}
                
                {kycStatus?.updatedAt && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Last Updated:</span>{' '}
                    {new Date(kycStatus.updatedAt).toLocaleDateString()}
                  </div>
                )}
                
                {kycStatus?.status !== 'approved' && (
                  <Button
                    className="w-full glow-effect"
                    data-testid="start-kyc-button"
                    onClick={() => initiateKycMutation.mutate()}
                    disabled={initiateKycMutation.isPending}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    {initiateKycMutation.isPending ? 'Starting...' : kycStatus?.status === 'pending' ? 'Check Status' : 'Start VerifyMy Verification'}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* 2257 Compliance Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle>18 U.S.C. §2257 Records</CardTitle>
                <CardDescription>
                  Age verification and record keeping compliance
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">ID Verification</span>
                </div>
                <Badge variant="outline" data-testid="id-verification-status">
                  Not Uploaded
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Consent Forms</span>
                </div>
                <Badge variant="outline" data-testid="consent-forms-status">
                  Not Uploaded
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Model Releases</span>
                </div>
                <Badge variant="outline" data-testid="model-releases-status">
                  Not Uploaded
                </Badge>
              </div>
            </div>
            
            <Dialog open={show2257Form} onOpenChange={setShow2257Form}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" data-testid="upload-documents-button">
                  <FileText className="mr-2 h-4 w-4" />
                  Complete 2257 Verification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    18 U.S.C. §2257 Compliance Verification
                  </DialogTitle>
                </DialogHeader>
                <Compliance2257Form
                  onSubmit={(data) => {
                    console.log('2257 form submitted:', data);
                    toast({ title: "Submitted!", description: "Your 2257 compliance records have been saved." });
                    setShow2257Form(false);
                    queryClient.invalidateQueries({ queryKey: ['/api/kyc/status'] });
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Creator Verification Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Creator Verification</CardTitle>
              <CardDescription>
                Complete verification to unlock all creator features
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Full creator verification includes identity verification, 2257 compliance, and content creator agreements.
          </p>
          <Dialog open={showVerificationForm} onOpenChange={setShowVerificationForm}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Fingerprint className="mr-2 h-4 w-4" />
                Complete Full Verification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-accent" />
                  Content Creator Verification
                </DialogTitle>
              </DialogHeader>
              <ContentCreatorVerificationForm
                onSubmit={(data) => {
                  console.log('Creator verification submitted:', data);
                  toast({ title: "Verification Submitted!", description: "Your creator verification has been submitted for review." });
                  setShowVerificationForm(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/kyc/status'] });
                }}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Compliance Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Compliance Information</CardTitle>
          <CardDescription>
            Important information about platform compliance requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Identity Verification</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Government-issued ID required</li>
                <li>• Selfie verification for identity matching</li>
                <li>• Address verification may be required</li>
                <li>• Processing time: 1-3 business days</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-secondary">Record Keeping</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All performers must be 18+ years old</li>
                <li>• Photo ID required for all content creators</li>
                <li>• Signed consent forms mandatory</li>
                <li>• Records maintained per federal law</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <span>
                Learn more about our{' '}
                <a href="#" className="text-primary hover:underline" data-testid="compliance-policy-link">
                  compliance policies
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline" data-testid="privacy-policy-link">
                  privacy practices
                </a>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
