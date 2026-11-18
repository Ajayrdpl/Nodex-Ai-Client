import React, { useEffect, useState, useMemo } from "react";
import {
  getAllWithdrawalRequests,
  getIncomeTotalForAdmin,
  approveWithdrawal,
  rejectWithdrawal,
} from "../../api/admin.api";
import { setLoading } from "../../redux/slices/loadingSlice";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { maskWalletAddress } from "../../utils/additionalFunc";
import { useLocation } from "react-router-dom";
import { isToday } from "../../utils/helper";
import { QRCodeCanvas } from "qrcode.react";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { RefreshCw, Download, Layers, Filter, CheckCircle2, XCircle, Copy, Check, QrCode } from "lucide-react";

const ApprovedWithdrawal = () => {
  const [allWithdrawalHistory, setAllWithdrawalHistory] = useState([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [backendStats, setBackendStats] = useState({ totalGross: 0, totalExchangePayout: 0, totalP2PWalletCredit: 0 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  const dispatch = useDispatch();
  const location = useLocation();
  const data = location?.state;

  const fetchAllWithdrawalHistory = async (isManual = false) => {
    try {
      if (!isManual) dispatch(setLoading(true));
      const [response, summaryRes] = await Promise.allSettled([
        getAllWithdrawalRequests(),
        getIncomeTotalForAdmin(),
      ]);

      if (response.status === "fulfilled") {
        const resData = response.value;
        const list = Array.isArray(resData?.data?.withdrawals)
          ? resData.data.withdrawals
          : Array.isArray(resData?.data?.history)
          ? resData.data.history
          : Array.isArray(resData?.data)
          ? resData.data
          : Array.isArray(resData?.withdrawals)
          ? resData.withdrawals
          : Array.isArray(resData?.history)
          ? resData.history
          : [];

        setAllWithdrawalHistory(list);

        if (resData?.data?.stats) {
          setBackendStats(resData.data.stats);
        }
      } else {
        setAllWithdrawalHistory([]);
      }

      if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
        setSummaryData(summaryRes.value?.data || summaryRes.value);
      }

      if (isManual) toast.success("Withdrawal records refreshed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch withdrawal reports");
    } finally {
      if (!isManual) dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAllWithdrawalHistory();
  }, []);

  const handleCopyText = async (text, id) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  /* =========================================================
     COMPACT & MOBILE-RESPONSIVE APPROVAL CONFIRMATION
  ========================================================= */
  const handleApprove = async (row) => {
    const id = row?._id || row?.id;
    if (!id) {
      toast.error("Withdrawal ID is missing");
      return;
    }

    const username = row?.user?.username || row?.username || "user";
    const amount = Number(row?.exchangeAmount || row?.netAmount || (Number(row?.investment || row?.amount || 0) * 0.45) || 0).toFixed(2);

    const result = await Swal.fire({
      title: "Approve Withdrawal?",
      text: `Are you sure you want to approve $${amount} USDT for ${username}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#0b0f19",
      color: "#f8fafc",
      iconColor: "#10b981",
      customClass: {
        popup: "!w-[88vw] !max-w-[320px] !p-4 !rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl",
        title: "!text-base !font-bold !text-white !m-0 !p-0",
        htmlContainer: "!text-xs !text-slate-300 !mt-2 !mb-0",
        actions: "!flex !gap-2 !mt-4 !w-full !justify-center",
        confirmButton: "!flex-1 !py-2.5 !rounded-xl !font-bold !text-xs !bg-emerald-600 hover:!bg-emerald-500 !text-white cursor-pointer !m-0 transition shadow-lg shadow-emerald-600/20",
        cancelButton: "!flex-1 !py-2.5 !rounded-xl !font-bold !text-xs !bg-slate-800 hover:!bg-slate-700 !text-slate-300 !border !border-slate-700 cursor-pointer !m-0 transition",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      dispatch(setLoading(true));
      const response = await approveWithdrawal({
        withdrawalId: id,
        id,
        status: "Approved",
      });

      if (response?.success || String(response?.message || "").toLowerCase().includes("success")) {
        await Swal.fire({
          icon: "success",
          title: "Approved!",
          text: response?.message || "Withdrawal payout marked as Completed.",
          background: "#0b0f19",
          color: "#f8fafc",
          customClass: {
            popup: "!w-[88vw] !max-w-[300px] !p-4 !rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl",
            title: "!text-sm !font-bold !text-white !m-0",
            htmlContainer: "!text-xs !text-slate-300 !mt-1 !mb-0",
          },
          buttonsStyling: false,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        setSelectedWithdrawal(null);
        await fetchAllWithdrawalHistory();
      } else {
        Swal.fire({
          icon: "error",
          title: "Approval Failed",
          text: response?.message || "Unable to approve withdrawal",
          background: "#0b0f19",
          color: "#f8fafc",
          customClass: {
            popup: "!w-[88vw] !max-w-[300px] !p-4 !rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl",
            title: "!text-sm !font-bold !text-white !m-0",
            htmlContainer: "!text-xs !text-slate-300 !mt-1 !mb-0",
            confirmButton: "!px-4 !py-2 !rounded-xl !font-bold !text-xs !bg-rose-600 !text-white cursor-pointer",
          },
          buttonsStyling: false,
        });
      }
    } catch (error) {
      console.error("Approve error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || error?.message || "Unable to approve withdrawal",
        background: "#0b0f19",
        color: "#f8fafc",
        customClass: {
          popup: "!w-[88vw] !max-w-[300px] !p-4 !rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl",
          title: "!text-sm !font-bold !text-white !m-0",
          htmlContainer: "!text-xs !text-slate-300 !mt-1 !mb-0",
          confirmButton: "!px-4 !py-2 !rounded-xl !font-bold !text-xs !bg-rose-600 !text-white cursor-pointer",
        },
        buttonsStyling: false,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  /* =========================================================
     COMPACT & MOBILE-RESPONSIVE REJECTION CONFIRMATION
  ========================================================= */
  const handleReject = async (row) => {
    const id = row?._id || row?.id;
    if (!id) {
      toast.error("Withdrawal ID is missing");
      return;
    }

    const username = row?.user?.username || row?.username || "user";

    const result = await Swal.fire({
      title: "Reject Withdrawal?",
      text: `Are you sure you want to reject withdrawal for ${username}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#0b0f19",
      color: "#f8fafc",
      iconColor: "#f43f5e",
      customClass: {
        popup: "!w-[88vw] !max-w-[320px] !p-4 !rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl",
        title: "!text-base !font-bold !text-white !m-0 !p-0",
        htmlContainer: "!text-xs !text-slate-300 !mt-2 !mb-0",
        actions: "!flex !gap-2 !mt-4 !w-full !justify-center",
        confirmButton: "!flex-1 !py-2.5 !rounded-xl !font-bold !text-xs !bg-rose-600 hover:!bg-rose-500 !text-white cursor-pointer !m-0 transition shadow-lg shadow-rose-600/20",
        cancelButton: "!flex-1 !py-2.5 !rounded-xl !font-bold !text-xs !bg-slate-800 hover:!bg-slate-700 !text-slate-300 !border !border-slate-700 cursor-pointer !m-0 transition",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      dispatch(setLoading(true));
      const response = await rejectWithdrawal({
        withdrawalId: id,
        id,
        status: "Rejected",
      });

      if (response?.success || String(response?.message || "").toLowerCase().includes("success")) {
        await Swal.fire({
          icon: "success",
          title: "Rejected!",
          text: response?.message || "Request rejected and funds reverted.",
          background: "#0b0f19",
          color: "#f8fafc",
          customClass: {
            popup: "!w-[88vw] !max-w-[300px] !p-4 !rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl",
            title: "!text-sm !font-bold !text-white !m-0",
            htmlContainer: "!text-xs !text-slate-300 !mt-1 !mb-0",
          },
          buttonsStyling: false,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        setSelectedWithdrawal(null);
        await fetchAllWithdrawalHistory();
      } else {
        toast.error(response?.message || "Failed to reject withdrawal");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to reject withdrawal");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const filteredWithdrawals = useMemo(() => {
    return allWithdrawalHistory.filter((item) => {
      const matchesToday = data === "today" ? isToday(new Date(item.createdAt)) : true;
      const statusLower = String(item.status || "Pending").toLowerCase();

      let matchesStatus = true;
      if (statusFilter === "Pending") matchesStatus = statusLower === "pending";
      else if (statusFilter === "Completed") matchesStatus = statusLower === "completed" || statusLower === "approved";
      else if (statusFilter === "Cancelled") matchesStatus = statusLower === "cancelled" || statusLower === "rejected";

      return matchesToday && matchesStatus;
    });
  }, [allWithdrawalHistory, data, statusFilter]);

  const handleExportCSV = () => {
    if (!filteredWithdrawals.length) {
      toast.info("No records to export");
      return;
    }

    const headers = [
      "#", "Payout ID", "User ID", "Username", "Email", "Mobile",
      "Gross Requested ($)", "10% Fee ($)", "50% Crypto Transfer ($)", "50% P2P Credit ($)",
      "Destination Wallet", "Status", "Date", "Remark"
    ];

    const rows = filteredWithdrawals.map((item, idx) => {
      const gross = Number(item.investment || item.amount || 0);
      const fee = Number(item.gasFee || gross * 0.1);
      const crypto = Number(item.exchangeAmount || item.netAmount || (gross - fee) * 0.5);
      const p2p = Number(item.p2pAmount || (gross - fee) * 0.5);

      return [
        idx + 1,
        item.id || item._id || "",
        item?.user?.id || "",
        item?.user?.username || item?.username || "",
        item?.user?.email || item?.email || "",
        item?.user?.mobile || item?.mobile || "",
        gross.toFixed(2),
        fee.toFixed(2),
        crypto.toFixed(2),
        p2p.toFixed(2),
        item.clientAddress || item?.user?.account || "",
        item.status || "Pending",
        item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
        `"${(item.remark || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `all_withdrawals_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const computedStats = useMemo(() => {
    const totalGross = Number(summaryData?.totalWithdraw ?? backendStats?.totalGross ?? allWithdrawalHistory.reduce((acc, curr) => acc + Number(curr.investment || curr.amount || 0), 0));
    const todayGross = Number(summaryData?.todayWithdraw ?? allWithdrawalHistory.filter((i) => isToday(new Date(i.createdAt))).reduce((acc, curr) => acc + Number(curr.investment || curr.amount || 0), 0));
    const totalCrypto = Number(backendStats?.totalExchangePayout ?? (totalGross * 0.45));
    const totalP2P = Number(backendStats?.totalP2PWalletCredit ?? (totalGross * 0.45));

    return { totalGross, todayGross, totalCrypto, totalP2P };
  }, [summaryData, backendStats, allWithdrawalHistory]);

  const cardData = [
    {
      title: "Total Gross Withdrawals",
      value: `$${computedStats.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",
    },
    {
      title: "Today's Withdrawals",
      value: `$${computedStats.todayGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/isometric/50/economic-improvement--v1.png",
    },
    {
      title: "Total 50% Crypto Payouts",
      value: `$${computedStats.totalCrypto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
    },
    {
      title: "Total 50% P2P Wallet Credits",
      value: `$${computedStats.totalP2P.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/wallet.png",
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
      header: "Payout ID",
      accessor: "id",
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-indigo-400 font-bold">
          <span>{row?.id || row?._id}</span>
          <button
            onClick={() => handleCopyText(row?.id || row?._id, row?.id || row?._id)}
            className="text-slate-500 hover:text-cyan-300 transition cursor-pointer"
          >
            {copiedId === (row?.id || row?._id) ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
        </div>
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
      searchValue: (row) => `${row?.user?.username || ""} ${row?.user?.id || ""} ${row?.user?.email || ""} ${row?.user?.mobile || ""}`,
    },
    {
      header: "Gross ($)",
      accessor: "investment",
      cell: (row) => {
        const gross = Number(row?.investment || row?.amount || 0);
        return <span className="font-bold text-white text-sm">${gross.toFixed(2)}</span>;
      },
    },
    {
      header: "10% Fee",
      accessor: "gasFee",
      cell: (row) => {
        const gross = Number(row?.investment || row?.amount || 0);
        const fee = Number(row?.gasFee ?? (gross * 0.1));
        return <span className="font-medium text-rose-400 text-xs">-${fee.toFixed(2)}</span>;
      },
    },
    {
      header: "50% Crypto Transfer",
      accessor: "exchangeAmount",
      cell: (row) => {
        const gross = Number(row?.investment || row?.amount || 0);
        const fee = Number(row?.gasFee ?? (gross * 0.1));
        const crypto = Number(row?.exchangeAmount ?? row?.netAmount ?? ((gross - fee) * 0.5));
        return (
          <div className="space-y-0.5">
            <span className="font-bold text-blue-300 text-xs sm:text-sm">${crypto.toFixed(2)}</span>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">{row?.currency || "USDT"}</div>
          </div>
        );
      },
    },
    {
      header: "50% P2P Credit",
      accessor: "p2pAmount",
      cell: (row) => {
        const gross = Number(row?.investment || row?.amount || 0);
        const fee = Number(row?.gasFee ?? (gross * 0.1));
        const p2p = Number(row?.p2pAmount ?? ((gross - fee) * 0.5));
        return <span className="font-bold text-emerald-400 text-xs sm:text-sm">${p2p.toFixed(2)}</span>;
      },
    },
    {
      header: "Destination Wallet",
      accessor: "clientAddress",
      cell: (row) => {
        const addr = row?.clientAddress || row?.user?.account || row?.walletAddress || "";
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
            <span className="truncate max-w-[120px]" title={addr}>
              {addr ? maskWalletAddress(addr) : "—"}
            </span>
            {addr && (
              <button
                onClick={() => handleCopyText(addr, `addr_${row?._id || row?.id}`)}
                className="text-slate-500 hover:text-cyan-300 transition cursor-pointer"
              >
                {copiedId === `addr_${row?._id || row?.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        );
      },
      searchValue: (row) => row?.clientAddress || row?.user?.account || "",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const status = row?.status || "Pending";
        const isApproved = status === "Completed" || status === "Approved";
        const isPending = status === "Pending";

        return (
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1 ${
              isApproved
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : isPending
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-rose-500/20 text-rose-400 border-rose-500/30"
            }`}
          >
            {isApproved ? <CheckCircle2 size={11} /> : isPending ? <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> : <XCircle size={11} />}
            {status}
          </span>
        );
      },
      searchValue: (row) => row?.status || "",
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
    {
      header: "Actions",
      exportable: false,
      cell: (row) => {
        const isPending = String(row?.status || "Pending").toLowerCase() === "pending";
        return (
          <div className="flex items-center gap-1.5 flex-nowrap">
            {isPending && (
              <>
                <button
                  onClick={() => handleApprove(row)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm shadow-emerald-600/30"
                  title="Approve"
                >
                  <CheckCircle2 size={12} />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(row)}
                  className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Reject"
                >
                  <XCircle size={12} />
                  Reject
                </button>
              </>
            )}
            <button
              onClick={() => setSelectedWithdrawal(row)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer border border-slate-700"
              title="Details"
            >
              <QrCode size={12} />
              Details
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <Layers size={13} className="text-indigo-400" />
            Platform Financial Reports
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">All Withdrawal History & Payout Audit</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Direct database settlement without smart contract / dApp wallet requirements. Manage and approve payouts.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => fetchAllWithdrawalHistory(true)}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={handleExportCSV}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Export CSV"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cardData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            iconImage={item.icon}
          />
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Filter size={13} className="text-indigo-400" />
          <span>Status:</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "Pending", "Completed", "Cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === s
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              {s === "all" ? "All" : s} (
              {
                s === "all"
                  ? allWithdrawalHistory.length
                  : allWithdrawalHistory.filter((w) => String(w.status || "Pending").toLowerCase() === s.toLowerCase() || (s === "Completed" && w.status === "Approved")).length
              }
              )
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title={`Withdrawal Reports (${filteredWithdrawals.length})`}
        columns={columns}
        data={filteredWithdrawals}
        pageSize={10}
      />

      {/* Details & Action Modal (Responsive) */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-5 text-white shadow-2xl space-y-3 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white">Withdrawal Details</h3>
                <span className="font-mono text-xs text-indigo-400">{selectedWithdrawal.id || selectedWithdrawal._id}</span>
              </div>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center p-2.5 bg-white rounded-xl w-fit mx-auto">
              <QRCodeCanvas
                value={selectedWithdrawal.clientAddress || selectedWithdrawal?.user?.account || "N/A"}
                size={130}
              />
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">User:</span>
                <span className="font-bold text-white">{selectedWithdrawal?.user?.username || selectedWithdrawal?.username || "Investor"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gross:</span>
                <span className="font-bold text-white">${Number(selectedWithdrawal.investment || selectedWithdrawal.amount || 0).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">10% Fee:</span>
                <span className="font-medium text-rose-400">-${Number(selectedWithdrawal.gasFee || Number(selectedWithdrawal.investment || 0) * 0.1).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">50% Crypto Transfer:</span>
                <span className="font-bold text-emerald-400">${Number(selectedWithdrawal.exchangeAmount || selectedWithdrawal.netAmount || (Number(selectedWithdrawal.investment || 0) * 0.45)).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">50% P2P Credit:</span>
                <span className="font-bold text-indigo-300">${Number(selectedWithdrawal.p2pAmount || (Number(selectedWithdrawal.investment || 0) * 0.45)).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-700/60">
                <span className="text-slate-400">Destination:</span>
                <span className="font-mono text-cyan-300 text-[11px] truncate max-w-[180px]" title={selectedWithdrawal.clientAddress || selectedWithdrawal?.user?.account}>
                  {selectedWithdrawal.clientAddress || selectedWithdrawal?.user?.account || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-amber-400 uppercase text-[11px]">{selectedWithdrawal.status || "Pending"}</span>
              </div>
            </div>

            {/* Modal Actions */}
            {String(selectedWithdrawal.status || "Pending").toLowerCase() === "pending" ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleApprove(selectedWithdrawal)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-emerald-600/30"
                >
                  <CheckCircle2 size={13} />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedWithdrawal)}
                  className="flex-1 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <XCircle size={13} />
                  Reject
                </button>
                <button
                  onClick={() => setSelectedWithdrawal(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedWithdrawal;
