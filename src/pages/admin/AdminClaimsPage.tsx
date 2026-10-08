import { useEffect, useState } from 'react';
import { fetchClaimsByStatus, approveClaim, rejectClaim } from '@/services/api';
import { ClaimWithRelations } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import { ClaimStatusBadge, ItemStatusBadge } from '@/components/ui/StatusBadge';
import { CheckCircle, XCircle, ClipboardCheck, Package, User, Calendar, MessageSquare } from 'lucide-react';

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<ClaimWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reviewModal, setReviewModal] = useState<{ claim: ClaimWithRelations; action: 'approve' | 'reject' } | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const data = await fetchClaimsByStatus(filter);
      setClaims(data);
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [filter]);

  const openReview = (claim: ClaimWithRelations, action: 'approve' | 'reject') => {
    setReviewModal({ claim, action });
    setNotes('');
    setError(null);
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    setProcessing(true);
    setError(null);
    try {
      if (reviewModal.action === 'approve') {
        await approveClaim(reviewModal.claim.id, notes.trim());
      } else {
        await rejectClaim(reviewModal.claim.id, notes.trim());
      }
      await loadClaims();
      setReviewModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process claim.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Spinner size="lg" className="py-20" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Claims" description="Review and manage item claims submitted by students." />

      <div className="flex gap-3 mb-4 flex-wrap">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-auto"
        >
          <option value="all">All Claims</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
        <span className="text-sm self-center" style={{ color: 'var(--color-text-muted)' }}>
          {claims.length} claim{claims.length !== 1 ? 's' : ''}
        </span>
      </div>

      {claims.length > 0 ? (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id} className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Item info */}
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Item</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {claim.item?.image_url ? (
                      <img src={claim.item.image_url} alt={claim.item.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                        <Package className="h-6 w-6" style={{ color: 'var(--color-text-light)' }} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{claim.item?.title || 'Item removed'}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{claim.item?.category}</p>
                      {claim.item && <div className="mt-1"><ItemStatusBadge status={claim.item.status} /></div>}
                    </div>
                  </div>
                </div>

                {/* Claim info */}
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Claimant</span>
                  </div>
                  <p className="text-sm font-medium">{claim.claimant?.full_name || 'Unknown'}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{claim.claimant?.email}</p>
                  {claim.claimant?.student_number && (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Student #: {claim.claimant.student_number}</p>
                  )}
                  <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-light)' }}>
                    <Calendar className="h-3 w-3" />
                    {new Date(claim.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Claim details */}
                <div className="lg:col-span-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Claim</span>
                    </div>
                    <ClaimStatusBadge status={claim.status} />
                  </div>
                  <p className="text-xs mb-1"><span className="font-medium">Reason:</span> {claim.reason}</p>
                  <p className="text-xs mb-1"><span className="font-medium">Identifying:</span> {claim.identifying_details}</p>
                  <p className="text-xs"><span className="font-medium">Contact:</span> {claim.contact_details}</p>
                  {claim.verification_notes && (
                    <p className="text-xs mt-1"><span className="font-medium">Notes:</span> {claim.verification_notes}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              {claim.status === 'pending' && (
                <div className="flex gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <Button variant="primary" size="sm" onClick={() => openReview(claim, 'approve')}>
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => openReview(claim, 'reject')}>
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
              {claim.status === 'approved' && (
                <Alert type="success" className="mt-4">Claim approved. The student must collect the item from designated university staff; do not arrange a handover with the finder.</Alert>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<ClipboardCheck className="h-8 w-8" />}
            title={`No ${filter !== 'all' ? filter : ''} claims`}
            description={filter === 'pending'
              ? 'There are no pending claims to review right now.'
              : 'No claims match this filter.'}
          />
        </Card>
      )}

      {/* Review modal */}
      <Modal
        open={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title={reviewModal?.action === 'approve' ? 'Approve Claim' : 'Reject Claim'}
        size="sm"
      >
        {error && <Alert type="error" className="mb-4">{error}</Alert>}
        {reviewModal && (
          <div className="space-y-4">
            <Alert type={reviewModal.action === 'approve' ? 'success' : 'warning'}>
              {reviewModal.action === 'approve'
                ? 'Approving verifies the claim and marks the item as CLAIMED. The claimant must collect it from designated university staff after approval.'
                : 'Rejecting this claim will close it. The claimant will see the rejected status.'}
            </Alert>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
              <p className="font-medium text-sm">{reviewModal.claim.item?.title}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Claimed by {reviewModal.claim.claimant?.full_name}
              </p>
            </div>
            <Textarea
              label="Verification Notes"
              name="notes"
              placeholder="Add notes about ownership verification or reason for decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setReviewModal(null)}>Cancel</Button>
              <Button
                variant={reviewModal.action === 'approve' ? 'primary' : 'danger'}
                loading={processing}
                onClick={handleReview}
                className="flex-1"
              >
                {reviewModal.action === 'approve' ? 'Approve Claim' : 'Reject Claim'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
