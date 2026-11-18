import React from "react";
import { Sparkles, Layers } from "lucide-react";
import ServerPagination from "./ServerPagination";

const ServerSideTable = ({
  title,
  subtitle,
  columns = [],
  data = [],
  totalCount = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  const splitThreshold = Math.ceil(columns.length / 2);

  return (
    <div className="neon-glow-card p-4 sm:p-6 border border-sky-400/40 shadow-[0_0_30px_rgba(14,165,233,0.22)] rounded-3xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="gold-badge-icon w-10 h-10 flex items-center justify-center shadow-lg shrink-0">
            <Sparkles className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
              <span className="gold-metallic-text">{title}</span>
            </h2>
            {subtitle ? (
              <p className="text-[11px] sm:text-xs text-slate-300 font-semibold tracking-wider uppercase">
                {subtitle}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 font-medium">
                Verified Ledger & Transactions
              </p>
            )}
          </div>
        </div>

        <span className="px-3.5 py-1.5 bg-sky-500/15 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold font-mono self-start sm:self-auto">
          Total Records: {totalCount}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-sky-500/30 shadow-inner bg-[#040914]/90">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-nowrap divide-x divide-white/10">
              {columns.map((col, idx) => {
                const isBlueSide = col.headerType ? col.headerType === "blue" : idx < splitThreshold;
                return (
                  <th
                    key={col.accessor || idx}
                    className={`py-3.5 px-4 text-xs font-black tracking-wider uppercase ${
                      isBlueSide ? "split-header-blue" : "split-header-gold"
                    } ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm divide-y divide-sky-500/15">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <Layers className="w-10 h-10 text-sky-400/40 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm font-medium">No results found.</p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-sky-950/30 text-nowrap transition-colors border-b border-sky-500/10"
                >
                  {columns.map((col, colIdx) => {
                    const isBlueSide = col.headerType ? col.headerType === "blue" : colIdx < splitThreshold;
                    return (
                      <td
                        key={col.accessor || colIdx}
                        className={`py-3.5 px-4 ${
                          isBlueSide ? "text-slate-100 font-medium" : "text-amber-300 font-bold font-mono"
                        } ${col.className || ""}`}
                      >
                        {col.cell ? col.cell(row, rowIndex) : row[col.accessor]}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <ServerPagination
          currentPage={currentPage}
          totalPages={totalPages}
          maxPageButtons={5}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default ServerSideTable;
