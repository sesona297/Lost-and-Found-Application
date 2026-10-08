import { useEffect, useState } from 'react';
import { fetchAllItemsAdmin, fetchFinderReports, receiveItem, returnItem } from '@/services/api';
import { FinderReport, ItemWithRelations } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Table from '@/components/ui/Table';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ItemTypeBadge, ItemStatusBadge } from '@/components/ui/StatusBadge';
import { ITEM_STATUSES } from '@/types';

export default function AdminItemsPage() {
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [finderReports, setFinderReports] = useState<FinderReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [returnConfirmation, setReturnConfirmation] = useState<ItemWithRelations | null>(null);
  const [returning, setReturning] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const [data, reports] = await Promise.all([fetchAllItemsAdmin(), fetchFinderReports()]);
      setItems(data);
      setFinderReports(reports);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async (item: ItemWithRelations, report?: FinderReport) => {
    setError(null);
    try {
      await receiveItem(item.id, report?.id);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record staff receipt.');
    }
  };

  const handleReturn = async (item: ItemWithRelations) => {
    setError(null);
    setReturning(true);
    try {
      await returnItem(item.id);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record item return.');
    } finally {
      setReturning(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filtered = items.filter(
    (item) =>
      (filterType === 'all' || item.item_type === filterType) &&
      (filterStatus === 'all' || item.status === filterStatus)
  );

  if (loading) {
    return (
      <AppLayout>
        <Spinner size="lg" className="py-20" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="All Items" description="Manage all reported lost and found items." />
      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      <div className="flex gap-3 mb-4 flex-wrap">
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-auto"
        >
          <option value="all">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </Select>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-auto"
        >
          <option value="all">All Statuses</option>
          {ITEM_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
        <span className="text-sm self-center" style={{ color: 'var(--color-text-muted)' }}>
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <Table
        columns={[
          {
            key: 'title',
            label: 'Item',
            render: (row) => (
              <div className="flex items-center gap-3">
                {row.image_url ? (
                  <img src={row.image_url} alt={row.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                    <span className="text-xs" style={{ color: 'var(--color-text-light)' }}>N/A</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{row.title}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{row.category}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'type',
            label: 'Type',
            render: (row) => <ItemTypeBadge type={row.item_type} />,
          },
          {
            key: 'reporter',
            label: 'Original Reporter',
            render: (row) => <span className="text-xs">{row.reporter?.full_name || 'Unknown'}</span>,
          },
          {
            key: 'campus',
            label: 'Campus',
            render: (row) => <span className="text-sm">{row.campus?.name || '—'}</span>,
          },
          {
            key: 'location',
            label: 'Location',
            render: (row) => <span className="text-sm">{row.location}</span>,
          },
          {
            key: 'finder',
            label: 'Finder / Handover',
            render: (row) => {
              const reports = finderReports.filter((entry) => entry.item_id === row.id);
              if (!reports.length) return <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No finder report</span>;
              return (
                <div className="space-y-2 text-xs min-w-40">
                  {reports.map((report) => (
                    <div key={report.id}>
                      <p className="font-medium">{report.finder.full_name}</p>
                      <p>{report.found_location}</p>
                      <p>{new Date(report.found_date).toLocaleDateString('en-GB')}</p>
                      {report.additional_details && <p className="mt-1">{report.additional_details}</p>}
                      <p className="mt-1 font-medium">{report.received_at ? 'Received by staff' : 'Awaiting staff receipt'}</p>
                    </div>
                  ))}
                </div>
              );
            },
          },
          {
            key: 'custody',
            label: 'Custody / Actions',
            render: (row) => {
              const report = finderReports.find((entry) => entry.item_id === row.id && !entry.received_at);
              if (row.status === 'claimed' && row.received_at) {
                return <Button variant="primary" size="sm" onClick={() => setReturnConfirmation(row)}>Mark Returned</Button>;
              }
              if (row.received_at) return <span className="text-xs">With university staff</span>;
              if (row.item_type === 'lost' && report) {
                return <Button variant="outline" size="sm" onClick={() => handleReceive(row, report)}>Confirm Receipt</Button>;
              }
              if (row.item_type === 'found' && row.status === 'found') {
                return <Button variant="outline" size="sm" onClick={() => handleReceive(row)}>Confirm Receipt</Button>;
              }
              return <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Not in custody</span>;
            },
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <ItemStatusBadge status={row.status} />,
          },
          {
            key: 'date_event',
            label: 'Date',
            render: (row) => <span className="text-xs whitespace-nowrap">{new Date(row.date_event).toLocaleDateString('en-GB')}</span>,
          },
        ]}
        data={filtered}
        emptyMessage="No items found matching your filters."
      />
      <ConfirmDialog
        open={!!returnConfirmation}
        title="Record Item Return"
        message={`Confirm that ${returnConfirmation?.title || 'this item'} was physically collected by the approved claimant from university staff.`}
        confirmLabel="Confirm Return"
        onConfirm={async () => {
          if (returnConfirmation) await handleReturn(returnConfirmation);
          setReturnConfirmation(null);
        }}
        onCancel={() => setReturnConfirmation(null)}
        loading={returning}
      />

    </AppLayout>
  );
}
