import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getAllTradingList, triggerDailyRoiCron } from "../../api/admin.api";
import { useLocation } from "react-router-dom";
import { isToday } from "../../utils/helper";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import {
  PlayCircle,
  RefreshCw,
  Download,
  Zap,
  TrendingUp,
  Trophy,
  Rocket,
  Shield,
  Star,
  Gem,
  Crown,
  Flame,
  Infinity as InfinityIcon,
  Layers,
  Filter,
} from "lucide-react";
import Swal from "sweetalert2";

const ROIIncome = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const data = location.state;

  const [allIncomeHistory, setAllIncomeHistory] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [summaryData, setSummaryData] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [selectedPackageFilter, setSelectedPackageFilter] = useState("all");

  const fetchAllIncomeHistory = async (isManual = false) => {
    try {
      if (!isManual) dispatch(setLoading(true));
      const response = await getAllTradingList();
      if (response?.success) {
        const list = Array.isArray(response?.data?.history)
          ? response.data.history
          : Array.isArray(response?.data)
          ? response.data
          : [];
        setAllIncomeHistory(list);
        setTotalIncome(response?.data?.totalIncome || response?.summary?.totalPaid || 0);
        setTodayTotal(response?.data?.todayTotal || 0);
        setSummaryData(response?.summary || null);
        if (isManual) toast.success("Daily ROI logs refreshed");
      } else {
        setAllIncomeHistory([]);
      }
    } catch (err) {
      toast.error("Failed to fetch Daily ROI reports");
      setAllIncomeHistory([]);
    } finally {
      if (!isManual) dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAllIncomeHistory();
  }, []);

  const handleTriggerDistribution = async () => {
    const confirm = await Swal.fire({
      title: "Trigger Package Daily ROI Distribution?",
      html: `
        <div style="text-align: left; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          <p style="margin-bottom: 8px;">This will calculate and distribute:</p>
          <ul style="padding-left: 20px; list-style-type: disc; margin-bottom: 12px;">
            <li><strong>Package-Based Daily ROI</strong> (NOVA: 4.5%, VANTAGE: 5.0%, NEXUS: 5.5%, PRIME: 6.0%, TITAN: 6.5%, INFINITY: 7.5%)</li>
            <li><strong>220% Maximum ROI Cap</strong> verification for every active user</li>
            <li><strong>10-Level ROI Dividends</strong> (24.0% Total) to eligible uplines</li>
          </ul>
          <p style="color: #38bdf8; font-weight: bold;">Are you sure you want to execute platform distribution now?</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00D2FF",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Execute Distribution",
    });

    if (!confirm.isConfirmed) return;

    try {
      setTriggering(true);
      const res = await triggerDailyRoiCron();
      if (res?.success) {
        Swal.fire({
          icon: "success",
          title: "Distribution Completed",
          text: res?.message || "Daily ROI and 10-Level dividends successfully distributed!",
        });
        fetchAllIncomeHistory(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Distribution Failed",
          text: res?.message || "Failed to execute distribution",
        });
      }
    } catch (err) {
      toast.error(err?.message || "Error executing distribution");
    } finally {
      setTriggering(false);
    }
  };

  const handleExportCSV = () => {
    if (!filteredIncomeHistory.length) {
      toast.info("No records to export");
      return;
    }
    const headers = ["#", "Transaction ID", "User ID", "Investment Amount ($)", "Rate (%)", "Daily ROI ($)", "Status", "Date", "Remark"];
    const rows = filteredIncomeHistory.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
      item?.user?.username || item?.user?.id || item?.user || "N/A",
      Number(item.amount || 0).toFixed(2),
      `${item.percentage || 4.5}%`,
      Number(item.income || 0).toFixed(2),
      item.status || "Completed",
      item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
      `"${(item.remark || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daily_roi_admin_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredIncomeHistory = useMemo(() => {
    return allIncomeHistory.filter((item) => {
      const matchesToday = data === "today" ? isToday(new Date(item.createdAt)) : true;
      let matchesPackage = true;
      if (selectedPackageFilter !== "all") {
        const amt = Number(item.amount || 0);
        if (selectedPackageFilter === "NOVA") matchesPackage = amt >= 10 && amt <= 200;
        else if (selectedPackageFilter === "VANTAGE") matchesPackage = amt >= 250 && amt <= 500;
        else if (selectedPackageFilter === "NEXUS") matchesPackage = amt >= 550 && amt <= 2000;
        else if (selectedPackageFilter === "PRIME") matchesPackage = amt >= 2500 && amt <= 5000;
        else if (selectedPackageFilter === "TITAN") matchesPackage = amt >= 5500 && amt <= 10000;
        else if (selectedPackageFilter === "INFINITY") matchesPackage = amt >= 10500;
      }
      return matchesToday && matchesPackage;
    });
  }, [allIncomeHistory, data, selectedPackageFilter]);

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
      cell: (row) => <span className="font-medium text-white font-mono text-xs">{row?.id || row?._id}</span>,
      searchValue: (row) => row?.id?.toString() || "",
    },
    {
      header: "User ID",
      accessor: "user.username",
      cell: (row) => (
        <span className="font-semibold text-cyan-400">
          {row?.user?.username || row?.user?.id || row?.user || "N/A"}
        </span>
      ),
      searchValue: (row) => row?.user?.username || "",
    },
    {
      header: "Package Amount",
      accessor: "amount",
      cell: (row) => (
        <span className="font-bold text-white text-nowrap font-mono">
          ${Number(row?.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "ROI Rate",
      accessor: "percentage",
      cell: (row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {row?.percentage ? `${row.percentage}%` : "4.5%"}
        </span>
      ),
    },
    {
      header: "Daily ROI Dividend",
      accessor: "income",
      cell: (row) => (
        <span className="font-bold text-emerald-400 text-nowrap font-mono">
          +${Number(row?.income || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      cell: (row) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
          {row?.type || "Daily ROI"}
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
        <span className="text-slate-300 text-xs font-mono">
          {row?.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
        </span>
      ),
    },
  ];

  const calculatedTotal = totalIncome || summaryData?.totalPaid || allIncomeHistory.reduce((s, i) => s + Number(i.income || 0), 0);
  const calculatedToday = todayTotal || allIncomeHistory.filter((i) => isToday(new Date(i.createdAt))).reduce((s, i) => s + Number(i.income || 0), 0);

  const cardData = [
    {
      title: "Total Daily ROI Distributed",
      value: `$${Number(calculatedTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
    },
    {
      title: "Today's Distributed Daily ROI",
      value: `$${Number(calculatedToday).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/sales-performance.png",
    },
    {
      title: "Total Distribution Records",
      value: `${allIncomeHistory.length} Payouts`,
      icon: "https://img.icons8.com/3d-fluency/94/layers.png",
    },
    {
      title: "Active Package Slabs",
      value: "6 Tiers (4.5% - 7.5%)",
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* ═══════════ TOP BANNER & CONTROLS ═══════════ */}
      <div className="bg-gradient-to-r from-slate-900 via-[#061a38] to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
            <Zap size={13} className="text-cyan-400" />
            02. Package-Based Daily ROI Engine (4.5% – 7.5%) • 220% Max Cap
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-['Orbitron',monospace]">
            Daily ROI & Package Dividend Analytics
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Automated payouts execute daily at 12:10 AM IST according to active package tier up to 220% cap, simultaneously triggering 10-Level ROI dividends to uplines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTriggerDistribution}
            disabled={triggering}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <PlayCircle size={16} />
            {triggering ? "Executing..." : "Distribute ROI & Level Dividends Now"}
          </button>

          <button
            onClick={() => fetchAllIncomeHistory(true)}
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

      {/* ═══════════ PACKAGE RATE REFERENCE STRIP (IMAGE 1) ═══════════ */}
      <div className="bg-[#030d1d] border border-cyan-500/20 rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3 pb-2 border-b border-white/5">
          <span className="font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-400" />
            Active Package Daily ROI Slabs & 220% Max ROI Cap
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Max ROI Cap: <strong className="text-amber-300">220%</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { name: "NOVA", range: "$10 – $200", rate: "4.5%", color: "text-amber-400" },
            { name: "VANTAGE", range: "$250 – $500", rate: "5.0%", color: "text-sky-300" },
            { name: "NEXUS", range: "$550 – $2,000", rate: "5.5%", color: "text-blue-400" },
            { name: "PRIME", range: "$2,500 – $5,000", rate: "6.0%", color: "text-yellow-400" },
            { name: "TITAN", range: "$5,500 – $10,000", rate: "6.5%", color: "text-orange-400" },
            { name: "INFINITY", range: "$10,500 – $25,000", rate: "7.5%", color: "text-purple-400" },
          ].map((item) => (
            <div
              key={item.name}
              onClick={() => setSelectedPackageFilter(selectedPackageFilter === item.name ? "all" : item.name)}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                selectedPackageFilter === item.name
                  ? "bg-cyan-500/20 border-cyan-400 shadow-md"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-white">{item.name}</span>
                <span className={`font-mono font-black text-xs ${item.color}`}>{item.rate}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.range}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ STAT CARDS ═══════════ */}
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

      {/* ═══════════ DATA TABLE ═══════════ */}
      <DataTable
        title={`Daily ROI Dividend Payout History ${selectedPackageFilter !== "all" ? `(${selectedPackageFilter} Package)` : "(All Users)"}`}
        columns={columns}
        data={filteredIncomeHistory}
        pageSize={10}
      />
    </div>
  );
};

export default ROIIncome;
