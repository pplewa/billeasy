import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '@/types';
import { cn } from '@/lib/utils/ui';

interface InvoiceStatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Component to display invoice status with appropriate styling
 */
export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  // Determine variant based on status
  const getVariant = () => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'success';
      case InvoiceStatus.PENDING:
        return 'default'; // Using default as info
      case InvoiceStatus.OVERDUE:
        return 'destructive';
      case InvoiceStatus.CANCELLED:
        return 'outline';
      case InvoiceStatus.DRAFT:
      default:
        return 'secondary';
    }
  };

  // Get human-readable label
  const getLabel = () => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'Paid';
      case InvoiceStatus.PENDING:
        return 'Pending';
      case InvoiceStatus.OVERDUE:
        return 'Overdue';
      case InvoiceStatus.CANCELLED:
        return 'Cancelled';
      case InvoiceStatus.DRAFT:
        return 'Draft';
      default:
        return status;
    }
  };

  return (
    <Badge variant={getVariant()} className={cn('capitalize', className)}>
      {getLabel()}
    </Badge>
  );
}
