const Skeleton = ({ className = '', ...props }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} {...props} />
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-700/50">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

export const SkeletonKanban = () => (
  <div className="flex gap-4 overflow-x-auto pb-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-72 space-y-3">
        <Skeleton className="h-8 w-32 rounded-xl" />
        {Array.from({ length: 3 }).map((_, j) => (
          <div key={j} className="bg-white dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
