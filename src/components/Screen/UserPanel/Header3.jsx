/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { maskWalletAddress } from "../../../utils/additionalFunc";
import {
  AuthenticatedAdminRouters,
  AuthenticatedUserRouters,
  LandingRouters,
} from "../../../constants/routes";
import { logoutUser } from "../../../redux/slices/authSlice";

const Header3 = ({ onMenuClick, hideSidebar = false }) => {
  const userInfo = useSelector((state) => state?.userInfo?.userInfo);
  const role = useSelector((state) => state?.isLoggedUser?.role);
  //   const [isDarkMode, setIsDarkMode] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // 1. State aur refs mobile dropdown ke liye
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const profileBtnRef = useRef(null);

  // 2. useEffect bahar click karne par dropdown ko band karne ke liye
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logoutHandler = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logoutUser());
        toast.success("Logged out successfully");
        navigate(LandingRouters.USER_LOGIN);
      }
    });
  };

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-4 py-2.5 sm:py-3 px-3 sm:px-5 border border-cyan-500/20 rounded-2xl bg-[#060d1a]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,210,255,0.06)] mb-3 relative z-30">
      {/* Left: Hamburger & Brand / Search */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {!hideSidebar && (
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#08152c] hover:bg-[#0c1f40] text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shrink-0"
            aria-label="Open Sidebar Menu"
          >
            <i className="fa-solid fa-bars text-sm sm:text-base"></i>
          </button>
        )}

        {/* Brand Tag - NODEXAI */}
        <Link
          to={role === "ADMIN" ? AuthenticatedAdminRouters.ADMIN_DASHBOARD : AuthenticatedUserRouters.DASHBOARD}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
        >
          <img
            src="/NodexAI.jpeg"
            alt="NODEXAI"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-cyan-400/50 shadow-[0_0_10px_rgba(0,210,255,0.3)] shrink-0"
          />
          <span className="text-xs sm:text-sm font-black tracking-wider bg-gradient-to-r from-cyan-400 via-white to-amber-300 bg-clip-text text-transparent font-['Orbitron',sans-serif]">
            NODEXAI
          </span>
        </Link>

        {/* Search on Desktop */}
        <div className="hidden xl:block relative w-52 2xl:w-64">
          <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400/70 text-xs"></i>
          <input
            type="text"
            placeholder="Search coin, pair, tx..."
            className="w-full bg-[#08152c]/90 border border-cyan-500/20 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions, Profile & Logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Telegram Community (Desktop) */}
        <a
          href="https://t.me/safepalalt"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center justify-center w-9 h-9 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 rounded-xl shadow-sm transition-all duration-200 shrink-0"
          title="Join Telegram Community"
        >
          <i className="fa-brands fa-telegram text-lg"></i>
        </a>

        {/* Live Network Status */}
        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/40 rounded-xl px-2.5 py-1.5 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)] shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#0ecb81] animate-pulse"></div>
          <span className="text-[11px] font-bold text-[#0ecb81] uppercase tracking-wider font-mono">Online</span>
        </div>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative shrink-0">
          <button
            ref={profileBtnRef}
            onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-1.5 p-0.5 rounded-full border-2 border-cyan-400/60 hover:border-amber-400 shadow-[0_0_12px_rgba(0,210,255,0.3)] transition-all cursor-pointer shrink-0"
            title="User Profile Menu"
          >
            <img
              src={
                userInfo?.picture ||
                "https://api.dicebear.com/8.x/lorelei/svg?seed=Lanre"
              }
              alt="User Avatar"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
            />
          </button>

          {/* User Profile Dropdown Menu */}
          <div
            ref={profileMenuRef}
            className={`absolute z-50 right-0 top-full mt-2 w-72 sm:w-80 origin-top-right bg-[#060d1a]/98 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(0,210,255,0.1)] ${
              isProfileMenuOpen
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            } transition-all duration-200 divide-y divide-cyan-500/20 overflow-hidden`}
          >
            {/* User Header Info Card */}
            <div className="p-4 bg-gradient-to-r from-[#08152c] to-[#040c1a] border-b border-cyan-500/20">
              <div className="flex items-center justify-between">
                <p className="font-black text-sm text-amber-300 uppercase tracking-wider truncate font-['Orbitron',sans-serif]">
                  {userInfo?.username || (role === "ADMIN" ? "ADMIN CONSOLE" : "NODEXAI Trader")}
                </p>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 font-mono">
                  {role === "ADMIN" ? "ADMIN" : "TRADER"}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-mono mt-1 font-semibold">
                ID: {userInfo?.id || (role === "ADMIN" ? "ADMIN001" : "NDX000001")}
              </p>
              {userInfo?.account && (
                <p className="text-[11px] text-cyan-300/80 font-mono mt-0.5 truncate">
                  {maskWalletAddress(userInfo?.account)}
                </p>
              )}
            </div>

            {/* Quick Links */}
            <div className="p-2 space-y-1">
              {role === "ADMIN" ? (
                <>
                  <Link
                    to={AuthenticatedAdminRouters.ADMIN_DASHBOARD}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#0a1e3f]/60 hover:text-amber-300 transition-colors"
                  >
                    <i className="fa-solid fa-gauge-high w-4 text-center text-amber-400"></i>
                    <span>Admin Overview</span>
                  </Link>
                  <Link
                    to={AuthenticatedAdminRouters.ALL_USERS}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#0a1e3f]/60 hover:text-cyan-300 transition-colors"
                  >
                    <i className="fa-solid fa-users w-4 text-center text-cyan-400"></i>
                    <span>User Management</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={AuthenticatedUserRouters.PROFILE}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#0a1e3f]/60 hover:text-amber-300 transition-colors"
                  >
                    <i className="fa-solid fa-user-gear w-4 text-center text-amber-400"></i>
                    <span>My Profile & Security</span>
                  </Link>
                  <Link
                    to={AuthenticatedUserRouters.DASHBOARD}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#0a1e3f]/60 hover:text-cyan-300 transition-colors"
                  >
                    <i className="fa-solid fa-gauge-high w-4 text-center text-cyan-400"></i>
                    <span>My Dashboard</span>
                  </Link>
                </>
              )}
            </div>

            {/* Dropdown Action Buttons */}
            <div className="p-3 space-y-2 bg-[#040914]/90">
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  logoutHandler();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500/20 to-red-600/20 hover:from-rose-500/30 hover:to-red-600/30 text-rose-300 hover:text-white border border-rose-500/40 hover:border-rose-500/70 shadow-[0_0_12px_rgba(246,70,93,0.2)] font-bold text-xs tracking-wider transition-all cursor-pointer"
              >
                <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
                <span>LOGOUT FROM ACCOUNT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Standalone Header Logout Button */}
        <button
          onClick={logoutHandler}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl shrink-0 cursor-pointer transition-all duration-200 font-bold text-xs bg-gradient-to-r from-rose-500/15 to-red-600/25 hover:from-rose-500/30 hover:to-red-600/40 text-rose-300 hover:text-white border border-rose-500/40 hover:border-rose-400 shadow-[0_0_10px_rgba(246,70,93,0.15)] hover:shadow-[0_0_15px_rgba(246,70,93,0.3)]"
          title="Logout from Account"
        >
          <i className="fa-solid fa-arrow-right-from-bracket text-xs sm:text-sm"></i>
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header3;
