import { cn } from "@/lib/utils/ui";

/**
 * Skeleton component for loading states
 * Displays a pulsing placeholder while content is loading
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton }; 