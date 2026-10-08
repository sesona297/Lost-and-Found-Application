import * as data from './data';
import type { Item, Claim } from '@/types';

export { fetchCampuses } from './data';
export { fetchItems } from './data';
export type { ItemFilters } from './data';
export { fetchItemById } from './data';
export { submitFinderReport, fetchFinderReports, receiveItem, returnItem } from './data';
export { fetchMyItems } from './data';
export { fetchAllItemsAdmin } from './data';
export { updateItemStatus } from './data';
export { fetchMyClaims } from './data';
export { fetchClaimsByStatus } from './data';
export { approveClaim } from './data';
export { rejectClaim } from './data';
export { fetchAllProfiles } from './data';
export { fetchAdminActions } from './data';
export { fetchStudentStats } from './data';
export { fetchAdminStats } from './data';

export async function createItem(item: {
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  campus_id: string;
  location: string;
  item_type: 'lost' | 'found';
  date_event: string;
  additional_details: string | null;
}): Promise<Item> {
  return data.createItem(item);
}

export async function createClaim(claim: {
  item_id: string;
  reason: string;
  identifying_details: string;
  additional_info: string | null;
  contact_details: string;
}): Promise<Claim> {
  return data.createClaim(claim);
}
