import React, { useCallback, useEffect, useState, useMemo } from "react";

import { useDispatch } from "react-redux";

import { toast } from "react-toastify";

import Swal from "sweetalert2";

import { setLoading } from "../../redux/slices/loadingSlice";

import DataTable from "../../components/Screen/UserPanel/DataTable";

import StatCard from "../../components/Screen/UserPanel/StatCard";

import {

  approveWithdrawal,

  getAllWithdrawalRequestss,

  rejectWithdrawal,

  getIncomeTotalForAdmin,

} from "../../api/admin.api";

import {

  RefreshCw,

  Download,

  ShieldCheck,

  CheckCircle2,

  XCircle,

  Copy,

  Check,

  DollarSign,

  Clock,

  ExternalLink,

  QrCode,

} from "lucide-react";

import { QRCodeCanvas } from "qrcode.react";

import { maskWalletAddress } from "../../utils/additionalFunc";



const WithdrawalRequest = () => {

  const dispatch = useDispatch();

  const [allWithdrawalRequests, setAllWithdrawalRequests] = useState([]);

  const [backendStats, setBackendStats] = useState({

    totalGross: 0,

    totalExchangePayout: 0,

    totalP2PWalletCredit: 0,

  });

  const [incomeSummary, setIncomeSummary] = useState(null);

  const [copiedAddress, setCopiedAddress] = useState(null);

  const [qrModalData, setQrModalData] = useState(null);



  /* =========================================================

     FETCH WITHDRAWALS & STATS

  ========================================================= */

  const fetchAllWithdrawalRequests = useCallback(

    async (isManual = false) => {

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



          // Filter strictly for Pending requests

          const pendingOnly = rawList.filter(

            (item) =>

              !item?.status || String(item?.status).toLowerCase() === "pending"

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



        if (isManual) toast.success("Pending withdrawals refreshed!");

      } catch (error) {

        console.error("fetchAllWithdrawalRequests Error:", error);

        toast.error("Failed to load withdrawal requests");

        setAllWithdrawalRequests([]);

      } finally {

        if (!isManual) dispatch(setLoading(false));

      }

    },

    [dispatch]

  );



  useEffect(() => {

    fetchAllWithdrawalRequests();

  }, [fetchAllWithdrawalRequests]);



  /* =========================================================

     COPY WALLET ADDRESS

  ========================================================= */

  const handleCopy = (address, label = "Wallet address") => {

    if (!address) return;

    navigator.clipboard.writeText(address);

    setCopiedAddress(address);

    toast.success(`${label} copied to clipboard!`);

    setTimeout(() => setCopiedAddress(null), 2000);

  };



  /* =========================================================

     APPROVE & MARK MANUAL PAYMENT (WITH TX HASH INPUT)

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

            <input id="swal-tx-hash" class="swal2-input" placeholder="0x... (from BscScan or wallet ref)" style="width: 100%; box-sizing: border-box; background: #030914; color: #ffffff; border: 1px solid #334155; border-radius: 8px; padding: 10px; font-size: 12px; font-family: monospace; margin: 0;" />

          </div>



          <div>

            <label style="display: block; font-size: 11px; font-weight: bold; color: #94a3b8; margin-bottom: 4px;">Remarks / Note (Optional):</label>

            <input id="swal-remark" class="swal2-input" placeholder="e.g. Paid via Admin Treasury Wallet" style="width: 100%; box-sizing: border-box; background: #030914; color: #ffffff; border: 1px solid #334155; border-radius: 8px; padding: 10px; font-size: 12px; margin: 0;" />

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

        const txHash = document.getElementById("swal-tx-hash").value.trim();

        const remark = document.getElementById("swal-remark").value.trim();

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

        toast.success(response?.message || "Withdrawal approved and marked paid successfully!");

        setAllWithdrawalRequests((prev) =>

          prev.filter((item) => (item?._id || item?.id) !== id)

        );

      } else {

        toast.error(response?.message || "Failed to approve withdrawal.");

      }

    } catch (error) {

      console.error("Approve error:", error);

      toast.error(

        error?.response?.data?.message ||

          error?.message ||

          "Unable to approve withdrawal."

      );

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

      text: `Rejecting this request will automatically refund the full gross amount ($${gross.toFixed(

        2

      )}) back to ${username}'s income balance.`,

      input: "text",

      inputPlaceholder: "Enter rejection reason (e.g. Invalid address)...",

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



    if (reason === undefined) return; // user cancelled



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

        toast.success(

          `Withdrawal rejected! $${gross.toFixed(2)} refunded to user balance.`

        );

        setAllWithdrawalRequests((prev) =>

          prev.filter((item) => (item?._id || item?.id) !== id)

        );

      } else {

        toast.error(response?.message || "Failed to reject withdrawal.");

      }

    } catch (error) {

      console.error("Reject error:", error);

      toast.error(

        error?.response?.data?.message ||

          error?.message ||

          "Unable to reject withdrawal."

      );

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

      "Date",

    ];



    const rows = allWithdrawalRequests.map((item, idx) => {

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

      `pending_withdrawals_${new Date().toISOString().split("T")[0]}.csv`

    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  };



  /* =========================================================

     COMPUTED STATS (5% FEE / 95% NET PAYOUT)

  ========================================================= */

  const computedStats = useMemo(() => {

    const totalGross = allWithdrawalRequests.reduce(

      (acc, curr) => acc + Number(curr.investment || curr.requestedAmount || curr.amount || 0),

      0

    );

    const totalFee = totalGross * 0.05;

    const totalNet = totalGross - totalFee;



    return {

      count: allWithdrawalRequests.length,

      totalGross,

      totalFee,

      totalNet,

    };

  }, [allWithdrawalRequests]);



  const cardData = [

    {

      title: "Pending Requests Count",

      value: `${computedStats.count} Requests`,

      icon: "https://img.icons8.com/3d-fluency/94/hourglass.png",

    },

    {

      title: "Total Gross Requested",

      value: `$${Number(computedStats.totalGross).toLocaleString(undefined, {

        minimumFractionDigits: 2,

        maximumFractionDigits: 2,

      })}`,

      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",

    },

    {

      title: "5% Admin Fee Revenue",

      value: `$${Number(computedStats.totalFee).toLocaleString(undefined, {

        minimumFractionDigits: 2,

        maximumFractionDigits: 2,

      })}`,

      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",

    },

    {

      title: "95% Total Net Payable",

      value: `$${Number(computedStats.totalNet).toLocaleString(undefined, {

        minimumFractionDigits: 2,

        maximumFractionDigits: 2,

      })}`,

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

        <span className="font-semibold text-slate-500 font-mono">{rowIndex + 1}</span>

      ),

    },

    {

      header: "Payout ID",

      accessor: "id",

      cell: (row) => (

        <span className="font-mono text-xs font-bold text-cyan-300">

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

      searchValue: (row) =>

        `${row?.user?.username || ""} ${row?.user?.id || ""} ${row?.user?.email || ""}`,

    },

    {

      header: "Gross Amount",

      accessor: "investment",

      cell: (row) => {

        const gross = Number(row?.investment || row?.requestedAmount || row?.amount || 0);

        return (

          <span className="font-bold text-white text-sm font-mono">

            ${gross.toFixed(2)}

          </span>

        );

      },

    },

    {

      header: "5% Admin Fee",

      accessor: "gasFee",

      cell: (row) => {

        const gross = Number(row?.investment || row?.requestedAmount || row?.amount || 0);

        const fee = Number(row?.gasFee ?? (gross * 0.05));

        return (

          <span className="font-semibold text-rose-400 text-xs font-mono">

            -${fee.toFixed(2)}

          </span>

        );

      },

    },

    {

      header: "Net Payable (95%)",

      accessor: "exchangeAmount",

      cell: (row) => {

        const gross = Number(row?.investment || row?.requestedAmount || row?.amount || 0);

        const fee = Number(row?.gasFee ?? (gross * 0.05));

        const net = Number(row?.exchangeAmount ?? row?.netAmount ?? (gross - fee));

        return (

          <div className="space-y-0.5">

            <span className="font-black text-emerald-400 text-sm font-mono">

              ${net.toFixed(2)} USDT

            </span>

            <div className="text-[10px] text-slate-400 font-semibold uppercase">

              Manual Transfer

            </div>

          </div>

        );

      },

    },

    {

      header: "Receiving Wallet",

      accessor: "clientAddress",

      cell: (row) => {

        const addr =

          row?.clientAddress || row?.user?.account || row?.walletAddress || "";

        return (

          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">

            <span className="truncate max-w-[120px]" title={addr}>

              {addr ? maskWalletAddress(addr) : "—"}

            </span>

            {addr && (

              <>

                <button

                  onClick={() => handleCopy(addr, "Address")}

                  className="text-slate-500 hover:text-cyan-300 transition"

                  title="Copy Address"

                >

                  {copiedAddress === addr ? (

                    <Check size={13} className="text-emerald-400" />

                  ) : (

                    <Copy size={13} />

                  )}

                </button>

                <button

                  onClick={() => setQrModalData({ address: addr, username: row?.user?.username || "User" })}

                  className="text-slate-500 hover:text-cyan-300 transition"

                  title="View QR Code"

                >

                  <QrCode size={13} />

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

      cell: (row) => (

        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1.5">

          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />

          {row?.status || "Pending"}

        </span>

      ),

      searchValue: (row) => row?.status || "Pending",

    },

    {

      header: "Requested Date",

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

      cell: (row) => (

        <div className="flex items-center gap-2">

          <button

            type="button"

            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-1"

            onClick={() => handleApprove(row)}

            title="Mark as Paid & Approve"

          >

            <CheckCircle2 size={13} />

            Pay & Approve

          </button>

          <button

            type="button"

            className="px-2.5 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-500 transition shadow-lg shadow-rose-600/20 cursor-pointer flex items-center gap-1"

            onClick={() => handleReject(row)}

            title="Reject and Refund to User Balance"

          >

            <XCircle size={13} />

            Reject

          </button>

        </div>

      ),

    },

  ];



  return (

    <div className="p-3 sm:p-5 md:p-6 max-w-[1400px] mx-auto space-y-6 text-slate-100 font-sans">

      {/* 🌟 Header Banner */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#020817] via-[#08152c] to-[#020817] border border-cyan-500/30 p-5 sm:p-7 shadow-[0_0_30px_rgba(0,210,255,0.12)]">

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

          <div className="space-y-1.5">

            <div className="flex items-center gap-2">

              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.25)]">

                <Clock className="w-3.5 h-3.5" /> Pending Queue

              </span>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">

                5% Admin Fee • 95% Net Transfer

              </span>

            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-['Orbitron',sans-serif] tracking-wide">

              Withdrawal Manual Approval Console

            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">

              Review pending withdrawal requests. Send the <strong className="text-emerald-400">95% Net Payable</strong> amount manually to the user's BEP-20 wallet, then enter the Tx Hash to mark paid. Rejected requests automatically refund the gross amount.

            </p>

          </div>



          <div className="flex items-center gap-2 shrink-0">

            <button

              onClick={() => fetchAllWithdrawalRequests(true)}

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



      {/* Main DataTable */}

      <div className="rounded-3xl bg-[#08152c]/90 border border-cyan-500/25 p-4 sm:p-6 shadow-xl">

        <DataTable

          columns={columns}

          data={allWithdrawalRequests}

          title="Pending Withdrawal Requests"

          exportable={false}

          searchPlaceholder="Search by ID, username, address..."

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

                onClick={() => handleCopy(qrModalData.address, "Address")}

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



export default WithdrawalRequest;

