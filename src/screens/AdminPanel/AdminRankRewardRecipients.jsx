import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Sparkles, Trophy, RefreshCw } from "lucide-react";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getAdminRankRewardRecipients, checkAllRankRewards } from "../../api/admin.api";
import DataTable from "../../components/Screen/UserPanel/DataTable";

const AdminRankRewardRecipients = () => {
  const dispatch = useDispatch();
  const [recipients, setRecipients] = useState([]);
  const [summary, setSummary] = useState(null);
  const [distributing, setDistributing] = useState(false);

  const fetchRecipients = async () => {
    try {
      dispatch(setLoading(true));
      const res = await getAdminRankRewardRecipients();
      if (res?.success) {
        setRecipients(res.data?.recipients || res.data || []);
        setSummary(res.data?.summary || null);
      } else {
        toast.error(res?.message || "Failed to fetch recipients");
      }
    } catch {
      toast.error("Failed to fetch rank reward recipients");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDistributeVIPRewards = async () => {
    try {
      setDistributing(true);
      const res = await checkAllRankRewards();
      if (res?.success) {
        toast.success(res?.message || "VIP Rank Rewards checked and distributed successfully!");
        fetchRecipients();
      } else {
        toast.error(res?.message || "Failed to distribute rank rewards");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Distribution failed");
    } finally {
      setDistributing(false);
    }
  };

  useEffect(() => { fetchRecipients(); }, []);

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, i) => <span className="font-medium text-white">{i + 1}</span>,
    },
    {
      header: "Username",
      accessor: "user.username",
      cell: (row) => (
        <span className="font-medium text-blue-400">{row?.user?.username || row?.username || "-"}</span>
      ),
    },
    {
      header: "Name",
      accessor: "user.name",
      cell: (row) => (
        <span className="font-medium text-white">{row?.user?.name || row?.name || "-"}</span>
      ),
    },
    {
      header: "Rank Achieved",
      accessor: "rank",
      cell: (row) => (
        <span className="font-bold text-yellow-400">🏆 {row?.rank || row?.tier || "-"}</span>
      ),
    },
    {
      header: "Reward Amount",
      accessor: "amount",
      cell: (row) => (
        <span className="font-bold text-green-400 text-nowrap">
          $ {Number(row?.amount ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Team Business",
      accessor: "teamBusiness",
      cell: (row) => (
        <span className="text-white text-nowrap">
          $ {Number(row?.teamBusiness ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row?.status === "Paid" || row?.status === "Completed"
            ? "bg-green-500/20 text-green-400 border border-green-500/30"
            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
        }`}>
          {row?.status || "Completed"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-slate-300">
          {row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
        </span>
      ),
      searchValue: (row) => new Date(row?.createdAt)?.toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Action Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border border-amber-500/20 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Trophy size={13} className="text-amber-400" />
              VIP Rank & Reward Distribution Center
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Rank Reward Management
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Audit VIP rank achievers and distribute Rank Achievement Rewards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDistributeVIPRewards}
              disabled={distributing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 border border-amber-400/40 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-600/20 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Sparkles size={15} className={distributing ? "animate-spin text-white" : ""} />
              {distributing ? "Checking & Distributing..." : "Check & Distribute VIP Rewards"}
            </button>
            <button
              onClick={fetchRecipients}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Recipients", value: summary.totalRecipients ?? recipients.length },
            { label: "Total Rewards Paid", value: `$ ${Number(summary.totalRewardsPaid ?? 0).toFixed(2)}` },
            { label: "Unique Ranks Achieved", value: summary.uniqueRanks ?? "-" },
          ].map((s) => (
            <div key={s.label} className="card hero-glass border border-glass-border rounded-2xl p-4">
              <p className="text-slate-400 text-sm">{s.label}</p>
              <p className="text-white font-bold text-xl mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <DataTable
        title="All Rank Reward Recipients"
        columns={columns}
        data={recipients}
        pageSize={10}
      />
    </div>
  );
};

export default AdminRankRewardRecipients;
