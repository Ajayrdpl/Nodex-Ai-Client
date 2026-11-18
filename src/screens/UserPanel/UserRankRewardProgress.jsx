import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getRankRewardProgress, getRankRewardHistory } from "../../api/user.api";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";

const UserRankRewardProgress = () => {
  const dispatch = useDispatch();
  const [progressData, setProgressData] = useState(null);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 0, totalRecords: 0 });
  const [totalIncome, setTotalIncome] = useState(0);

  const fetchAll = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const [progressRes, historyRes] = await Promise.all([
        getRankRewardProgress(),
        getRankRewardHistory({ page: 1, limit: 10 }),
      ]);

      if (progressRes?.success) {
        setProgressData(progressRes.data);
      } else {
        toast.error(progressRes?.message || "Failed to fetch progress");
      }

      if (historyRes?.success) {
        setHistory(historyRes.data?.history || (Array.isArray(historyRes.data) ? historyRes.data : []));
        setTotalIncome(historyRes.data?.totalEarned ?? historyRes.data?.totalIncome ?? 0);
        setPagination(historyRes.data?.pagination || { currentPage: 1, totalPages: 0, totalRecords: 0 });
      }
    } catch {
      toast.error("Failed to fetch rank reward data");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchHistoryPage = async (page) => {
    try {
      dispatch(setLoading(true));
      const res = await getRankRewardHistory({ page, limit: 10 });
      if (res?.success) {
        setHistory(res.data?.history || (Array.isArray(res.data) ? res.data : []));
        setTotalIncome(res.data?.totalEarned ?? res.data?.totalIncome ?? 0);
        setPagination(res.data?.pagination || { currentPage: page, totalPages: 0, totalRecords: 0 });
      }
    } catch {
      toast.error("Failed to fetch history");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived values from API ──────────────────────────────────────────────
  const teamBusiness     = Number(progressData?.currentTeamBusiness ?? 0);
  const directCount      = Number(progressData?.directReferralsCount ?? 0);
  const achievedRewards  = progressData?.achievedRewards || [];
  const tierProgress     = progressData?.tierProgress || [];
  const eligibleTiers    = progressData?.eligibleTiers || [];

  // Current rank = API currentRank or last achieved tier name
  const currentRank = progressData?.currentRank || (achievedRewards.length > 0
    ? achievedRewards[achievedRewards.length - 1]?.tier?.name || achievedRewards[achievedRewards.length - 1]?.rank || "VIP"
    : "No Rank");

  // Next rank = first non-achieved tier
  const nextTierEntry = tierProgress.find((t) => !t.isAchieved);

  // ── Stat Cards ───────────────────────────────────────────────────────────
  const statCards = [
    {
      title: "Team Business",
      value: `$ ${teamBusiness.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/conference-call.png",
    },
    {
      title: "Direct Referrals",
      value: directCount,
      icon: "https://img.icons8.com/3d-fluency/94/people.png",
    },
    {
      title: "Current Rank",
      value: currentRank,
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
    },
    {
      title: "Total Reward Income",
      value: `$ ${Number(totalIncome).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-bag.png",
    },
    {
      title: "Ranks Achieved",
      value: achievedRewards.length,
      icon: "https://img.icons8.com/3d-fluency/94/medal.png",
    },
    {
      title: "Next Rank",
      value: nextTierEntry?.tier?.name || "Max Rank",
      icon: "https://img.icons8.com/3d-fluency/94/goal.png",
    },
  ];

  // ── History Table Columns ────────────────────────────────────────────────
  const historyColumns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, i) => (
        <span className="font-medium text-white">
          {(pagination.currentPage - 1) * 10 + i + 1}
        </span>
      ),
    },
    {
      header: "Rank",
      accessor: "tier",
      cell: (row) => (
        <span className="font-bold text-yellow-400">
          🏆 {row?.tier?.name || row?.rank || "-"}
        </span>
      ),
    },
    {
      header: "Reward Amount",
      accessor: "amount",
      cell: (row) => (
        <span className="font-bold text-green-400 text-nowrap">
          $ {Number(row?.income ?? row?.amount ?? row?.rewardAmount ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Remark",
      accessor: "remark",
      cell: (row) => (
        <span className="text-slate-300 text-sm">{row?.remark || "-"}</span>
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
        <span className="text-slate-300 text-nowrap">
          {row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-5">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            iconImage={card.icon}
          />
        ))}
      </div>

      {/* ── Eligible Tiers Banner ── */}
      {eligibleTiers.length > 0 && (
        <div className="p-4 rounded-2xl border border-green-500/40 bg-green-500/10">
          <p className="text-green-400 font-semibold text-sm mb-2">
            🎉 You are eligible for the following ranks:
          </p>
          <div className="flex flex-wrap gap-2">
            {eligibleTiers.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/40"
              >
                {t?.name || t?.rank}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Tier Progress Table ── */}
      {tierProgress.length > 0 && (
        <div className="card hero-glass border border-glass-border rounded-2xl p-5">
          <h3 className="text-hero-primary font-semibold text-base mb-4">
            🏅 Rank & Reward Tier Progress
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-3 text-slate-400 font-medium">#</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium">Rank</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium">Reward</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium">Direct Required</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium">Rank Condition</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium">Team Required</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium">Your Directs</th>
                  <th className="text-left py-3 px-3 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tierProgress.map((entry, idx) => {
                  const { tier, isAchieved, isEligible } = entry;
                  return (
                    <tr
                      key={tier._id}
                      className={`border-b border-slate-700/40 transition-colors ${
                        isAchieved
                          ? "bg-green-500/5"
                          : isEligible
                          ? "bg-yellow-500/5"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-400">{idx + 1}</td>

                      {/* Rank Name */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-white">{tier.name}</span>
                      </td>

                      {/* Reward Amount */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-green-400 text-nowrap">
                          $ {Number(tier.rewardAmount).toLocaleString()}
                        </span>
                      </td>

                      {/* Direct Required */}
                      <td className="py-3 px-3">
                        <span className={`font-medium ${
                          directCount >= tier.directRequired ? "text-green-400" : "text-slate-300"
                        }`}>
                          {directCount} / {tier.directRequired}
                        </span>
                      </td>

                      {/* Rank Condition */}
                      <td className="py-3 px-3 text-slate-300 text-nowrap">
                        {tier.directRankRequired
                          ? `${tier.directRankCount}× ${tier.directRankRequired}`
                          : <span className="text-slate-500">—</span>}
                      </td>

                      {/* Team Required */}
                      <td className="py-3 px-3">
                        {tier.totalTeamRequired > 0 ? (
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full bg-primary-green transition-all duration-500"
                                style={{
                                  width: `${Math.min((teamBusiness / tier.totalTeamRequired) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 text-nowrap">
                              {teamBusiness.toLocaleString()} / {tier.totalTeamRequired.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">No requirement</span>
                        )}
                      </td>

                      {/* Your Directs */}
                      <td className="py-3 px-3 text-slate-300">{directCount}</td>

                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        {isAchieved ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 text-nowrap">
                            ✓ Achieved
                          </span>
                        ) : isEligible ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-nowrap">
                            ⚡ Eligible
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-400 text-nowrap">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Payout History ── */}
      <div className="card hero-glass border border-glass-border rounded-2xl overflow-hidden">
        <DataTable
          title="Rank Reward Payout History"
          columns={historyColumns}
          data={history}
          pageSize={10}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/50">
            <span className="text-slate-400 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages} — {pagination.totalRecords} records
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.currentPage <= 1}
                onClick={() => fetchHistoryPage(pagination.currentPage - 1)}
                className="px-4 py-1.5 rounded-lg text-sm border border-slate-600 text-slate-300 disabled:opacity-40 hover:bg-slate-700/50 transition"
              >
                Prev
              </button>
              <button
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => fetchHistoryPage(pagination.currentPage + 1)}
                className="px-4 py-1.5 rounded-lg text-sm border border-slate-600 text-slate-300 disabled:opacity-40 hover:bg-slate-700/50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default UserRankRewardProgress;
