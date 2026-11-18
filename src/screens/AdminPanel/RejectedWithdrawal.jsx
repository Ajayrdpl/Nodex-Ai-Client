import React, { useEffect, useState, useMemo } from "react";
import {
  getAllRejectedWithdrawalRequests,
  getAllWithdrawalRequests,
} from "../../api/admin.api";
import { setLoading } from "../../redux/slices/loadingSlice";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { RefreshCw, Download, Layers, XCircle } from "lucide-react";
import { maskWalletAddress } from "../../utils/additionalFunc";

const RejectedWithdrawal = () => {
  const [allRejected, setAllRejected] = useState([]);
  const dispatch = useDispatch();

  const fetchAllRejected = async (isManual = false) => {
    try {
      if (!isManual) dispatch(setLoading(true));
      const [res1, res2] = await Promise.allSettled([
        getAllRejectedWithdrawalRequests(),
        getAllWithdrawalRequests(),
      ]);

      let list = [];
      if (res1.status === "fulfilled" && (res1.value?.success || res1.value?.data)) {
        const d = res1.value.data;
        list = Array.isArray(d?.withdrawals)
          ? d.withdrawals
          : Array.isArray(d?.history)
          ? d.history
          : Array.isArray(d)
          ? d
          : [];
      }

      // If empty, check full history for Cancelled/Rejected items
      if (!list.length && res2.status === "fulfilled") {
        const d2 = res2.value?.data;
        const allList = Array.isArray(d2?.withdrawals)
          ? d2.withdrawals
          : Array.isArray(d2?.history)
          ? d2.history
          : Array.isArray(d2)
          ? d2
          : [];
        list = allList.filter(
          (w) => String(w.status).toLowerCase() === "cancelled" || String(w.status).toLowerCase() === "rejected"
        );
      }

      setAllRejected(list);
      if (isManual) toast.success("Rejected withdrawals refreshed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch rejected withdrawals");
      setAllRejected([]);
    } finally {
      if (!isManual) dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAllRejected();
  }, []);

  const handleExportCSV = () => {
    if (!allRejected.length) {
      toast.info("No records to export");
      return;
    }

    const headers = ["#", "Payout ID", "User ID", "Username", "Email", "Gross Amount ($)", "Wallet Address", "Status", "Date", "Rejection Reason"];
    const rows = allRejected.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
      item?.user?.id || "",
      item?.user?.username || item?.username || "",
      item?.user?.email || item?.email || "",
      Number(item.investment || item.amount || 0).toFixed(2),
      item.clientAddress || item?.user?.account || "",
      item.status || "Rejected",
      item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
      `"${(item.remark || item.reason || item.penaltyReason || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rejected_withdrawals_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-semibold text-slate-400">{rowIndex + 1}</span>
      ),
    },
    {
      header: "Payout ID",
      accessor: "id",
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-rose-400">
          {row?.id || row?._id}
        </span>
      ),
      searchValue: (row) => row?.id?.toString() || row?._id?.toString() || "",
    },
    {
      header: "User Details",
      accessor: "user.username",
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-white text-xs sm:text-sm">
            {row?.user?.username || row?.username || "Investor"}
          </div>
          <div className="text-[11px] text-cyan-400 font-mono">
            ID: {row?.user?.id || "—"}
          </div>
          {(row?.user?.email || row?.user?.mobile) && (
            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
              {row?.user?.email || row?.user?.mobile}
            </div>
          )}
        </div>
      ),
      searchValue: (row) => `${row?.user?.username || ""} ${row?.user?.id || ""} ${row?.user?.email || ""}`,
    },
    {
      header: "Gross Amount",
      accessor: "investment",
      cell: (row) => (
        <span className="font-bold text-white text-sm">
          ${Number(row?.investment || row?.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Destination Wallet",
      accessor: "clientAddress",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {maskWalletAddress(row?.clientAddress || row?.user?.account || "")}
        </span>
      ),
      searchValue: (row) => row?.clientAddress || row?.user?.account || "",
    },
    {
      header: "Reason / Remark",
      accessor: "remark",
      cell: (row) => (
        <span className="text-xs text-rose-300 italic max-w-[200px] truncate block" title={row?.remark || row?.reason}>
          {row?.remark || row?.reason || "Refunded to wallet"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
          <XCircle size={11} />
          {row?.status || "Cancelled"}
        </span>
      ),
    },
    {
      header: "Date & Time",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-xs text-slate-300">
          {row?.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold mb-2">
            <Layers size={13} className="text-rose-400" />
            Financial Audit
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Rejected Withdrawal Requests</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Logs of cancelled withdrawal requests with refunded wallet balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAllRejected(true)}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleExportCSV}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Export CSV"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <DataTable
        title={`Rejected Withdrawals (${allRejected.length})`}
        columns={columns}
        data={allRejected}
        pageSize={10}
      />
    </div>
  );
};

export default RejectedWithdrawal;
