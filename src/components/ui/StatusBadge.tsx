import Badge, { type Color } from './Badge';
import { getStatusInfo, getClaimStatusInfo } from '@/types';
import { Package, Eye, Hand, CheckCircle } from 'lucide-react';

const itemIcons: Record<string, React.ReactNode> = {
  lost: <Package className="h-3 w-3" />,
  found: <Eye className="h-3 w-3" />,
  claimed: <Hand className="h-3 w-3" />,
  returned: <CheckCircle className="h-3 w-3" />,
};

export function ItemStatusBadge({ status }: { status: string }) {
  const info = getStatusInfo(status);
  return (
    <Badge color={info.color as Color}>
      {itemIcons[status]}
      {info.label}
    </Badge>
  );
}

export function ClaimStatusBadge({ status }: { status: string }) {
  const info = getClaimStatusInfo(status);
  return <Badge color={info.color as Color}>{info.label}</Badge>;
}

export function ItemTypeBadge({ type }: { type: string }) {
  return (
    <Badge color={type === 'lost' ? 'error' : 'info'}>
      {type === 'lost' ? 'Lost' : 'Found'}
    </Badge>
  );
}
