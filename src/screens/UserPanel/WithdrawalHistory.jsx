import React, { useEffect, useState } from "react";
import { setLoading } from "../../redux/slices/loadingSlice";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import { useDispatch } from "react-redux";
import { maskWalletAddress } from "../../utils/additionalFunc";
import { useLocation } from "react-router-dom";
import { isToday } from "../../utils/helper";
import { getAllUserWithdrawalHistory } from "../../api/user.api";
import { Copy, Check, Download, RefreshCw, ArrowDownLeft } from "lucide-react";
import { toast } from "react-toastify";

const WithdrawalHistory = () => {
  const [allWithdrawalHistory, setAllWithdrawalHistory] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const navData = location?.state;

  const fetchAllWithdrawalHistory = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else dispatch(setLoading(true));

      const response = await getAllUserWithdrawalHistory();
      if (response?.success) {
        const list = Array.isArray(response?.data?.history)
          ? response.data.history
          : Array.isArray(response?.data)
          ? response.data
          : [];
        setAllWithdrawalHistory(list);
      } else {
        setAllWithdrawalHistory([]);
      }

      if (isManual) {
        toast.success("Withdrawal history refreshed");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch withdrawal history");
    } finally {
      if (isManual) setRefreshing(false);
      else dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAllWithdrawalHistory();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (!allWithdrawalHistory.length) {
      toast.info("No records to export");
      return;
    }

    const headers = ["#", "Withdrawal ID", "Amount ($)", "Wallet Address", "Status", "Date"];
    const rows = allWithdrawalHistory.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
      Number(item.amount || item.investment || 0).toFixed(2),
      item.walletAddress || item.clientAddress || "",
      item.status || "Pending",
      item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `withdrawal_history_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredIncomeHistory =
    navData === "today"
      ? allWithdrawalHistory.filter((item) => isToday(new Date(item.createdAt)))
      : allWithdrawalHistory;

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-semibold text-slate-400">{rowIndex + 1}</span>
      ),
    },
    {
      header: "Withdrawal ID",
      accessor: "id",
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400 font-semibold">
          <span>{row?.id || row?._id || "N/A"}</span>
          <button
            onClick={() => handleCopy(row?.id || row?._id, row?.id || row?._id)}
            className="text-slate-500 hover:text-cyan-300 transition cursor-pointer"
          >
            {copiedId === (row?.id || row?._id) ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      ),
    },
    {
      header: "Amount ($)",
      accessor: "amount",
      cell: (row) => (
        <span className="font-mono font-black text-rose-400 text-sm">
          -${Number(row?.amount || row?.investment || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Wallet Address",
      accessor: "walletAddress",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {maskWalletAddress(row?.walletAddress || row?.clientAddress || row?.account)}
        </span>
      ),
    },
    {
      header: "Currency",
      accessor: "currency",
      cell: (row) => (
        <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
          {row?.currency || "USDT"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const isCompleted = row?.status?.toLowerCase() === "completed" || row?.status?.toLowerCase() === "approved";
        const isPending = row?.status?.toLowerCase() === "pending" || row?.status?.toLowerCase() === "processing";
        return (
          <span
            className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
              isCompleted
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : isPending
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : "bg-rose-500/20 text-rose-400 border-rose-500/30"
            }`}
          >
            {row?.status || "Pending"}
          </span>
        );
      },
    },
    {
      header: "Created At",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-xs text-slate-400">
          {row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 neon-glow-card">
        <div className="flex items-center gap-3">
          <div className="gold-badge-icon w-10 h-10 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
              <span className="gold-metallic-text">Withdrawal History</span>
            </h2>
            <p className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">
              Real-time on-chain & internal withdrawal status ledger
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAllWithdrawalHistory(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-[#060e1e] hover:bg-sky-950/40 text-slate-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition border border-sky-500/30 cursor-pointer"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-amber-400" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </div>

      <DataTable
        title="All Withdrawal Requests"
        columns={columns}
        data={filteredIncomeHistory}
        pageSize={10}
      />
    </div>
  );
};

export default WithdrawalHistory;
