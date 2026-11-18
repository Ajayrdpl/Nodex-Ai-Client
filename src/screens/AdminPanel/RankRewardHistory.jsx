import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getAllRankRewardHistory } from "../../api/admin.api";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";

const RankRewardHistory = () => {
  const dispatch = useDispatch();

  const [history,         setHistory]         = useState([]);
  const [tiers,           setTiers]           = useState([]);
  const [achievedRewards, setAchievedRewards] = useState([]);
  const [totalIncome,     setTotalIncome]     = useState(0);
  const [todayTotal,      setTodayTotal]      = useState(0);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchAllRankRewardHistory = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getAllRankRewardHistory();
      if (response?.success) {
        setHistory(response.data?.history || []);
        setTiers(response.data?.tiers || []);
        setAchievedRewards(response.data?.achievedRewards || []);
        setTotalIncome(response.data?.totalIncome || 0);
        setTodayTotal(response.data?.todayTotal || 0);
      } else {
        toast.error(response?.message || "Something went wrong");
        setHistory([]);
      }
    } catch {
      toast.error("Failed to fetch Rank Reward history");
      setHistory([]);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAllRankRewardHistory();
  }, []);

  // ── Stat Cards ───────────────────────────────────────────────────────────
  const cardData = [
    {
      title: "Total Rank Reward Income",
      value: `$ ${Number(totalIncome ?? 0).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-bag.png",
    },
    {
      title: "Today Rank Reward Income",
      value: `$ ${Number(todayTotal ?? 0).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/today.png",
    },
    {
      title: "Total Tiers",
      value: tiers.length,
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
    },
    {
      title: "Total Achieved",
      value: achievedRewards.length,
      icon: "https://img.icons8.com/3d-fluency/94/medal.png",
    },
  ];

  // ── History table columns ────────────────────────────────────────────────
  const historyColumns = [
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
      cell: (row) => (
        <span className="font-medium text-white">{row?.id || "-"}</span>
      ),
    },
    {
      header: "Username",
      accessor: "user.username",
      cell: (row) => (
        <span className="font-medium text-white">{row?.user?.username || "-"}</span>
      ),
      searchValue: (row) => row?.user?.username || "",
    },
    {
      header: "Rank",
      accessor: "rank",
      cell: (row) => (
        <span className="font-medium text-yellow-400">
          🏆 {row?.rank || row?.tier?.name || row?.level || "-"}
        </span>
      ),
    },
    {
      header: "Reward Amount",
      accessor: "amount",
      cell: (row) => (
        <span className="font-medium text-white text-nowrap">
          $ {Number(row?.amount ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Income",
      accessor: "income",
      cell: (row) => (
        <span className="font-medium text-green-400 text-nowrap">
          $ {Number(row?.income ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`font-medium ${
            row?.status === "Completed" ? "text-green-500" : "text-yellow-400"
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

  // ── Tiers table columns ──────────────────────────────────────────────────
  const tierColumns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-medium text-white">{rowIndex + 1}</span>
      ),
    },
    {
      header: "Rank Name",
      accessor: "name",
      cell: (row) => (
        <span className="font-semibold text-yellow-400">🏆 {row?.name}</span>
      ),
    },
    {
      header: "Reward Amount",
      accessor: "rewardAmount",
      cell: (row) => (
        <span className="font-medium text-green-400 text-nowrap">
          $ {Number(row?.rewardAmount ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Direct Required",
      accessor: "directRequired",
      cell: (row) => (
        <span className="font-medium text-white">{row?.directRequired ?? "-"}</span>
      ),
    },
    {
      header: "Rank Condition",
      accessor: "directRankRequired",
      cell: (row) => (
        <span className="font-medium text-white">
          {row?.directRankRequired
            ? `${row.directRankCount}× ${row.directRankRequired}`
            : <span className="text-slate-500">—</span>}
        </span>
      ),
    },
    {
      header: "Team Required",
      accessor: "totalTeamRequired",
      cell: (row) => (
        <span className="font-medium text-white text-nowrap">
          {row?.totalTeamRequired > 0 ? row.totalTeamRequired.toLocaleString() : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`font-medium ${
            row?.status ? "text-green-500" : "text-red-400"
          }`}
        >
          {row?.status ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  // ── Achieved Rewards columns ─────────────────────────────────────────────
  const achievedColumns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-medium text-white">{rowIndex + 1}</span>
      ),
    },
    {
      header: "Username",
      accessor: "user.username",
      cell: (row) => (
        <span className="font-medium text-white">{row?.user?.username || row?.username || "-"}</span>
      ),
      searchValue: (row) => row?.user?.username || row?.username || "",
    },
    {
      header: "Rank Achieved",
      accessor: "rank",
      cell: (row) => (
        <span className="font-semibold text-yellow-400">
          🏆 {row?.rank || row?.tier?.name || "-"}
        </span>
      ),
    },
    {
      header: "Reward Amount",
      accessor: "rewardAmount",
      cell: (row) => (
        <span className="font-medium text-green-400 text-nowrap">
          $ {Number(row?.rewardAmount ?? row?.amount ?? 0).toFixed(2)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            iconImage={item.icon}
          />
        ))}
      </div>

      {/* Rank Tiers Table */}
      {tiers.length > 0 && (
        <div className="card hero-glass border border-glass-border rounded-2xl p-5">
          <h3 className="text-hero-primary font-semibold text-base mb-4">
            🏅 Rank & Reward Tiers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {tierColumns.map((col) => (
                    <th key={col.header} className="text-left py-3 px-4 text-slate-400 font-medium text-nowrap">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, idx) => (
                  <tr key={tier._id} className="border-b border-slate-700/40">
                    {tierColumns.map((col) => (
                      <td key={col.header} className="py-3 px-4">
                        {col.cell(tier, idx)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Achieved Rewards Table */}
      {achievedRewards.length > 0 && (
        <DataTable
          title="Achieved Rewards"
          columns={achievedColumns}
          data={achievedRewards}
          pageSize={10}
        />
      )}

      {/* Payout History Table */}
      <DataTable
        title="Rank Reward Payout History"
        columns={historyColumns}
        data={history}
        pageSize={10}
      />

    </div>
  );
};

export default RankRewardHistory;
