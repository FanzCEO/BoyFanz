/**
 * Admin Verification Review Panel
 * For admins to review and approve/reject verifications
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface PendingVerification {
  id: string;
  type: '2257' | 'identity';
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  submittedAt: string;
}

interface VerificationStats {
  pendingReview: number;
  records2257: Array<{ status: string; count: number }>;
  identityVerifications: Array<{ status: string; count: number }>;
}

export default function VerificationReview() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'search'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<VerificationStats>({
    queryKey: ['/api/admin/verification/stats'],
    staleTime: 30000,
  });

  const { data: pending, isLoading } = useQuery({
    queryKey: ['/api/admin/verification/pending'],
    staleTime: 30000,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['/api/admin/verification/search', searchQuery],
    enabled: searchQuery.length >= 3,
    staleTime: 30000,
  });

  const displayRecords =
    selectedTab === 'pending'
      ? pending?.records2257 || []
      : searchResults || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Creator Verification Center
                </h1>
                <p className="text-sm text-gray-600">
                  Approve creators to start earning • 2257 compliance review
                </p>
              </div>
            </div>

            {stats && (
              <div className="flex items-center gap-4">
                <div className="text-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-900">
                    {stats.pendingReview}
                  </div>
                  <div className="text-xs text-yellow-700">Pending Review</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedTab === 'pending'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pending?.total || 0})
            </div>
          </button>

          <button
            onClick={() => setSelectedTab('search')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedTab === 'search'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </div>
          </button>
        </div>

        {/* Search Bar */}
        {selectedTab === 'search' && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Records List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading verifications...</p>
          </div>
        ) : displayRecords.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Records Found
            </h3>
            <p className="text-gray-600">
              {selectedTab === 'pending'
                ? 'There are no pending verifications at the moment.'
                : 'Try searching with a different query.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayRecords.map((record: any) => (
              <VerificationCard
                key={record.id}
                record={record}
                onSelect={() => setSelectedRecord(record.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <VerificationDetailModal
          recordId={selectedRecord}
          onClose={() => {
            setSelectedRecord(null);
            queryClient.invalidateQueries({ queryKey: ['/api/admin/verification/pending'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/verification/stats'] });
          }}
        />
      )}
    </div>
  );
}

function VerificationCard({
  record,
  onSelect,
}: {
  record: any;
  onSelect: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold text-gray-900">
            {record.type === '2257' ? '2257 Record' : 'Identity Verification'}
          </span>
        </div>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
          {record.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">User:</span>
          <span className="font-medium text-gray-900">{record.userName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Email:</span>
          <span className="text-gray-900">{record.userEmail}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Submitted:</span>
          <span className="text-gray-900">
            {new Date(record.submittedAt).toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={onSelect}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        Review Details
      </button>
    </div>
  );
}

function VerificationDetailModal({
  recordId,
  onClose,
}: {
  recordId: string;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: record, isLoading } = useQuery({
    queryKey: ['/api/admin/verification/2257', recordId],
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/admin/verification/2257/${recordId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ notes }),
        }
      );
      if (!response.ok) throw new Error('Failed to approve');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verification'] });
      onClose();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/admin/verification/2257/${recordId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reason: rejectReason, notes }),
        }
      );
      if (!response.ok) throw new Error('Failed to reject');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/verification'] });
      onClose();
    },
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-8">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!record) return null;

  const recordData = record.record;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">2257 Record Review</h2>
            <p className="text-indigo-100 text-sm">ID: {recordId.substring(0, 8)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Username:</span>
                <p className="font-medium text-gray-900">{record.user.username}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium text-gray-900">{record.user.email}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-600">Legal Name</label>
                <p className="font-medium text-gray-900">
                  {recordData.legalFirstName} {recordData.legalMiddleName}{' '}
                  {recordData.legalLastName}
                </p>
              </div>
              <div>
                <label className="text-gray-600">Date of Birth</label>
                <p className="font-medium text-gray-900">
                  {new Date(recordData.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* ID Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Primary Identification
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-gray-600">ID Type</label>
                <p className="font-medium text-gray-900">{recordData.primaryIdType}</p>
              </div>
              <div>
                <label className="text-gray-600">ID Number</label>
                <p className="font-medium text-gray-900">
                  {recordData.primaryIdNumber}
                </p>
              </div>
              <div>
                <label className="text-gray-600">Issuing Authority</label>
                <p className="font-medium text-gray-900">
                  {recordData.primaryIdIssuer}
                </p>
              </div>
              {recordData.primaryIdExpiryDate && (
                <div>
                  <label className="text-gray-600">Expiry Date</label>
                  <p className="font-medium text-gray-900">
                    {new Date(recordData.primaryIdExpiryDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Current Address</h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
              {recordData.currentAddress}
            </p>
          </div>

          {/* Attestations */}
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3">Attestations</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-900">Attests to being 18+</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-900">
                  Attests identity information is accurate
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-900">
                  Consents to record keeping
                </span>
              </div>
            </div>
          </div>

          {/* Review Notes */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-900 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes about this review..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Reject Form */}
          {showRejectForm && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-3">Rejection Reason</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                required
                placeholder="Explain why this record is being rejected..."
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          {!showRejectForm ? (
            <>
              <button
                onClick={() => setShowRejectForm(true)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                {approveMutation.isPending ? 'Approving...' : 'Approve & Activate Creator'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={!rejectReason || rejectMutation.isPending}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {rejectMutation.isPending
                  ? 'Rejecting...'
                  : 'Confirm Rejection'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
