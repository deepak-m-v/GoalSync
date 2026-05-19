export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

export default function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  );
}
