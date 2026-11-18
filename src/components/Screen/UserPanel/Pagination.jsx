import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const generatePaginationRange = (currentPage, totalPages) => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
        return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
    const paginationRange = generatePaginationRange(currentPage, totalPages);

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

            {/* Page Number Buttons */}
            {paginationRange.map((page, index) => {
                if (typeof page === 'string') {
                    return (
                        <span key={`ellipsis-${index}`} className="w-8 h-9 flex items-center justify-center text-slate-500 font-mono">
                            ...
                        </span>
                    );
                }

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

export default Pagination;