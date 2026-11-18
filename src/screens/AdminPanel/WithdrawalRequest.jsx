import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { setLoading } from "../../redux/slices/loadingSlice";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { approveWithdrawal, getAllWithdrawalRequestss, rejectWithdrawal, getIncomeTotalForAdmin } from "../../api/admin.api";
import { RefreshCw, Download, Layers, ShieldCheck, CheckCircle2, XCircle, ArrowUpRight, Copy, Check } from "lucide-react";
import { maskWalletAddress } from "../../utils/additionalFunc";

const WithdrawalRequest = () => {
  const dispatch = useDispatch();
  const [allWithdrawalRequests, setAllWithdrawalRequests] = useState([]);
  const [backendStats, setBackendStats] = useState({ totalGross: 0, totalExchangePayout: 0, totalP2PWalletCredit: 0 });
  const [incomeSummary, setIncomeSummary] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(null);

  /* =========================================================
     FETCH WITHDRAWALS & STATS
  ========================================================= */
  const fetchAllWithdrawalRequests = useCallback(async (isManual = false) => {
    try {
      if (!isManual) dispatch(setLoading(true));

      const [response, summaryRes] = await Promise.allSettled([
        getAllWithdrawalRequestss(),
        getIncomeTotalForAdmin(),
      ]);

      if (response.status === "fulfilled") {
        const resData = response.value;
        const rawList = Array.isArray(resData?.data?.withdrawals)
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

        // Filter for Pending requests
        const pendingOnly = rawList.filter(
          (item) => !item?.status || String(item?.status).toLowerCase() === "pending"
        );

        setAllWithdrawalRequests(pendingOnly);

        if (resData?.data?.stats) {
          setBackendStats(resData.data.stats);
        }
      } else {
        setAllWithdrawalRequests([]);
      }

      if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
        setIncomeSummary(summaryRes.value?.data || summaryRes.value);
      }

      if (isManual) toast.success("Pending withdrawals refreshed");
    } catch (error) {
      console.error("fetchAllWithdrawalRequests Error:", error);
      toast.error("Failed to load withdrawal requests");
      setAllWithdrawalRequests([]);
    } finally {
      if (!isManual) dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllWithdrawalRequests();
  }, [fetchAllWithdrawalRequests]);

  /* =========================================================
     COPY WALLET ADDRESS
  ========================================================= */
  const handleCopy = (address) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success("Wallet address copied!");
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  /* =========================================================
     APPROVE WITHDRAWAL (DIRECT SETTLEMENT - COMPACT CONFIRMATION)
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
          text: response?.message || "Withdrawal approved successfully.",
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

        // Remove approved withdrawal from pending table
        setAllWithdrawalRequests((prev) => prev.filter((item) => (item?._id || item?.id) !== id));
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
        title: "Something went wrong",
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
     REJECT WITHDRAWAL (COMPACT CONFIRMATION)
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
          text: response?.message || "Withdrawal rejected and amount refunded.",
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

        // Remove rejected withdrawal from pending table
        setAllWithdrawalRequests((prev) => prev.filter((item) => (item?._id || item?.id) !== id));
      } else {
        Swal.fire({
          icon: "error",
          title: "Rejection Failed",
          text: response?.message || "Unable to reject withdrawal",
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
      console.error("Reject error:", error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error?.response?.data?.message || error?.message || "Unable to reject withdrawal",
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
     EXPORT CSV
  ========================================================= */
  const handleExportCSV = () => {
    if (!allWithdrawalRequests.length) {
      toast.info("No pending requests to export");
      return;
    }

    const headers = [
      "#", "Payout ID", "User ID", "Username", "Email", "Mobile",
      "Gross Amount ($)", "10% Fee ($)", "50% Crypto ($)", "50% P2P ($)",
      "Destination Wallet", "Status", "Date", "Remark"
    ];

    const rows = allWithdrawalRequests.map((item, idx) => {
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
    link.setAttribute("download", `pending_withdrawals_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* =========================================================
     COMPUTED STATS
  ========================================================= */
  const computedStats = useMemo(() => {
    const totalGross = allWithdrawalRequests.reduce((acc, curr) => acc + Number(curr.investment || curr.amount || 0), 0);
    const totalCrypto = allWithdrawalRequests.reduce((acc, curr) => acc + Number(curr.exchangeAmount || curr.netAmount || (Number(curr.investment || 0) * 0.45)), 0);
    const totalP2P = allWithdrawalRequests.reduce((acc, curr) => acc + Number(curr.p2pAmount || (Number(curr.investment || 0) * 0.45)), 0);

    return {
      count: allWithdrawalRequests.length,
      totalGross: totalGross || backendStats.totalGross,
      totalCrypto: totalCrypto || backendStats.totalExchangePayout,
      totalP2P: totalP2P || backendStats.totalP2PWalletCredit,
    };
  }, [allWithdrawalRequests, backendStats]);

  const cardData = [
    {
      title: "Pending Requests Count",
      value: `${computedStats.count} Requests`,
      icon: "https://img.icons8.com/3d-fluency/94/hourglass.png",
    },
    {
      title: "Total Gross Requested",
      value: `$${Number(computedStats.totalGross).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",
    },
    {
      title: "50% Exchange Crypto Payout",
      value: `$${Number(computedStats.totalCrypto).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
    },
    {
      title: "50% P2P Wallet Credited",
      value: `$${Number(computedStats.totalP2P).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/wallet.png",
    },
  ];

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */
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
        <span className="font-mono text-xs font-bold text-indigo-400">
          {row?.id || row?._id || "WITH-NEW"}
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
      searchValue: (row) => `${row?.user?.username || ""} ${row?.user?.id || ""} ${row?.user?.email || ""} ${row?.user?.mobile || ""}`,
    },
    {
      header: "Gross Amount",
      accessor: "investment",
      cell: (row) => {
        const gross = Number(row?.investment || row?.amount || 0);
        return (
          <span className="font-bold text-white text-sm">
            ${gross.toFixed(2)}
          </span>
        );
      },
    },
    {
      header: "10% Fee",
      accessor: "gasFee",
      cell: (row) => {
        const gross = Number(row?.investment || row?.amount || 0);
        const fee = Number(row?.gasFee ?? (gross * 0.1));
        return (
          <span className="font-medium text-rose-400 text-xs">
            -${fee.toFixed(2)}
          </span>
        );
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
            <span className="font-bold text-blue-300 text-xs sm:text-sm">
              ${crypto.toFixed(2)}
            </span>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {row?.currency || "USDT"}
            </div>
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
        return (
          <span className="font-bold text-emerald-400 text-xs sm:text-sm">
            ${p2p.toFixed(2)}
          </span>
        );
      },
    },
    {
      header: "Wallet Destination",
      accessor: "clientAddress",
      cell: (row) => {
        const addr = row?.clientAddress || row?.user?.account || row?.walletAddress || "";
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
            <span className="truncate max-w-[130px]" title={addr}>
              {addr ? maskWalletAddress(addr) : "—"}
            </span>
            {addr && (
              <button
                onClick={() => handleCopy(addr)}
                className="text-slate-500 hover:text-cyan-300 transition"
                title="Copy Address"
              >
                {copiedAddress === addr ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
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
      cell: (row) => (
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          {row?.status || "Pending"}
        </span>
      ),
      searchValue: (row) => row?.status || "Pending",
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
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-1"
            onClick={() => handleApprove(row)}
          >
            <CheckCircle2 size={13} />
            Approve
          </button>
          <button
            type="button"
            className="px-2.5 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-500 transition shadow-lg shadow-rose-600/20 cursor-pointer flex items-center gap-1"
            onClick={() => handleReject(row)}
          >
            <XCircle size={13} />
            Reject
          </button>
        </div>
      ),
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="space-y-6 mt-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Layers size={13} className="text-amber-400" />
            Withdrawal Management
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Pending Withdrawal Requests</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Review and process 50% crypto payouts and instant 50% P2P wallet credit allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAllWithdrawalRequests(true)}
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

      {/* Dynamic Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            iconImage={item.icon}
          />
        ))}
      </div>

      {/* Pending Table */}
      <DataTable
        title={`Pending Withdrawal Requests (${allWithdrawalRequests.length})`}
        columns={columns}
        data={allWithdrawalRequests}
        pageSize={10}
      />
    </div>
  );
};

export default WithdrawalRequest;