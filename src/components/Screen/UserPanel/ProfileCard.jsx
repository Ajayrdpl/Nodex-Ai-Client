import { useState } from "react";
import { useSelector } from "react-redux";
import {
  maskEmailAddress,
  maskWalletAddress,
  shareReferralCode,
} from "../../../utils/additionalFunc";
import { toast } from "react-toastify";
import { MdOutlineShare } from "react-icons/md";
import { TbCopyCheck, TbCopy } from "react-icons/tb";

const ProfileCard = ({ user: propUser }) => {
  const reduxUser = useSelector((state) => state?.isLoggedUser?.data);
  const user = propUser || reduxUser || {};

  const [copiedText1, setCopiedText1] = useState(false);
  const location = window.location.origin;
  const userRefId = user?.id || user?.username || reduxUser?.id || reduxUser?.username || "";
  const referCode = `${location}/register?referral=${encodeURIComponent(userRefId)}`;
  const handleCopy = (text, setCopiedState) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedState(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopiedState(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="card hero-glass mt-10 border border-slate-800 rounded-3xl p-6 flex flex-col items-center h-full bg-slate-900/60 shadow-xl backdrop-blur-md">
      <img
        src={
          user?.picture || "https://api.dicebear.com/8.x/lorelei/svg?seed=NodexAiTrader"
        }
        alt="User Avatar"
        className="w-24 h-24 rounded-full border-4 border-cyan-500/50 -mt-16 shadow-xl shadow-cyan-500/20 bg-slate-950 object-cover"
      />
      <h3 className="text-xl font-black text-white mt-4 font-mono">{user?.id || "VLT000001"}</h3>
      <h4 className="text-base font-bold text-cyan-400 mb-1 capitalize">
        {user?.username || "NODEXAI Trader"}
      </h4>
      <p className="text-xs text-slate-400">Personal Trader Account</p>

      <hr className="w-full border-slate-800 my-4" />

      <div className="w-full space-y-3 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Sponsored By:</span>
          <span className="font-mono font-bold text-white uppercase">
            {user?.sponsor?.id || user?.referral || "Direct System"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Email:</span>
          <span className="font-mono font-semibold text-slate-200">
            {user?.email ? maskEmailAddress(user.email) : "N/A"}
          </span>
        </div>
        {user?.mobile && (
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Mobile:</span>
            <span className="font-mono font-semibold text-slate-200">
              {user.mobile}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Wallet Address:</span>
          <span className="font-mono font-semibold text-cyan-300">
            {user?.account ? maskWalletAddress(user.account) : "Not Connected"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Account Status:</span>
          <span className="font-bold px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            Active Trader
          </span>
        </div>
      </div>

      <hr className="w-full border-slate-800 my-4" />

      {/* Referral Link - Highlighted */}
      <div className="w-full rounded-2xl border-2 border-green-500/70 bg-green-500/10 p-4 shadow-lg shadow-green-500/30 animate-pulse-glow">
        <div className="flex items-center gap-2 mb-3">
          <i className="fa-solid fa-arrow-trend-up text-green-400"></i>
          <p className="text-sm font-bold text-green-400">Your Referral Link</p>
        </div>
        <div className="relative w-full flex gap-2">
          <input
            type="text"
            readOnly
            value={referCode || "N/A"}
            disabled
            className="w-full bg-green-500/10 border border-green-500/30 rounded-xl py-3 px-4 text-green-300 text-sm font-bold font-mono pointer-events-none tracking-wide"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(referCode, setCopiedText1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/40 transition-colors duration-200 border border-green-500/40"
            >
              {copiedText1 ? <TbCopyCheck size={18} /> : <TbCopy size={18} />}
            </button>
            <button
              onClick={() => shareReferralCode(referCode)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/40 transition-colors duration-200 border border-green-500/40"
            >
              <MdOutlineShare size={18} />
            </button>
          </div>
        </div>
        <p className="text-xs text-green-500/70 mt-2 text-center">
          Share this link to earn referral income
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;