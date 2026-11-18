import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getAdminRoyaltyAll,
  getAdminRoyaltyMembers,
  getAdminRoyaltyTurnover,
  adminCalculateRoyalty,
} from "../../api/admin.api";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";

// ── Tier config ──────────────────────────────────────────────────────────────
const TIERS = [
  { value: "",      label: "All Tiers"       },
  { value: "tier1", label: "Tier 1 — Bronze" },
  { value: "tier2", label: "Tier 2 — Silver" },
  { value: "tier3", label: "Tier 3 — Gold"   },
];
const TIER_COLOR = { tier1: "text-orange-400", tier2: "text-gray-300", tier3: "text-yellow-400" };
const getTierLabel = (t) => TIERS.find((x) => x.value === t)?.label || t || "—";
const getTierColor = (t) => TIER_COLOR[t] || "text-slate-400";

const TABS = [
  { id: "records",  label: "All Records", icon: "fa-solid fa-list"      },
  { id: "members",  label: "Members",     icon: "fa-solid fa-users"     },
  { id: "turnover", label: "Turnover",    icon: "fa-solid fa-chart-bar" },
];

const now = new Date();
const YEARS = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(0, i).toLocaleString("default", { month: "long" }),
}));

const AdminRoyaltyIncome = () => {
  const dispatch = useDispatch();

  // ── Tab ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("records");

  // ── Records ──────────────────────────────────────────────────────────────
  const [records,    setRecords]    = useState([]);
  const [recordTier, setRecordTier] = useState("");

  // ── Members ──────────────────────────────────────────────────────────────
  const [members,    setMembers]    = useState([]);
  const [memberTier, setMemberTier] = useState("");

  // ── Turnover ─────────────────────────────────────────────────────────────
  const [turnover, setTurnover] = useState(null);
  const [tvMonth,  setTvMonth]  = useState(now.getMonth() + 1);
  const [tvYear,   setTvYear]   = useState(now.getFullYear());

  // ── Calculate ────────────────────────────────────────────────────────────
  const [calcMonth,   setCalcMonth]   = useState(now.getMonth() + 1);
  const [calcYear,    setCalcYear]    = useState(now.getFullYear());
  const [calculating, setCalculating] = useState(false);

  // ── Fetch: Records ───────────────────────────────────────────────────────
  const fetchRecords = useCallback(async (tier = "") => {
    try {
      dispatch(setLoading(true));
      const res = await getAdminRoyaltyAll({ tier: tier || undefined });
      if (res?.success) {
        setRecords(res.data?.records || res.data || []);
      } else {
        toast.error(res?.message || "Failed to fetch records");
        setRecords([]);
      }
    } catch {
      toast.error("Failed to fetch royalty records");
      setRecords([]);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // ── Fetch: Members ───────────────────────────────────────────────────────
  const fetchMembers = useCallback(async (tier = "") => {
    try {
      dispatch(setLoading(true));
      const res = await getAdminRoyaltyMembers({ tier: tier || undefined });
      if (res?.success) {
        setMembers(res.data?.members || res.data || []);
      } else {
        toast.error(res?.message || "Failed to fetch members");
        setMembers([]);
      }
    } catch {
      toast.error("Failed to fetch royalty members");
      setMembers([]);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // ── Fetch: Turnover ──────────────────────────────────────────────────────
  const fetchTurnover = useCallback(async (month, year) => {
    try {
      dispatch(setLoading(true));
      const res = await getAdminRoyaltyTurnover({ month, year });
      if (res?.success) {
        setTurnover(res.data);
      } else {
        toast.error(res?.message || "Failed to fetch turnover");
        setTurnover(null);
      }
    } catch {
      toast.error("Failed to fetch royalty turnover");
      setTurnover(null);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "records")  fetchRecords(recordTier);
    if (activeTab === "members")  fetchMembers(memberTier);
    if (activeTab === "turnover") fetchTurnover(tvMonth, tvYear);
  }, [activeTab]);

  // ── Calculate handler ────────────────────────────────────────────────────
  const handleCalculate = async () => {
    try {
      setCalculating(true);
      const res = await adminCalculateRoyalty({ month: calcMonth, year: calcYear });
      if (res?.success) {
        toast.success(res?.message || "Royalty distribution triggered successfully");
        if (activeTab === "records") fetchRecords(recordTier);
      } else {
        toast.error(res?.message || "Calculation failed");
      }
    } catch {
      toast.error("Calculation request failed");
    } finally {
      setCalculating(false);
    }
  };

  // ── Records columns ──────────────────────────────────────────────────────
  const recordColumns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => <span className="font-medium text-white">{rowIndex + 1}</span>,
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
          {getTierLabel(row?.tier)}
        </span>
      ),
    },
    {
      header: "Direct Business",
      accessor: "directBusinessVolume",
      cell: (row) => (
        <span className="font-medium text-white text-nowrap">
          $ {Number(row?.directBusinessVolume ?? row?.businessVolume ?? 0).toLocaleString()}
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
      header: "Percentage (%)",
      accessor: "percentage",
      cell: (row) => (
        <span className="font-medium text-white">
          {row?.percentage != null ? `${row.percentage}%` : "-"}
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

  // ── Members columns ──────────────────────────────────────────────────────
  const memberColumns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => <span className="font-medium text-white">{rowIndex + 1}</span>,
    },
    {
      header: "Username",
      accessor: "username",
      cell: (row) => (
        <span className="font-medium text-white">{row?.username || row?.user?.username || "-"}</span>
      ),
      searchValue: (row) => row?.username || row?.user?.username || "",
    },
    {
      header: "Name",
      accessor: "name",
      cell: (row) => (
        <span className="font-medium text-white">{row?.name || row?.user?.name || "-"}</span>
      ),
    },
    {
      header: "Tier",
      accessor: "tier",
      cell: (row) => (
        <span className={`font-medium ${getTierColor(row?.tier)}`}>
          {getTierLabel(row?.tier)}
        </span>
      ),
    },
    {
      header: "Direct Business",
      accessor: "directBusinessVolume",
      cell: (row) => (
        <span className="font-medium text-white text-nowrap">
          $ {Number(row?.directBusinessVolume ?? row?.businessVolume ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Direct Members",
      accessor: "memberCount",
      cell: (row) => (
        <span className="font-medium text-white">
          {row?.memberCount ?? row?.directCount ?? "-"}
        </span>
      ),
    },
    {
      header: "Qualified",
      accessor: "isQualified",
      cell: (row) => (
        <span
          className={`font-medium ${
            row?.isQualified || row?.eligible ? "text-green-500" : "text-yellow-400"
          }`}
        >
          {row?.isQualified || row?.eligible ? "✓ Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Joined",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-slate-300">
          {row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
        </span>
      ),
      searchValue: (row) => new Date(row?.createdAt)?.toLocaleDateString(),
    },
  ];

  // ── Turnover summary cards ───────────────────────────────────────────────
  const turnoverCards = turnover
    ? [
        {
          title: "Total Turnover",
          value: `$ ${Number(turnover.totalTurnover ?? turnover.totalBusiness ?? 0).toLocaleString()}`,
          icon: "https://img.icons8.com/3d-fluency/94/activity-feed.png",
        },
        {
          title: "Total Pool Size",
          value: `$ ${Number(turnover.totalPoolSize ?? turnover.totalPool ?? 0).toLocaleString()}`,
          icon: "https://img.icons8.com/3d-fluency/94/money-bag.png",
        },
        {
          title: "Total Distributed",
          value: `$ ${Number(turnover.totalDistributed ?? turnover.totalPaid ?? 0).toLocaleString()}`,
          icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
        },
        {
          title: "Active Members",
          value: turnover.activeMembersCount ?? turnover.totalMembers ?? 0,
          icon: "https://img.icons8.com/3d-fluency/94/conference-call.png",
        },
      ]
    : [];

  const pools = turnover?.pools || turnover?.tierPools || [];

  // ── Tier filter buttons ──────────────────────────────────────────────────
  const TierFilter = ({ activeTier, onChange }) => (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-slate-400 text-sm">Filter by Tier:</span>
      {TIERS.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            activeTier === t.value
              ? "border-[var(--primary-color)] text-[var(--primary-color)] bg-[var(--primary-color)]/10"
              : "border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  // ── Month/Year select ────────────────────────────────────────────────────
  const MonthYearSelect = ({ month, year, onMonthChange, onYearChange, onApply }) => (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-slate-400 text-xs font-medium">Month</label>
        <select
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary-color)]"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-slate-400 text-xs font-medium">Year</label>
        <select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary-color)]"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      {onApply && (
        <button
          onClick={onApply}
          className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold transition"
        >
          Apply
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-5 mt-5">

      {/* ── Manual Distribution Trigger ── */}
      <div className="card hero-glass border border-glass-border rounded-2xl p-5">
        <h3 className="text-hero-primary font-semibold text-base mb-4">
          ⚙️ Manual Royalty Distribution
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          <MonthYearSelect
            month={calcMonth}
            year={calcYear}
            onMonthChange={setCalcMonth}
            onYearChange={setCalcYear}
          />
          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="btn-primary px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {calculating ? "Processing..." : "▶ Trigger Distribution"}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-slate-700/50">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Records Tab ── */}
      {activeTab === "records" && (
        <div className="space-y-4">
          <TierFilter
            activeTier={recordTier}
            onChange={(tier) => { setRecordTier(tier); fetchRecords(tier); }}
          />
          <DataTable
            title="Royalty Income Records"
            columns={recordColumns}
            data={records}
            pageSize={10}
          />
        </div>
      )}

      {/* ── Members Tab ── */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <TierFilter
            activeTier={memberTier}
            onChange={(tier) => { setMemberTier(tier); fetchMembers(tier); }}
          />
          <DataTable
            title="Qualified Royalty Members"
            columns={memberColumns}
            data={members}
            pageSize={10}
          />
        </div>
      )}

      {/* ── Turnover Tab ── */}
      {activeTab === "turnover" && (
        <div className="space-y-5">
          <MonthYearSelect
            month={tvMonth}
            year={tvYear}
            onMonthChange={setTvMonth}
            onYearChange={setTvYear}
            onApply={() => fetchTurnover(tvMonth, tvYear)}
          />

          {/* Summary Cards */}
          {turnover && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {turnoverCards.map((item) => (
                <StatCard
                  key={item.title}
                  title={item.title}
                  value={item.value}
                  iconImage={item.icon}
                />
              ))}
            </div>
          )}

          {/* Per-Tier Pool Breakdown */}
          {pools.length > 0 && (
            <div className="card hero-glass border border-glass-border rounded-2xl p-5">
              <h3 className="text-hero-primary font-semibold text-base mb-4">
                Tier Pool Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Tier</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Pool Size</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Members</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Per Member</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Distributed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pools.map((p, idx) => (
                      <tr key={idx} className="border-b border-slate-700/40">
                        <td className={`py-3 px-4 font-medium ${getTierColor(p?.tier || p?.name)}`}>
                          {getTierLabel(p?.tier || p?.name)}
                        </td>
                        <td className="py-3 px-4 font-medium text-white text-nowrap">
                          $ {Number(p?.poolSize ?? p?.pool ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">
                          {p?.memberCount ?? p?.members ?? "-"}
                        </td>
                        <td className="py-3 px-4 font-medium text-green-400 text-nowrap">
                          $ {Number(p?.perMember ?? p?.sharePerMember ?? 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-medium text-white text-nowrap">
                          $ {Number(p?.distributed ?? p?.totalPaid ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!turnover && (
            <div className="card hero-glass border border-glass-border rounded-2xl p-10 text-center text-slate-400 text-sm">
              Select a month and year, then click <span className="text-white font-medium">Apply</span> to load turnover data.
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminRoyaltyIncome;
