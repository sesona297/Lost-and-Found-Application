import { Link } from 'react-router-dom';
import { ItemWithRelations } from '@/types';
import { ItemTypeBadge, ItemStatusBadge } from '@/components/ui/StatusBadge';
import { MapPin, Calendar, Tag } from 'lucide-react';

interface ItemCardProps {
  item: ItemWithRelations;
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Link
      to={`/items/${item.id}`}
      className="card hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
    >
      <div className="aspect-[4/3] relative overflow-hidden" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full" style={{ color: 'var(--color-text-light)' }}>
            <span className="text-xs">No image</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <ItemTypeBadge type={item.item_type} />
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-primary transition-colors" style={{ color: 'var(--color-text)' }}>
          {item.title}
        </h3>
        <div className="flex flex-wrap gap-2 text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3 w-3" /> {item.category}
          </span>
          {item.campus && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {item.campus.name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Calendar className="h-3 w-3" />
            {new Date(item.date_event).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
          <ItemStatusBadge status={item.status} />
        </div>
      </div>
    </Link>
  );
}
