import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { fetchMyItems } from '@/services/api';
import { ItemWithRelations } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import ItemCard from '@/components/ItemCard';
import Alert from '@/components/ui/Alert';
import { FileText, PackagePlus } from 'lucide-react';

export default function MyReportsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const data = await fetchMyItems(user.id);
        setItems(data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  if (loading) {
    return (
      <AppLayout>
        <Spinner size="lg" className="py-20" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="My Reports"
        description="Items you have reported as lost or found."
        action={
          <>
            <Link to="/report-lost">
              <Button variant="outline" size="sm">
                <PackagePlus className="h-4 w-4" />
                Report Lost
              </Button>
            </Link>
            <Link to="/report-found">
              <Button variant="primary" size="sm">
                <PackagePlus className="h-4 w-4" />
                Report Found
              </Button>
            </Link>
          </>
        }
      />

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id}>
              {item.item_type === 'lost' && item.received_at && item.status !== 'returned' && (
                <Alert type="success" className="mb-3">Your lost item has been reported as found and is currently with university staff.</Alert>
              )}
              {item.item_type === 'lost' && item.has_finder_report && !item.received_at && (
                <Alert type="info" className="mb-3">Someone reported finding your item. It is awaiting confirmation by university staff.</Alert>
              )}
              {item.status === 'claimed' && item.received_at && (
                <Alert type="info" className="mb-3">Your claim was approved. Collect the item from university staff; do not arrange a private handover with the finder.</Alert>
              )}
              {item.status === 'returned' && item.returned_at && (
                <Alert type="success" className="mb-3">Staff recorded this item as returned to its verified owner on {new Date(item.returned_at).toLocaleString()}.</Alert>
              )}
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="No reports yet"
            description="You haven't reported any lost or found items. Start by reporting one now."
            action={
              <Link to="/report-lost">
                <Button variant="primary" size="sm">Report an Item</Button>
              </Link>
            }
          />
        </div>
      )}
    </AppLayout>
  );
}
