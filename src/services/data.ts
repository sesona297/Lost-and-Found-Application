import { queryApi } from './db';
import type { AdminActionWithRelations, Campus, ClaimWithRelations, FinderReport, ItemStatus, ItemWithRelations, Profile } from '@/types';

export interface ItemFilters {
  search?: string;
  category?: string;
  campus_id?: string;
  item_type?: string;
  status?: string;
  sort?: 'newest' | 'oldest';
  page?: number;
  pageSize?: number;
}

export function fetchCampuses(): Promise<Campus[]> {
  return queryApi('/campuses');
}

export function fetchItems(filters: ItemFilters = {}): Promise<{ items: ItemWithRelations[]; total: number }> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  return queryApi(`/items${params.size ? `?${params}` : ''}`);
}

export function fetchItemById(id: string): Promise<ItemWithRelations> {
  return queryApi(`/items/${encodeURIComponent(id)}`);
}

export function createItem(item: Record<string, unknown>): Promise<ItemWithRelations> {
  return queryApi('/items', { method: 'POST', body: JSON.stringify(item) });
}

export function createClaim(claim: Record<string, unknown>): Promise<ClaimWithRelations> {
  return queryApi('/claims', { method: 'POST', body: JSON.stringify(claim) });
}

export function submitFinderReport(itemId: string, report: { found_location: string; found_date: string; additional_details: string | null }) {
  return queryApi(`/items/${encodeURIComponent(itemId)}/finder-reports`, { method: 'POST', body: JSON.stringify(report) });
}

export function fetchFinderReports(): Promise<FinderReport[]> {
  return queryApi('/admin/finder-reports');
}

export function receiveItem(itemId: string, finderReportId?: string) {
  return queryApi(`/admin/items/${encodeURIComponent(itemId)}/receive`, {
    method: 'POST', body: JSON.stringify(finderReportId ? { finder_report_id: finderReportId } : {}),
  });
}

export function returnItem(itemId: string) {
  return queryApi(`/admin/items/${encodeURIComponent(itemId)}/return`, { method: 'POST' });
}

export function fetchMyItems(_userId: string): Promise<ItemWithRelations[]> {
  void _userId;
  return queryApi('/me/items');
}

export function fetchAllItemsAdmin(): Promise<ItemWithRelations[]> {
  return queryApi('/admin/items');
}

export function updateItemStatus(id: string, status: ItemStatus | string, notes: string) {
  return queryApi(`/admin/items/${encodeURIComponent(id)}/status`, { method: 'PUT', body: JSON.stringify({ status, notes }) });
}

export function fetchMyClaims(_userId: string): Promise<ClaimWithRelations[]> {
  void _userId;
  return queryApi('/me/claims');
}

export function fetchClaimsByStatus(status: string): Promise<ClaimWithRelations[]> {
  return queryApi(`/admin/claims?status=${encodeURIComponent(status)}`);
}

export function approveClaim(id: string, notes: string) {
  return queryApi(`/admin/claims/${encodeURIComponent(id)}/approve`, { method: 'PUT', body: JSON.stringify({ notes }) });
}

export function rejectClaim(id: string, notes: string) {
  return queryApi(`/admin/claims/${encodeURIComponent(id)}/reject`, { method: 'PUT', body: JSON.stringify({ notes }) });
}

export function fetchAllProfiles(): Promise<Profile[]> {
  return queryApi('/admin/users');
}

export function fetchAdminActions(): Promise<AdminActionWithRelations[]> {
  return queryApi('/admin/actions');
}

export function fetchStudentStats(_userId: string) {
  void _userId;
  return queryApi('/me/stats') as Promise<{ myItems: number; activeClaims: number; returnedItems: number }>;
}

export function fetchAdminStats() {
  return queryApi('/admin/stats') as Promise<{ totalItems: number; lostItems: number; foundItems: number; pendingClaims: number; claimedItems: number; returnedItems: number }>;
}