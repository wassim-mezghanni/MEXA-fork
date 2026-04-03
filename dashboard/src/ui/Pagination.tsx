

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
  const pages = [];
  
  // Basic logic for 1, 2, 3 ... totalPages
  // For a production component, you'd use a more robust range generator
  for (let i = 1; i <= Math.min(3, totalPages); i++) {
    pages.push(i);
  }

  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span className="icon text-lg">chevron_left</span>
      </button>

      <div className="flex items-center gap-2">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all font-heading text-sm ${
              currentPage === page 
                ? "bg-primary-container text-white font-bold" 
                : "text-on-surface-variant font-medium hover:bg-surface-container-high"
            }`}
          >
            {page}
          </button>
        ))}
        {totalPages > 3 && (
          <>
            <span className="text-outline/50 px-2 select-none">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all font-heading text-sm ${
                currentPage === totalPages 
                  ? "bg-primary-container text-white font-bold" 
                  : "text-on-surface-variant font-medium hover:bg-surface-container-high"
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span className="icon text-lg">chevron_right</span>
      </button>
    </div>
  );
}
