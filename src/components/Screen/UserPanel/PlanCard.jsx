import React from "react";
import {
  Star,
  Gem,
  Shield,
  Crown,
  Flame,
  Infinity as InfinityIcon,
  Coins,
  TrendingUp,
  Calendar,
  Trophy,
  CheckCircle2,
  Zap,
} from "lucide-react";

const getBadgeIcon = (title, iconType) => {
  const t = (title || "").toUpperCase();
  if (t === "NOVA" || iconType === "star") {
    return (
      <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-b from-amber-300 via-amber-500 to-yellow-600 shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center justify-center">
        <div className="w-full h-full rounded-full bg-[#030d1d] flex items-center justify-center border border-amber-300/40">
          <Star className="w-7 h-7 text-amber-300 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
        </div>
      </div>
    );
  }
  if (t === "VANTAGE" || iconType === "diamond") {
    return (
      <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-b from-sky-200 via-sky-400 to-blue-600 shadow-[0_0_20px_rgba(56,189,248,0.6)] flex items-center justify-center">
        <div className="w-full h-full rounded-full bg-[#030d1d] flex items-center justify-center border border-sky-300/40">
          <Gem className="w-7 h-7 text-sky-200 fill-sky-300/30 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
        </div>
      </div>
    );
  }
  if (t === "NEXUS" || iconType === "gem") {
    return (
      <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-b from-cyan-300 via-blue-500 to-indigo-600 shadow-[0_0_25px_rgba(0,210,255,0.7)] flex items-center justify-center">
        <div className="w-full h-full rounded-full bg-[#030d1d] flex items-center justify-center border border-cyan-300/50">
          <Shield className="w-7 h-7 text-cyan-300 fill-cyan-400/40 drop-shadow-[0_0_10px_rgba(0,210,255,0.9)]" />
        </div>
      </div>
    );
  }
  if (t === "PRIME" || iconType === "crown") {
    return (
      <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-b from-amber-200 via-yellow-500 to-amber-700 shadow-[0_0_25px_rgba(234,179,8,0.7)] flex items-center justify-center">
        <div className="w-full h-full rounded-full bg-[#030d1d] flex items-center justify-center border border-amber-300/50">
          <Crown className="w-7 h-7 text-amber-300 fill-amber-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.9)]" />
        </div>
      </div>
    );
  }
  if (t === "TITAN" || iconType === "flame") {
    return (
      <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-b from-amber-400 via-orange-500 to-red-600 shadow-[0_0_25px_rgba(249,115,22,0.7)] flex items-center justify-center">
        <div className="w-full h-full rounded-full bg-[#030d1d] flex items-center justify-center border border-orange-400/50">
          <Flame className="w-7 h-7 text-orange-400 fill-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.9)]" />
        </div>
      </div>
    );
  }
  // Default to INFINITY / purple
  return (
    <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-b from-purple-300 via-fuchsia-500 to-indigo-700 shadow-[0_0_30px_rgba(168,85,247,0.8)] flex items-center justify-center">
      <div className="w-full h-full rounded-full bg-[#030d1d] flex items-center justify-center border border-purple-300/50">
        <InfinityIcon className="w-7 h-7 text-purple-200 drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]" />
      </div>
    </div>
  );
};

const PlanCard = ({ plan, onSelect, isAdmin = false }) => {
  const inActive = plan?.status === false;
  const title = (plan?.title || "Plan").toUpperCase();

  const minAmt = Number(plan?.minAmount || plan?.min || 0);
  const maxAmt =
    plan?.maxAmount === Infinity || plan?.max === Infinity
      ? null
      : Number(plan?.maxAmount || plan?.max || 0);

  const dailyRoi = plan?.dailyRoi || plan?.percentage || 4.5;
  const thirtyDaysRoi = plan?.thirtyDaysRoi || plan?.monthlyRoi || (dailyRoi * 30);
  const isInfinity = title === "INFINITY";

  // Tier-based theme styling
  let cardBorder = "border-cyan-500/30 hover:border-cyan-400/70";
  let glowEffect = "shadow-[0_0_30px_rgba(0,210,255,0.15)] hover:shadow-[0_0_35px_rgba(0,210,255,0.3)]";
  let btnGradient = "from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white";

  if (title === "NOVA") {
    cardBorder = "border-amber-400/40 hover:border-amber-400/80";
    glowEffect = "shadow-[0_0_30px_rgba(245,158,11,0.18)] hover:shadow-[0_0_35px_rgba(245,158,11,0.35)]";
    btnGradient = "from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black";
  } else if (title === "VANTAGE") {
    cardBorder = "border-sky-400/40 hover:border-sky-400/80";
    glowEffect = "shadow-[0_0_30px_rgba(56,189,248,0.18)] hover:shadow-[0_0_35px_rgba(56,189,248,0.35)]";
    btnGradient = "from-sky-500 via-cyan-400 to-blue-600 text-slate-950 font-black";
  } else if (title === "NEXUS") {
    cardBorder = "border-cyan-400/50 hover:border-cyan-300";
    glowEffect = "shadow-[0_0_30px_rgba(0,210,255,0.22)] hover:shadow-[0_0_40px_rgba(0,210,255,0.4)]";
    btnGradient = "from-cyan-400 via-blue-600 to-cyan-500 text-white font-black";
  } else if (title === "PRIME") {
    cardBorder = "border-amber-400/50 hover:border-yellow-300";
    glowEffect = "shadow-[0_0_30px_rgba(234,179,8,0.25)] hover:shadow-[0_0_40px_rgba(234,179,8,0.45)]";
    btnGradient = "from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black";
  } else if (title === "TITAN") {
    cardBorder = "border-orange-500/50 hover:border-orange-400";
    glowEffect = "shadow-[0_0_30px_rgba(249,115,22,0.25)] hover:shadow-[0_0_40px_rgba(249,115,22,0.45)]";
    btnGradient = "from-orange-500 via-amber-500 to-red-600 text-white font-black";
  } else if (title === "INFINITY") {
    cardBorder = "border-purple-500/60 hover:border-fuchsia-400";
    glowEffect = "shadow-[0_0_35px_rgba(168,85,247,0.3)] hover:shadow-[0_0_45px_rgba(168,85,247,0.55)]";
    btnGradient = "from-purple-500 via-fuchsia-500 to-indigo-600 text-white font-black";
  }

  return (
    <div
      className={`
        group relative flex flex-col rounded-3xl transition-all duration-500 hover:-translate-y-2
        bg-gradient-to-b from-[#061226]/90 via-[#030d1d]/95 to-[#020817]
        border-2 ${cardBorder} ${glowEffect}
        p-6 sm:p-7 backdrop-blur-xl overflow-hidden
        ${inActive ? "opacity-60 grayscale" : ""}
      `}
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="flex flex-col items-center justify-center mb-4">
        {getBadgeIcon(title, plan?.iconType)}
        <h3 className="text-2xl font-black text-white uppercase tracking-wider mt-3 font-['Orbitron',monospace]">
          {title}
        </h3>
        {plan?.badgeText && (
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mt-0.5">
            {plan.badgeText}
          </span>
        )}
      </div>

      {/* Stats Table matching Image */}
      <div className="space-y-3.5 my-3 bg-[#020714]/75 p-4 rounded-2xl border border-white/5">
        {/* Row 1: Investment Range */}
        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Investment</span>
          </div>
          <div className="text-right">
            <span className="text-base sm:text-lg font-black text-white font-mono">
              ${minAmt.toLocaleString()} – {maxAmt ? `$${maxAmt.toLocaleString()}` : "Above"}
            </span>
          </div>
        </div>

        {/* Row 2: Daily ROI */}
        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
            <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Daily ROI</span>
          </div>
          <div className="text-right">
            <span className="text-lg sm:text-xl font-black text-cyan-300 font-mono drop-shadow-[0_0_8px_rgba(0,210,255,0.4)]">
              {dailyRoi}%
            </span>
          </div>
        </div>

        {/* Row 3: 30 Days ROI / Maximum ROI */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
            {isInfinity ? (
              <Trophy className="w-4 h-4 text-purple-400 shrink-0" />
            ) : (
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{isInfinity ? "Maximum ROI" : "30 Days ROI"}</span>
          </div>
          <div className="text-right">
            <span className="text-lg sm:text-xl font-black text-amber-300 font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
              {isInfinity ? "220%" : `${thirtyDaysRoi}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Feature Bullets */}
      <div className="space-y-2 mb-6 flex-grow text-xs pt-2">
        <div className="flex items-center gap-2 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Maximum ROI Cap: <strong className="text-emerald-300 font-mono">220%</strong></span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            {minAmt >= 500 ? (
              <strong className="text-amber-300">All 10 Levels Auto-Unlocked</strong>
            ) : (
              <span>Eligible for 10-Level Community Income</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Principal withdrawal: 0% fee after 30 days</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => onSelect(plan)}
        disabled={inActive}
        className={`
          w-full py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg
          bg-gradient-to-r ${btnGradient} hover:brightness-110 active:scale-98
          ${inActive ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <Zap className="w-4 h-4" />
        <span>{isAdmin ? "Edit Package" : `Invest in ${title}`}</span>
      </button>
    </div>
  );
};

export default PlanCard;
