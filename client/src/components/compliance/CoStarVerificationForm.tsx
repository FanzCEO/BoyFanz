/**
 * ============================================================================
 * CO-STAR VERIFICATION FORM
 * ============================================================================
 * Adult Co-Star Model Release: 2257 and Agreement
 * 
 * This form is required for compliance with 18 U.S.C. § 2257 for content
 * collaboration. All co-stars must complete this form before appearing in
 * any content.
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, AlertCircle, Users } from "lucide-react";

const costarFormSchema = z.object({
  // Personal Information
  legalName: z.string().min(1, "Legal name is required"),
  stageName: z.string().optional(),
  maidenName: z.string().optional(),
  previousLegalName: z.string().optional(),
  otherKnownNames: z.string().optional(),
  
  // Age Verification
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  age: z.number().min(18, "Must be 18 or older"),
  
  // Identification
  idType: z.enum(["drivers_license", "passport", "social_security", "other"]),
  idNumber: z.string().min(1, "ID number is required"),
  idState: z.string().optional(),
  idCountry: z.string().default("US"),
  
  // Contact Information
  address: z.string().min(1, "Address is required"),
  apartment: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  cellPhone: z.string().optional(),
  homePhone: z.string().optional(),
  email: z.string().email("Valid email is required"),
  
  // Primary Creator Information
  primaryCreatorName: z.string().min(1, "Primary creator name is required"),
  primaryCreatorStageName: z.string().optional(),
  contentCreationDate: z.string().min(1, "Content creation date is required"),
  
  // Document Uploads
  idImageUrl: z.string().min(1, "ID image is required"),
  holdingIdImageUrl: z.string().optional(),
  
  // Certifications - All Required
  is18OrOlder: z.boolean().refine(val => val === true, {
    message: "Must certify 18 or older",
  }),
  disclosedAllNames: z.boolean().refine(val => val === true, {
    message: "Must certify all names disclosed",
  }),
  providedAccurateId: z.boolean().refine(val => val === true, {
    message: "Must certify accurate ID",
  }),
  noIllegalActs: z.boolean().refine(val => val === true, {
    message: "Must certify no illegal acts",
  }),
  freeWillParticipation: z.boolean().refine(val => val === true, {
    message: "Must certify free will participation",
  }),
  
  // Agreement Terms
  agreeToDistribution: z.boolean().refine(val => val === true, {
    message: "Must agree to content distribution",
  }),
  understandNoOwnership: z.boolean().refine(val => val === true, {
    message: "Must acknowledge platform ownership terms",
  }),
  noThirdPartyRestrictions: z.boolean().refine(val => val === true, {
    message: "Must certify no third party restrictions",
  }),
  agreeToIndemnify: z.boolean().refine(val => val === true, {
    message: "Must agree to indemnification",
  }),
  
  // Signatures
  costarSignature: z.string().min(1, "Co-star signature is required"),
  primaryCreatorSignature: z.string().min(1, "Primary creator signature is required"),
  signatureDate: z.string().min(1, "Signature date is required"),
  
  // Sworn Statement
  swornStatementAgreed: z.boolean().refine(val => val === true, {
    message: "Must agree to sworn statement",
  }),
});

type CostarFormData = z.infer<typeof costarFormSchema>;

interface CoStarVerificationFormProps {
  invitationToken?: string;
  primaryCreatorInfo?: {
    displayName: string;
    stageName?: string;
  };
}

export function CoStarVerificationForm({
  invitationToken,
  primaryCreatorInfo,
}: CoStarVerificationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number>(0);

  const form = useForm<CostarFormData>({
    resolver: zodResolver(costarFormSchema),
    defaultValues: {
      idCountry: "US",
      is18OrOlder: false,
      disclosedAllNames: false,
      providedAccurateId: false,
      noIllegalActs: false,
      freeWillParticipation: false,
      agreeToDistribution: false,
      understandNoOwnership: false,
      noThirdPartyRestrictions: false,
      agreeToIndemnify: false,
      swornStatementAgreed: false,
      primaryCreatorName: primaryCreatorInfo?.displayName || "",
      primaryCreatorStageName: primaryCreatorInfo?.stageName || "",
    },
  });

  // Calculate age when date of birth changes
  const watchDateOfBirth = form.watch("dateOfBirth");

  useEffect(() => {
    if (watchDateOfBirth) {
      const birthDate = new Date(watchDateOfBirth);
      const age = Math.floor(
        (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      setCalculatedAge(age);
      form.setValue("age", age);
    }
  }, [watchDateOfBirth]);

  const handleFileUpload = (field: string) => async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Get upload URL from backend
      const response = await apiRequest("/api/upload/get-url", "POST", {
        filename: file.name,
        contentType: file.type,
      });

      // Upload file
      const uploadResponse = await fetch(response.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      // Set the URL in form
      form.setValue(field as keyof CostarFormData, response.publicUrl);

      toast({
        title: "Upload Successful",
        description: `${field} uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: CostarFormData) => {
    try {
      setIsSubmitting(true);

      // Validate age
      if (data.age < 18) {
        toast({
          title: "Age Verification Failed",
          description: "You must be 18 or older to submit this form",
          variant: "destructive",
        });
        return;
      }

      // Submit to backend
      const endpoint = invitationToken
        ? `/api/compliance/costar-complete/${invitationToken}`
        : "/api/compliance/costar-verification";

      await apiRequest(endpoint, "POST", data);

      toast({
        title: "Verification Submitted!",
        description:
          "Your co-star verification has been submitted and is pending review.",
      });

      // Reset form
      form.reset();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit verification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen cyber-bg p-6">
      <div className="container mx-auto max-w-4xl">
        <Card className="bg-gray-900/50 border-purple-500/20">
          <CardHeader className="text-center border-b border-purple-500/20 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
            <div className="flex justify-center mb-4">
              <Users className="w-16 h-16 text-purple-400 cyber-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold cyber-text-glow text-purple-300">
              Adult Co-Star Model Release: 2257 and Agreement
            </CardTitle>
            <CardDescription className="text-gray-300 mt-2">
              Fanz™ Unlimited Network LLC
            </CardDescription>
            <p className="text-sm text-gray-400 mt-2">
              This form is required for compliance with 18 U.S.C. § 2257 for
              content collaboration with{" "}
              <strong className="text-purple-300">
                {primaryCreatorInfo?.displayName || "a primary creator"}
              </strong>
            </p>
          </CardHeader>

          <CardContent className="p-8">
            {/* Important Notice */}
            <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-8">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">
                    Important Information
                  </h3>
                  <p className="text-sm text-blue-200">
                    This form is required by federal law and ensures all
                    participants in adult content are 18+ years old. Your
                    information is encrypted and stored securely for compliance
                    purposes only. Fanz Unlimited Network LLC does not produce or
                    create any media and acts solely as a hosting platform.
                  </p>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Co-Star Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/20 pb-2">
                    Co-Star Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="legalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Legal Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="Full legal name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stageName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Stage/Performance Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="Stage name (if any)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maidenName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Maiden Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="Maiden name (if any)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="previousLegalName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Previous Legal Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="Previous legal name (if any)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="otherKnownNames"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-300">
                          Other Names Known By
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="bg-gray-800 border-gray-700"
                            placeholder="Any other names you have been known by"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Date of Birth *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="bg-gray-800 border-gray-700"
                            />
                          </FormControl>
                          {calculatedAge > 0 && (
                            <FormDescription className="text-gray-400">
                              Age: {calculatedAge} years old
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Email *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              className="bg-gray-800 border-gray-700"
                              placeholder="your@email.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Identification Section - Same as 2257 Form */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/20 pb-2">
                    Identification
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="idType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            ID Type *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select ID type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="drivers_license">
                                Driver's License
                              </SelectItem>
                              <SelectItem value="passport">Passport</SelectItem>
                              <SelectItem value="social_security">
                                Social Security
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="idNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            ID Number *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="ID number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="idState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            State (if applicable)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="State"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact Information - Similar to 2257 Form */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/20 pb-2">
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel className="text-purple-300">
                            Address *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="Street address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Apt/Unit
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="Apt #"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">City *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="City"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            State *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="State"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            ZIP Code *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="ZIP code"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cellPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Cell Phone
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              className="bg-gray-800 border-gray-700"
                              placeholder="(555) 555-5555"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="homePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Home Phone
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              className="bg-gray-800 border-gray-700"
                              placeholder="(555) 555-5555"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Primary Creator Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/20 pb-2">
                    Primary Creator Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryCreatorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Primary Creator Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              readOnly={!!primaryCreatorInfo}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contentCreationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Date of Content Creation *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="bg-gray-800 border-gray-700"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Document Uploads */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/20 pb-2">
                    Required Documentation
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-purple-300">
                        Government ID Image *
                      </Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload("idImageUrl")}
                        className="bg-gray-800 border-gray-700"
                      />
                      {form.watch("idImageUrl") && (
                        <p className="text-green-400 text-sm">✓ Uploaded</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-purple-300">
                        Photo Holding ID (Optional)
                      </Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload("holdingIdImageUrl")}
                        className="bg-gray-800 border-gray-700"
                      />
                      {form.watch("holdingIdImageUrl") && (
                        <p className="text-green-400 text-sm">✓ Uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Co-Star Consent and Certifications */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/20 pb-2">
                    Co-Star Consent and Acknowledgment
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        name: "is18OrOlder" as const,
                        label: "I certify that I am 18 years of age or older",
                      },
                      {
                        name: "disclosedAllNames" as const,
                        label:
                          "I certify I have disclosed all other names I have been known by",
                      },
                      {
                        name: "providedAccurateId" as const,
                        label:
                          "I certify I have provided accurate identification",
                      },
                      {
                        name: "noIllegalActs" as const,
                        label:
                          "I certify I will not engage in any illegal acts or provide illegal substances",
                      },
                      {
                        name: "freeWillParticipation" as const,
                        label:
                          "I certify I am entering this agreement freely and without coercion",
                      },
                    ].map((cert) => (
                      <FormField
                        key={cert.name}
                        control={form.control}
                        name={cert.name}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-700 p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-purple-300">
                                {cert.label} *
                              </FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/20 pb-2">
                    Terms and Conditions
                  </h3>

                  <div className="bg-gray-800/50 p-4 rounded-lg text-sm text-gray-300 space-y-2">
                    <p>
                      <strong>1.</strong> Both parties agree to the lawful
                      distribution of the collaboratively created content through
                      Fanz Unlimited Network LLC's platform.
                    </p>
                    <p>
                      <strong>2.</strong> Fanz Unlimited Network LLC retains no
                      ownership of the content, copyright, or materials provided.
                    </p>
                    <p>
                      <strong>3.</strong> All parties confirm they are not
                      restricted by any other commitments to third parties.
                    </p>
                    <p>
                      <strong>4.</strong> All participants must comply with
                      federal, state, and local laws.
                    </p>
                    <p>
                      <strong>5.</strong> Both parties agree to indemnify Fanz
                      Unlimited Network LLC from any disputes or claims arising
                      from the creation or distribution of the content.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        name: "agreeToDistribution" as const,
                        label:
                          "I agree to the lawful distribution of collaboratively created content",
                      },
                      {
                        name: "understandNoOwnership" as const,
                        label:
                          "I understand that Fanz retains no ownership of the content",
                      },
                      {
                        name: "noThirdPartyRestrictions" as const,
                        label:
                          "I am not restricted by any commitments to third parties",
                      },
                      {
                        name: "agreeToIndemnify" as const,
                        label:
                          "I agree to indemnify Fanz from any disputes or claims",
                      },
                    ].map((term) => (
                      <FormField
                        key={term.name}
                        control={form.control}
                        name={term.name}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-700 p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-purple-300">
                                {term.label} *
                              </FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Signatures */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-purple-400 border-b border-purple-500/20 pb-2">
                    Signatures
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="costarSignature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Co-Star Signature *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="Type your full name as signature"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryCreatorSignature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">
                            Primary Creator Signature *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-gray-800 border-gray-700"
                              placeholder="Primary creator must sign"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="signatureDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-purple-300">Date *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="bg-gray-800 border-gray-700"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Sworn Statement */}
                <div className="space-y-4">
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                    <h4 className="font-semibold text-red-400 mb-2">
                      Sworn Statement
                    </h4>
                    <p className="text-sm text-red-200 mb-4">
                      <strong>
                        UNDER 28 U.S.C. § 1746 AND PENALTIES OF PERJURY:
                      </strong>
                      <br />
                      <br />
                      By submitting this form, you swear that the foregoing
                      information is true and correct. You also confirm that each
                      identification document provided is valid, lawfully
                      obtained, and has not been forged or altered.
                      <br />
                      <br />
                      <strong>WARNING:</strong> Any false statement may subject
                      you to civil and criminal penalties under federal law.
                    </p>

                    <FormField
                      control={form.control}
                      name="swornStatementAgreed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-red-300">
                              I acknowledge and agree to the sworn statement above
                              under penalty of perjury *
                            </FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || calculatedAge < 18}
                    className="w-full md:w-auto px-12 py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                  >
                    {isSubmitting
                      ? "Submitting Verification..."
                      : "Submit Co-Star Verification Form"}
                  </Button>
                </div>

                {calculatedAge < 18 && calculatedAge > 0 && (
                  <p className="text-center text-red-400 text-sm">
                    You must be 18 or older to submit this form
                  </p>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Record Custodian Info */}
        <Card className="mt-6 bg-gray-900/50 border-purple-500/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-purple-400 mb-2">
              Custodian of Records
            </h3>
            <p className="text-sm text-gray-300">
              Fanz™ Unlimited Network LLC
              <br />
              30 N Gould St #45302
              <br />
              Sheridan, Wyoming 82801
              <br />
              United States
              <br />
              Email: records@fanzunlimited.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

