import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getMentorshipStatus, getMentorshipHistory } from "../../api/user.api";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import DataTable from "../../components/Screen/UserPanel/DataTable";

const MentorshipBonus = () => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        dispatch(setLoading(true));
        const [statusRes, historyRes] = await Promise.all([
          getMentorshipStatus(),
          getMentorshipHistory(),
        ]);
        if (statusRes?.success) {
          setStatus(statusRes.data || statusRes);
        } else {
          toast.error(statusRes?.message || "Failed to fetch status");
        }
        if (historyRes?.success) {
          const list = Array.isArray(historyRes.data)
            ? historyRes.data
            : (historyRes.data?.history || historyRes.data?.records || historyRes.data?.docs || historyRes.history || []);
          setHistory(list);
        } else {
          toast.error(historyRes?.message || "Failed to fetch history");
        }
      } catch {
        toast.error("Failed to fetch mentorship data");
        setHistory([]);
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetch();
  }, [dispatch]);

  const req = status?.requirements;

  const cards = [
    {
      title: "Total Mentorship Earned",
      value: `$ ${Number(status?.totalEarned ?? status?.estimatedBonus ?? status?.totalBonus ?? 0).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/bar-chart.png",
    },
    {
      title: "Self Investment",
      value: `$ ${Number(status?.selfInvestment ?? 0).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/coins.png",
    },
    {
      title: "Total Team Business",
      value: `$ ${Number(status?.totalTeamBusiness ?? 0).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/group.png",
    },
    {
      title: "Monthly New Business",
      value: `$ ${Number(status?.monthlyNewBusiness ?? 0).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-transfer.png",
    },
  ];

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, i) => <span className="font-medium text-white">{i + 1}</span>,
    },
    {
      header: "Month / Period",
      accessor: "month",
      searchValue: true,
      cell: (row) => (
        <span className="font-medium text-white">
          {row?.month && row?.year ? `${row.month}/${row.year}` : row?.period || row?.remark || "-"}
        </span>
      ),
    },
    {
      header: "Team Volume",
      accessor: "amount",
      cell: (row) => (
        <span className="text-slate-300">
          {row?.amount ? `$ ${Number(row.amount).toLocaleString()}` : "-"}
        </span>
      ),
    },
    {
      header: "Bonus (20%)",
      accessor: "income",
      cell: (row) => (
        <span className="font-semibold text-emerald-400">
          $ {Number(row?.income ?? row?.bonus ?? row?.bonusAmount ?? row?.amount ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            row?.status === "Completed" || row?.status === "Distributed" || row?.status === "Paid"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          }`}
        >
          {row?.status || "Completed"}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      searchValue: true,
      cell: (row) => (
        <span className="text-slate-300 text-sm">
          {row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <StatCard key={c.title} title={c.title} value={c.value} iconImage={c.icon} />
        ))}
      </div>

      {/* Eligibility Banner */}
      <div className={`p-4 rounded-xl border ${status?.eligible ? "border-green-500/40 bg-green-500/10" : "border-red-500/40 bg-red-500/10"}`}>
        <div className="flex items-center gap-3">
          <i className={`fa-solid ${status?.eligible ? "fa-circle-check text-green-400" : "fa-circle-xmark text-red-400"} text-xl`}></i>
          <div>
            <p className={`font-semibold ${status?.eligible ? "text-green-400" : "text-red-400"}`}>
              {status?.eligible ? "Eligible for Mentorship Bonus" : "Not Eligible"}
            </p>
            {!status?.eligible && status?.reason && (
              <p className="text-slate-400 text-sm mt-0.5">{status.reason}</p>
            )}
          </div>
        </div>
      </div>

      {/* Requirements Table */}
      {req && (
        <div className="hero-glass rounded-xl p-5">
          <p className="text-white font-semibold mb-4">Requirements</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Self Investment Required", value: `$ ${Number(req.selfInvestmentRequired ?? 0).toFixed(2)}`, current: status?.selfInvestment },
              { label: "Total Team Business Required", value: `$ ${Number(req.totalTeamBusinessRequired ?? 0).toFixed(2)}`, current: status?.totalTeamBusiness },
              { label: "Monthly New Business Required", value: `$ ${Number(req.monthlyNewBusinessRequired ?? 0).toFixed(2)}`, current: status?.monthlyNewBusiness },
              { label: "Bonus Percentage", value: req.bonusPercentage, current: null },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-slate-400 text-sm">{item.label}</span>
                <div className="text-right">
                  <span className="text-white font-semibold text-sm">{item.value}</span>
                  {item.current !== null && (
                    <p className="text-xs text-slate-500">Current: $ {Number(item.current).toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DataTable title="Mentorship Bonus History" columns={columns} data={history} pageSize={10} />
    </div>
  );
};

export default MentorshipBonus;
