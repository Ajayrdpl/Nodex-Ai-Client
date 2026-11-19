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
    <header className="flex items-center justify-between gap-2 sm:gap-4 py-2.5 sm:py-3 px-3 sm:px-5 border border-[#2b313a] rounded-2xl bg-[#181a20]/95 backdrop-blur-md shadow-xl mb-3 relative z-30">
      {/* Left: Hamburger & Brand / Search */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {!hideSidebar && (
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-[#1e2329] hover:bg-[#2b313a] text-[#f0b90b] border border-[#2b313a] hover:border-[#f0b90b]/40 transition-all cursor-pointer shrink-0"
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
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#f0b90b]/50 shadow-[0_0_8px_rgba(240,185,11,0.3)] shrink-0"
          />
          <span className="text-xs sm:text-sm font-black tracking-wider text-[#eaecef] font-['Orbitron',monospace]">
            NODEX<span className="text-[#f0b90b]">AI</span>
          </span>
        </Link>

        {/* Search on Desktop */}
        <div className="hidden xl:block relative w-52 2xl:w-64">
          <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[#848e9c] text-xs"></i>
          <input
            type="text"
            placeholder="Search coin, pair, tx..."
            className="w-full bg-[#1e2329] border border-[#2b313a] rounded-xl py-2 pl-9 pr-3 text-xs text-[#eaecef] placeholder-[#848e9c] focus:outline-none focus:border-[#f0b90b] transition-colors"
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
          className="hidden md:inline-flex items-center justify-center w-9 h-9 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400 rounded-xl shadow-sm transition-all duration-200 shrink-0"
          title="Join Telegram Community"
        >
          <i className="fa-brands fa-telegram text-lg"></i>
        </a>

        {/* Live Network Status */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#1e2329] rounded-xl px-2.5 py-1.5 border border-[#2b313a] shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#0ecb81] animate-pulse"></div>
          <span className="text-[11px] font-bold text-[#0ecb81] uppercase tracking-wider">Online</span>
        </div>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative shrink-0">
          <button
            ref={profileBtnRef}
            onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-1.5 p-0.5 rounded-full border-2 border-[#f0b90b]/40 hover:border-[#f0b90b] shadow-[0_0_10px_rgba(240,185,11,0.2)] transition-all cursor-pointer shrink-0"
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
            className={`absolute z-50 right-0 top-full mt-2 w-72 sm:w-80 origin-top-right bg-[#181a20] border border-[#2b313a] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] ${
              isProfileMenuOpen
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            } transition-all duration-200 divide-y divide-[#2b313a] overflow-hidden`}
          >
            {/* User Header Info Card */}
            <div className="p-4 bg-[#1e2329]/70">
              <div className="flex items-center justify-between">
                <p className="font-black text-sm text-[#f0b90b] uppercase tracking-wider truncate">
                  {userInfo?.username || (role === "ADMIN" ? "ADMIN CONSOLE" : "NODEXAI Trader")}
                </p>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#f0b90b]/15 text-[#f0b90b] border border-[#f0b90b]/30">
                  {role === "ADMIN" ? "ADMIN" : "TRADER"}
                </span>
              </div>
              <p className="text-xs text-[#eaecef] font-mono mt-1 font-semibold">
                ID: {userInfo?.id || (role === "ADMIN" ? "ADMIN001" : "NDX000001")}
              </p>
              {userInfo?.account && (
                <p className="text-[11px] text-[#848e9c] font-mono mt-0.5 truncate">
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
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#eaecef] hover:bg-[#1e2329] hover:text-[#f0b90b] transition-colors"
                  >
                    <i className="fa-solid fa-gauge-high w-4 text-center text-[#f0b90b]"></i>
                    <span>Admin Overview</span>
                  </Link>
                  <Link
                    to={AuthenticatedAdminRouters.ALL_USERS}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#eaecef] hover:bg-[#1e2329] hover:text-[#0ecb81] transition-colors"
                  >
                    <i className="fa-solid fa-users w-4 text-center text-[#0ecb81]"></i>
                    <span>User Management</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={AuthenticatedUserRouters.PROFILE}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#1e2329] hover:text-[#f0b90b] transition-colors"
                  >
                    <i className="fa-solid fa-user-gear w-4 text-center text-[#f0b90b]"></i>
                    <span>My Profile & Security</span>
                  </Link>
                  <Link
                    to={AuthenticatedUserRouters.DASHBOARD}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-[#1e2329] hover:text-[#0ecb81] transition-colors"
                  >
                    <i className="fa-solid fa-gauge-high w-4 text-center text-[#0ecb81]"></i>
                    <span>My Dashboard</span>
                  </Link>
                </>
              )}
            </div>

            {/* Dropdown Action Buttons */}
            <div className="p-3 space-y-2 bg-[#12161c]/60">
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  logoutHandler();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-[#f6465d] hover:text-white border border-red-500/40 hover:border-red-500/70 shadow-[0_0_12px_rgba(246,70,93,0.2)] font-bold text-xs tracking-wider transition-all cursor-pointer"
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
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl shrink-0 cursor-pointer transition-all duration-200 font-bold text-xs bg-red-500/15 hover:bg-red-500/25 text-[#f6465d] hover:text-white border border-red-500/40 hover:border-red-500/70 shadow-[0_0_10px_rgba(246,70,93,0.15)] hover:shadow-[0_0_15px_rgba(246,70,93,0.3)]"
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
