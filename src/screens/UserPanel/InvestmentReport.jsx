import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import {
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getAllInvestmentHistory, getIncomeSummaryApi } from "../../api/user.api";
import { getIncomeTotal } from "../../api/auth.api";
import { maskWalletAddress } from "../../utils/additionalFunc";
import { NumberFormatCommas } from "../../utils/FormatText";
import { isToday } from "../../utils/helper";

const InvestmentReport = () => {
  const dispatch = useDispatch();
  const [investments, setInvestments] = useState([]);
  const [totalStats, setTotalStats] = useState({ totalIncome: 0, todayTotal: 0 });
  const [summaryData, setSummaryData] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInvestments = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else dispatch(setLoading(true));

      const [historyRes, summaryRes] = await Promise.allSettled([
        getAllInvestmentHistory(),
        getIncomeSummaryApi(),
      ]);

      if (historyRes.status === "fulfilled" && historyRes.value?.success) {
        const list = Array.isArray(historyRes.value?.data?.history)
          ? historyRes.value.data.history
          : Array.isArray(historyRes.value?.data)
          ? historyRes.value.data
          : [];
        setInvestments(list);
        setTotalStats({
          totalIncome: Number(historyRes.value?.data?.totalIncome ?? 0),
          todayTotal: Number(historyRes.value?.data?.todayTotal ?? 0),
        });
      } else {
        setInvestments([]);
      }

      if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
        setSummaryData(summaryRes.value.data);
      }

      if (isManual) {
        toast.success("Investment reports updated");
      }
    } catch (err) {
      console.error("Investment fetch error:", err);
      toast.error("Failed to fetch investment reports");
    } finally {
      if (isManual) setRefreshing(false);
      else dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (!investments.length) {
      toast.info("No investment records to export");
      return;
    }

    const headers = ["#", "Transaction ID", "Amount ($)", "Type", "Status", "Txn Hash", "Date"];
    const rows = investments.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
      Number(item.investment || item.amount || 0).toFixed(2),
      item.type || "Deposit",
      item.status || "Completed",
      item.hash || item.txnHash || "",
      item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `investment_reports_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalInv = Number(
    totalStats.totalIncome || investments.reduce((acc, curr) => acc + Number(curr.investment || curr.amount || 0), 0)
  );

  const todayInv = Number(
    totalStats.todayTotal || investments.filter((i) => isToday(new Date(i.createdAt))).reduce((acc, curr) => acc + Number(curr.investment || curr.amount || 0), 0)
  );

  const investmentData = [
    {
      title: "Total Active Investment",
      value: `$ ${totalInv.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/exchange.png",
      highlight: true,
    },
    {
      title: "Today's Deposit",
      value: `$ ${todayInv.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-transfer.png",
    },
    {
      title: "Non-Working Cap Limit (3X)",
      value: `$ ${(totalInv * 3).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/shield.png",
    },
    {
      title: "Working Cap Limit (5X)",
      value: `$ ${(totalInv * 5).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/crown.png",
    },
  ];

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-semibold text-slate-400">{rowIndex + 1}</span>
      ),
    },
    {
      header: "Transaction ID",
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
        <span className="font-mono font-black text-emerald-400 text-sm">
          +${Number(row?.investment || row?.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      cell: (row) => (
        <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          {row?.type || "Deposit"}
        </span>
      ),
    },
    {
      header: "Txn Hash",
      accessor: "hash",
      cell: (row) => {
        const hash = row?.hash || row?.txnHash;
        if (!hash) return <span className="text-slate-500 text-xs">-</span>;
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
            <span>{maskWalletAddress(hash)}</span>
            <a
              href={`https://bscscan.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition"
              title="View on BscScan"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          {row?.status || "Completed"}
        </span>
      ),
    },
    {
      header: "Date & Time",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-xs text-slate-400">
          {row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <Zap size={13} className="text-cyan-400" />
              On-Chain Deposit & Account Activation Reports
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Investment Deposit Reports
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Real-time audit log of all verified on-chain package deposits and account activations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchInvestments(true)}
              disabled={refreshing}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {investmentData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            iconImage={item.icon}
            highlight={item.highlight}
          />
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        title="Wallet Recharge Investment Reports"
        columns={columns}
        data={investments}
        pageSize={10}
      />
    </div>
  );
};

export default InvestmentReport;
