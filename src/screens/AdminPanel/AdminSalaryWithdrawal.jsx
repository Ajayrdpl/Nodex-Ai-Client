import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getAdminSalaryWithdrawalAll, getAdminSalaryWithdrawalStats } from "../../api/admin.api";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";

const STATUS_FILTERS = ["All", "Pending", "Approved", "Completed", "Rejected"];

const AdminSalaryWithdrawal = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchStats = async () => {
    try {
      const res = await getAdminSalaryWithdrawalStats();
      if (res?.success) setStats(res.data);
    } catch { }
  };

  const fetchWithdrawals = async (status = "All", p = 1) => {
    try {
      dispatch(setLoading(true));
      const res = await getAdminSalaryWithdrawalAll({
        status: status === "All" ? undefined : status,
        page: p,
        limit: 10,
      });
      if (res?.success) {
        setWithdrawals(Array.isArray(res.data) ? res.data : res.data?.withdrawals || res.data?.history || []);
        if (res.data?.pagination) setPagination(res.data.pagination);
      } else toast.error(res?.message || "Failed to fetch withdrawals");
    } catch { toast.error("Failed to fetch withdrawals"); }
    finally { dispatch(setLoading(false)); }
  };

  useEffect(() => {
    fetchStats();
    fetchWithdrawals("All", 1);
  }, []);

  const handleFilterChange = (s) => {
    setStatusFilter(s);
    setPage(1);
    fetchWithdrawals(s, 1);
  };

  const fmt = (v) => Number(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const statCards = [
    { title: "Total Withdrawals", value: `$ ${fmt(stats?.totalAmount)}`, icon: "https://img.icons8.com/3d-fluency/94/money-bag.png" },
    { title: "Today Withdrawals", value: `$ ${fmt(stats?.todayAmount)}`, icon: "https://img.icons8.com/3d-fluency/94/cash-in-hand.png" },
    { title: "Pending Amount", value: `$ ${fmt(stats?.pendingAmount)}`, icon: "https://img.icons8.com/3d-fluency/94/clock.png" },
    { title: "Approved Amount", value: `$ ${fmt(stats?.approvedAmount ?? stats?.completedAmount)}`, icon: "https://img.icons8.com/3d-fluency/94/checked.png" },
    { title: "Total Records", value: `${Number(stats?.totalCount ?? pagination?.total ?? 0)}`, icon: "https://img.icons8.com/3d-fluency/94/bar-chart.png" },
    { title: "Pending Count", value: `${Number(stats?.pendingCount ?? 0)}`, icon: "https://img.icons8.com/3d-fluency/94/time.png" },
  ];

  const statusColor = (s) => {
    if (s === "Completed" || s === "Approved") return "text-green-400";
    if (s === "Rejected") return "text-red-400";
    return "text-yellow-400";
  };

  const statusBg = (s) => {
    if (s === "Completed" || s === "Approved") return "bg-green-500/10 border-green-500/30";
    if (s === "Rejected") return "bg-red-500/10 border-red-500/30";
    return "bg-yellow-500/10 border-yellow-500/30";
  };

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, i) => <span className="font-medium text-white">{i + 1}</span>,
    },
    {
      header: "Username",
      accessor: "username",
      searchValue: true,
      cell: (row) => (
        <span className="font-medium text-white">{row?.user?.username || row?.username || "-"}</span>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      cell: (row) => <span className="font-semibold text-white">$ {fmt(row?.amount)}</span>,
    },
    {
      header: "Charge",
      accessor: "charge",
      cell: (row) => (
        <span className="text-orange-400">- $ {fmt(row?.charge ?? row?.adminCharge ?? (row?.amount * 0.1))}</span>
      ),
    },
    {
      header: "Net Amount",
      accessor: "netAmount",
      cell: (row) => (
        <span className="font-semibold text-green-400">
          $ {fmt(row?.netAmount ?? row?.receivedAmount ?? (row?.amount - (row?.charge ?? row?.adminCharge ?? row?.amount * 0.1)))}
        </span>
      ),
    },
    {
      header: "Wallet Address",
      accessor: "walletAddress",
      cell: (row) => (
        <span className="font-mono text-slate-300 text-xs">
          {row?.walletAddress ? `${row.walletAddress.slice(0, 8)}...${row.walletAddress.slice(-6)}` : "-"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusBg(row?.status)} ${statusColor(row?.status)}`}>
          {row?.status || "-"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      searchValue: true,
      cell: (row) => (
        <span className="text-slate-400 text-sm">
          {row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 mt-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((c) => <StatCard key={c.title} title={c.title} value={c.value} iconImage={c.icon} />)}
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={statusFilter === s
              ? { background: "linear-gradient(135deg, #A5D0FB, #CFC6FF)", color: "#000" }
              : { background: "rgba(165,208,251,0.08)", color: "#A5D0FB", border: "1px solid rgba(165,208,251,0.2)" }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        title={`Salary Withdrawals${statusFilter !== "All" ? ` — ${statusFilter}` : ""}`}
        columns={columns}
        data={withdrawals}
        pageSize={10}
      />
    </div>
  );
};

export default AdminSalaryWithdrawal;
