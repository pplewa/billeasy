import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils/ui';
import { ButtonProps, buttonVariants } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

/**
 * Pagination navigation component
 */
const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

/**
 * Pagination content wrapper
 */
const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
  )
);
PaginationContent.displayName = 'PaginationContent';

/**
 * Pagination item wrapper
 */
const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props} />
);
PaginationItem.displayName = 'PaginationItem';

/**
 * Pagination link component (for page numbers or prev/next)
 */
type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

/**
 * Pagination ellipsis (...)
 */
const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => {
  const t = useTranslations('common');

  return (
    <span
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">{t('pagination.morePagesLabel')}</span>
    </span>
  );
};
PaginationEllipsis.displayName = 'PaginationEllipsis';

/**
 * Pagination Next button
 */
const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
  const t = useTranslations('common');

  return (
    <PaginationLink
      aria-label={t('pagination.nextPageLabel')}
      size="default"
      className={cn('gap-1 px-2.5', className)}
      {...props}
    >
      <span>{t('pagination.next')}</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
};
PaginationNext.displayName = 'PaginationNext';

/**
 * Pagination Previous button
 */
const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const t = useTranslations('common');

  return (
    <PaginationLink
      aria-label={t('pagination.previousPageLabel')}
      size="default"
      className={cn('gap-1 px-2.5', className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>{t('pagination.previous')}</span>
    </PaginationLink>
  );
};
PaginationPrevious.displayName = 'PaginationPrevious';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
