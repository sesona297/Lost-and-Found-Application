import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCampuses, createItem } from '@/services/api';
import { Campus, ITEM_CATEGORIES } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import ImageUpload from '@/components/ui/ImageUpload';
import { PackagePlus, Package, CheckCircle } from 'lucide-react';

interface ReportItemPageProps {
  itemType: 'lost' | 'found';
}

export default function ReportItemPage({ itemType }: ReportItemPageProps) {
  const navigate = useNavigate();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    campus_id: '',
    location: '',
    date_event: '',
    additional_details: '',
  });

  useEffect(() => {
    fetchCampuses().then(setCampuses).catch(console.error);
  }, []);

  const isLost = itemType === 'lost';
  const title = isLost ? 'Report Lost Item' : 'Report Found Item';
  const icon = isLost ? <PackagePlus className="h-6 w-6" /> : <Package className="h-6 w-6" />;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Item title is required';
    if (!form.category) e.category = 'Please select a category';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.campus_id) e.campus_id = 'Please select a campus';
    if (!form.location.trim()) e.location = 'Specific location is required';
    if (!form.date_event) e.date_event = isLost ? 'Date lost is required' : 'Date found is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await createItem({
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        image_url: imageUrl,
        campus_id: form.campus_id,
        location: form.location.trim(),
        item_type: itemType,
        date_event: form.date_event,
        additional_details: form.additional_details.trim() || null,
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AppLayout>
        <Card className="max-w-md mx-auto p-8 text-center animate-scale-in">
          <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: 'var(--color-success-light)' }}>
            <CheckCircle className="h-10 w-10" style={{ color: 'var(--color-success)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2">Report Submitted!</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Your {isLost ? 'lost' : 'found'} item report has been created successfully.
            {isLost
              ? ' If someone finds it, they can report that against your original lost-item report.'
              : ' Please hand the physical item to designated university staff or the Lost & Found office. Claims can be submitted after staff confirms receipt.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            <Button variant="primary" onClick={() => {
              setSuccess(false);
              setForm({ title: '', category: '', description: '', campus_id: '', location: '', date_event: '', additional_details: '' });
              setImageUrl(null);
            }}>
              Report Another
            </Button>
          </div>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={title}
        description={isLost
          ? 'Provide details about the item you lost so others can help you find it.'
          : 'Provide details about the item you found so the owner can claim it.'}
      />

      <div className="max-w-2xl">
        {submitError && <Alert type="error" className="mb-4">{submitError}</Alert>}

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: isLost ? 'var(--color-error-light)' : 'var(--color-info-light)', color: isLost ? 'var(--color-error)' : 'var(--color-info)' }}>
              {icon}
            </div>
            <div>
              <h2 className="font-semibold text-sm">Item Details</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                All fields marked with * are required
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Item Title *"
              type="text"
              name="title"
              placeholder="e.g. Black Nike backpack"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              error={errors.title}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category *"
                name="category"
                placeholder="Select category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                error={errors.category}
              >
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>

              <Select
                label="Campus *"
                name="campus_id"
                placeholder="Select campus"
                value={form.campus_id}
                onChange={(e) => setForm({ ...form, campus_id: e.target.value })}
                error={errors.campus_id}
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>

            <Input
              label="Specific Location *"
              type="text"
              name="location"
              placeholder="e.g. Library, 2nd floor near study area"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              error={errors.location}
            />

            <Textarea
              label="Description *"
              name="description"
              placeholder="Describe the item in detail — colour, brand, distinguishing features, contents, etc."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              error={errors.description}
            />

            <Input
              label={isLost ? 'Date Lost *' : 'Date Found *'}
              type="date"
              name="date_event"
              value={form.date_event}
              onChange={(e) => setForm({ ...form, date_event: e.target.value })}
              error={errors.date_event}
              max={new Date().toISOString().split('T')[0]}
            />

            <ImageUpload
              label="Item Image"
              onUpload={setImageUrl}
              currentUrl={imageUrl}
              hint="Upload a clear photo of the item (optional but recommended)"
            />

            <Textarea
              label="Additional Details"
              name="additional_details"
              placeholder="Any other information that might help identify the item (optional)"
              value={form.additional_details}
              onChange={(e) => setForm({ ...form, additional_details: e.target.value })}
              rows={3}
            />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                {isLost ? 'Submit Lost Report' : 'Submit Found Report'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
