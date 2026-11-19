import React, { useEffect, useState, useMemo, useCallback } from "react";

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

import { isToday } from "../../utils/helper";

import { QRCodeCanvas } from "qrcode.react";

import StatCard from "../../components/Screen/UserPanel/StatCard";

import {

  RefreshCw,

  Download,

  Filter,

  CheckCircle2,

  XCircle,

  Copy,

  Check,

  QrCode,

  ExternalLink,

  Clock,

  DollarSign,

} from "lucide-react";



const ApprovedWithdrawal = () => {

  const [allWithdrawalHistory, setAllWithdrawalHistory] = useState([]);

  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  const [summaryData, setSummaryData] = useState(null);

  const [backendStats, setBackendStats] = useState({

    totalGross: 0,

    totalExchangePayout: 0,

    totalP2PWalletCredit: 0,

  });

  const [statusFilter, setStatusFilter] = useState("all");

  const [copiedId, setCopiedId] = useState(null);

  const [qrModalData, setQrModalData] = useState(null);



  const dispatch = useDispatch();



  const fetchAllWithdrawalHistory = useCallback(

    async (isManual = false) => {

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

    },

    [dispatch]

  );



  useEffect(() => {

    fetchAllWithdrawalHistory();

  }, [fetchAllWithdrawalHistory]);



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

     APPROVE & RECORD MANUAL PAYMENT

  ========================================================= */

  const handleApprove = async (row) => {

    const id = row?._id || row?.id;

    if (!id) {

      toast.error("Withdrawal ID is missing");

      return;

    }



    const username = row?.user?.username || row?.username || "Investor";

    const gross = Number(row?.investment || row?.requestedAmount || row?.amount || 0);

    const fee = Number(row?.gasFee ?? gross * 0.05);

    const netPayout = Number(row?.exchangeAmount ?? row?.netAmount ?? (gross - fee));

    const wallet = row?.clientAddress || row?.user?.account || row?.walletAddress || "";



    const { value: formValues } = await Swal.fire({

      title: "Approve & Record Manual Payout",

      html: `

        <div style="text-align: left; font-size: 13px; color: #cbd5e1; font-family: sans-serif;">

          <div style="background: #020817; border: 1px solid rgba(0,210,255,0.3); padding: 12px; border-radius: 12px; margin-bottom: 14px;">

            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">

              <span style="color: #94a3b8;">User:</span>

              <strong style="color: #ffffff;">${username}</strong>

            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">

              <span style="color: #94a3b8;">Gross Amount:</span>

              <strong style="color: #ffffff;">$${gross.toFixed(2)}</strong>

            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">

              <span style="color: #f43f5e;">Admin Fee (5%):</span>

              <strong style="color: #f43f5e;">-$${fee.toFixed(2)}</strong>

            </div>

            <div style="display: flex; justify-content: space-between; border-top: 1px solid #1e293b; padding-top: 6px;">

              <span style="color: #10b981; font-weight: bold;">Net Transfer (95%):</span>

              <strong style="color: #10b981; font-size: 16px;">$${netPayout.toFixed(2)} USDT</strong>

            </div>

          </div>



          <div style="margin-bottom: 12px;">

            <label style="display: block; font-size: 11px; font-weight: bold; color: #38bdf8; margin-bottom: 4px;">Destination Wallet (BEP-20):</label>

            <div style="background: #030914; border: 1px solid #334155; padding: 8px 10px; border-radius: 8px; font-family: monospace; font-size: 11px; word-break: break-all; color: #f8fafc;">

              ${wallet || "No wallet specified"}

            </div>

          </div>



          <div style="margin-bottom: 12px;">

            <label style="display: block; font-size: 11px; font-weight: bold; color: #94a3b8; margin-bottom: 4px;">Manual Blockchain Tx Hash (TxID):</label>

            <input id="swal-tx-hash-app" class="swal2-input" placeholder="0x... (from BscScan or wallet ref)" style="width: 100%; box-sizing: border-box; background: #030914; color: #ffffff; border: 1px solid #334155; border-radius: 8px; padding: 10px; font-size: 12px; font-family: monospace; margin: 0;" />

          </div>



          <div>

            <label style="display: block; font-size: 11px; font-weight: bold; color: #94a3b8; margin-bottom: 4px;">Remarks / Note (Optional):</label>

            <input id="swal-remark-app" class="swal2-input" placeholder="e.g. Paid via Admin Treasury Wallet" style="width: 100%; box-sizing: border-box; background: #030914; color: #ffffff; border: 1px solid #334155; border-radius: 8px; padding: 10px; font-size: 12px; margin: 0;" />

          </div>

        </div>

      `,

      focusConfirm: false,

      showCancelButton: true,

      confirmButtonText: "Confirm & Mark Paid",

      cancelButtonText: "Cancel",

      background: "#08152c",

      color: "#f8fafc",

      customClass: {

        popup: "!w-[92vw] !max-w-[440px] !p-5 !rounded-3xl border border-cyan-500/30 shadow-2xl",

        title: "!text-base !font-black !text-white !font-mono !m-0 !pb-2",

        confirmButton: "!py-2.5 !px-5 !rounded-xl !font-bold !text-xs !bg-emerald-600 hover:!bg-emerald-500 !text-white cursor-pointer transition shadow-lg shadow-emerald-600/30",

        cancelButton: "!py-2.5 !px-4 !rounded-xl !font-bold !text-xs !bg-slate-800 hover:!bg-slate-700 !text-slate-300 !border !border-slate-700 cursor-pointer transition",

      },

      preConfirm: () => {

        const txHash = document.getElementById("swal-tx-hash-app").value.trim();

        const remark = document.getElementById("swal-remark-app").value.trim();

        return { txHash, remark };

      },

    });



    if (!formValues) return;



    try {

      dispatch(setLoading(true));

      const response = await approveWithdrawal({

        withdrawalId: id,

        id,

        status: "Approved",

        hash: formValues.txHash || `MANUAL_PAY_${Date.now()}`,

        txHash: formValues.txHash || `MANUAL_PAY_${Date.now()}`,

        remark: formValues.remark || `Admin manual payout of $${netPayout.toFixed(2)} to ${wallet}`,

      });



      if (

        response?.success ||

        String(response?.message || "").toLowerCase().includes("success")

      ) {

        toast.success("Withdrawal approved and marked paid successfully!");

        fetchAllWithdrawalHistory(true);

      } else {

        toast.error(response?.message || "Failed to approve withdrawal.");

      }

    } catch (error) {

      console.error("Approve error:", error);

      toast.error(error?.response?.data?.message || error?.message || "Unable to approve withdrawal.");

    } finally {

      dispatch(setLoading(false));

    }

  };



  /* =========================================================

     REJECT & REFUND TO USER BALANCE

  ========================================================= */

  const handleReject = async (row) => {

    const id = row?._id || row?.id;

    if (!id) {

      toast.error("Withdrawal ID is missing");

      return;

    }



    const username = row?.user?.username || row?.username || "Investor";

    const gross = Number(row?.investment || row?.requestedAmount || row?.amount || 0);



    const { value: reason } = await Swal.fire({

      title: "Reject Withdrawal Request?",

      text: `Rejecting will refund $${gross.toFixed(2)} gross amount back to ${username}'s income balance.`,

      input: "text",

      inputPlaceholder: "Enter rejection reason...",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Yes, Reject & Refund",

      cancelButtonText: "Cancel",

      background: "#08152c",

      color: "#f8fafc",

      iconColor: "#f43f5e",

      customClass: {

        popup: "!w-[92vw] !max-w-[420px] !p-5 !rounded-3xl border border-rose-500/30 shadow-2xl",

        title: "!text-base !font-bold !text-white !m-0 !pb-1",

        htmlContainer: "!text-xs !text-slate-300 !mt-2",

        input: "!bg-[#030914] !text-white !border !border-slate-700 !rounded-xl !text-xs !p-2.5",

        confirmButton: "!py-2.5 !px-5 !rounded-xl !font-bold !text-xs !bg-rose-600 hover:!bg-rose-500 !text-white cursor-pointer transition shadow-lg shadow-rose-600/30",

        cancelButton: "!py-2.5 !px-4 !rounded-xl !font-bold !text-xs !bg-slate-800 hover:!bg-slate-700 !text-slate-300 !border !border-slate-700 cursor-pointer transition",

      },

      buttonsStyling: false,

    });



    if (reason === undefined) return;



    try {

      dispatch(setLoading(true));

      const response = await rejectWithdrawal({

        withdrawalId: id,

        id,

        status: "Rejected",

        reason: reason || "Withdrawal cancelled by admin.",

        remark: reason || "Withdrawal cancelled by admin. Amount reverted.",

      });



      if (

        response?.success ||

        String(response?.message || "").toLowerCase().includes("success")

      ) {

        toast.success(`Withdrawal rejected! $${gross.toFixed(2)} refunded to user balance.`);

        fetchAllWithdrawalHistory(true);

      } else {

        toast.error(response?.message || "Failed to reject withdrawal.");

      }

    } catch (error) {

      console.error("Reject error:", error);

      toast.error(error?.response?.data?.message || error?.message || "Unable to reject withdrawal.");

    } finally {

      dispatch(setLoading(false));

    }

  };



  /* =========================================================

     FILTERED LIST

  ========================================================= */

  const filteredData = useMemo(() => {

    if (statusFilter === "all") return allWithdrawalHistory;

    return allWithdrawalHistory.filter((item) => {

      const status = String(item?.status || "Pending").toLowerCase();

      if (statusFilter === "completed") return status === "completed" || status === "approved";

      if (statusFilter === "pending") return status === "pending";

      if (statusFilter === "rejected") return status === "cancelled" || status === "rejected";

      return true;

    });

  }, [allWithdrawalHistory, statusFilter]);



  /* =========================================================

     EXPORT CSV

  ========================================================= */

  const handleExportCSV = () => {

    if (!filteredData.length) {

      toast.info("No records to export");

      return;

    }



    const headers = [

      "#",

      "Payout ID",

      "User ID",

      "Username",

      "Email",

      "Gross Amount ($)",

      "5% Admin Fee ($)",

      "Net Payout ($)",

      "Destination Wallet",

      "Status",

      "Tx Hash",

      "Date",

    ];



    const rows = filteredData.map((item, idx) => {

      const gross = Number(item.investment || item.requestedAmount || item.amount || 0);

      const fee = Number(item.gasFee ?? gross * 0.05);

      const net = Number(item.exchangeAmount ?? item.netAmount ?? (gross - fee));



      return [

        idx + 1,

        item.id || item._id || "",

        item?.user?.id || "",

        item?.user?.username || item?.username || "",

        item?.user?.email || item?.email || "",

        gross.toFixed(2),

        fee.toFixed(2),

        net.toFixed(2),

        item.clientAddress || item?.user?.account || "",

        item.status || "Pending",

        item.hash || "",

        item.createdAt ? new Date(item.createdAt).toLocaleString() : "",

      ];

    });



    const csvContent =

      "data:text/csv;charset=utf-8," +

      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);

    link.setAttribute(

      "download",

      `all_withdrawals_report_${new Date().toISOString().split("T")[0]}.csv`

    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  };



  /* =========================================================

     COMPUTED STATS (5% FEE / 95% NET PAYOUT)

  ========================================================= */

  const computedStats = useMemo(() => {

    const totalGross = allWithdrawalHistory.reduce(

      (acc, curr) => acc + Number(curr.investment || curr.requestedAmount || curr.amount || 0),

      0

    );

    const todayGross = allWithdrawalHistory

      .filter((i) => isToday(new Date(i.createdAt)))

      .reduce((acc, curr) => acc + Number(curr.investment || curr.requestedAmount || curr.amount || 0), 0);



    const completedList = allWithdrawalHistory.filter(

      (i) => String(i.status).toLowerCase() === "completed" || String(i.status).toLowerCase() === "approved"

    );

    const totalPaidNet = completedList.reduce((acc, curr) => {

      const g = Number(curr.investment || curr.requestedAmount || curr.amount || 0);

      const f = Number(curr.gasFee ?? g * 0.05);

      return acc + Number(curr.exchangeAmount ?? curr.netAmount ?? (g - f));

    }, 0);



    const pendingCount = allWithdrawalHistory.filter(

      (i) => !i.status || String(i.status).toLowerCase() === "pending"

    ).length;



    return { totalGross, todayGross, totalPaidNet, pendingCount };

  }, [allWithdrawalHistory]);



  const cardData = [

    {

      title: "Total Gross Withdrawals",

      value: `$${computedStats.totalGross.toLocaleString(undefined, {

        minimumFractionDigits: 2,

        maximumFractionDigits: 2,

      })}`,

      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",

    },

    {

      title: "Today's Withdrawals",

      value: `$${computedStats.todayGross.toLocaleString(undefined, {

        minimumFractionDigits: 2,

        maximumFractionDigits: 2,

      })}`,

      icon: "https://img.icons8.com/isometric/50/economic-improvement--v1.png",

    },

    {

      title: "Total Net Paid Out (95%)",

      value: `$${computedStats.totalPaidNet.toLocaleString(undefined, {

        minimumFractionDigits: 2,

        maximumFractionDigits: 2,

      })}`,

      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",

    },

    {

      title: "Pending Requests In Queue",

      value: `${computedStats.pendingCount} Pending`,

      icon: "https://img.icons8.com/3d-fluency/94/hourglass.png",

    },

  ];



  /* =========================================================

     COLUMNS

  ========================================================= */

  const columns = [

    {

      header: "S/N",

      accessor: "_id",

      cell: (_, rowIndex) => (

        <span className="font-semibold text-slate-500 font-mono">{rowIndex + 1}</span>

      ),

    },

    {

      header: "Payout ID",

      accessor: "id",

      cell: (row) => (

        <div className="flex items-center gap-1 font-mono text-xs text-cyan-300 font-bold">

          <span>{row?.id || row?._id || "WITH-NEW"}</span>

          <button

            onClick={() => handleCopyText(row?.id || row?._id, row?.id || row?._id)}

            className="text-slate-500 hover:text-cyan-300 transition cursor-pointer"

            title="Copy ID"

          >

            {copiedId === (row?.id || row?._id) ? (

              <Check size={12} className="text-emerald-400" />

            ) : (

              <Copy size={12} />

            )}

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

      searchValue: (row) =>

        `${row?.user?.username || ""} ${row?.user?.id || ""} ${row?.user?.email || ""}`,

    },

    {

      header: "Gross ($)",

      accessor: "investment",

      cell: (row) => {

        const gross = Number(row?.investment || row?.requestedAmount || row?.amount || 0);

        return <span className="font-bold text-white text-sm font-mono">${gross.toFixed(2)}</span>;

      },

    },

    {

      header: "5% Admin Fee",

      accessor: "gasFee",

      cell: (row) => {

        const gross = Number(row?.investment || row?.requestedAmount || row?.amount || 0);

        const fee = Number(row?.gasFee ?? (gross * 0.05));

        return <span className="font-semibold text-rose-400 text-xs font-mono">-${fee.toFixed(2)}</span>;

      },

    },

    {

      header: "Net Payout (95%)",

      accessor: "exchangeAmount",

      cell: (row) => {

        const gross = Number(row?.investment || row?.requestedAmount || row?.amount || 0);

        const fee = Number(row?.gasFee ?? (gross * 0.05));

        const net = Number(row?.exchangeAmount ?? row?.netAmount ?? (gross - fee));

        return (

          <div className="space-y-0.5">

            <span className="font-bold text-emerald-400 text-xs sm:text-sm font-mono">

              ${net.toFixed(2)} USDT

            </span>

          </div>

        );

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

              <>

                <button

                  onClick={() => handleCopyText(addr, `addr_${row?._id || row?.id}`)}

                  className="text-slate-500 hover:text-cyan-300 transition cursor-pointer"

                  title="Copy Address"

                >

                  {copiedId === `addr_${row?._id || row?.id}` ? (

                    <Check size={12} className="text-emerald-400" />

                  ) : (

                    <Copy size={12} />

                  )}

                </button>

                <button

                  onClick={() => setQrModalData({ address: addr, username: row?.user?.username || "User" })}

                  className="text-slate-500 hover:text-cyan-300 transition cursor-pointer"

                  title="View QR Code"

                >

                  <QrCode size={12} />

                </button>

              </>

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

        const raw = String(row?.status || "Pending").toLowerCase();

        const isApproved = raw === "completed" || raw === "approved";

        const isPending = raw === "pending";



        return (

          <span

            className={`px-2.5 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1.5 ${

              isApproved

                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"

                : isPending

                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"

                : "bg-rose-500/20 text-rose-400 border-rose-500/30"

            }`}

          >

            {isApproved ? (

              <CheckCircle2 size={12} />

            ) : isPending ? (

              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />

            ) : (

              <XCircle size={12} />

            )}

            {row?.status || "Pending"}

          </span>

        );

      },

      searchValue: (row) => row?.status || "",

    },

    {

      header: "Tx Hash / Remark",

      accessor: "hash",

      cell: (row) => {

        const hash = row?.hash;

        return (

          <div className="font-mono text-[11px] text-slate-300">

            {hash && hash !== "—" ? (

              <div className="flex items-center gap-1 text-cyan-300">

                <span className="truncate max-w-[110px]" title={hash}>

                  {hash.startsWith("0x") ? maskWalletAddress(hash) : hash}

                </span>

                <button

                  onClick={() => handleCopyText(hash, `hash_${row?._id || row?.id}`)}

                  className="text-slate-500 hover:text-cyan-300 transition"

                  title="Copy Hash"

                >

                  {copiedId === `hash_${row?._id || row?.id}` ? (

                    <Check size={12} className="text-emerald-400" />

                  ) : (

                    <Copy size={12} />

                  )}

                </button>

                {hash.startsWith("0x") && (

                  <a

                    href={`https://bscscan.com/tx/${hash}`}

                    target="_blank"

                    rel="noopener noreferrer"

                    className="text-slate-500 hover:text-cyan-300 transition"

                    title="View on BscScan"

                  >

                    <ExternalLink size={12} />

                  </a>

                )}

              </div>

            ) : (

              <span className="text-slate-500 text-xs italic">

                {row?.remark || "—"}

              </span>

            )}

          </div>

        );

      },

    },

    {

      header: "Date & Time",

      accessor: "createdAt",

      cell: (row) => (

        <span className="text-xs text-slate-400">

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

                  title="Pay & Approve"

                >

                  <CheckCircle2 size={12} />

                  Pay

                </button>

                <button

                  onClick={() => handleReject(row)}

                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm shadow-rose-600/30"

                  title="Reject & Refund"

                >

                  <XCircle size={12} />

                  Reject

                </button>

              </>

            )}

          </div>

        );

      },

    },

  ];



  return (

    <div className="p-3 sm:p-5 md:p-6 max-w-[1400px] mx-auto space-y-6 text-slate-100 font-sans">

      {/* 🌟 Top Banner */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#020817] via-[#08152c] to-[#020817] border border-cyan-500/30 p-5 sm:p-7 shadow-[0_0_30px_rgba(0,210,255,0.12)]">

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

          <div className="space-y-1.5">

            <div className="flex items-center gap-2">

              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)]">

                <CheckCircle2 className="w-3.5 h-3.5" /> All Withdrawal Records

              </span>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">

                5% Platform Charge • 95% Net Transfer

              </span>

            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-['Orbitron',sans-serif] tracking-wide">

              Withdrawal History & Auditing Console

            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">

              Complete historical ledger of all member withdrawal requests, manual blockchain transaction hashes, 5% fee deductions, and net payouts.

            </p>

          </div>



          <div className="flex items-center gap-2 shrink-0">

            <button

              onClick={() => fetchAllWithdrawalHistory(true)}

              className="px-4 py-2.5 bg-[#09172f]/90 hover:bg-[#0d2247] text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(0,210,255,0.15)] cursor-pointer"

            >

              <RefreshCw className="w-3.5 h-3.5" />

              <span>Refresh</span>

            </button>

            <button

              onClick={handleExportCSV}

              className="px-4 py-2.5 bg-[#09172f]/90 hover:bg-[#0d2247] text-emerald-300 hover:text-white border border-emerald-500/30 hover:border-emerald-400 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"

            >

              <Download className="w-3.5 h-3.5" />

              <span>Export CSV</span>

            </button>

          </div>

        </div>

      </div>



      {/* 4 Stat Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {cardData.map((item, index) => (

          <StatCard

            key={index}

            index={index}

            title={item.title}

            value={item.value}

            icon={item.icon}

          />

        ))}

      </div>



      {/* Main DataTable with Filter */}

      <div className="rounded-3xl bg-[#08152c]/90 border border-cyan-500/25 p-4 sm:p-6 shadow-xl space-y-4">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">

          <div className="flex items-center gap-2">

            <Filter size={15} className="text-cyan-400" />

            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">

              Filter by Status:

            </span>

          </div>



          <div className="flex flex-wrap items-center gap-1.5">

            {[

              { key: "all", label: "All Requests" },

              { key: "completed", label: "Paid / Completed" },

              { key: "pending", label: "Pending" },

              { key: "rejected", label: "Rejected / Refunded" },

            ].map((f) => (

              <button

                key={f.key}

                onClick={() => setStatusFilter(f.key)}

                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${

                  statusFilter === f.key

                    ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,210,255,0.4)]"

                    : "bg-[#030914] text-slate-400 hover:text-white border border-slate-800"

                }`}

              >

                {f.label}

              </button>

            ))}

          </div>

        </div>



        <DataTable

          columns={columns}

          data={filteredData}

          title="Withdrawal Reports"

          exportable={false}

          searchPlaceholder="Search by ID, username, address, or hash..."

        />

      </div>



      {/* QR Code Modal */}

      {qrModalData && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">

          <div className="bg-[#08152c] border border-cyan-500/30 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">

            <h3 className="text-sm font-bold text-white font-['Orbitron',sans-serif]">

              Wallet QR Code

            </h3>

            <p className="text-xs text-slate-400">

              User: <strong className="text-cyan-300">{qrModalData.username}</strong>

            </p>

            <div className="p-4 bg-white rounded-2xl inline-block mx-auto">

              <QRCodeCanvas value={qrModalData.address} size={180} />

            </div>

            <div className="p-2.5 bg-[#030914] rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 break-all">

              {qrModalData.address}

            </div>

            <div className="flex gap-2 justify-center">

              <button

                onClick={() => handleCopyText(qrModalData.address, "Address")}

                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"

              >

                Copy Address

              </button>

              <button

                onClick={() => setQrModalData(null)}

                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"

              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};



export default ApprovedWithdrawal;

