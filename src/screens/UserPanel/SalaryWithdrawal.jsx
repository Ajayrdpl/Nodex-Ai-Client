import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Wallet, DollarSign, ArrowDownLeft, AlertCircle, CheckCircle, Copy, Clock, ShieldCheck } from "lucide-react";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getSalaryWithdrawalBalance, submitSalaryWithdrawal, getSalaryWithdrawalHistory } from "../../api/user.api";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";

const ADMIN_CHARGE_PERCENT = 10;
const MIN_WITHDRAWAL = 10;

const SalaryWithdrawal = () => {
  const dispatch = useDispatch();
  const walletAddress = useSelector((state) => state?.isLoggedUser?.data?.account);

  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(1);

  const fetchBalance = async () => {
    try {
      const res = await getSalaryWithdrawalBalance();
      if (res?.success) setBalance(res.data);
      else toast.error(res?.message || "Failed to fetch balance");
    } catch { toast.error("Failed to fetch balance"); }
  };

  const fetchHistory = async (p = 1) => {
    try {
      dispatch(setLoading(true));
      const res = await getSalaryWithdrawalHistory({ page: p, limit: 10 });
      if (res?.success) {
        setHistory(Array.isArray(res.data) ? res.data : res.data?.history || res.data?.withdrawals || []);
        if (res.data?.pagination) setPagination(res.data.pagination);
      } else toast.error(res?.message || "Failed to fetch history");
    } catch { toast.error("Failed to fetch history"); }
    finally { dispatch(setLoading(false)); }
  };

  useEffect(() => {
    fetchBalance();
    fetchHistory(1);
  }, []);

  const availableBalance = Number(balance?.balance ?? balance?.availableBalance ?? 0);
  const numAmount = Number(amount);
  const adminCharge = numAmount > 0 ? (numAmount * ADMIN_CHARGE_PERCENT) / 100 : 0;
  const netAmount = numAmount - adminCharge;
  const isValid = numAmount >= MIN_WITHDRAWAL && numAmount <= availableBalance;

  const handleSubmit = async () => {
    if (numAmount < MIN_WITHDRAWAL) { toast.error(`Minimum withdrawal is $${MIN_WITHDRAWAL}`); return; }
    if (numAmount > availableBalance) { toast.error("Amount exceeds available balance"); return; }
    if (!walletAddress) { toast.error("Wallet address not found"); return; }
    try {
      dispatch(setLoading(true));
      const res = await submitSalaryWithdrawal({ amount: numAmount, walletAddress });
      if (res?.success) {
        toast.success(res.message || "Withdrawal request submitted successfully");
        setAmount("");
        fetchBalance();
        fetchHistory(1);
      } else toast.error(res?.message || "Withdrawal failed");
    } catch { toast.error("Withdrawal request failed"); }
    finally { dispatch(setLoading(false)); }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt = (v) => Number(v ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cards = [
    {
      title: "Available Balance",
      value: `$ ${fmt(balance?.balance ?? balance?.availableBalance)}`,
      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",
    },
    {
      title: "Total Withdrawn",
      value: `$ ${fmt(balance?.totalWithdrawn)}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-bag.png",
    },
    {
      title: "Pending Withdrawals",
      value: `$ ${fmt(balance?.pendingAmount)}`,
      icon: "https://img.icons8.com/3d-fluency/94/clock.png",
    },
    {
      title: "Total Salary Earned",
      value: `$ ${fmt(balance?.totalEarned ?? balance?.totalSalary)}`,
      icon: "https://img.icons8.com/3d-fluency/94/bar-chart.png",
    },
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
      header: "Amount",
      accessor: "amount",
      cell: (row) => <span className="font-semibold text-white">$ {fmt(row?.amount)}</span>,
    },
    {
      header: "Charge (10%)",
      accessor: "charge",
      cell: (row) => <span className="text-orange-400">- $ {fmt(row?.charge ?? row?.adminCharge ?? (row?.amount * 0.1))}</span>,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => <StatCard key={c.title} title={c.title} value={c.value} iconImage={c.icon} />)}
      </div>

      {/* Cooldown / Eligibility Banner */}
      {/* {balance?.cooldown && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
          <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-semibold text-sm">Cooldown Active</p>
            <p className="text-yellow-300/70 text-xs mt-0.5">{balance.cooldown}</p>
          </div>
        </div>
      )} */}


      {balance?.cooldown && (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
        <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />

        <div>
            <p className="text-yellow-400 font-semibold text-sm">
                Cooldown Active
            </p>

            <p className="text-yellow-300/70 text-xs mt-0.5">
                {typeof balance.cooldown === "string"
                    ? balance.cooldown
                    : balance.cooldown.message ||
                      JSON.stringify(balance.cooldown)}
            </p>
        </div>
    </div>
)}

      {/* Withdrawal Form */}
      <div className="max-w-2xl mx-auto">
        <div
          className="relative rounded-3xl p-8 overflow-hidden"
          style={{ background: "#0a1628", border: "1px solid rgba(165,208,251,0.2)", boxShadow: "0 8px 40px rgba(165,208,251,0.08)" }}
        >
          {/* Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(165,208,251,0.06) 0%, transparent 70%)" }} />

          {/* Header */}
          <div className="relative flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl" style={{ background: "rgba(165,208,251,0.12)", border: "1px solid rgba(165,208,251,0.25)" }}>
              <ArrowDownLeft className="w-7 h-7" style={{ color: "#A5D0FB" }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Salary Withdrawal</h2>
              <p className="text-slate-400 text-sm mt-0.5">Withdraw your salary income securely</p>
            </div>
          </div>

          {/* Notice */}
          <div className="relative mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-300 text-sm">
                Minimum withdrawal: <strong>${MIN_WITHDRAWAL}</strong> · Admin charge: <strong>{ADMIN_CHARGE_PERCENT}%</strong> deducted
              </p>
            </div>
          </div>

          <div className="relative space-y-5">
            {/* Balance Row */}
            <div className="flex justify-between items-center px-1">
              <span className="text-slate-400 text-sm">Available Balance</span>
              <span className="font-bold text-lg" style={{ color: "#A5D0FB" }}>$ {fmt(availableBalance)}</span>
            </div>

            {/* Amount Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                <DollarSign className="w-4 h-4" style={{ color: "#A5D0FB" }} />
                Withdrawal Amount (USDT)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min $${MIN_WITHDRAWAL}`}
                min="0"
                onKeyDown={(e) => ["ArrowUp", "ArrowDown", "e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                onWheel={(e) => e.target.blur()}
                className="w-full rounded-xl py-4 px-5 text-white text-lg font-semibold focus:outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(165,208,251,0.2)" }}
              />
              {amount && numAmount > availableBalance && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Amount exceeds available balance
                </p>
              )}
            </div>

            {/* Wallet Address */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
                <Wallet className="w-4 h-4 text-cyan-400" />
                Destination Wallet
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={walletAddress || ""}
                  disabled
                  className="w-full rounded-xl py-4 px-5 pr-12 text-slate-300 text-sm font-mono"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(165,208,251,0.1)" }}
                />
                <button onClick={copyAddress} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-colors">
                  {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Summary */}
            {isValid && (
              <div className="p-5 rounded-xl border border-green-500/20 bg-green-500/5">
                <p className="text-white font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Withdrawal Summary
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Requested Amount</span>
                    <span className="text-white font-semibold">$ {fmt(numAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-300">Admin Charge ({ADMIN_CHARGE_PERCENT}%)</span>
                    <span className="text-orange-400 font-semibold">- $ {fmt(adminCharge)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 mt-1">
                    <span className="text-slate-300 font-semibold">You Receive</span>
                    <span className="text-green-400 font-bold text-base">$ {fmt(netAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={isValid ? {
                background: "linear-gradient(135deg, #A5D0FB, #CFC6FF)",
                color: "#000",
                boxShadow: "0 4px 20px rgba(165,208,251,0.3)"
              } : { background: "rgba(255,255,255,0.05)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <span className="flex items-center justify-center gap-2">
                <ArrowDownLeft className="w-5 h-5" />
                {!amount ? "Enter Amount" : numAmount < MIN_WITHDRAWAL ? `Min $${MIN_WITHDRAWAL} Required` : numAmount > availableBalance ? "Insufficient Balance" : `Withdraw $ ${fmt(numAmount)}`}
              </span>
            </button>

            {/* Security Note */}
            <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <ShieldCheck className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-500 text-xs">Withdrawals are processed within 24 hours. Ensure your wallet address is correct before submitting.</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <DataTable
        title="Salary Withdrawal History"
        columns={columns}
        data={history}
        pageSize={10}
      />
    </div>
  );
};

export default SalaryWithdrawal;
