/**
 * 2257 Compliance Form
 * For creators to submit record-keeping information with photo ID uploads
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, CheckCircle, AlertCircle, Lock, Upload, X, Image } from "lucide-react";

interface Form2257Data {
  legalFirstName: string;
  legalLastName: string;
  legalMiddleName?: string;
  dateOfBirth: string;
  primaryIdType: string;
  primaryIdNumber: string;
  primaryIdIssuer: string;
  primaryIdExpiryDate?: string;
  currentAddress: string;
  // Photo uploads
  idFrontImageUrl?: string;
  idBackImageUrl?: string;
  selfieWithIdUrl?: string;
  // Attestations
  attestsOver18: boolean;
  attestsIdentityAccurate: boolean;
  consentToRecordKeeping: boolean;
}

export function Form2257() {
  const queryClient = useQueryClient();

  const { data: status } = useQuery({
    queryKey: ["/api/verification/status"],
    staleTime: 60000,
  });

  const { data: record2257Status } = useQuery({
    queryKey: ["/api/verification/2257/status"],
    staleTime: 60000,
  });

  const [formData, setFormData] = useState<Form2257Data>({
    legalFirstName: "",
    legalLastName: "",
    legalMiddleName: "",
    dateOfBirth: "",
    primaryIdType: "drivers_license",
    primaryIdNumber: "",
    primaryIdIssuer: "",
    primaryIdExpiryDate: "",
    currentAddress: "",
    idFrontImageUrl: "",
    idBackImageUrl: "",
    selfieWithIdUrl: "",
    attestsOver18: false,
    attestsIdentityAccurate: false,
    consentToRecordKeeping: false,
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const submitForm = useMutation({
    mutationFn: async (data: Form2257Data) => {
      const response = await fetch("/api/verification/2257/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit form");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verification/2257/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/verification/status"] });
    },
  });

  const handleFileUpload = async (field: keyof Form2257Data, file: File) => {
    setUploadingField(field);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", `verification/2257/${Date.now()}-${file.name}`);

      const response = await fetch("/api/bunny/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      
      if (result.success && result.data?.url) {
        setFormData((prev) => ({ ...prev, [field]: result.data.url }));
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      setUploadError(error.message || "Failed to upload file");
    } finally {
      setUploadingField(null);
    }
  };

  const handleFileChange = (field: keyof Form2257Data) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Please upload an image file (JPG, PNG, etc.)");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File size must be less than 10MB");
        return;
      }
      handleFileUpload(field, file);
    }
  };

  const clearUpload = (field: keyof Form2257Data) => {
    setFormData((prev) => ({ ...prev, [field]: "" }));
  };

  // Need identity verification first
  if (!status?.identityVerified) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">
              Identity Verification Required
            </h3>
            <p className="text-sm text-yellow-700">
              Please complete identity verification before submitting your 2257
              record.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Already submitted and approved
  if (record2257Status?.status === "approved") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">
              2257 Record Approved
            </h3>
            <p className="text-sm text-green-700">
              Your 2257 compliance record has been approved. You're all set to
              create content!
            </p>
            {record2257Status.approvedAt && (
              <p className="text-xs text-green-600 mt-2">
                Approved on {new Date(record2257Status.approvedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pending review
  if (record2257Status?.status === "pending_review") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Under Review
            </h3>
            <p className="text-sm text-blue-700">
              Your 2257 record is being reviewed by our compliance team. This
              typically takes 24-48 hours.
            </p>
            {record2257Status.submittedAt && (
              <p className="text-xs text-blue-600 mt-2">
                Submitted on {new Date(record2257Status.submittedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm.mutate(formData);
  };

  const isFormValid =
    formData.legalFirstName &&
    formData.legalLastName &&
    formData.dateOfBirth &&
    formData.primaryIdNumber &&
    formData.primaryIdIssuer &&
    formData.currentAddress &&
    formData.idFrontImageUrl &&
    formData.idBackImageUrl &&
    formData.selfieWithIdUrl &&
    formData.attestsOver18 &&
    formData.attestsIdentityAccurate &&
    formData.consentToRecordKeeping;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-bold">Final Step: Start Making Money</h2>
            <p className="text-purple-100 text-sm">Quick compliance form • Then you're live</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Rejection notice */}
        {record2257Status?.status === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">
                  Revision Needed
                </h4>
                <p className="text-sm text-red-700">
                  {record2257Status.rejectionReason ||
                    "Please review and resubmit your information."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Legal First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.legalFirstName}
                  onChange={(e) =>
                    setFormData({ ...formData, legalFirstName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Legal Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.legalLastName}
                  onChange={(e) =>
                    setFormData({ ...formData, legalLastName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.legalMiddleName}
                  onChange={(e) =>
                    setFormData({ ...formData, legalMiddleName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* ID Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Primary Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Type *
                </label>
                <select
                  required
                  value={formData.primaryIdType}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryIdType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="drivers_license">Driver's License</option>
                  <option value="passport">Passport</option>
                  <option value="state_id">State ID</option>
                  <option value="national_id">National ID</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.primaryIdNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryIdNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuing Authority *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., State of California"
                  value={formData.primaryIdIssuer}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryIdIssuer: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.primaryIdExpiryDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryIdExpiryDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Address *
            </label>
            <textarea
              required
              rows={3}
              value={formData.currentAddress}
              onChange={(e) =>
                setFormData({ ...formData, currentAddress: e.target.value })
              }
              placeholder="Street address, city, state, zip code, country"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Photo Uploads */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Required Photo Documentation
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload clear photos of your ID documents. All photos must be legible and match your information above.
            </p>
            
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ID Front */}
              <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Front *
                </label>
                {formData.idFrontImageUrl ? (
                  <div className="relative">
                    <img
                      src={formData.idFrontImageUrl}
                      alt="ID Front"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => clearUpload("idFrontImageUrl")}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Uploaded
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange("idFrontImageUrl")}
                      disabled={uploadingField === "idFrontImageUrl"}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition">
                      {uploadingField === "idFrontImageUrl" ? (
                        <div className="animate-pulse">
                          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Click to upload</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ID Back */}
              <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Back *
                </label>
                {formData.idBackImageUrl ? (
                  <div className="relative">
                    <img
                      src={formData.idBackImageUrl}
                      alt="ID Back"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => clearUpload("idBackImageUrl")}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Uploaded
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange("idBackImageUrl")}
                      disabled={uploadingField === "idBackImageUrl"}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition">
                      {uploadingField === "idBackImageUrl" ? (
                        <div className="animate-pulse">
                          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Click to upload</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Selfie with ID */}
              <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selfie Holding ID *
                </label>
                {formData.selfieWithIdUrl ? (
                  <div className="relative">
                    <img
                      src={formData.selfieWithIdUrl}
                      alt="Selfie with ID"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => clearUpload("selfieWithIdUrl")}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Uploaded
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange("selfieWithIdUrl")}
                      disabled={uploadingField === "selfieWithIdUrl"}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition">
                      {uploadingField === "selfieWithIdUrl" ? (
                        <div className="animate-pulse">
                          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Click to upload</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attestations */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Required Attestations
            </h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.attestsOver18}
                  onChange={(e) =>
                    setFormData({ ...formData, attestsOver18: e.target.checked })
                  }
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  I attest that I am 18 years of age or older
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.attestsIdentityAccurate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attestsIdentityAccurate: e.target.checked,
                    })
                  }
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  I attest that all information provided is accurate and matches my
                  legal identification
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consentToRecordKeeping}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consentToRecordKeeping: e.target.checked,
                    })
                  }
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  I consent to the maintenance of my records for 2257 compliance
                  purposes
                </span>
              </label>
            </div>
          </div>

          {/* Error message */}
          {submitForm.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                {submitForm.error?.message || "Failed to submit form. Please try again."}
              </p>
            </div>
          )}

          {/* Success message */}
          {submitForm.isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-green-900 mb-1">
                  You're Almost Live!
                </p>
                <p className="text-sm text-green-700">
                  Your submission is under review. You'll be approved and earning within 24-48 hours.
                </p>
              </div>
            </div>
          )}

          {/* Value Prop Before Submit */}
          {!submitForm.isSuccess && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm font-semibold text-green-800 mb-1">
                Almost there! Complete this form and start earning.
              </p>
              <p className="text-xs text-green-700">
                Remember: Fans pay the fees. You keep 100%.
              </p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!isFormValid || submitForm.isPending}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitForm.isPending ? "Submitting for review..." : "Submit & Go Live"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            All information is encrypted and stored securely in compliance with 18 U.S.C. § 2257
          </p>
        </div>
      </form>
    </div>
  );
}
