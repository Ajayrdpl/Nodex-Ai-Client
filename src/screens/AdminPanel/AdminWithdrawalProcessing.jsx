// src/screens/AdminPanel/AdminWithdrawalProcessing.jsx
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AdminService } from "../../api/services.api";

const AdminWithdrawalProcessing = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({ totalGross: 0, totalExchangePayout: 0, totalP2PWalletCredit: 0 });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Pending"); // "Pending" | "Completed" | "Cancelled" | "All"
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [selectedTx, setSelectedTx] = useState(null);
  const [actionType, setActionType] = useState(null); // "APPROVE" | "REJECT"
  const [txHash, setTxHash] = useState("");
  const [actionRemark, setActionRemark] = useState("");

  const loadWithdrawalData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminService.getWithdrawals({
        status: statusFilter === "All" ? undefined : statusFilter,
      });

      if (res?.success || res?.withdrawals || res?.data) {
        const d = res?.data || res;
        const list = Array.isArray(d?.withdrawals) ? d.withdrawals : Array.isArray(d?.history) ? d.history : Array.isArray(d) ? d : [];
        setWithdrawals(list);
        if (d?.stats) setStats(d.stats);
      }
    } catch (err) {
      toast.error("Failed to load withdrawal requests");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadWithdrawalData();
  }, [loadWithdrawalData]);

  // Handle Approve / Reject Submit
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTx) return;

    try {
      if (actionType === "APPROVE") {
        if (!txHash.trim()) {
          toast.warning("Please enter the blockchain transfer transaction hash");
          return;
        }

        const res = await AdminService.approveWithdrawal({
          id: selectedTx._id || selectedTx.id,
          status: "Completed",
          hash: txHash.trim(),
          remark: actionRemark.trim() || `Transferred $${Number(selectedTx.exchangeAmount || 0).toFixed(2)} to user wallet`,
        });

        if (res?.success || String(res?.message || "").toLowerCase().includes("success")) {
          toast.success("Withdrawal approved & blockchain hash recorded!");
          closeModal();
          loadWithdrawalData();
        } else {
          toast.error(res?.message || "Approval failed");
        }
      } else if (actionType === "REJECT") {
        if (!actionRemark.trim()) {
          toast.warning("Please enter rejection reason");
          return;
        }

        const res = await AdminService.rejectWithdrawal({
          id: selectedTx._id || selectedTx.id,
          status: "Cancelled",
          remark: actionRemark.trim(),
        });

        if (res?.success || String(res?.message || "").toLowerCase().includes("success")) {
          toast.success("Withdrawal cancelled & user balance reverted!");
          closeModal();
          loadWithdrawalData();
        } else {
          toast.error(res?.message || "Rejection failed");
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to process withdrawal");
    }
  };

  const openApproveModal = (tx) => {
    setSelectedTx(tx);
    setActionType("APPROVE");
    setTxHash("");
    setActionRemark(`Transferred $${Number(tx.exchangeAmount || tx.investment * 0.45 || 0).toFixed(2)} USDT`);
  };

  const openRejectModal = (tx) => {
    setSelectedTx(tx);
    setActionType("REJECT");
    setTxHash("");
    setActionRemark("");
  };

  const closeModal = () => {
    setSelectedTx(null);
    setActionType(null);
    setTxHash("");
    setActionRemark("");
  };

  const filteredList = withdrawals.filter((w) => {
    const userStr = w?.user?.username || w?.username || "";
    const addr = w?.clientAddress || w?.walletAddress || "";
    const id = w?.id || w?.customId || w?._id || "";
    return (
      userStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* 🚀 Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Admin Finance</span>
          <h1 className="text-2xl md:text-3xl font-black mt-1">Withdrawal Requests & Payout Processing</h1>
          <p className="text-slate-400 text-sm mt-1">
            50% Exchange Crypto Payouts Verification & Instant P2P Settlement Logs.
          </p>
        </div>

        <button
          onClick={loadWithdrawalData}
          disabled={loading}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* 📊 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Gross Requested</span>
          <h3 className="text-2xl font-black text-white mt-1">${Number(stats.totalGross || 0).toFixed(2)}</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-blue-400 uppercase font-semibold">50% Exchange Crypto Payout</span>
          <h3 className="text-2xl font-black text-blue-400 mt-1">${Number(stats.totalExchangePayout || 0).toFixed(2)}</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-emerald-400 uppercase font-semibold">50% P2P Wallet Credited</span>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">${Number(stats.totalP2PWalletCredit || 0).toFixed(2)}</h3>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex gap-2">
          {["Pending", "Completed", "Cancelled", "All"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                statusFilter === s ? "bg-indigo-600 text-white shadow" : "bg-slate-900 text-slate-400 border border-slate-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by user, address or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-xs sm:text-sm w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                <th className="p-3.5">Tx ID</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Gross ($)</th>
                <th className="p-3.5">10% Fee</th>
                <th className="p-3.5">50% Crypto Transfer</th>
                <th className="p-3.5">50% P2P Credit</th>
                <th className="p-3.5">Wallet Destination</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? (
                filteredList.map((item, idx) => {
                  const gross = Number(item.investment || item.amount || 0);
                  const fee = Number(item.gasFee || item.adminFee || gross * 0.10);
                  const crypto = Number(item.exchangeAmount || (gross - fee) * 0.50);
                  const p2p = Number(item.p2pAmount || (gross - fee) * 0.50);

                  return (
                    <tr key={item._id || idx} className="border-b border-slate-800 hover:bg-slate-800/30 text-xs sm:text-sm">
                      <td className="p-3.5 font-mono text-indigo-400 font-semibold">{item.id || item.customId || `WITH-${idx + 1}`}</td>
                      <td className="p-3.5 font-bold text-white">{item?.user?.username || item?.username || "Investor"}</td>
                      <td className="p-3.5 text-white font-bold">${gross.toFixed(2)}</td>
                      <td className="p-3.5 text-rose-400">-${fee.toFixed(2)}</td>
                      <td className="p-3.5 text-blue-300 font-bold">${crypto.toFixed(2)}</td>
                      <td className="p-3.5 text-emerald-400 font-bold">${p2p.toFixed(2)}</td>
                      <td className="p-3.5 font-mono text-xs text-slate-400 truncate max-w-[140px]">{item.clientAddress || item.walletAddress || "—"}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            item.status === "Completed" || item.status === "Approved"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : item.status === "Pending"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {item.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {item.status === "Pending" ? (
                          <>
                            <button
                              onClick={() => openApproveModal(item)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectModal(item)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow transition"
                            >
                              Reject
                            </button>
                          </>
                        ) : item.hash ? (
                          <span className="text-[11px] font-mono text-slate-400 truncate block max-w-[100px]">
                            {item.hash.substring(0, 8)}...
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-500 text-sm">
                    No withdrawal records matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔍 Processing Modal */}
      {selectedTx && actionType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                {actionType === "APPROVE" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                {actionType === "APPROVE" ? "Approve & Complete Payout" : "Reject & Refund Withdrawal"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">User:</span>
                <strong className="text-white">{selectedTx?.user?.username || selectedTx?.username}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">50% Crypto Transfer Amount:</span>
                <strong className="text-blue-300 font-bold">
                  ${Number(selectedTx.exchangeAmount || selectedTx.investment * 0.45 || 0).toFixed(2)} USDT
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination Address:</span>
                <span className="font-mono text-slate-300 text-[11px] truncate max-w-[250px]">
                  {selectedTx.clientAddress || selectedTx.walletAddress}
                </span>
              </div>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3.5">
              {actionType === "APPROVE" && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Blockchain Transaction Hash (TxID)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0x... or Tron Tx Hash"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {actionType === "APPROVE" ? "Admin Note / Remark" : "Rejection Reason (Returned to User)"}
                </label>
                <input
                  type="text"
                  required={actionType === "REJECT"}
                  placeholder={actionType === "APPROVE" ? "e.g. Transferred via Binance / Tron" : "e.g. Invalid wallet address"}
                  value={actionRemark}
                  onChange={(e) => setActionRemark(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-1/2 py-2.5 rounded-xl text-sm font-bold shadow-lg ${
                    actionType === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  Confirm {actionType === "APPROVE" ? "Approval" : "Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawalProcessing;
