import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  RefreshCw,
  TrendingUp,
  Download,
  Users,
  Search,
  DollarSign,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Coins,
  Layers,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getAllCompoundingHistoryAdmin,
  getCompoundingStatsAdmin,
} from "../../api/admin.api";

const AdminCompounding = () => {
  const dispatch = useDispatch();

  const [historyList, setHistoryList] = useState([]);
  const [stats, setStats] = useState({
    totalCompounded: 0,
    totalBonusEarned: 0,
    totalCount: 0,
    uniqueUsers: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchAllData = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else dispatch(setLoading(true));

        const [historyRes, statsRes] = await Promise.allSettled([
          getAllCompoundingHistoryAdmin({ limit: 200 }),
          getCompoundingStatsAdmin(),
        ]);

        if (historyRes.status === "fulfilled" && historyRes.value?.success) {
          const list = Array.isArray(historyRes.value?.data?.history)
            ? historyRes.value.data.history
            : Array.isArray(historyRes.value?.data)
            ? historyRes.value.data
            : [];
          setHistoryList(list);
        } else {
          setHistoryList([]);
        }

        if (statsRes.status === "fulfilled" && statsRes.value?.success) {
          setStats(statsRes.value.data || {});
        }

        if (isManual) toast.success("Auto compounding data refreshed");
      } catch (err) {
        console.error("Failed to fetch admin compounding data:", err);
        toast.error("Failed to load compounding data");
      } finally {
        if (isManual) setRefreshing(false);
        else dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return historyList;
    const term = searchTerm.toLowerCase();
    return historyList.filter(
      (item) =>
        (item.user?.username && item.user.username.toLowerCase().includes(term)) ||
        (item.user?.id && item.user.id.toLowerCase().includes(term)) ||
        (item.user?._id && item.user._id.toLowerCase().includes(term)) ||
        (item._id && item._id.toLowerCase().includes(term))
    );
  }, [historyList, searchTerm]);

  const handleExportCSV = () => {
    if (!filteredList.length) {
      toast.info("No records to export");
      return;
    }

    const headers = [
      "#",
      "Transaction ID",
      "User ID",
      "Username",
      "Compounded Amount ($)",
      "Bonus 0.5% ($)",
      "Total Credited ($)",
      "Date",
      "Status",
    ];

    const rows = filteredList.map((item, idx) => [
      idx + 1,
      item._id || item.id || "",
      item.user?.id || item.user?._id || "N/A",
      item.user?.username || "N/A",
      Number(item.compoundAmount || 0).toFixed(2),
      Number(item.bonusAmount || 0).toFixed(2),
      Number(item.totalCredited || (item.compoundAmount || 0) + (item.bonusAmount || 0)).toFixed(2),
      item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
      "Completed",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `NODEXAI_compounding_admin_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Compounding report downloaded!");
  };

  const columns = [
    {
      Header: "#",
      Cell: ({ row }) => (
        <span className="font-mono text-xs text-[#848e9c]">{row.index + 1}</span>
      ),
    },
    {
      Header: "User",
      accessor: "user",
      Cell: ({ value }) => (
        <div className="flex flex-col">
          <span className="font-bold text-xs text-[#eaecef]">
            {value?.username || "User"}
          </span>
          <span className="text-[10px] font-mono text-[#f0b90b]">
            {value?.id || value?._id || "N/A"}
          </span>
        </div>
      ),
    },
    {
      Header: "Compounded Amount",
      accessor: "compoundAmount",
      Cell: ({ value }) => (
        <span className="font-mono font-bold text-xs text-[#eaecef]">
          ${Number(value || 0).toFixed(2)}
        </span>
      ),
    },
    {
      Header: "0.5% Bonus",
      accessor: "bonusAmount",
      Cell: ({ value }) => (
        <span className="font-mono font-bold text-xs text-[#0ecb81] bg-[#0ecb81]/10 px-2 py-0.5 rounded border border-[#0ecb81]/30">
          +${Number(value || 0).toFixed(2)}
        </span>
      ),
    },
    {
      Header: "Added To Active Balance",
      accessor: "totalCredited",
      Cell: ({ row, value }) => {
        const total =
          value ??
          (Number(row.original.compoundAmount || 0) +
            Number(row.original.bonusAmount || 0));
        return (
          <span className="font-mono font-bold text-xs text-[#f0b90b]">
            ${Number(total).toFixed(2)}
          </span>
        );
      },
    },
    {
      Header: "Date & Time",
      accessor: "createdAt",
      Cell: ({ value }) => (
        <span className="font-mono text-[11px] text-[#848e9c]">
          {value ? new Date(value).toLocaleString() : "N/A"}
        </span>
      ),
    },
    {
      Header: "Status",
      Cell: () => (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0ecb81] bg-[#0ecb81]/15 px-2 py-0.5 rounded-full border border-[#0ecb81]/40">
          <CheckCircle2 size={10} /> Credited
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 p-2 sm:p-4 min-h-screen bg-[#0b0e11] text-[#eaecef]">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#181a20] border border-[#2b313a] rounded-2xl p-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#f0b90b] bg-[#1e2329] border border-[#f0b90b]/40 px-2.5 py-0.5 rounded-full">
              NODEXAI Incomes Engine
            </span>
            <span className="text-[10px] font-bold text-[#0ecb81] bg-[#0ecb81]/10 border border-[#0ecb81]/30 px-2 py-0.5 rounded-full">
              0.5% Auto Bonus
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#eaecef] mt-1 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#f0b90b]" /> Auto Compounding Administration
          </h1>
          <p className="text-xs text-[#848e9c] mt-0.5">
            Monitor real-time user balance compounding, 0.5% instant bonus distribution, and active capital increments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAllData(true)}
            disabled={refreshing}
            className="px-3 py-2 rounded-xl bg-[#1e2329] border border-[#2b313a] hover:border-[#f0b90b] text-xs font-bold text-[#eaecef] hover:text-[#f0b90b] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#f0b90b] hover:bg-[#fcd535] text-[#181a20] text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <StatCard
          title="Total Compounded"
          value={`$ ${Number(stats?.totalCompounded || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          theme="amber"
          badge="CAPITAL"
          subText="Reinvested by Users"
        />
        <StatCard
          title="0.5% Bonus Awarded"
          value={`$ ${Number(stats?.totalBonusEarned || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          theme="emerald"
          badge="0.5% BONUS"
          subText="Free Bonus Added"
        />
        <StatCard
          title="Total Transactions"
          value={`${Number(stats?.totalCount || historyList.length)}`}
          theme="blue"
          badge="LEDGER"
          subText="Compound Events"
        />
        <StatCard
          title="Unique Users"
          value={`${Number(stats?.uniqueUsers || 0)}`}
          theme="purple"
          badge="USERS"
          subText="Active Compounders"
        />
      </div>

      {/* ── FILTER & TABLE ── */}
      <div className="bg-[#181a20] border border-[#2b313a] rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848e9c]"
            />
            <input
              type="text"
              placeholder="Search by User ID or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e2329] border border-[#2b313a] focus:border-[#f0b90b] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#eaecef] placeholder-[#848e9c] outline-none"
            />
          </div>
          <span className="text-[11px] font-mono text-[#848e9c] text-right">
            Showing {filteredList.length} of {historyList.length} entries
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredList}
          emptyMessage="No compounding records found."
        />
      </div>
    </div>
  );
};

export default AdminCompounding;

