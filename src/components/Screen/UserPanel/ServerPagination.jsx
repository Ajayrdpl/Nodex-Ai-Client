import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ServerPagination = ({
  totalPages,
  currentPage,
  onPageChange,
  maxPageButtons = 5,
}) => {
  if (totalPages === 0) return null;

  // Calculate start and end page for pagination range
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = startPage + maxPageButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-6 pt-4 border-t border-sky-500/20">
      {/* Previous Button */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#09152b] text-sky-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-900/40 hover:text-white transition-colors border border-sky-500/30 cursor-pointer"
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page) => {
        const isActive = currentPage === page;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-xl transition-all font-bold text-xs sm:text-sm border cursor-pointer ${
              isActive
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                : "bg-[#09152b] text-slate-300 border-sky-500/30 hover:bg-sky-900/40 hover:text-white"
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#09152b] text-sky-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-900/40 hover:text-white transition-colors border border-sky-500/30 cursor-pointer"
        aria-label="Next Page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default ServerPagination;
