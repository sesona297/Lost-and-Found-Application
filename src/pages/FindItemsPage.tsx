import { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { fetchCampuses, fetchItems, ItemFilters } from '@/services/api';
import { Campus, ItemWithRelations, ITEM_CATEGORIES } from '@/types';
import AppLayout from '@/layouts/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ItemCard from '@/components/ItemCard';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function FindItemsPage() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [items, setItems] = useState<ItemWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [filters, setFilters] = useState<ItemFilters>({
    search: '',
    category: 'all',
    campus_id: 'all',
    item_type: 'all',
    status: 'all',
    sort: 'newest',
  });

  // Debounced search
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchCampuses().then(setCampuses).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const { items: data, total: t } = await fetchItems({ ...filters, page, pageSize });
      setItems(data);
      setTotal(t);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleFilterChange = (key: keyof ItemFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ search: '', category: 'all', campus_id: 'all', item_type: 'all', status: 'all', sort: 'newest' });
    setPage(1);
  };

  const hasActiveFilters = searchInput || (filters.category && filters.category !== 'all') || (filters.campus_id && filters.campus_id !== 'all') || (filters.item_type && filters.item_type !== 'all') || (filters.status && filters.status !== 'all');

  const totalPages = Math.ceil(total / pageSize);

  return (
    <AppLayout>
      <PageHeader
        title="Find an Item"
        description="Search and filter through all reported lost and found items."
      />

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'var(--color-text-light)' }} />
        <input
          type="text"
          placeholder="Search by keyword, e.g. 'black backpack'..."
          value={searchInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
          className="input pl-11"
          aria-label="Search items"
        />
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="ml-auto text-xs font-medium inline-flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
              <X className="h-3 w-3" /> Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            label="Category"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="all">All Categories</option>
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
          <Select
            label="Campus"
            value={filters.campus_id}
            onChange={(e) => handleFilterChange('campus_id', e.target.value)}
          >
            <option value="all">All Campuses</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select
            label="Type"
            value={filters.item_type}
            onChange={(e) => handleFilterChange('item_type', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </Select>
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="claimed">Claimed</option>
            <option value="returned">Returned</option>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {loading ? 'Loading...' : `${total} item${total !== 1 ? 's' : ''} found`}
        </p>
        <Select
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="w-auto"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </Select>
      </div>

      {/* Results grid */}
      {loading ? (
        <Spinner size="lg" className="py-16" />
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm px-2" style={{ color: 'var(--color-text-muted)' }}>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <EmptyState
            icon={<Search className="h-8 w-8" />}
            title="No items found"
            description={hasActiveFilters
              ? 'Try adjusting your search or filters to see more results.'
              : 'No items have been reported yet. Check back later!'}
            action={hasActiveFilters ? <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button> : undefined}
          />
        </div>
      )}
    </AppLayout>
  );
}
