/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { Sparkles, Search, Download, Layers } from "lucide-react";
import Pagination from "./Pagination";
import { extractText } from "../../../utils/helper";

const DataTable = ({
  title,
  subtitle,
  columns = [],
  data = [],
  pageSize = 10,
  dropdownFilters = [],
}) => {
  const [filters, setFilters] = useState({});
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const renderDropdownFilters = () => {
    return dropdownFilters.map((filterItem) => (
      <div
        className="flex flex-col text-slate-300 text-xs w-full md:w-auto font-medium"
        key={filterItem.accessor}
      >
        {filterItem.label && <label className="mb-1 text-slate-400">{filterItem.label}</label>}
        <select
          className="bg-[#0b1324] border border-sky-500/30 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition cursor-pointer"
          value={filters[filterItem.accessor] || "all"}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              [filterItem.accessor]: e.target.value,
            }))
          }
        >
          <option value="all">All {filterItem.label || "Options"}</option>
          {filterItem.options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0b1324] text-white">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    ));
  };

  // Pehle data ko filter karein
  const filteredData = useMemo(() => {
    let filtered = data || [];

    // Apply text search filter
    if (filter) {
      const lowerCaseFilter = filter.toLowerCase();
      filtered = filtered?.filter((row) =>
        columns?.some((column) => {
          const content = column.searchValue
            ? column.searchValue(row)
            : row[column.accessor]?.toString();
          return content?.toLowerCase().includes(lowerCaseFilter);
        })
      );
    }

    // Apply dropdown filters
    Object.entries(filters).forEach(([accessor, selected]) => {
      if (selected === "all") return;

      filtered = filtered.filter((row) => {
        const col = columns.find((c) => c.accessor === accessor);
        const content = col?.searchValue
          ? col.searchValue(row)
          : row[accessor]?.toString().toLowerCase();

        return content === selected;
      });
    });

    return filtered;
  }, [data, filter, filters, columns]);

  // Pagination calculation
  const totalPages = Math.ceil((filteredData?.length || 0) / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData?.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const exportToExcel = (rows) => {
    const formattedData = rows.map((row, index) => {
      const obj = {};

      columns.forEach((col) => {
        if (col.exportable === false) return; // Skip non-exportable columns

        let rawValue;
        if (col.cell) {
          try {
            rawValue = col.cell(row, index);
          } catch {
            rawValue = row[col.accessor];
          }
        } else {
          rawValue = row[col.accessor];
        }

        obj[col.header] = extractText(rawValue);
      });

      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, `${title || "data"}.xlsx`);
  };

  const splitThreshold = Math.ceil(columns.length / 2);

  return (
    <div className="neon-glow-card p-4 sm:p-6 border border-sky-400/40 shadow-[0_0_30px_rgba(14,165,233,0.22)] rounded-3xl">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-5 gap-4">
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
                Verified Records & Smart Ledger
              </p>
            )}
          </div>
        </div>

        {/* Search + Dropdowns + Export Button container */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative w-full sm:w-auto min-w-[200px]">
            <Search className="w-4 h-4 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-60 bg-[#060e1e] border border-sky-500/30 rounded-xl py-2 pl-9 pr-4 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
            />
          </div>

          {renderDropdownFilters()}

          {/* Export Button */}
          <button
            onClick={() => exportToExcel(filteredData)}
            className="w-full sm:w-auto text-xs font-black px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Split Table Structure */}
      <div className="overflow-x-auto rounded-2xl border border-sky-500/30 shadow-inner bg-[#040914]/90">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-nowrap divide-x divide-white/10">
              {columns?.map((col, idx) => {
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
            {paginatedData?.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-sky-950/30 text-nowrap transition-colors border-b border-sky-500/10"
              >
                {columns?.map((col, colIdx) => {
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
            ))}
          </tbody>
        </table>
        {paginatedData?.length === 0 && (
          <div className="text-center py-12">
            <Layers className="w-10 h-10 text-sky-400/40 mx-auto mb-2" />
            <p className="text-slate-400 text-sm font-medium">No results found.</p>
          </div>
        )}
      </div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
};

export default DataTable;