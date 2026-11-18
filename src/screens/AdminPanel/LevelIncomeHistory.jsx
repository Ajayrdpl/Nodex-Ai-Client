import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getAllLevelIncomeHistory } from "../../api/admin.api";
import { isToday } from "../../utils/helper";
import { useLocation } from "react-router-dom";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { RefreshCw, Download, Layers, Filter, Users, TrendingUp, DollarSign } from "lucide-react";

const LevelIncomeHistory = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const data = location?.state;

  const [allLevelIncomeHistory, setAllLevelIncomeHistory] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [summaryData, setSummaryData] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("all");

  const fetchAllLevelIncomeHistory = async (isManual = false) => {
    try {
      if (!isManual) dispatch(setLoading(true));
      const response = await getAllLevelIncomeHistory();
      if (response?.success) {
        const list = Array.isArray(response?.data?.history)
          ? response.data.history
          : Array.isArray(response?.data)
          ? response.data
          : [];
        setAllLevelIncomeHistory(list);
        setTotalIncome(response?.data?.totalIncome || response?.summary?.totalPaid || 0);
        setTodayTotal(response?.data?.todayTotal || 0);
        setSummaryData(response?.summary || null);
        if (isManual) toast.success("10-Level income logs refreshed");
      } else {
        setAllLevelIncomeHistory([]);
      }
    } catch (err) {
      toast.error("Failed to fetch 10-Level ROI Dividend history");
      setAllLevelIncomeHistory([]);
    } finally {
      if (!isManual) dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAllLevelIncomeHistory();
  }, []);

  const handleExportCSV = () => {
    if (!filteredIncomeHistory.length) {
      toast.info("No records to export");
      return;
    }
    const headers = ["#", "Transaction ID", "User ID", "From Downline", "Depth Level", "Downline ROI ($)", "Rate (%)", "Level Income ($)", "Status", "Date"];
    const rows = filteredIncomeHistory.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
      item?.user?.username || item?.user?.id || item?.user || "N/A",
      item?.fromUser?.username || item?.fromUser?.id || item?.fromUser || "Downline",
      `Level ${item.level || 1}`,
      Number(item.amount || 0).toFixed(2),
      `${item.percentage || ""}%`,
      Number(item.income || 0).toFixed(2),
      item.status || "Completed",
      item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `10_level_income_admin_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter by today and selected level
  const filteredIncomeHistory = useMemo(() => {
    return allLevelIncomeHistory.filter((item) => {
      const matchesToday = data === "today" ? isToday(new Date(item.createdAt)) : true;
      const matchesLevel = selectedLevel === "all" ? true : String(item.level) === String(selectedLevel);
      return matchesToday && matchesLevel;
    });
  }, [allLevelIncomeHistory, data, selectedLevel]);

  // Dynamic Level-wise summary calculations from active data
  const levelBreakdown = useMemo(() => {
    const counts = {};
    allLevelIncomeHistory.forEach((item) => {
      const lvl = item.level || 1;
      counts[lvl] = (counts[lvl] || 0) + Number(item.income || 0);
    });
    return counts;
  }, [allLevelIncomeHistory]);

  const distinctLevelsCount = useMemo(() => {
    const uniqueLevels = new Set(allLevelIncomeHistory.map((i) => i.level || 1));
    return uniqueLevels.size;
  }, [allLevelIncomeHistory]);

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-medium text-white">{rowIndex + 1}</span>
      ),
    },
    {
      header: "Transaction ID",
      accessor: "id",
      cell: (row) => <span className="font-medium text-white font-mono">{row?.id || row?._id}</span>,
      searchValue: (row) => row?.id?.toString() || row?._id?.toString() || "",
    },
    {
      header: "Receiver User",
      accessor: "user.username",
      cell: (row) => (
        <span className="font-semibold text-cyan-400">
          {row?.user?.username || row?.user?.id || row?.user || "N/A"}
        </span>
      ),
      searchValue: (row) => row?.user?.username || row?.user?.id || row?.user || "",
    },
    {
      header: "From Downline",
      accessor: "fromUser.username",
      cell: (row) => (
        <span className="font-medium text-slate-300">
          {row?.fromUser?.username || row?.fromUser?.id || row?.fromUser || "Direct Partner"}
        </span>
      ),
      searchValue: (row) => row?.fromUser?.username || row?.fromUser?.id || row?.fromUser || "",
    },
    {
      header: "Depth Level",
      accessor: "level",
      cell: (row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Level {row?.level || "1"}
        </span>
      ),
    },
    {
      header: "Downline ROI",
      accessor: "amount",
      cell: (row) => (
        <span className="font-medium text-white text-nowrap">
          ${Number(row?.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Percentage",
      accessor: "percentage",
      cell: (row) => (
        <span className="font-bold text-amber-400">
          {row?.percentage ? `${row.percentage}%` : "-"}
        </span>
      ),
    },
    {
      header: "Level Dividend",
      accessor: "income",
      cell: (row) => (
        <span className="font-bold text-emerald-400 text-nowrap">
          +${Number(row?.income || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`font-semibold text-xs px-2.5 py-1 rounded-full ${
            row?.status === "Completed"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          }`}
        >
          {row?.status || "Completed"}
        </span>
      ),
      searchValue: (row) => row?.status || "",
    },
    {
      header: "Date & Time",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-slate-300 text-xs">
          {row?.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
        </span>
      ),
    },
  ];

  const calculatedTotal = useMemo(() => {
    return totalIncome || summaryData?.totalPaid || allLevelIncomeHistory.reduce((sum, item) => sum + Number(item.income || 0), 0);
  }, [totalIncome, summaryData, allLevelIncomeHistory]);

  const calculatedToday = useMemo(() => {
    return todayTotal || allLevelIncomeHistory.filter((item) => isToday(new Date(item.createdAt))).reduce((sum, item) => sum + Number(item.income || 0), 0);
  }, [todayTotal, allLevelIncomeHistory]);

  const cardData = [
    {
      title: "Total 10-Level Income Paid",
      value: `$${Number(calculatedTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://cdn-icons-png.flaticon.com/512/10102/10102408.png",
    },
    {
      title: "Today's Level Income Paid",
      value: `$${Number(calculatedToday).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/isometric/50/economic-improvement--v1.png",
    },
    {
      title: "Total Distribution Records",
      value: `${allLevelIncomeHistory.length} Transactions`,
      icon: "https://img.icons8.com/3d-fluency/94/layers.png",
    },
    {
      title: "Active Generation Tiers",
      value: `${distinctLevelsCount} / 10 Levels Active`,
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <Layers size={13} className="text-indigo-400" />
            03. 10-Level ROI Generation Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">10-Level ROI Dividend Reports</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time platform distribution audit for 10-level generation dividends across all active downlines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAllLevelIncomeHistory(true)}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Export CSV"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            iconImage={item.icon}
          />
        ))}
      </div>

      {/* Dynamic Level Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Filter size={14} className="text-indigo-400" />
          <span>Filter by Generation Depth:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedLevel("all")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedLevel === "all"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            All Levels ({allLevelIncomeHistory.length})
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => {
            const countForLvl = allLevelIncomeHistory.filter((i) => (i.level || 1) === lvl).length;
            if (countForLvl === 0 && selectedLevel !== String(lvl)) return null; // Only show active levels or all

            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(String(lvl))}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedLevel === String(lvl)
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                L{lvl} {countForLvl > 0 ? `(${countForLvl})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title={`10-Level ROI Dividend Income History ${selectedLevel !== "all" ? `(Level ${selectedLevel})` : "(All Users)"}`}
        columns={columns}
        data={filteredIncomeHistory}
        pageSize={10}
      />
    </div>
  );
};

export default LevelIncomeHistory;
