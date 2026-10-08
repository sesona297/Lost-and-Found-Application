export type UserRole = 'student' | 'admin';

export type ItemType = 'lost' | 'found';

export type ItemStatus = 'lost' | 'found' | 'claimed' | 'returned';

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  student_number: string | null;
  staff_number: string | null;
  role: UserRole;
  phone: string | null;
  created_at: string;
}

export interface Campus {
  id: string;
  name: string;
  created_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  campus_id: string | null;
  location: string;
  item_type: ItemType;
  status: ItemStatus;
  date_event: string;
  additional_details: string | null;
  received_by?: string | null;
  received_at?: string | null;
  returned_to?: string | null;
  returned_by?: string | null;
  returned_at?: string | null;
  has_finder_report?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemWithRelations extends Item {
  campus?: Campus | null;
  reporter?: Profile | null;
}

export interface FinderReport {
  id: string;
  item_id: string;
  finder_id: string;
  found_location: string;
  found_date: string;
  additional_details: string | null;
  received_by: string | null;
  received_at: string | null;
  created_at: string;
  item_title: string;
  item_type: ItemType;
  item_status: ItemStatus;
  finder: Profile;
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  reason: string;
  identifying_details: string;
  additional_info: string | null;
  contact_details: string;
  status: ClaimStatus;
  verification_notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface ClaimWithRelations extends Claim {
  item?: Item | null;
  claimant?: Profile | null;
  verifier?: Profile | null;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action: string;
  item_id: string | null;
  claim_id: string | null;
  description: string;
  created_at: string;
}

export interface AdminActionWithRelations extends AdminAction {
  admin?: Profile | null;
  item?: Item | null;
}

export const ITEM_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Bags',
  'Books',
  'ID/Documents',
  'Keys',
  'Jewellery',
  'Accessories',
  'Other',
] as const;

export const ITEM_STATUSES: { value: ItemStatus; label: string; color: string }[] = [
  { value: 'lost', label: 'Lost', color: 'error' },
  { value: 'found', label: 'Found', color: 'info' },
  { value: 'claimed', label: 'Claimed', color: 'warning' },
  { value: 'returned', label: 'Returned', color: 'success' },
];

export const CLAIM_STATUSES: { value: ClaimStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
];

export function getStatusInfo(status: string) {
  return ITEM_STATUSES.find((s) => s.value === status) ?? { value: status, label: status, color: 'info' };
}

export function getClaimStatusInfo(status: string) {
  return CLAIM_STATUSES.find((s) => s.value === status) ?? { value: status, label: status, color: 'info' };
}
