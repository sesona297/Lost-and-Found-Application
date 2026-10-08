import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { fetchItemById, createClaim, submitFinderReport } from '@/services/api';
import { ItemWithRelations } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { ItemTypeBadge, ItemStatusBadge } from '@/components/ui/StatusBadge';
import { ArrowLeft, MapPin, Calendar, Tag, FileText, User, MessageSquare, CheckCircle } from 'lucide-react';

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<ItemWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [finderModalOpen, setFinderModalOpen] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [finderSuccess, setFinderSuccess] = useState(false);
  const [finderForm, setFinderForm] = useState({ found_location: '', found_date: '', additional_details: '' });
  const [claimForm, setClaimForm] = useState({
    reason: '',
    identifying_details: '',
    additional_info: '',
    contact_details: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await fetchItemById(id);
        if (!data) {
          setNotFound(true);
        } else {
          setItem(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const canClaim = item && user && item.status === 'found' && item.received_at &&
    (item.item_type === 'found' ? item.user_id !== user.id : item.user_id === user.id);
  const canReportFinding = item && user && item.item_type === 'lost' && item.status === 'lost' && item.user_id !== user.id;
  const isOwner = item && user && item.user_id === user.id;

  const validateClaim = (): boolean => {
    const e: Record<string, string> = {};
    if (!claimForm.reason.trim()) e.reason = 'Please explain why you believe this is your item';
    if (!claimForm.identifying_details.trim()) e.identifying_details = 'Please provide identifying details';
    if (!claimForm.contact_details.trim()) e.contact_details = 'Contact details are required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClaimSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validateClaim() || !item) return;
    setSubmitting(true);
    try {
      await createClaim({
        item_id: item.id,
        reason: claimForm.reason.trim(),
        identifying_details: claimForm.identifying_details.trim(),
        additional_info: claimForm.additional_info.trim() || null,
        contact_details: claimForm.contact_details.trim(),
      });
      setClaimSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinderSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const nextErrors: Record<string, string> = {};
    if (!finderForm.found_location.trim()) nextErrors.found_location = 'Where you found it is required';
    if (!finderForm.found_date) nextErrors.found_date = 'Date found is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !item) return;
    setSubmitting(true);
    try {
      await submitFinderReport(item.id, {
        found_location: finderForm.found_location.trim(),
        found_date: finderForm.found_date,
        additional_details: finderForm.additional_details.trim() || null,
      });
      setFinderSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit finder report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Spinner size="lg" className="py-20" />
      </AppLayout>
    );
  }

  if (notFound || !item) {
    return (
      <AppLayout>
        <Card>
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="Item not found"
            description="This item may have been removed or the link is incorrect."
            action={<Button variant="primary" size="sm" onClick={() => navigate('/find-items')}>Back to Find Items</Button>}
          />
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link to="/find-items" className="inline-flex items-center gap-1.5 text-sm font-medium mb-4" style={{ color: 'var(--color-text-muted)' }}>
        <ArrowLeft className="h-4 w-4" /> Back to items
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="aspect-[4/3] flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full h-full object-contain" />
              ) : (
                <div className="text-center" style={{ color: 'var(--color-text-light)' }}>
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">No image available</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Details sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start gap-2 mb-3">
              <ItemTypeBadge type={item.item_type} />
              <ItemStatusBadge status={item.status} />
            </div>
            <h1 className="text-xl font-bold mb-3">{item.title}</h1>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>Category:</span>
                <span className="font-medium">{item.category}</span>
              </div>
              {item.campus && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ color: 'var(--color-text-muted)' }}>Campus:</span>
                  <span className="font-medium">{item.campus.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>Location:</span>
                <span className="font-medium">{item.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {item.item_type === 'lost' ? 'Date Lost:' : 'Date Found:'}
                </span>
                <span className="font-medium">
                  {new Date(item.date_event).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>Reported:</span>
                <span className="font-medium">
                  {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {item.reporter && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ color: 'var(--color-text-muted)' }}>Reported by:</span>
                  <span className="font-medium">
                    {isOwner ? 'You' : item.reporter.full_name || 'Anonymous'}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {canReportFinding && (
            <Card className="p-5">
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
                Found this item? Report where and when you found it. Please hand the physical item to university staff; do not arrange a private handover.
              </p>
              <Button variant="primary" className="w-full" onClick={() => setFinderModalOpen(true)}>
                <CheckCircle className="h-4 w-4" />
                I Found This Item
              </Button>
            </Card>
          )}

          {item.item_type === 'lost' && item.has_finder_report && !item.received_at && (
            <Alert type="info">Someone reported finding this item. It is awaiting confirmation by university staff.</Alert>
          )}

          {item.item_type === 'found' && !item.received_at && (
            <Alert type="info">This item has been reported found and is awaiting receipt by university staff before claims can be submitted.</Alert>
          )}

          {item.received_at && item.status !== 'returned' && (
            <Alert type="success">This item is currently in the custody of university staff.</Alert>
          )}

          {/* Claim button */}
          {canClaim && (
            <Card className="p-5">
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
                Is this your item? Submit ownership details for staff verification. If approved, collect it from university staff.
              </p>
              <Button variant="primary" className="w-full" onClick={() => setClaimModalOpen(true)}>
                <MessageSquare className="h-4 w-4" />
                Claim This Item
              </Button>
            </Card>
          )}

          {isOwner && (
            <Card className="p-5">
              <Alert type="info">
                This is your item report. You can track its status from My Reports.
              </Alert>
              <Link to="/my-reports" className="block mt-3">
                <Button variant="outline" size="sm" className="w-full">View My Reports</Button>
              </Link>
            </Card>
          )}

          {!user && (
            <Card className="p-5">
              <Alert type="warning">
                Log in to report finding an item or submit an ownership claim.
              </Alert>
              <Link to="/login" className="block mt-3">
                <Button variant="primary" size="sm" className="w-full">Log In to Claim</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>

      {/* Description */}
      <Card className="p-5 mt-6">
        <h2 className="font-semibold mb-3">Description</h2>
        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>{item.description}</p>
        {item.additional_details && (
          <>
            <h3 className="font-semibold text-sm mt-5 mb-2">Additional Details</h3>
            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-muted)' }}>{item.additional_details}</p>
          </>
        )}
      </Card>

      {/* Claim modal */}
      <Modal open={claimModalOpen} onClose={() => setClaimModalOpen(false)} title="Submit a Claim" size="md">
        {claimSuccess ? (
          <div className="text-center py-4">
            <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: 'var(--color-success-light)' }}>
              <CheckCircle className="h-10 w-10" style={{ color: 'var(--color-success)' }} />
            </div>
            <h3 className="text-lg font-bold mb-2">Claim Submitted!</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Your claim has been submitted and is now pending review by staff. You can track its status from My Claims.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setClaimModalOpen(false)}>Close</Button>
              <Button variant="primary" onClick={() => navigate('/my-claims')}>View My Claims</Button>
            </div>
          </div>
        ) : (
          <>
            {submitError && <Alert type="error" className="mb-4">{submitError}</Alert>}
            <Alert type="info" className="mb-4">
              Provide details that help staff verify you are the rightful owner. Be specific about features not visible in the photo.
            </Alert>
            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <Textarea
                label="Why do you believe this is your item? *"
                name="reason"
                placeholder="Explain how you lost/found this item and why you think this is yours..."
                value={claimForm.reason}
                onChange={(e) => setClaimForm({ ...claimForm, reason: e.target.value })}
                error={errors.reason}
                rows={3}
              />
              <Textarea
                label="Identifying details *"
                name="identifying_details"
                placeholder="Mention specific features, markings, contents, or serial numbers only the owner would know..."
                value={claimForm.identifying_details}
                onChange={(e) => setClaimForm({ ...claimForm, identifying_details: e.target.value })}
                error={errors.identifying_details}
                rows={3}
              />
              <Textarea
                label="Additional information"
                name="additional_info"
                placeholder="Any other relevant details (optional)"
                value={claimForm.additional_info}
                onChange={(e) => setClaimForm({ ...claimForm, additional_info: e.target.value })}
                rows={2}
              />
              <Input
                label="Contact details *"
                type="text"
                name="contact_details"
                placeholder="Phone number or email where staff can reach you"
                value={claimForm.contact_details}
                onChange={(e) => setClaimForm({ ...claimForm, contact_details: e.target.value })}
                error={errors.contact_details}
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setClaimModalOpen(false)}>Cancel</Button>
                <Button type="submit" loading={submitting} className="flex-1">Submit Claim</Button>
              </div>
            </form>
          </>
        )}
      </Modal>

      <Modal open={finderModalOpen} onClose={() => setFinderModalOpen(false)} title="Report Finding This Item" size="md">
        {finderSuccess ? (
          <div className="space-y-4">
            <Alert type="success">Your finder report is linked to the original lost-item report. Please hand the physical item to the designated university staff or Lost & Found office. Do not arrange a private handover with the owner.</Alert>
            <Button variant="primary" className="w-full" onClick={() => setFinderModalOpen(false)}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleFinderSubmit} className="space-y-4">
            {submitError && <Alert type="error">{submitError}</Alert>}
            <Alert type="info">Your logged-in account will be recorded as the finder. The item remains LOST until staff confirms receipt.</Alert>
            <Input
              label="Where did you find it? *"
              name="found_location"
              value={finderForm.found_location}
              onChange={(e) => setFinderForm({ ...finderForm, found_location: e.target.value })}
              error={errors.found_location}
              required
            />
            <Input
              label="When did you find it? *"
              type="date"
              name="found_date"
              value={finderForm.found_date}
              onChange={(e) => setFinderForm({ ...finderForm, found_date: e.target.value })}
              error={errors.found_date}
              max={new Date().toISOString().split('T')[0]}
              required
            />
            <Textarea
              label="Additional details"
              name="finder_details"
              value={finderForm.additional_details}
              onChange={(e) => setFinderForm({ ...finderForm, additional_details: e.target.value })}
              rows={3}
            />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setFinderModalOpen(false)}>Cancel</Button>
              <Button type="submit" loading={submitting} className="flex-1">Submit Finder Report</Button>
            </div>
          </form>
        )}
      </Modal>
    </AppLayout>
  );
}
