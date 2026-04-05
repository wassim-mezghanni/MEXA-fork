

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}: PaginationProps) {
  const getPages = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages shown around current (current-1, current, current+1)

    const left = currentPage - delta;
    const right = currentPage + delta;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // Always show first
        i === totalPages || // Always show last
        (i >= left && i <= right) // Show around current
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const pages = getPages();

  return (
    <div className={`flex items-center justify-between w-full p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-sm transition-all duration-500 hover:shadow-md ${className}`}>
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
        aria-label="Previous page"
      >
        <span className="icon text-lg group-active:-translate-x-1 transition-transform">chevron_left</span>
      </button>

      <div className="flex items-center gap-1.5 translate-y-0.5">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`dots-${index}`} className="w-8 flex items-center justify-center text-outline/30 select-none animate-in fade-in duration-700">
                <span className="icon text-sm">more_horiz</span>
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 font-headline text-xs tracking-tighter ${
                isActive 
                  ? "bg-primary text-white font-extrabold shadow-lg shadow-primary/20 scale-110 z-10" 
                  : "text-on-surface-variant font-bold hover:bg-white hover:text-primary border border-transparent hover:border-outline-variant/10"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-20 disabled:cursor-not-allowed group"
        aria-label="Next page"
      >
        <span className="icon text-lg group-active:translate-x-1 transition-transform">chevron_right</span>
      </button>
    </div>
  );
}
