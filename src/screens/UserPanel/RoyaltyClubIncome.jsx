import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getRoyaltyStatus, getRoyaltyHistory, getRoyaltyStats } from "../../api/user.api";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";

// ── Tier config (matches API keys) ──────────────────────────────────────────
const TIER_COLOR = {
  tier1: "text-gray-300",
  tier2: "text-yellow-400",
  tier3: "text-cyan-400",
};
const getTierColor = (key) => TIER_COLOR[key] || "text-slate-400";

const RoyaltyClubIncome = () => {
  const dispatch = useDispatch();

  const [status,     setStatus]     = useState(null);
  const [stats,      setStats]      = useState(null);
  const [history,    setHistory]    = useState([]);
  const [earningsByTier, setEarningsByTier] = useState({});
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 });

  // ── Fetch all on mount ───────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const [statusRes, statsRes, historyRes] = await Promise.all([
        getRoyaltyStatus(),
        getRoyaltyStats(),
        getRoyaltyHistory({ page: 1, limit: 10 }),
      ]);

      if (statusRes?.success) {
        setStatus(statusRes.data);
      } else {
        toast.error(statusRes?.message || "Failed to fetch royalty status");
      }

      if (statsRes?.success) {
        setStats(statsRes.data);
      } else {
        toast.error(statsRes?.message || "Failed to fetch royalty stats");
      }

      if (historyRes?.success) {
        setHistory(historyRes.data?.history || []);
        setEarningsByTier(historyRes.data?.earningsByTier || {});
        setPagination(historyRes.data?.pagination || { page: 1, totalPages: 0, total: 0 });
      } else {
        toast.error(historyRes?.message || "Failed to fetch royalty history");
        setHistory([]);
      }
    } catch {
      toast.error("Failed to fetch royalty club data");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // ── Paginated history fetch ──────────────────────────────────────────────
  const fetchHistoryPage = async (page) => {
    try {
      dispatch(setLoading(true));
      const res = await getRoyaltyHistory({ page, limit: 10 });
      if (res?.success) {
        setHistory(res.data?.history || []);
        setEarningsByTier(res.data?.earningsByTier || {});
        setPagination(res.data?.pagination || { page, totalPages: pagination.totalPages, total: pagination.total });
      } else {
        toast.error(res?.message || "Failed to fetch history");
      }
    } catch {
      toast.error("Failed to fetch royalty history");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ── Derived from API ─────────────────────────────────────────────────────
  // status.tiers is an object: { tier1: {...}, tier2: {...}, tier3: {...} }
  const tiersObj   = status?.tiers || {};
  const tiersArray = Object.entries(tiersObj); // [["tier1", {...}], ["tier2", {...}], ...]

  const qualifiedTierKey   = status?.qualifiedTier || stats?.qualifiedTier;
  const qualifiedTierLabel = status?.tierLabel || stats?.tierLabel || "Not Qualified";
  const currentTurnover    = Number(status?.currentMonthTurnover ?? 0);
  const totalEarned        = Number(stats?.totalEarned ?? 0);

  // ── Stat Cards ───────────────────────────────────────────────────────────
  const cardData = [
    {
      title: "Total Royalty Earned",
      value: `$ ${totalEarned.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-bag.png",
    },
    {
      title: "Current Tier",
      value: qualifiedTierLabel,
      icon: "https://img.icons8.com/3d-fluency/94/crown.png",
    },
    {
      title: "Monthly Turnover",
      value: `$ ${currentTurnover.toLocaleString()}`,
      icon: "https://img.icons8.com/3d-fluency/94/activity-feed.png",
    },
    // Per-tier earnings from earningsByTier
    ...Object.entries(earningsByTier).map(([key, val]) => ({
      title: `${tiersObj[key]?.label || key} Earned`,
      value: `$ ${Number(val ?? 0).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
    })),
  ];

  // ── History table columns ────────────────────────────────────────────────
  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-medium text-white">
          {(pagination.page - 1) * 10 + rowIndex + 1}
        </span>
      ),
    },
    {
      header: "Month / Year",
      accessor: "month",
      cell: (row) => (
        <span className="font-medium text-white text-nowrap">
          {row?.month ? `${String(row.month).padStart(2, "0")} / ${row.year}` : "-"}
        </span>
      ),
    },
    {
      header: "Tier",
      accessor: "tier",
      cell: (row) => (
        <span className={`font-medium ${getTierColor(row?.tier)}`}>
          {tiersObj[row?.tier]?.label || row?.tier || "-"}
        </span>
      ),
    },
    {
      header: "Turnover",
      accessor: "turnover",
      cell: (row) => (
        <span className="font-medium text-white text-nowrap">
          $ {Number(row?.turnover ?? row?.systemTurnover ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Pool Size",
      accessor: "poolSize",
      cell: (row) => (
        <span className="font-medium text-white text-nowrap">
          $ {Number(row?.poolSize ?? row?.pool ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Members in Pool",
      accessor: "membersCount",
      cell: (row) => (
        <span className="font-medium text-white">
          {row?.membersCount ?? row?.memberCount ?? "-"}
        </span>
      ),
    },
    {
      header: "Royalty Income",
      accessor: "amount",
      cell: (row) => (
        <span className="font-medium text-green-400 text-nowrap">
          $ {Number(row?.amount ?? row?.income ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`font-medium ${
            row?.status === "Completed" || row?.status === "Paid"
              ? "text-green-500"
              : "text-yellow-400"
          }`}
        >
          {row?.status || "-"}
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
    <div className="space-y-5 mt-5">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            iconImage={item.icon}
          />
        ))}
      </div>

      {/* Tier Eligibility Breakdown — from status.tiers object */}
      {tiersArray.length > 0 && (
        <div className="card hero-glass border border-glass-border rounded-2xl p-5">
          <h3 className="text-hero-primary font-semibold text-base mb-4">
            👑 Royalty Club Tier Eligibility
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Club</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Directs Required</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Your Directs</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Team Required</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Your Team</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Benefit</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tiersArray.map(([key, tier]) => (
                  <tr
                    key={key}
                    className={`border-b border-slate-700/40 ${
                      tier.qualified ? "bg-green-500/5" : ""
                    }`}
                  >
                    {/* Club Name */}
                    <td className={`py-3 px-4 font-semibold ${getTierColor(key)}`}>
                      {tier.label}
                    </td>

                    {/* Directs Required vs Count */}
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        tier.directCount >= tier.directRequired ? "text-green-400" : "text-slate-300"
                      }`}>
                        {tier.directCount} / {tier.directRequired}
                      </span>
                    </td>

                    {/* Your Directs */}
                    <td className="py-3 px-4 text-white font-medium">{tier.directCount}</td>

                    {/* Team Required vs Size */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-primary-green transition-all duration-500"
                            style={{
                              width: `${tier.teamRequired > 0
                                ? Math.min((tier.teamSize / tier.teamRequired) * 100, 100)
                                : 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 text-nowrap">
                          {tier.teamSize} / {tier.teamRequired}
                        </span>
                      </div>
                    </td>

                    {/* Your Team */}
                    <td className="py-3 px-4 text-white font-medium">{tier.teamSize}</td>

                    {/* Benefit */}
                    <td className="py-3 px-4 text-slate-300 text-xs max-w-[200px]">
                      {tier.benefit || "-"}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          tier.qualified ? "text-green-500" : "text-yellow-400"
                        }`}
                      >
                        {tier.qualified ? "✓ Qualified" : "Not Qualified"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Diamond Club extra conditions */}
          {tiersObj.tier3 && (
            <div className="mt-4 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
              <p className="text-cyan-400 font-semibold text-sm mb-2">💎 Diamond Club — Extra Conditions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Self Investment Required</span>
                  <span className={`font-medium ${
                    tiersObj.tier3.selfInvestment >= tiersObj.tier3.selfInvestmentRequired
                      ? "text-green-400" : "text-white"
                  }`}>
                    $ {tiersObj.tier3.selfInvestment} / $ {tiersObj.tier3.selfInvestmentRequired}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Direct Monthly Business</span>
                  <span className={`font-medium ${
                    tiersObj.tier3.directMonthlyBusiness >= tiersObj.tier3.directMonthlyBusinessRequired
                      ? "text-green-400" : "text-white"
                  }`}>
                    $ {tiersObj.tier3.directMonthlyBusiness} / $ {tiersObj.tier3.directMonthlyBusinessRequired}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Table */}
      <DataTable
        title="Royalty Club Income History"
        columns={columns}
        data={history}
        pageSize={10}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-2">
          <span className="text-slate-400 text-sm">
            Page {pagination.page} of {pagination.totalPages} — {pagination.total} records
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchHistoryPage(pagination.page - 1)}
              className="px-4 py-1.5 rounded-lg text-sm border border-slate-600 text-slate-300 disabled:opacity-40 hover:bg-slate-700/50 transition"
            >
              Prev
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchHistoryPage(pagination.page + 1)}
              className="px-4 py-1.5 rounded-lg text-sm border border-slate-600 text-slate-300 disabled:opacity-40 hover:bg-slate-700/50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoyaltyClubIncome;
