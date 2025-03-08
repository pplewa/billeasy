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

  // Custom styling based on status
  const getCustomStyles = () => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-500';
      case InvoiceStatus.PENDING:
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-500';
      case InvoiceStatus.OVERDUE:
        return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-500';
      case InvoiceStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-400';
      case InvoiceStatus.DRAFT:
      default:
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary-foreground/20';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn('capitalize whitespace-nowrap', getCustomStyles(), className)}
    >
      {getLabel()}
    </Badge>
  );
}
