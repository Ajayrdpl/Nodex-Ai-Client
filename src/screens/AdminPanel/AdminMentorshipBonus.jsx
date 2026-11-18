import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getAdminMentorshipEligibleUsers,
  adminDistributeMentorship,
  adminDistributeSingleMentorship,
  getAdminMentorshipAllHistory,
} from "../../api/admin.api";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";

const TABS = ["History", "Eligible Users"];

const AdminMentorshipBonus = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState(0);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [distributing, setDistributing] = useState(false);
  const [singleUserId, setSingleUserId] = useState("");

  const fetchData = async () => {
    try {
      dispatch(setLoading(true));
      const [eligRes, histRes] = await Promise.all([
        getAdminMentorshipEligibleUsers(),
        getAdminMentorshipAllHistory(),
      ]);
      if (eligRes?.success) setEligibleUsers(Array.isArray(eligRes.data) ? eligRes.data : eligRes.data?.users || eligRes.data?.records || []);
      if (histRes?.success) setHistory(Array.isArray(histRes.data) ? histRes.data : histRes.data?.history || histRes.data?.records || []);
    } catch {
      toast.error("Failed to fetch mentorship data");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDistributeAll = async () => {
    try {
      setDistributing(true);
      const res = await adminDistributeMentorship({});
      if (res?.success) { toast.success(res.message || "Distributed successfully"); fetchData(); }
      else toast.error(res?.message || "Distribution failed");
    } catch { toast.error("Distribution failed"); }
    finally { setDistributing(false); }
  };

  const handleDistributeSingle = async (userId) => {
    try {
      const res = await adminDistributeSingleMentorship({ userId });
      if (res?.success) { toast.success(res.message || "Distributed successfully"); fetchData(); }
      else toast.error(res?.message || "Distribution failed");
    } catch { toast.error("Distribution failed"); }
  };

  const cards = [
    {
      title: "Total History Records",
      value: `${history.length}`,
      icon: "https://img.icons8.com/3d-fluency/94/bar-chart.png",
    },
    {
      title: "Eligible Users",
      value: `${eligibleUsers.length}`,
      icon: "https://img.icons8.com/3d-fluency/94/group.png",
    },
  ];

  const historyColumns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, i) => <span className="font-medium text-white">{i + 1}</span>,
    },
    {
      header: "Username",
      accessor: "username",
      searchValue: true,
      cell: (row) => <span className="font-medium text-white">{row?.username || row?.user?.username || "-"}</span>,
    },
    {
      header: "From User",
      accessor: "fromUser",
      searchValue: true,
      cell: (row) => <span className="font-medium text-white">{row?.fromUser || "-"}</span>,
    },
    {
      header: "Level",
      accessor: "level",
      cell: (row) => <span className="font-medium text-white">{row?.level ?? "-"}</span>,
    },
    {
      header: "Amount",
      accessor: "amount",
      cell: (row) => (
        <span className="font-medium text-green-400">$ {Number(row?.amount ?? 0).toFixed(2)}</span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className={row?.status === "Completed" ? "text-green-500 font-medium" : "text-yellow-400 font-medium"}>
          {row?.status || "-"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      searchValue: true,
      cell: (row) => (
        <span className="text-slate-300">
          {row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ];

  const eligibleColumns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, i) => <span className="font-medium text-white">{i + 1}</span>,
    },
    {
      header: "Username",
      accessor: "username",
      searchValue: true,
      cell: (row) => <span className="font-medium text-white">{row?.username || row?.user?.username || row?.userId?.username || "-"}</span>,
    },
    {
      header: "Self Investment",
      accessor: "selfInvestment",
      cell: (row) => (
        <span className="text-slate-300">
          {row?.selfInvestment !== undefined ? `$ ${Number(row.selfInvestment).toFixed(2)}` : "-"}
        </span>
      ),
    },
    {
      header: "Monthly Business",
      accessor: "monthlyNewBusiness",
      cell: (row) => (
        <span className="text-slate-300">
          {row?.monthlyNewBusiness !== undefined
            ? `$ ${Number(row.monthlyNewBusiness).toFixed(2)}`
            : (row?.totalTeamBusiness !== undefined ? `$ ${Number(row.totalTeamBusiness).toFixed(2)}` : "-")}
        </span>
      ),
    },
    {
      header: "Estimated Bonus (20%)",
      accessor: "estimatedBonus",
      cell: (row) => (
        <span className="font-semibold text-green-400">
          $ {Number(row?.estimatedBonus ?? row?.expectedBonus ?? row?.bonus ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: "action",
      cell: (row) => (
        <button
          onClick={() => handleDistributeSingle(row?._id || row?.userId || row?.user?._id)}
          className="px-3 py-1 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #A5D0FB, #CFC6FF)", color: "#000" }}
        >
          Distribute
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c) => (
          <StatCard key={c.title} title={c.title} value={c.value} iconImage={c.icon} />
        ))}
      </div>

      {/* Distribute All Button */}
      <div className="flex justify-end">
        <button
          onClick={handleDistributeAll}
          disabled={distributing}
          className="px-6 py-2 rounded-xl font-semibold text-sm disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #A5D0FB, #CFC6FF)", color: "#000" }}
        >
          {distributing ? "Distributing..." : "Distribute All"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === i ? "text-black" : "text-white border border-white/20"}`}
            style={tab === i ? { background: "linear-gradient(135deg, #A5D0FB, #CFC6FF)" } : {}}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <DataTable title="All Mentorship History" columns={historyColumns} data={history} pageSize={10} />
      )}
      {tab === 1 && (
        <DataTable title="Eligible Users" columns={eligibleColumns} data={eligibleUsers} pageSize={10} />
      )}
    </div>
  );
};

export default AdminMentorshipBonus;
