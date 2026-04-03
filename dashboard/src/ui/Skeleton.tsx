export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variants: Record<string, string> = {
    text: 'rounded-md h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`bg-surface-container-high/60 animate-pulse ${variants[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

export interface SkeletonCardProps {
  className?: string;
  lines?: number;
  icon?: boolean;
  elevation?: 'low' | 'medium' | 'high';
}

export function SkeletonCard({
  className = '',
  lines = 3,
  icon = true,
  elevation = 'low',
}: SkeletonCardProps) {
  const shadows: Record<string, string> = {
    low: 'shadow-ambient',
    medium: 'shadow-[0_15px_45px_-8px_rgba(25,28,29,0.08)]',
    high: 'shadow-[0_20px_60px_-10px_rgba(25,28,29,0.1)]',
  };

  return (
    <div className={`bg-surface-container-lowest rounded-lg p-6 ${shadows[elevation]} ${className}`}>
      <div className="flex items-start gap-4">
        {icon && <Skeleton variant="circular" className="w-10 h-10 shrink-0" />}
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" className="w-2/3 h-4" />
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              className={`h-3 ${i === lines - 2 ? 'w-1/2' : 'w-full'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
