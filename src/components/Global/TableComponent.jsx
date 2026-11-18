import React from "react";

const TableComponent = ({ columns, rows }) => {
  const length = columns.length;
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
    8: "grid-cols-8",
    9: "grid-cols-9",
    10: "grid-cols-10",
    11: "grid-cols-11",
    12: "grid-cols-12",
    13: "grid-cols-13",
    14: "grid-cols-14",
    15: "grid-cols-15",
    16: "grid-cols-16",
    17: "grid-cols-17",
    18: "grid-cols-18",
    19: "grid-cols-19",
    20: "grid-cols-20",
    21: "grid-cols-21",
    22: "grid-cols-22",
    23: "grid-cols-23",
    24: "grid-cols-24",
  };

  return (
    <div className="neon-glow-card py-6 px-4 w-full overflow-x-auto">
      {/* Header */}
      <div
        className={`grid ${
          gridColsClass[length] || "grid-cols-6"
        } items-center gap-4 text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-[#0d2754] via-[#091a38] to-[#0d2754] text-sky-300 border border-sky-500/30 rounded-xl px-4 py-3 min-w-[1000px] shadow-sm`}
      >
        {columns.map((col, index) => (
          <p
            key={index}
            className={`${
              index === 0
                ? "text-left"
                : index === columns.length - 1
                ? "text-right pr-4"
                : "text-center"
            }`}
          >
            {col}
          </p>
        ))}
      </div>

      {/* Rows */}
      <div className="mt-4 space-y-2">
        {rows.length > 0 ? (
          rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`grid ${
                gridColsClass[length] || "grid-cols-6"
              } items-center gap-4 text-xs sm:text-sm text-slate-200 bg-slate-950/50 border border-sky-500/15 p-3.5 rounded-xl hover:border-sky-400/40 hover:bg-sky-950/25 transition-all min-w-[1000px]`}
            >
              {row.map((cell, cellIndex) => (
                <div
                  key={cellIndex}
                  className={`${
                    cellIndex === 0
                      ? "flex items-center gap-3 font-medium text-white"
                      : cellIndex === row.length - 1
                      ? "font-bold text-right text-amber-400"
                      : "text-center"
                  }`}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-slate-400 py-6">No data found</p>
        )}
      </div>
    </div>
  );
};

export default TableComponent;
