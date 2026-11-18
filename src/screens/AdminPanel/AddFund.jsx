import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";
import { toast } from "react-toastify";
import { AddUserFund, getAllUsersList, getPackageInfoAdmin } from "../../api/admin.api";
import { maskWalletAddress } from "../../utils/additionalFunc";
import { NODEXAI_PACKAGES } from "../UserPanel/InvestmentPage";
import {
  DollarSign,
  User,
  Search,
  FileText,
  Send,
  CheckCircle2,
  X,
  ChevronDown,
  Wallet,
  Rocket,
  ShieldCheck,
  UserCheck,
  Star,
  Gem,
  Shield,
  Crown,
  Flame,
  Infinity as InfinityIcon,
  Layers,
  Award,
  Check,
  AlertCircle,
} from "lucide-react";

const getBadgeIcon = (title) => {
  const t = (title || "").toUpperCase();
  if (t === "NOVA") return <Star className="w-4 h-4 text-amber-400 fill-amber-400" />;
  if (t === "VANTAGE") return <Gem className="w-4 h-4 text-sky-300" />;
  if (t === "NEXUS") return <Shield className="w-4 h-4 text-cyan-400 fill-cyan-400/40" />;
  if (t === "PRIME") return <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />;
  if (t === "TITAN") return <Flame className="w-4 h-4 text-orange-400 fill-orange-500" />;
  return <InfinityIcon className="w-4 h-4 text-purple-300" />;
};

const getPackageTheme = (title) => {
  const t = (title || "").toUpperCase();
  if (t === "NOVA") {
    return {
      border: "border-amber-500/40",
      activeBg: "bg-gradient-to-br from-amber-500/15 via-[#061833] to-[#020817]",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      accent: "text-amber-400",
      glow: "shadow-[0_0_25px_rgba(245,158,11,0.2)]",
    };
  }
  if (t === "VANTAGE") {
    return {
      border: "border-sky-400/40",
      activeBg: "bg-gradient-to-br from-sky-500/15 via-[#061833] to-[#020817]",
      badgeBg: "bg-sky-500/20 text-sky-300 border-sky-400/40",
      accent: "text-sky-300",
      glow: "shadow-[0_0_25px_rgba(56,189,248,0.2)]",
    };
  }
  if (t === "NEXUS") {
    return {
      border: "border-blue-500/40",
      activeBg: "bg-gradient-to-br from-blue-500/15 via-[#061833] to-[#020817]",
      badgeBg: "bg-blue-500/20 text-blue-300 border-blue-400/40",
      accent: "text-blue-400",
      glow: "shadow-[0_0_25px_rgba(59,130,246,0.25)]",
    };
  }
  if (t === "PRIME") {
    return {
      border: "border-yellow-400/40",
      activeBg: "bg-gradient-to-br from-yellow-500/15 via-[#061833] to-[#020817]",
      badgeBg: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
      accent: "text-yellow-400",
      glow: "shadow-[0_0_25px_rgba(234,179,8,0.25)]",
    };
  }
  if (t === "TITAN") {
    return {
      border: "border-orange-500/40",
      activeBg: "bg-gradient-to-br from-orange-500/15 via-[#061833] to-[#020817]",
      badgeBg: "bg-orange-500/20 text-orange-300 border-orange-400/40",
      accent: "text-orange-400",
      glow: "shadow-[0_0_25px_rgba(249,115,22,0.25)]",
    };
  }
  // INFINITY
  return {
    border: "border-purple-500/40",
    activeBg: "bg-gradient-to-br from-purple-500/15 via-[#061833] to-[#020817]",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    accent: "text-purple-400",
    glow: "shadow-[0_0_25px_rgba(168,85,247,0.25)]",
  };
};

const AddFund = () => {
  const dispatch = useDispatch();

  // Form states
  const [amount, setAmount] = useState("10");
  const [amountError, setAmountError] = useState("");
  const [username, setUsername] = useState("");
  const [remark, setRemark] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(NODEXAI_PACKAGES[0]); // default NOVA
  const [packagesList, setPackagesList] = useState(NODEXAI_PACKAGES);

  // Searchable User Dropdown states
  const [usersList, setUsersList] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Package Dropdown state
  const [isPackageDropdownOpen, setIsPackageDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const packageDropdownRef = useRef(null);

  // Fetch all users & packages on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsUsersLoading(true);
        const [usersRes, pkgRes] = await Promise.all([
          getAllUsersList(),
          getPackageInfoAdmin().catch(() => null),
        ]);

        const list = Array.isArray(usersRes?.data?.users)
          ? usersRes.data.users
          : Array.isArray(usersRes?.data?.history)
            ? usersRes.data.history
            : Array.isArray(usersRes?.data)
              ? usersRes.data
              : [];
        setUsersList(list);

        // Merge DB packages if available
        const rawPackages = pkgRes?.data || pkgRes?.packages;
        if (Array.isArray(rawPackages) && rawPackages.length > 0) {
          const merged = NODEXAI_PACKAGES.map((vPkg) => {
            const dbMatch = rawPackages.find(
              (p) =>
                (p.title && p.title.toUpperCase() === vPkg.title) ||
                p.id === vPkg.id ||
                p.minAmount === vPkg.min
            );
            if (dbMatch) {
              return {
                ...vPkg,
                _id: dbMatch._id || vPkg._id,
                id: dbMatch.id || dbMatch._id || vPkg.id,
              };
            }
            return vPkg;
          });
          setPackagesList(merged);
        }
      } catch (err) {
        console.error("Failed to load initial data for AddFund:", err);
      } finally {
        setIsUsersLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (packageDropdownRef.current && !packageDropdownRef.current.contains(e.target)) {
        setIsPackageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users based on search query
  const filteredUsers = usersList.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const uName = (u?.username || "").toLowerCase();
    const uId = (u?.id || u?._id || "").toLowerCase();
    const uAccount = (u?.account || "").toLowerCase();
    const uEmail = (u?.email || "").toLowerCase();
    const uMobile = (u?.mobile || "").toLowerCase();

    return (
      uName.includes(q) ||
      uId.includes(q) ||
      uAccount.includes(q) ||
      uEmail.includes(q) ||
      uMobile.includes(q)
    );
  });

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUsername(user?.username || user?.account || user?.id || "");
    setSearchQuery(user?.username || user?.account || "");
    setIsDropdownOpen(false);
  };

  const handleClearSelectedUser = () => {
    setSelectedUser(null);
    setUsername("");
    setSearchQuery("");
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setUsername(val);
    setSelectedUser(null);
    if (!isDropdownOpen) setIsDropdownOpen(true);
  };

  // When package is selected from dropdown
  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    const numAmt = Number(amount) || 0;
    // If current amount is outside package bounds, set to package minimum
    if (numAmt < pkg.min || numAmt > pkg.max) {
      setAmount(String(pkg.min));
    }
    setAmountError("");
    setIsPackageDropdownOpen(false);
  };

  // Restrict amount input strictly within selected package range
  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setAmount("");
      setAmountError(`Minimum amount is $${selectedPackage?.min?.toLocaleString() || 10}`);
      return;
    }

    const num = Number(val);
    if (isNaN(num)) return;

    // Restriction: Cannot exceed selected package maximum
    if (selectedPackage?.max && num > selectedPackage.max) {
      setAmount(String(selectedPackage.max));
      setAmountError(`Maximum limit for ${selectedPackage.title} is $${selectedPackage.max.toLocaleString()}`);
      return;
    }

    // Check if below package minimum
    if (selectedPackage?.min && num < selectedPackage.min) {
      setAmount(val);
      setAmountError(`Amount must be between $${selectedPackage.min.toLocaleString()} and $${selectedPackage.max.toLocaleString()}`);
      return;
    }

    setAmount(val);
    setAmountError("");
  };

  // Blur validation: auto-correct to package bounds if out-of-range
  const handleAmountBlur = () => {
    const num = Number(amount) || 0;
    if (!selectedPackage) return;

    if (num < selectedPackage.min) {
      setAmount(String(selectedPackage.min));
      setAmountError("");
      toast.info(`Amount adjusted to minimum $${selectedPackage.min.toLocaleString()} for ${selectedPackage.title}`);
    } else if (selectedPackage.max && num > selectedPackage.max) {
      setAmount(String(selectedPackage.max));
      setAmountError("");
    } else {
      setAmountError("");
    }
  };

  const handleAddUserFund = async (e) => {
    if (e) e.preventDefault();

    const identifier = username.trim() || searchQuery.trim();
    if (!identifier) {
      toast.error("Please search and select a user or enter User ID / Username");
      return;
    }

    const numberAmount = Number(amount);
    if (!amount || numberAmount <= 0) {
      toast.error("Fund Amount must be greater than 0");
      return;
    }

    if (selectedPackage) {
      if (numberAmount < selectedPackage.min) {
        setAmountError(`Minimum amount for ${selectedPackage.title} is $${selectedPackage.min.toLocaleString()}`);
        toast.error(`Minimum amount for ${selectedPackage.title} is $${selectedPackage.min.toLocaleString()}`);
        setAmount(String(selectedPackage.min));
        return;
      }
      if (selectedPackage.max && numberAmount > selectedPackage.max) {
        setAmountError(`Maximum amount for ${selectedPackage.title} is $${selectedPackage.max.toLocaleString()}`);
        toast.error(`Maximum amount for ${selectedPackage.title} is $${selectedPackage.max.toLocaleString()}`);
        setAmount(String(selectedPackage.max));
        return;
      }
    }

    dispatch(setLoading(true));

    try {
      const res = await AddUserFund({
        username: identifier,
        amount: numberAmount,
        packageId: selectedPackage?.id || selectedPackage?._id,
        packageTitle: selectedPackage?.title,
        dailyRoi: selectedPackage?.dailyRoi,
        remark: remark.trim() || undefined,
      });

      if (res?.success) {
        toast.success(
          res?.message ||
          `Successfully invested $${numberAmount} in ${selectedPackage?.title || "Package"} for user ${identifier}!`
        );
        setAmount(String(selectedPackage?.min || 10));
        setUsername("");
        setSearchQuery("");
        setSelectedUser(null);
        setRemark("");
      } else {
        toast.error(res?.message || "Failed to add fund");
      }
    } catch (error) {
      console.error("Error adding fund:", error);
      toast.error(error?.response?.data?.message || error?.message || "Server Error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const dailyRoi = selectedPackage?.dailyRoi || 4.5;
  const thirtyDaysRoi = selectedPackage?.thirtyDaysRoi || (dailyRoi * 30);
  const numberAmount = Number(amount) || 0;
  const dailyEarning = ((numberAmount * dailyRoi) / 100).toFixed(2);
  const thirtyDayEarning = ((numberAmount * thirtyDaysRoi) / 100).toFixed(2);
  const maxRoiCap = (numberAmount * 2.2).toFixed(2);
  const selectedTheme = getPackageTheme(selectedPackage?.title);

  // Dynamic presets for selected package
  const presets = selectedPackage?.presetAmounts || [
    selectedPackage?.min || 10,
    selectedPackage?.max || 200,
  ];

  return (
    <div className="max-w-3xl mx-auto mt-6 pb-16 text-white">
      <div className="bg-[#030d1d] border border-cyan-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Background Ambience Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 relative z-10 border-b border-cyan-500/15 pb-5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,210,255,0.35)] shrink-0">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                NODEXAI Admin Console
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide font-['Orbitron',monospace]">
              Admin Package Investment / Add Fund
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Select user & package tier. Saves package link in database & activates 220% Max ROI Cap.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddUserFund} className="space-y-6 relative z-10">
          {/* ═══════════ 1. SEARCHABLE USER DROPDOWN ═══════════ */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-cyan-400" />
                Select Target User <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {usersList.length > 0 ? `${usersList.length} users registered` : "Loading users..."}
              </span>
            </div>

            {/* Input with Search Icon and Dropdown Arrow */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search by Username, User ID, Wallet (0x...), or Email"
                className="w-full bg-[#020817] border border-cyan-500/30 rounded-xl py-3.5 pl-10 pr-10 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition font-mono shadow-inner placeholder-slate-500"
                autoComplete="off"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSelectedUser}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-1 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Floating Dropdown Results Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto rounded-2xl bg-[#030d1d] border border-cyan-500/35 shadow-[0_10px_35px_rgba(0,0,0,0.9)] backdrop-blur-2xl divide-y divide-cyan-500/10">
                {isUsersLoading ? (
                  <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>Loading registered users...</span>
                  </div>
                ) : (
                  <>
                    <div className="sticky top-0 z-20 px-3.5 py-2 bg-[#020b18]/95 backdrop-blur-md border-b border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                      <span>Users Found: <strong className="text-white">{filteredUsers.length}</strong></span>
                      <span>Total in DB: <strong className="text-white">{usersList.length}</strong></span>
                    </div>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => {
                    const isSelected =
                      selectedUser?._id === u._id ||
                      username.toLowerCase() === (u?.username || "").toLowerCase();
                    return (
                      <div
                        key={u._id || u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all ${isSelected
                          ? "bg-cyan-500/20 text-cyan-200 border-l-4 border-cyan-400"
                          : "hover:bg-cyan-950/40 text-slate-200"
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                            {(u.username || "U")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white truncate">
                                {u.username || "Anonymous"}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-white/5">
                                ID: {u.id || u._id?.slice(-6)}
                              </span>
                              {u.active?.isActive ? (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                                  Active
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 text-[10px]">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                              {u.account ? maskWalletAddress(u.account) : u.email || "No wallet"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-slate-400 font-mono uppercase">Total Inv.</p>
                          <p className="text-xs font-black text-amber-300 font-mono">
                            ${Number(u.investment || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                      })
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No users found matching &quot;{searchQuery}&quot;
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Selected User Info Card Preview */}
            {selectedUser && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">
                        {selectedUser.username}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                        ID: {selectedUser.id || selectedUser._id?.slice(-6)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-cyan-400" />
                      <span>{selectedUser.account ? maskWalletAddress(selectedUser.account) : "No wallet linked"}</span>
                      {selectedUser.email && (
                        <span className="text-slate-500 ml-1">• {selectedUser.email}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Current Balance</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">
                    ${Number(selectedUser.investment || 0).toLocaleString()} USDT
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ═══════════ 2. PACKAGE SELECTION DROPDOWN (ONLY TITLE IN DROPDOWN) ═══════════ */}
          <div className="space-y-3" ref={packageDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                Select Investment Package <span className="text-rose-400">*</span>
              </label>
            </div>

            {/* Dropdown Selector Trigger: Shows Selected Package Title */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPackageDropdownOpen(!isPackageDropdownOpen)}
                className="w-full bg-[#020817] border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl py-3.5 px-4 text-left flex items-center justify-between gap-3 transition cursor-pointer shadow-inner group"
              >
                <span className="font-extrabold text-white text-sm sm:text-base font-['Orbitron',monospace] tracking-wider">
                  {selectedPackage?.title || "Select Package"}
                </span>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-transform duration-200 ${isPackageDropdownOpen ? "rotate-180 text-cyan-400" : ""
                    }`}
                />
              </button>

              {/* Floating Package Options Menu: ONLY TITLES */}
              {isPackageDropdownOpen && (
                <div className="absolute left-0 right-0 z-40 mt-1.5 rounded-xl bg-[#030d1d] border border-cyan-500/40 shadow-[0_15px_45px_rgba(0,0,0,0.95)] backdrop-blur-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  {packagesList.map((pkg) => {
                    const isSelected = selectedPackage?.title === pkg.title;
                    return (
                      <div
                        key={pkg.title}
                        onClick={() => handlePackageSelect(pkg)}
                        className={`px-4 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${isSelected
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold"
                          : "hover:bg-slate-800/80 text-slate-200 border border-transparent"
                          }`}
                      >
                        <span className="font-extrabold text-sm sm:text-base font-['Orbitron',monospace] tracking-wider">
                          {pkg.title}
                        </span>

                        {isSelected && (
                          <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ONLY SELECTED PACKAGE SHOWN AFTER SELECTION */}
            {selectedPackage && (
              <div
                className={`p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden backdrop-blur-xl ${selectedTheme.activeBg} ${selectedTheme.border} ${selectedTheme.glow} animate-in fade-in duration-200`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#020817] border border-white/15 flex items-center justify-center shadow-lg shrink-0">
                      {getBadgeIcon(selectedPackage.title)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-white font-['Orbitron',monospace] tracking-wider">
                          {selectedPackage.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Package Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3.5 font-mono">
                  <div className="bg-[#020817]/80 rounded-xl p-2.5 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Investment Range</span>
                    <span className="text-xs sm:text-sm font-black text-white">
                      ${selectedPackage.min?.toLocaleString()} – ${selectedPackage.max?.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#020817]/80 rounded-xl p-2.5 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Daily ROI</span>
                    <span className="text-xs sm:text-sm font-black text-cyan-300">
                      {selectedPackage.dailyRoi}% / day
                    </span>
                  </div>

                  <div className="bg-[#020817]/80 rounded-xl p-2.5 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">
                      {selectedPackage.title === "INFINITY" ? "ROI Yield" : "30 Days ROI"}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-amber-300">
                      {selectedPackage.title === "INFINITY"
                        ? "220% Max"
                        : `${selectedPackage.thirtyDaysRoi}%`}
                    </span>
                  </div>

                  <div className="bg-[#020817]/80 rounded-xl p-2.5 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Max ROI Cap</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-400">
                      220%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═══════════ 3. DEPOSIT AMOUNT INPUT ═══════════ */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Investment Amount (USDT BEP-20) <span className="text-rose-400">*</span>
              </label>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400 font-mono">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                min={selectedPackage?.min || 10}
                max={selectedPackage?.max || 25000}
                placeholder={`Enter amount between $${selectedPackage?.min?.toLocaleString()} and $${selectedPackage?.max?.toLocaleString()}`}
                className={`w-full bg-[#020817] border rounded-xl py-3.5 pl-10 pr-4 text-white text-lg font-bold font-mono focus:outline-none transition shadow-inner placeholder-slate-500 ${
                  amountError
                    ? "border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                    : "border-cyan-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                }`}
                onKeyDown={(e) =>
                  ["ArrowUp", "ArrowDown", "e", "E", "+", "-"].includes(e.key) &&
                  e.preventDefault()
                }
                onWheel={(e) => e.target.blur()}
                required
              />
            </div>

            {/* Real-time Inline Range Error Warning */}
            {amountError && (
              <p className="text-xs text-rose-400 font-mono flex items-center gap-1.5 pt-0.5 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{amountError}</span>
              </p>
            )}

            {/* Quick Preset Buttons for Selected Package */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-mono">Presets:</span>
              {presets.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => {
                    setAmount(String(val));
                    setAmountError("");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer border ${numberAmount === val
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,210,255,0.3)]"
                    : "bg-[#020817] text-slate-300 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-slate-800"
                    }`}
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* ═══════════ 4. REMARK / NOTE ═══════════ */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-400" />
              Remark / Note (Optional)
            </label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Bank wire deposit verified / VIP upgrade / Special package assignment"
              className="w-full bg-[#020817] border border-cyan-500/30 rounded-xl py-3.5 px-4 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition placeholder-slate-500"
            />
          </div>

          {/* ═══════════ 5. LIVE CAPPING & EARNINGS CALCULATION ═══════════ */}
          {numberAmount > 0 && (
            <div className="p-4 rounded-2xl bg-[#020817]/95 border border-cyan-500/30 text-xs text-slate-300 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex justify-between items-center pb-2 border-b border-cyan-500/15">
                <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                  <Award className="w-4 h-4 text-amber-400" /> Package to Assign:
                </span>
                <span className="font-extrabold text-amber-300 font-['Orbitron',monospace] text-sm">
                  {selectedPackage?.title} (${numberAmount.toLocaleString()} USDT)
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Daily Trading ROI ({dailyRoi}% / day):</span>
                <span className="font-bold text-cyan-300 font-mono text-sm">
                  +${dailyEarning} / day
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>
                  {selectedPackage?.title === "INFINITY" ? "Maximum ROI Yield:" : `30 Days Estimated Yield (${thirtyDaysRoi}%):`}
                </span>
                <span className="font-bold text-amber-300 font-mono text-sm">
                  +${thirtyDayEarning} USDT
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-emerald-400" /> Maximum ROI Cap (220%):
                </span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  +${maxRoiCap} USDT
                </span>
              </div>

              {numberAmount >= 500 && (
                <div className="pt-2 border-t border-cyan-500/15 flex items-center gap-1.5 text-amber-300 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>VIP Unlocked: All 10 Levels Community Income Automatically Activated!</span>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ 6. SUBMIT BUTTON ═══════════ */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:brightness-110 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,210,255,0.35)] flex items-center justify-center gap-2 cursor-pointer font-['Orbitron',monospace] active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>
              Invest ${numberAmount > 0 ? numberAmount.toLocaleString() : "0.00"} in {selectedPackage?.title || "Package"} for User
            </span>
          </button>

          <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Assigns package ID in DB, links transaction, activates daily ROI cron & capping</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AddFund;
