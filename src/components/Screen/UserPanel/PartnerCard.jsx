import React, { useState } from "react";
import { maskWalletAddress } from "../../../utils/additionalFunc";
import { NumberFormatCommas } from "../../../utils/FormatText";
import moment from "moment";
import {
  Copy,
  Check,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  UserCheck,
  Hash,
  Zap,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";

const StatItem = ({ icon: Icon, label, value, valueColor = "text-white" }) => (
  <div className="flex flex-col bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/70 hover:border-slate-700/80 transition-colors">
    <p className="text-[10px] sm:text-[11px] text-slate-400 mb-0.5 flex items-center gap-1 font-medium">
      {Icon && <Icon size={12} className="text-cyan-400/80 flex-shrink-0" />}
      <span className="truncate">{label}</span>
    </p>
    <div className={`font-bold text-xs truncate ${valueColor}`}>{value}</div>
  </div>
);

const PartnerCard = ({ partner, index }) => {
  const {
    _id,
    id,
    username,
    email,
    mobile,
    account,
    walletAddress,
    investment,
    activeInvestment,
    earnings,
    boosterActive,
    boosterEligibleUntil,
    matrixLevel,
    matrixPosition,
    createdAt,
    active,
    role,
  } = partner || {};

  const [copiedKey, setCopiedKey] = useState(null);

  const finalWallet = account || walletAddress || "";
  const finalInvestment = Number(investment || activeInvestment || 0);
  const totalRoi = Number(earnings?.totalRoi ?? 0);
  const totalWorking = Number(earnings?.totalWorking ?? 0);

  const isActive = Boolean(
    active?.isActive === true ||
    finalInvestment >= 50
  );

  const partnerId = id || _id || "N/A";
  const joinedDate = active?.activeDate || createdAt;

  const copyText = (text, key, label = "Text") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${label}: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="group relative bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between">
      {/* Background ambient glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/15 transition-all" />

      <div className="relative z-10">
        {/* === Header: Avatar + Username + Status Badge === */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={`https://api.dicebear.com/8.x/bottts/svg?seed=${id || username || index}`}
                alt={`Avatar for ${username}`}
                className="w-12 h-12 rounded-full border-2 border-slate-700 group-hover:border-cyan-400 bg-slate-950 transition-all duration-300 shadow-md"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-slate-900 ${
                  isActive ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                }`}
                title={isActive ? "Active Partner ($50+)" : "Inactive Partner (<$50)"}
              />
            </div>
            <div>
              <div className="font-black text-white text-sm sm:text-base flex items-center gap-1.5 flex-wrap">
                <span>{username || "Unnamed Partner"}</span>
                {active?.isVerified && (
                  <ShieldCheck size={14} className="text-cyan-400" title="Verified Member" />
                )}
                {boosterActive && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Zap size={9} /> Booster
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 font-mono">
                <span>{maskWalletAddress(finalWallet) || "No Wallet Connected"}</span>
                {finalWallet && (
                  <button
                    onClick={() => copyText(finalWallet, `wallet-${partnerId}`, "Wallet Address")}
                    className="text-slate-500 hover:text-cyan-300 transition-colors p-0.5 cursor-pointer"
                    title="Copy Full Wallet Address"
                  >
                    {copiedKey === `wallet-${partnerId}` ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wide flex-shrink-0 ${
              isActive
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/20"
                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
            }`}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        {/* === Info Grid (4 Primary Cards) === */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <StatItem
            icon={Hash}
            label="Partner ID"
            value={
              <span className="flex items-center justify-between gap-1 font-mono text-cyan-300">
                <span className="truncate">{partnerId}</span>
                <button
                  onClick={() => copyText(partnerId, `id-${partnerId}`, "Member ID")}
                  className="text-slate-500 hover:text-cyan-300 transition-colors p-0.5 cursor-pointer flex-shrink-0"
                  title="Copy Member ID"
                >
                  {copiedKey === `id-${partnerId}` ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </span>
            }
          />
          <StatItem
            icon={DollarSign}
            label="Investment"
            valueColor={finalInvestment >= 50 ? "text-emerald-400" : "text-slate-400"}
            value={
              <span>
                $<NumberFormatCommas value={finalInvestment} decimalScale={2} />
              </span>
            }
          />
          <StatItem
            icon={TrendingUp}
            label="Total ROI"
            valueColor="text-amber-300"
            value={
              <span>
                $<NumberFormatCommas value={totalRoi} decimalScale={2} />
              </span>
            }
          />
          <StatItem
            icon={Calendar}
            label="Joined Date"
            value={joinedDate ? moment(joinedDate).format("DD MMM YYYY") : "N/A"}
          />
        </div>

        {/* === Secondary Attributes (Matrix + Status) === */}
        <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 px-1">
          <div className="flex items-center gap-1.5 text-slate-400 truncate">
            <Layers size={12} className="text-indigo-400 flex-shrink-0" />
            <span className="truncate">
              Matrix:{" "}
              <strong className="text-slate-200">
                {matrixLevel ? `L${matrixLevel} • Pos ${matrixPosition || 1}` : "Standard"}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 truncate justify-end">
            <UserCheck size={12} className="text-cyan-400 flex-shrink-0" />
            <span className="truncate">
              Status:{" "}
              <strong
                className={
                  active?.isBlocked
                    ? "text-rose-400"
                    : active?.isVerified
                    ? "text-cyan-300"
                    : "text-slate-300"
                }
              >
                {active?.isBlocked ? "Blocked" : active?.isVerified ? "Verified" : "Normal"}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* === Footer Contact / Email / Mobile === */}
      <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400 relative z-10">
        <div className="flex items-center gap-2 truncate">
          {email && (
            <span
              className="flex items-center gap-1 truncate text-slate-400 hover:text-slate-200 transition-colors"
              title={email}
            >
              <Mail size={11} className="text-slate-500 flex-shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[180px]">{email}</span>
            </span>
          )}
          {mobile && (
            <span
              className="hidden sm:flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
              title={mobile}
            >
              <Phone size={11} className="text-slate-500 flex-shrink-0" />
              <span>{mobile}</span>
            </span>
          )}
        </div>
        <span className="text-[10px] text-cyan-500/80 font-mono uppercase font-bold tracking-wider self-end sm:self-auto">
          DIRECT QUALIFIER
        </span>
      </div>
    </div>
  );
};

export default PartnerCard;
