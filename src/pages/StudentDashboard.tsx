import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { fetchStudentStats, fetchItems, fetchMyItems } from '@/services/api';
import { ItemWithRelations } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ItemCard from '@/components/ItemCard';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import { PackagePlus, Package, Search, FileText, ClipboardCheck, CheckCircle, ArrowRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ myItems: 0, activeClaims: 0, returnedItems: 0 });
  const [recentItems, setRecentItems] = useState<ItemWithRelations[]>([]);
  const [foundReports, setFoundReports] = useState<ItemWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const [s, { items }, mine] = await Promise.all([
          fetchStudentStats(user.id),
          fetchItems({ page: 1, pageSize: 6 }),
          fetchMyItems(user.id),
        ]);
        setStats(s);
        setRecentItems(items);
        setFoundReports(mine.filter((item) => item.item_type === 'lost' && item.has_finder_report));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
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
        title={`Welcome, ${user?.full_name?.split(' ')[0] || 'Student'}`}
        description="Here's an overview of your activity and recently reported items."
      />

      {foundReports.length > 0 && (
        <div className="space-y-3 mb-6">
          {foundReports.map((item) => (
            <Link key={item.id} to={`/items/${item.id}`} className="block">
              <Alert type={item.received_at ? 'success' : 'info'}>
                <span className="font-medium">{item.title}:</span>{' '}
                {item.received_at
                  ? 'Your lost item has been reported as found and is currently with university staff.'
                  : 'Someone reported finding your lost item. It is awaiting confirmation by university staff.'}
              </Alert>
            </Link>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="My Reported Items" value={stats.myItems} icon={<FileText className="h-6 w-6" />} color="var(--color-primary)" />
        <StatCard label="Active Claims" value={stats.activeClaims} icon={<ClipboardCheck className="h-6 w-6" />} color="var(--color-warning)" />
        <StatCard label="Items Returned" value={stats.returnedItems} icon={<CheckCircle className="h-6 w-6" />} color="var(--color-success)" />
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/report-lost">
          <Card hoverable className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}>
              <PackagePlus className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Report Lost Item</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>Lost something on campus</p>
            </div>
            <ArrowRight className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--color-text-light)' }} />
          </Card>
        </Link>
        <Link to="/report-found">
          <Card hoverable className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' }}>
              <Package className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Report Found Item</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>Found something? Report it</p>
            </div>
            <ArrowRight className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--color-text-light)' }} />
          </Card>
        </Link>
        <Link to="/find-items">
          <Card hoverable className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
              <Search className="h-6 w-6" color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Find an Item</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>Search lost & found items</p>
            </div>
            <ArrowRight className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--color-text-light)' }} />
          </Card>
        </Link>
      </div>

      {/* Recently reported */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Recently Reported Items</h2>
        <Link to="/find-items">
          <Button variant="ghost" size="sm">View all</Button>
        </Link>
      </div>

      {recentItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No items reported yet"
            description="Be the first to report a lost or found item."
            action={
              <Link to="/report-lost">
                <Button variant="primary" size="sm">Report an Item</Button>
              </Link>
            }
          />
        </Card>
      )}
    </AppLayout>
  );
}
