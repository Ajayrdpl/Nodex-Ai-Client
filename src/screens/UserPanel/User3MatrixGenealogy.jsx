// src/screens/UserPanel/User3MatrixGenealogy.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  Network,
  Users,
  TrendingUp,
  Award,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Copy,
  ExternalLink,
  DollarSign,
  ArrowRight,
  Home,
  User,
  Sparkles,
  HelpCircle,
  Info,
  Sliders,
  Eye,
  Check,
  Filter,
  Activity,
  ArrowUpRight,
  Wallet,
  Calendar,
  Grid,
  Compass,
  Move,
} from "lucide-react";
import { getMatrixTreeApi } from "../../api/user.api";
import { UserService } from "../../api/services.api";
import { setLoading } from "../../redux/slices/loadingSlice";
import { maskWalletAddress } from "../../utils/additionalFunc";

const User3MatrixGenealogy = () => {
  const dispatch = useDispatch();

  // Core API State
  const [treeData, setTreeData] = useState(null);
  const [matrixStats, setMatrixStats] = useState(null);
  const [legsData, setLegsData] = useState(null);
  const [teamDivision, setTeamDivision] = useState(null);
  const [directPartners, setDirectPartners] = useState([]);

  // Tree Controls & Interaction State
  const [depth, setDepth] = useState(4); // Default: 4 levels (1 -> 3 -> 9 -> 27)
  const [zoomLevel, setZoomLevel] = useState(85);
  const [legFilter, setLegFilter] = useState("all"); // "all" | 1 | 2 | 3
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFocusedUser, setCurrentFocusedUser] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [accessDeniedError, setAccessDeniedError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState("tree"); // "tree" | "division" | "partners"
  const [treeViewMode, setTreeViewMode] = useState("canvas"); // "canvas" | "list"
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Canvas Pan & Drag Navigation State
  const canvasRef = useRef(null);
  const treeWrapperRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Center tree scroll view
  const handleCenterView = () => {
    if (canvasRef.current) {
      const el = canvasRef.current;
      el.scrollTo({
        left: (el.scrollWidth - el.clientWidth) / 2,
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Copy helper
  const handleCopy = (text, e) => {
    if (e) e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // 📡 Fetch 3-Matrix Tree from API
  const loadMatrixTree = useCallback(
    async (targetUser = null, targetDepth = depth, isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else dispatch(setLoading(true));

        setAccessDeniedError(null);

        const params = { depth: targetDepth };
        if (targetUser && targetUser.trim() !== "") {
          params.userId = targetUser.trim();
          params.username = targetUser.trim();
        }

        const [treeRes, partnersRes, divRes] = await Promise.allSettled([
          getMatrixTreeApi(params),
          UserService.getDirectPartners(),
          UserService.getTeamDivision(),
        ]);

        // Process Direct Partners
        if (partnersRes.status === "fulfilled") {
          const d = partnersRes.value?.data || partnersRes.value || {};
          let partners = [];
          if (Array.isArray(d)) {
            partners = d;
          } else if (Array.isArray(d?.partners)) {
            partners = d.partners;
          } else if (Array.isArray(d?.data)) {
            partners = d.data;
          }
          setDirectPartners(partners);
        }

        // Process Team Division
        if (divRes.status === "fulfilled") {
          setTeamDivision(divRes.value?.data || divRes.value);
        }

        // Process Tree Data & 403 Security Check
        if (treeRes.status === "fulfilled") {
          const res = treeRes.value;

          if (res?.isForbidden || res?.status === 403) {
            const errMsg =
              res?.message ||
              `Access Denied (403 Forbidden): User "${targetUser}" is not in your downline team. Tree access is strictly restricted to your verified organization.`;
            setAccessDeniedError(errMsg);
            toast.error(errMsg, { autoClose: 5000 });
            return;
          }

          if (res?.success && res?.data) {
            const data = res.data;
            const root = data.root || (data.slots ? data : null);
            setTreeData(root);

            if (data.matrixStats) {
              setMatrixStats(data.matrixStats);
            }
            if (data.legs) {
              setLegsData(data.legs);
            }

            setCurrentFocusedUser(targetUser || "");

            // Update Breadcrumbs
            if (!targetUser) {
              setBreadcrumbs([
                {
                  label: root?.username ? `${root.username} (Root)` : "My Root Tree",
                  id: root?.id || root?._id || "",
                  username: root?.username || "",
                },
              ]);
            } else {
              setBreadcrumbs((prev) => {
                const query = targetUser.toLowerCase();
                const existsIdx = prev.findIndex(
                  (b) =>
                    (b.id && b.id.toLowerCase() === query) ||
                    (b.username && b.username.toLowerCase() === query)
                );

                if (existsIdx !== -1) {
                  return prev.slice(0, existsIdx + 1);
                }

                return [
                  ...prev,
                  {
                    label: root?.username || targetUser,
                    id: root?.id || targetUser,
                    username: root?.username || targetUser,
                  },
                ];
              });
            }
          }
        }
      } catch (err) {
        console.error("Error loading matrix tree:", err);
        if (err?.response?.status === 403) {
          const errMsg =
            err?.response?.data?.message ||
            "Access Denied (403 Forbidden): This user is not part of your downline team.";
          setAccessDeniedError(errMsg);
          toast.error(errMsg);
        } else {
          toast.error("Failed to load 3-Matrix Tree. Please try again.");
        }
      } finally {
        if (isManual) setRefreshing(false);
        else dispatch(setLoading(false));
      }
    },
    [dispatch, depth]
  );

  useEffect(() => {
    loadMatrixTree();
  }, [loadMatrixTree]);

  // Auto center scroll position when tree data or zoom or leg changes
  useEffect(() => {
    if (canvasRef.current) {
      const el = canvasRef.current;
      setTimeout(() => {
        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      }, 50);
    }
  }, [treeData, zoomLevel, legFilter, depth]);

  // 🖱️ Mouse & Touch Drag to Pan Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("a")) return;
    isDraggingRef.current = true;
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: canvasRef.current?.scrollLeft || 0,
      scrollTop: canvasRef.current?.scrollTop || 0,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !canvasRef.current) return;
    e.preventDefault();
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    canvasRef.current.scrollLeft = startPosRef.current.scrollLeft - dx;
    canvasRef.current.scrollTop = startPosRef.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Handle Touch Pan for Mobile
  const handleTouchStart = (e) => {
    if (e.target.closest("button") || e.target.closest("input")) return;
    if (e.touches && e.touches[0]) {
      isDraggingRef.current = true;
      startPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        scrollLeft: canvasRef.current?.scrollLeft || 0,
        scrollTop: canvasRef.current?.scrollTop || 0,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || !canvasRef.current || !e.touches || !e.touches[0]) return;
    const dx = e.touches[0].clientX - startPosRef.current.x;
    const dy = e.touches[0].clientY - startPosRef.current.y;
    canvasRef.current.scrollLeft = startPosRef.current.scrollLeft - dx;
    canvasRef.current.scrollTop = startPosRef.current.scrollTop - dy;
  };

  // Handle Search Submission
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      handleResetRoot();
      return;
    }
    loadMatrixTree(searchQuery.trim(), depth);
  };

  // Handle Reset to Root
  const handleResetRoot = () => {
    setSearchQuery("");
    setAccessDeniedError(null);
    setLegFilter("all");
    loadMatrixTree(null, depth);
  };

  // Handle Breadcrumb Click
  const handleBreadcrumbClick = (item, index) => {
    if (index === 0) {
      handleResetRoot();
    } else {
      const target = item.id || item.username;
      loadMatrixTree(target, depth);
    }
  };

  // Handle Drilldown on Clicked Node
  const handleDrilldown = (node) => {
    if (!node || node.isVacant) return;
    const target = node.id || node.username || node._id;
    if (target) {
      setSearchQuery(target);
      loadMatrixTree(target, depth);
    }
  };

  // Handle Depth Change
  const handleDepthChange = (newDepth) => {
    setDepth(newDepth);
    loadMatrixTree(currentFocusedUser || null, newDepth);
  };

  // Fit to screen helper
  const handleFitScreen = () => {
    if (depth === 4 && legFilter === "all") {
      setZoomLevel(55);
    } else if (depth === 3 && legFilter === "all") {
      setZoomLevel(75);
    } else {
      setZoomLevel(90);
    }
  };

  // Calculated Matrix Stats Fallbacks
  const stats = useMemo(() => {
    if (matrixStats) return matrixStats;
    return {
      totalMatrixMembers: directPartners.length || 0,
      totalActiveMembers: directPartners.filter((p) => p.active?.isActive !== false).length || 0,
      totalInactiveMembers: directPartners.filter((p) => p.active?.isActive === false).length || 0,
      totalMatrixVolume: 0,
      level1: { count: 3, capacity: 3, percentage: 100 },
      level2: { count: 9, capacity: 9, percentage: 100 },
      level3: { count: 0, capacity: 27, percentage: 0 },
      level4: { count: 0, capacity: 81, percentage: 0 },
    };
  }, [matrixStats, directPartners]);

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 sm:space-y-6 text-slate-100 font-sans">
      {/* 🌟 1. Top Executive Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-[#070D1E] to-slate-950 border border-indigo-500/30 shadow-2xl p-4 sm:p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Network className="w-3.5 h-3.5" /> 3-Matrix Tri-Leg Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Security Protected
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white flex flex-wrap items-center gap-2">
              3-Matrix Genealogy Tree
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 text-base sm:text-xl md:text-2xl font-black font-['Orbitron',monospace]">
                (1 ➔ 3 ➔ 9 ➔ 27)
              </span>
            </h1>

            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Explore your tri-leg downline network in real time. Pan freely, zoom dynamically, or filter by specific leg branch.
            </p>
          </div>

          {/* Quick Actions & Refresh */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => loadMatrixTree(currentFocusedUser || null, depth, true)}
              disabled={refreshing}
              className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 shadow-lg shadow-cyan-950/50 cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
              Refresh Tree
            </button>

            {currentFocusedUser && (
              <button
                onClick={handleResetRoot}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
              >
                <Home className="w-3.5 h-3.5" /> Return to Root
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🛡️ 403 Forbidden / Security Notice Banner */}
      {accessDeniedError && (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-2 border-rose-500/60 p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/40 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-white font-black text-sm sm:text-base flex items-center gap-2">
                403 Access Denied: Unauthorized Genealogy Subtree
              </h4>
              <p className="text-rose-200/90 text-xs sm:text-sm mt-0.5">{accessDeniedError}</p>
              <span className="text-[11px] text-rose-400/80 mt-1 block">
                Security Policy: You can only explore downlines that belong to your direct/indirect organization.
              </span>
            </div>
          </div>

          <button
            onClick={handleResetRoot}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" /> Return to My Tree
          </button>
        </div>
      )}

      {/* 📊 2. High-Precision Matrix Performance Metrics (HUD) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Members */}
        <div className="bg-gradient-to-br from-cyan-950/70 via-slate-900/90 to-[#020617] border border-cyan-500/30 hover:border-cyan-400 p-4 sm:p-5 rounded-3xl transition duration-300 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-cyan-300">
              Total Matrix Network
            </span>
            <div className="p-2 bg-cyan-500/15 text-cyan-400 rounded-2xl group-hover:scale-110 transition duration-300 border border-cyan-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-white font-['Orbitron',monospace]">
              {(stats?.totalMatrixMembers ?? 0).toLocaleString()} <span className="text-xs text-cyan-300 font-sans font-normal">Members</span>
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {stats?.totalActiveMembers ?? 0} Active
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400 font-bold font-mono text-[11px]">
                {stats?.totalInactiveMembers ?? 0} Inactive
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Matrix Volume */}
        <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-[#030712] border border-emerald-500/30 hover:border-emerald-400 p-4 sm:p-5 rounded-3xl transition duration-300 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-300">
              Total Matrix Turnover
            </span>
            <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-2xl group-hover:scale-110 transition duration-300 border border-emerald-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-100 font-['Orbitron',monospace]">
              ${Number(stats?.totalMatrixVolume ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Combined tri-leg network turnover</p>
          </div>
        </div>

        {/* KPI 3: Root Active Package */}
        <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-[#070314] border border-indigo-500/30 hover:border-indigo-400 p-4 sm:p-5 rounded-3xl transition duration-300 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-300">
              Current Focused Root
            </span>
            <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-2xl group-hover:scale-110 transition duration-300 border border-indigo-500/30">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-bold text-white truncate max-w-[180px]">
              {treeData?.username || "—"}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30 text-[11px]">
                {treeData?.id || "—"}
              </span>
              <span className="text-emerald-400 font-extrabold font-mono text-[11px]">
                ${Number(treeData?.investment || treeData?.activeInvestment || 0).toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Direct Sponsors */}
        <div className="bg-gradient-to-br from-amber-950/60 via-slate-900/90 to-[#0c0702] border border-amber-500/30 hover:border-amber-400 p-4 sm:p-5 rounded-3xl transition duration-300 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-300">
              Direct Sponsors
            </span>
            <div className="p-2 bg-amber-500/15 text-amber-400 rounded-2xl group-hover:scale-110 transition duration-300 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-white font-['Orbitron',monospace]">
              {directPartners.length} <span className="text-xs text-amber-300 font-sans font-normal">Directs</span>
            </h3>
            <p className="text-[10px] text-amber-400/90 mt-1 font-semibold font-mono">
              {directPartners.filter((p) => p.active?.isActive !== false).length} Active Qualifying Sponsors
            </p>
          </div>
        </div>
      </div>

      {/* 🚀 3. Tri-Leg Power Breakdown & Level Capacities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Tri-Leg Breakdown (8 cols on lg) */}
        <div className="lg:col-span-8 bg-[#08101E]/95 border-2 border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xl space-y-3.5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2 font-['Orbitron',monospace]">
                <Layers className="w-4 h-4 text-cyan-400" />
                3-Matrix Tri-Leg Performance
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time volume and active user breakdown across Leg 1, Leg 2, and Leg 3
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LegMetricCard
              position={1}
              title="Leg 1 (Left)"
              data={legsData?.leg1}
              theme="cyan"
            />
            <LegMetricCard
              position={2}
              title="Leg 2 (Center)"
              data={legsData?.leg2}
              theme="indigo"
            />
            <LegMetricCard
              position={3}
              title="Leg 3 (Right)"
              data={legsData?.leg3}
              theme="purple"
            />
          </div>
        </div>

        {/* Level Capacity Progress (4 cols on lg) */}
        <div className="lg:col-span-4 bg-[#08101E]/95 border-2 border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xl space-y-3.5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-['Orbitron',monospace]">
                <Grid className="w-4 h-4 text-emerald-400" />
                Level Capacities
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                120 Slots Total
              </span>
            </div>

            <div className="space-y-2.5 mt-3">
              <LevelCapacityMeter
                level={1}
                capacity={3}
                count={stats?.level1?.count ?? 3}
                percentage={stats?.level1?.percentage ?? 100}
                color="bg-gradient-to-r from-cyan-400 to-blue-500"
              />
              <LevelCapacityMeter
                level={2}
                capacity={9}
                count={stats?.level2?.count ?? 0}
                percentage={stats?.level2?.percentage ?? 0}
                color="bg-gradient-to-r from-indigo-400 to-purple-500"
              />
              <LevelCapacityMeter
                level={3}
                capacity={27}
                count={stats?.level3?.count ?? 0}
                percentage={stats?.level3?.percentage ?? 0}
                color="bg-gradient-to-r from-purple-400 to-pink-500"
              />
              <LevelCapacityMeter
                level={4}
                capacity={81}
                count={stats?.level4?.count ?? 0}
                percentage={stats?.level4?.percentage ?? 0}
                color="bg-gradient-to-r from-emerald-400 to-teal-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Matrix Spillover: <strong className="text-emerald-400">Active</strong></span>
            <span>Tri-Leg Max</span>
          </div>
        </div>
      </div>

      {/* 🧭 4. Navigation Bar, Search & Quick Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "tree", label: "Interactive 3-Matrix Tree", icon: Network },
            { key: "division", label: "50:30:20 Leg Turnover", icon: TrendingUp },
            { key: "partners", label: `Direct Sponsors (${directPartners.length})`, icon: Users },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 py-1.5 sm:py-2 px-3 sm:px-3.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black shadow-lg shadow-cyan-500/25"
                    : "bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tree Search Bar */}
        {activeTab === "tree" && (
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search downline (PEH138782, Chandan)..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black rounded-xl text-xs font-black transition shadow-lg shadow-cyan-500/20 shrink-0 cursor-pointer active:scale-95"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleResetRoot}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>
        )}
      </div>

      {/* 🌳 Tab 1: Interactive Visual 3-Matrix Tree Canvas */}
      {activeTab === "tree" && (
        <div className="space-y-3.5">
          {/* Breadcrumb Trail & Tree Controls HUD */}
          <div className="bg-[#08101E]/95 border-2 border-slate-800 p-3 sm:p-4 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl backdrop-blur-md">
            {/* Breadcrumb Trail */}
            <div className="flex items-center flex-wrap gap-1 text-xs text-slate-400">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1">
                Subtree Path:
              </span>
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.id || idx}>
                    <button
                      onClick={() => handleBreadcrumbClick(crumb, idx)}
                      className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer text-xs ${
                        isLast
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                          : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {idx === 0 && <Home className="w-3 h-3" />}
                      {crumb.label}
                    </button>
                    {!isLast && <ChevronRight className="w-3 h-3 text-slate-600" />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Depth, View Mode, Leg Filter & Zoom Controls */}
            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-between md:justify-end">
              {/* View Switcher (Tree Canvas vs Mobile List) */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
                <button
                  onClick={() => setTreeViewMode("canvas")}
                  className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer text-[11px] flex items-center gap-1 ${
                    treeViewMode === "canvas"
                      ? "bg-cyan-500 text-black shadow font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Network className="w-3 h-3" /> Canvas
                </button>
                <button
                  onClick={() => setTreeViewMode("list")}
                  className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer text-[11px] flex items-center gap-1 ${
                    treeViewMode === "list"
                      ? "bg-indigo-600 text-white shadow font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-3 h-3" /> Mobile Tier
                </button>
              </div>

              {/* Leg Quick Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold px-1.5 hidden sm:inline">Leg:</span>
                {[
                  { key: "all", label: "All" },
                  { key: 1, label: "Leg 1" },
                  { key: 2, label: "Leg 2" },
                  { key: 3, label: "Leg 3" },
                ].map((lf) => (
                  <button
                    key={lf.key}
                    onClick={() => setLegFilter(lf.key)}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl font-bold transition cursor-pointer text-[11px] ${
                      legFilter === lf.key
                        ? "bg-cyan-500 text-black shadow font-black"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    {lf.label}
                  </button>
                ))}
              </div>

              {/* Depth Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold px-1.5 hidden sm:inline">Depth:</span>
                {[2, 3, 4].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDepthChange(d)}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl font-bold transition cursor-pointer text-[11px] ${
                      depth === d
                        ? "bg-indigo-600 text-white shadow font-black"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    {d}L
                  </button>
                ))}
              </div>

              {/* Zoom Controls */}
              {treeViewMode === "canvas" && (
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(35, z - 10))}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono px-1 text-xs font-bold text-cyan-400 min-w-[34px] text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleFitScreen}
                    className="px-2 py-1 hover:bg-slate-800 rounded-lg text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer border border-cyan-500/30"
                    title="Fit to Screen"
                  >
                    Fit
                  </button>
                  <button
                    onClick={handleCenterView}
                    className="px-2 py-1 hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition cursor-pointer"
                    title="Center Tree"
                  >
                    Center
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 🌿 View Mode 1: Interactive Tree Canvas with Pan, Drag, and Center */}
          {treeViewMode === "canvas" ? (
            <div
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className={`relative bg-[#040914] border-2 border-slate-800 rounded-3xl shadow-2xl overflow-x-auto overflow-y-auto cursor-grab active:cursor-grabbing select-none scrollbar-thin scrollbar-thumb-slate-700 transition-all duration-300 ${
                isFullscreen
                  ? "fixed inset-2 z-50 rounded-2xl bg-[#030712] border-cyan-500/50 shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[96vh] h-[96vh]"
                  : "min-h-[640px] sm:min-h-[720px] h-[75vh] max-h-[850px]"
              }`}
            >
              {/* Subtle Grid Background */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#818cf8 1px, #030712 1px)",
                  backgroundSize: "28px 28px",
                  backgroundPosition: "0 0, 14px 14px",
                }}
              />

              {/* Top Left Navigation Hint */}
              <div className="absolute top-3.5 left-3.5 z-20 hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full text-[11px] text-slate-300 font-mono pointer-events-none backdrop-blur-md shadow-lg">
                <Move className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Drag to Pan • Pinch / Zoom • Click Card for Details</span>
              </div>

              {/* Floating Bottom HUD Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-950/90 border border-cyan-500/40 px-3 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(35, z - 10))}
                  className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(85)}
                  className="px-2 py-0.5 text-xs font-mono font-bold text-cyan-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Reset 85%"
                >
                  {zoomLevel}%
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                  className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-800 mx-1" />
                <button
                  onClick={handleCenterView}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Compass className="w-3 h-3" /> Center
                </button>
                <button
                  onClick={handleFitScreen}
                  className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl text-[11px] font-bold transition border border-cyan-500/30 cursor-pointer"
                >
                  Fit
                </button>
                <button
                  onClick={() => setIsFullscreen((f) => !f)}
                  className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition cursor-pointer ml-1"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
                </button>
              </div>

              {treeData ? (
                <div
                  ref={treeWrapperRef}
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: "top center",
                    transition: "transform 0.2s ease-out",
                  }}
                  className="w-max min-w-full flex flex-col items-center pt-16 sm:pt-20 pb-32 px-12 sm:px-24"
                >
                  <MatrixTreeLevelRenderer
                    node={treeData}
                    maxDepth={depth}
                    currentLevel={1}
                    legFilter={legFilter}
                    onDrilldown={handleDrilldown}
                    onSelectNode={setSelectedMember}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                  />
                </div>
              ) : (
                <div className="py-28 text-center space-y-3.5">
                  <Network className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                  <h4 className="text-white font-bold text-base">No 3-Matrix Team Data Found</h4>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto">
                    Your matrix team hierarchy will populate here as new members register and activate in your tri-legs.
                  </p>
                  <button
                    onClick={() => loadMatrixTree(null, depth, true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    Reload Tree
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 📱 View Mode 2: Mobile Hierarchy Tier Breakdown (Accordion List) */
            <MobileHierarchyTierView
              treeData={treeData}
              onDrilldown={handleDrilldown}
              onSelectNode={setSelectedMember}
              onCopy={handleCopy}
              copiedId={copiedId}
            />
          )}
        </div>
      )}

      {/* 📊 Tab 2: 50%:30%:20% Leg Turnover Division */}
      {activeTab === "division" && (
        <div className="space-y-4">
          <div className="bg-[#08101E]/95 border-2 border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl space-y-5 backdrop-blur-md">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-['Orbitron',monospace]">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Leg Turnover Division (50% : 30% : 20% Rule)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Executive Salary rank qualification distributes required team volume across strongest leg (Max 50%), second leg (Max 30%), and other legs (Max 20%).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Leg 1 */}
              <div className="bg-slate-950 border border-cyan-500/30 p-4 sm:p-5 rounded-3xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
                    Leg 1 (Main Leg - Max 50%)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                    Strongest Leg
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-['Orbitron',monospace] mt-2.5">
                  ${Number(teamDivision?.leg1Volume || teamDivision?.legA || legsData?.leg1?.totalVolume || 0).toLocaleString()}
                </h3>
                <p className="text-xs text-slate-400 mt-2">Maximum volume contribution towards salary qualification: 50%</p>
              </div>

              {/* Leg 2 */}
              <div className="bg-slate-950 border border-indigo-500/30 p-4 sm:p-5 rounded-3xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                    Leg 2 (Second Leg - Max 30%)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                    Second Leg
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-['Orbitron',monospace] mt-2.5">
                  ${Number(teamDivision?.leg2Volume || teamDivision?.legB || legsData?.leg2?.totalVolume || 0).toLocaleString()}
                </h3>
                <p className="text-xs text-slate-400 mt-2">Second strongest leg volume contribution: 30%</p>
              </div>

              {/* Other Legs */}
              <div className="bg-slate-950 border border-purple-500/30 p-4 sm:p-5 rounded-3xl relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">
                    Other Legs (Remaining - Max 20%)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                    Remaining Legs
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-['Orbitron',monospace] mt-2.5">
                  ${Number(teamDivision?.otherLegsVolume || teamDivision?.otherLegs || legsData?.leg3?.totalVolume || 0).toLocaleString()}
                </h3>
                <p className="text-xs text-slate-400 mt-2">Combined rest of team downline volume: 20%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👥 Tab 3: Direct Sponsors Table */}
      {activeTab === "partners" && (
        <div className="neon-glow-card border border-sky-400/40 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(14,165,233,0.22)] backdrop-blur-xl p-4 sm:p-6">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="gold-badge-icon w-10 h-10 flex items-center justify-center">
                <Users className="w-5 h-5 text-slate-950 font-black" />
              </div>
              <div>
                <h3 className="font-black gold-metallic-text text-sm sm:text-base uppercase tracking-wider">Directly Sponsored Partners</h3>
                <p className="text-xs text-slate-300 font-semibold uppercase">Members registered directly through your sponsor referral link</p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 bg-sky-500/15 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold font-mono">
              Total Qualifying Sponsors: {directPartners.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-sky-500/30 shadow-inner bg-[#040914]/90">
            <table className="w-full text-left text-xs md:text-sm border-collapse">
              <thead>
                <tr className="text-nowrap divide-x divide-white/10">
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">#</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Username</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">User ID</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold">Self Investment</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold">Status</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold">Joined Date</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-500/15">
                {directPartners.length > 0 ? (
                  directPartners.map((p, idx) => {
                    const isActive = p.active?.isActive !== false && p.isActive !== false;
                    return (
                      <tr key={p._id || idx} className="hover:bg-sky-950/30 transition-colors border-b border-sky-500/10">
                        <td className="p-3.5 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs uppercase border border-sky-500/30">
                              {(p.username || "U").charAt(0)}
                            </div>
                            <span className="font-bold text-white">{p.username}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-sky-300 text-xs">
                          <button
                            onClick={() => handleCopy(p.id || p.userId)}
                            className="flex items-center gap-1 hover:underline cursor-pointer"
                            title="Click to copy"
                          >
                            {p.id || p.userId || "—"}
                            <Copy className="w-3 h-3 text-slate-500" />
                          </button>
                        </td>
                        <td className="p-3.5 font-bold text-amber-300 font-mono">
                          ${Number(p.investment || p.activePackage || 0).toFixed(2)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isActive
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                            {isActive ? "Active ($50+)" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-xs font-mono">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setActiveTab("tree");
                              handleDrilldown({ id: p.id || p.userId, username: p.username });
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300 rounded-lg text-xs font-black transition flex items-center gap-1 ml-auto shadow-[0_0_10px_rgba(245,158,11,0.3)] cursor-pointer uppercase tracking-wider"
                          >
                            <Network className="w-3.5 h-3.5" /> View Tree
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400 text-sm">
                      No direct sponsored partners found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📋 5. Node Quick Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onExploreSubtree={(target) => {
            setSelectedMember(null);
            handleDrilldown(target);
          }}
          onCopy={handleCopy}
          copiedId={copiedId}
        />
      )}
    </div>
  );
};

/* =====================================================================
   🌳 RECURSIVE MULTI-TIER 3-MATRIX TREE RENDERER (1 -> 3 -> 9 -> 27)
   ===================================================================== */
const MatrixTreeLevelRenderer = ({
  node,
  maxDepth = 4,
  currentLevel = 1,
  legFilter = "all",
  onDrilldown,
  onSelectNode,
  onCopy,
  copiedId,
}) => {
  if (!node) return null;

  // Normalize 3 slots for this node (Position 1, Position 2, Position 3)
  const slots = useMemo(() => {
    const rawSlots = node.slots || node.children || [];
    const normalized = [
      { matrixPosition: 1, isVacant: true, message: "Vacant Leg 1" },
      { matrixPosition: 2, isVacant: true, message: "Vacant Leg 2" },
      { matrixPosition: 3, isVacant: true, message: "Vacant Leg 3" },
    ];

    if (Array.isArray(rawSlots)) {
      rawSlots.forEach((s, idx) => {
        const pos = s?.matrixPosition || idx + 1;
        if (pos >= 1 && pos <= 3) {
          normalized[pos - 1] = s;
        }
      });
    }

    // Apply leg filter on level 1 (direct children)
    if (currentLevel === 1 && legFilter !== "all") {
      return normalized.filter((_, idx) => idx + 1 === Number(legFilter));
    }

    return normalized;
  }, [node, currentLevel, legFilter]);

  const hasChildren = currentLevel < maxDepth;

  return (
    <div className="flex flex-col items-center">
      {/* 🪪 Member Node Card */}
      <MatrixMemberCard
        node={node}
        level={currentLevel}
        onDrilldown={onDrilldown}
        onSelectNode={onSelectNode}
        onCopy={onCopy}
        copiedId={copiedId}
      />

      {/* 🌿 Connector Lines & Child Subtrees */}
      {hasChildren && (
        <div className="w-full flex flex-col items-center mt-1">
          {/* Vertical Stem down from parent */}
          <div className="w-0.5 h-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />

          {/* Child Branches Grid with Mathematical Crossbar Alignment */}
          <div className="w-full flex justify-center pt-0">
            {slots.map((childSlot, index) => {
              const isFirst = index === 0;
              const isLast = index === slots.length - 1;
              const isSingle = slots.length === 1;
              const pos = childSlot?.matrixPosition || index + 1;

              return (
                <div
                  key={childSlot?.id || childSlot?._id || `slot-${pos}-${index}-${currentLevel}`}
                  className="flex flex-col items-center flex-1 min-w-0 relative px-1 sm:px-2.5"
                >
                  {/* Horizontal crossbar segments connecting this child to siblings */}
                  {!isSingle && (
                    <div className="w-full absolute top-0 left-0 flex h-0.5 pointer-events-none">
                      <div
                        className={`h-0.5 flex-1 ${
                          isFirst ? "bg-transparent" : "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]"
                        }`}
                      />
                      <div
                        className={`h-0.5 flex-1 ${
                          isLast ? "bg-transparent" : "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]"
                        }`}
                      />
                    </div>
                  )}

                  {/* Vertical drop line down into the child card */}
                  <div className="w-0.5 h-5 bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)] z-10" />

                  {/* Child Node or Subtree */}
                  {childSlot?.isVacant ? (
                    <VacantSlotCard position={pos} level={currentLevel + 1} />
                  ) : (
                    <MatrixTreeLevelRenderer
                      node={childSlot}
                      maxDepth={maxDepth}
                      currentLevel={currentLevel + 1}
                      legFilter="all"
                      onDrilldown={onDrilldown}
                      onSelectNode={onSelectNode}
                      onCopy={onCopy}
                      copiedId={copiedId}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* =====================================================================
   🪪 OCCUPIED MEMBER CARD COMPONENT (SCALED FOR PERFECT MULTI-TIER FIT)
   ===================================================================== */
const MatrixMemberCard = ({ node, level = 1, onDrilldown, onSelectNode, onCopy, copiedId }) => {
  if (!node) return null;

  const isActive = node.isActive !== false && node.active?.isActive !== false;
  const isRoot = level === 1;
  const isLevel2 = level === 2;
  const isLevel3 = level === 3;
  const isLevel4 = level >= 4;
  const pos = node.matrixPosition || 1;
  const username = node.username || "Investor";
  const memberId = node.id || node.userId || node._id || "PEH0000";
  const investment = Number(node.investment || node.activeInvestment || 0);

  // LEVEL 4: NANO CARD (27 SLOTS ROW)
  if (isLevel4) {
    return (
      <div
        onClick={() => onSelectNode && onSelectNode(node)}
        className={`relative group cursor-pointer transition-all duration-200 rounded-xl p-1.5 border shadow flex flex-col items-center text-center select-none min-w-[75px] max-w-[95px] ${
          isActive
            ? "bg-slate-950/95 border-indigo-500/50 hover:border-cyan-400 shadow-cyan-500/10"
            : "bg-slate-950/80 border-slate-800 opacity-75"
        }`}
      >
        <div className="w-full flex items-center justify-between text-[8px] text-slate-400 font-bold mb-0.5">
          <span>L4#{pos}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
        </div>
        <div className="text-[10px] font-bold text-white truncate w-full group-hover:text-cyan-300">
          {username}
        </div>
        <div className="text-[9px] font-extrabold text-emerald-400 font-mono">
          ${investment.toFixed(0)}
        </div>
      </div>
    );
  }

  // LEVEL 3: COMPACT CARD (9 SLOTS ROW)
  if (isLevel3) {
    return (
      <div
        onClick={() => onSelectNode && onSelectNode(node)}
        className={`relative group cursor-pointer transition-all duration-200 rounded-2xl p-2 border shadow-md flex flex-col items-center text-center select-none min-w-[105px] max-w-[130px] ${
          isActive
            ? "bg-gradient-to-b from-slate-900/95 to-slate-950 border-indigo-500/50 hover:border-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
            : "bg-slate-950/90 border-slate-800 opacity-80"
        }`}
      >
        <div className="w-full flex items-center justify-between text-[8.5px] font-extrabold mb-1">
          <span className="text-cyan-400">Leg #{pos}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
        </div>
        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px] mb-0.5">
          {username.charAt(0)}
        </div>
        <div className="text-[11px] font-bold text-white truncate w-full group-hover:text-cyan-300 font-mono">
          {username}
        </div>
        <div className="text-[9px] text-slate-400 font-mono truncate max-w-[80px]">
          {memberId}
        </div>
        <div className="mt-1 w-full bg-slate-950 rounded-lg py-0.5 px-1 border border-slate-800 flex items-center justify-between text-[9px]">
          <span className="text-slate-400">Inv:</span>
          <span className="text-emerald-400 font-bold font-mono">${investment.toFixed(0)}</span>
        </div>
      </div>
    );
  }

  // LEVEL 1 & 2: FULL LUXURY CARDS
  return (
    <div
      onClick={() => onSelectNode && onSelectNode(node)}
      className={`relative group cursor-pointer transition-all duration-300 rounded-3xl p-3 md:p-3.5 border shadow-xl flex flex-col items-center text-center select-none ${
        isRoot
          ? "bg-gradient-to-b from-slate-900 via-indigo-950/90 to-slate-950 border-cyan-400/80 hover:border-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)] min-w-[160px] max-w-[195px]"
          : "bg-gradient-to-b from-slate-900 via-slate-950 to-[#040814] border-indigo-500/60 hover:border-cyan-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] min-w-[140px] max-w-[175px]"
      }`}
    >
      {/* Position & Status Header */}
      <div className="w-full flex items-center justify-between gap-1 mb-1.5">
        <span
          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
            isRoot
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
              : pos === 1
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
              : pos === 2
              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
              : "bg-purple-500/20 text-purple-300 border-purple-500/30"
          }`}
        >
          {isRoot ? "👑 Root Leader" : `Leg #${pos}`}
        </span>

        <span
          className={`w-2 h-2 rounded-full ${
            isActive
              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              : "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]"
          }`}
          title={isActive ? "Active ($50+)" : "Inactive Account"}
        />
      </div>

      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-2xl flex items-center justify-center font-black text-xs uppercase mb-1 transition-transform group-hover:scale-110 shadow-md ${
          isRoot
            ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-black font-black"
            : isActive
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold"
            : "bg-slate-800 text-slate-400"
        }`}
      >
        {username.charAt(0)}
      </div>

      {/* Username & Member ID */}
      <h4 className="text-white font-black text-xs truncate w-full group-hover:text-cyan-300 transition font-mono">
        {username}
      </h4>

      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 mt-0.5">
        <span className="truncate max-w-[85px]">{memberId}</span>
        <button
          onClick={(e) => onCopy && onCopy(memberId, e)}
          className="hover:text-cyan-300 transition p-0.5 cursor-pointer"
          title="Copy User ID"
        >
          {copiedId === memberId ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
        </button>
      </div>

      {/* Investment */}
      <div className="mt-1.5 w-full bg-slate-950/80 rounded-xl py-1 px-1.5 border border-slate-800/80 flex items-center justify-between text-[10px]">
        <span className="text-slate-400 font-medium">Invest:</span>
        <span className="font-extrabold text-emerald-400 font-mono">
          ${investment.toFixed(0)}
        </span>
      </div>

      {/* Quick Drilldown Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDrilldown && onDrilldown(node);
        }}
        className="mt-1.5 w-full py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 border border-indigo-500/30 group-hover:border-indigo-400 cursor-pointer"
      >
        <Eye className="w-3 h-3" /> Focus Subtree
      </button>
    </div>
  );
};

/* =====================================================================
   📭 VACANT SLOT CARD COMPONENT (RESPONSIVE MULTI-TIER)
   ===================================================================== */
const VacantSlotCard = ({ position = 1, level = 2 }) => {
  const isLevel4 = level >= 4;
  const isLevel3 = level === 3;

  if (isLevel4) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-1.5 flex flex-col items-center justify-center text-center min-w-[70px] max-w-[90px] select-none">
        <span className="text-[7.5px] font-bold text-slate-600 uppercase">Slot #{position}</span>
        <span className="text-[9px] text-slate-600 font-bold">+ Vacant</span>
      </div>
    );
  }

  if (isLevel3) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 p-2 flex flex-col items-center justify-center text-center min-w-[95px] max-w-[120px] select-none">
        <span className="text-[8px] font-bold text-slate-600 uppercase mb-0.5">Slot #{position}</span>
        <div className="w-5 h-5 rounded border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-[10px] mb-0.5 font-bold">
          +
        </div>
        <span className="text-[9px] font-bold text-slate-500">Vacant Leg</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/50 p-2.5 sm:p-3 flex flex-col items-center justify-center text-center transition group select-none min-w-[115px] max-w-[145px]">
      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">
        Slot #{position}
      </span>
      <div className="w-6 h-6 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-600 group-hover:text-slate-400 group-hover:border-slate-500 transition mb-0.5 text-xs font-bold">
        +
      </div>
      <h5 className="text-[10px] font-bold text-slate-500 group-hover:text-slate-400 transition truncate">
        Vacant Leg {position}
      </h5>
      <span className="text-[8px] text-slate-600">Available</span>
    </div>
  );
};

/* =====================================================================
   📊 LEG METRIC CARD COMPONENT
   ===================================================================== */
const LegMetricCard = ({ position, title, data, theme = "cyan" }) => {
  const isOccupied = data?.occupied !== false && (data?.totalMembers > 0 || data?.totalVolume > 0);

  const colors = {
    cyan: {
      border: "border-cyan-500/30 hover:border-cyan-400/80",
      bg: "bg-gradient-to-br from-cyan-950/60 via-slate-900/90 to-slate-950",
      titleColor: "text-cyan-400",
      badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    },
    indigo: {
      border: "border-indigo-500/30 hover:border-indigo-400/80",
      bg: "bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-slate-950",
      titleColor: "text-indigo-400",
      badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    },
    purple: {
      border: "border-purple-500/30 hover:border-purple-400/80",
      bg: "bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-slate-950",
      titleColor: "text-purple-400",
      badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
  }[theme] || {
    border: "border-slate-800",
    bg: "bg-slate-900",
    titleColor: "text-white",
    badge: "bg-slate-800 text-slate-400",
  };

  return (
    <div className={`p-3.5 sm:p-4 rounded-3xl ${colors.bg} border ${colors.border} shadow-lg relative overflow-hidden transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-black uppercase tracking-wider ${colors.titleColor}`}>
          {title}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
            isOccupied
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-slate-800 text-slate-400 border-slate-700"
          }`}
        >
          {isOccupied ? "● Active" : "○ Empty"}
        </span>
      </div>

      <div className="mt-2">
        <span className="text-[9px] uppercase font-bold text-slate-400">Total Leg Volume</span>
        <h4 className="text-lg sm:text-xl font-black text-white font-['Orbitron',monospace] mt-0.5">
          ${Number(data?.totalVolume || 0).toLocaleString()}
        </h4>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div>
          <span className="text-slate-500 text-[9px] block">Downlines</span>
          <span className="font-bold text-white">{data?.totalMembers || 0}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[9px] block">Active</span>
          <span className="font-bold text-emerald-400">{data?.activeMembers || 0}</span>
        </div>
      </div>
    </div>
  );
};

/* =====================================================================
   🎚️ LEVEL CAPACITY METER COMPONENT
   ===================================================================== */
const LevelCapacityMeter = ({ level, capacity, count = 0, percentage = 0, color }) => {
  const safePercent = Math.min(100, Math.max(0, percentage || Math.round((count / capacity) * 100)));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-bold text-slate-300">
          Level {level} <span className="text-slate-500 font-normal">({capacity} Slots)</span>
        </span>
        <span className="font-mono font-bold text-white text-[11px]">
          {count}/{capacity} <span className="text-cyan-400">({safePercent}%)</span>
        </span>
      </div>

      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
};

/* =====================================================================
   📋 MEMBER DETAIL MODAL COMPONENT
   ===================================================================== */
const MemberDetailModal = ({ member, onClose, onExploreSubtree, onCopy, copiedId }) => {
  if (!member) return null;

  const isActive = member.isActive !== false && member.active?.isActive !== false;
  const username = member.username || "Investor";
  const memberId = member.id || member.userId || member._id || "PEH0000";
  const sponsor = member.sponsor;
  const wallet = member.walletAddress || member.account;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#08101E] border-2 border-slate-800 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-white relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-lg font-black uppercase text-black shadow-lg">
              {username.charAt(0)}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">{username}</h3>
              <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400">
                <span>{memberId}</span>
                <button
                  onClick={() => onCopy && onCopy(memberId)}
                  className="hover:text-white cursor-pointer"
                  title="Copy ID"
                >
                  {copiedId === memberId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Member Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Account Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
              <span className={`text-xs font-bold ${isActive ? "text-emerald-400" : "text-rose-400"}`}>
                {isActive ? "Active ID ($50+)" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Active Package</span>
            <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono mt-1">
              ${Number(member.investment || member.activeInvestment || 0).toFixed(2)}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Matrix Position</span>
            <div className="text-xs sm:text-sm font-black text-cyan-300 mt-1">
              Leg #{member.matrixPosition || 1} (Level {member.matrixLevel || 2})
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Direct Branches</span>
            <div className="text-xs sm:text-sm font-black text-purple-300 font-mono mt-1">
              {member.childrenCount ?? (member.slots ? member.slots.filter((s) => !s.isVacant).length : 0)} / 3 Filled
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        {wallet && (
          <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Wallet:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-200">{maskWalletAddress(wallet)}</span>
              <button
                onClick={() => onCopy && onCopy(wallet)}
                className="text-cyan-400 hover:text-white cursor-pointer"
                title="Copy Full Address"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Sponsor Details */}
        {sponsor && (
          <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Sponsor Leader:</span>
            <span className="font-bold text-white font-mono">
              {sponsor.username || sponsor.name || "Leader"} ({sponsor.id || "PEH0001"})
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            onClick={() => onExploreSubtree(member)}
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <Network className="w-3.5 h-3.5" /> Focus & Drill Down Subtree
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =====================================================================
   📱 MOBILE HIERARCHY TIER BREAKDOWN VIEW (PERFECT FOR MOBILE PHONES)
   ===================================================================== */
const MobileHierarchyTierView = ({ treeData, onDrilldown, onSelectNode, onCopy, copiedId }) => {
  const [expandedLeg, setExpandedLeg] = useState(1);

  if (!treeData) {
    return (
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 text-center text-slate-400">
        No tree data available.
      </div>
    );
  }

  const rootSlots = treeData.slots || treeData.children || [];

  return (
    <div className="space-y-4">
      {/* 👑 Level 1: Root Leader Card */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-2 border-cyan-500/50 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
            👑 Root Leader (Level 1)
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              treeData.isActive !== false
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}
          >
            {treeData.isActive !== false ? "● Active ($50+)" : "○ Inactive"}
          </span>
        </div>

        <div className="flex items-center gap-3.5 mt-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-black flex items-center justify-center font-black text-lg shadow-lg">
            {(treeData.username || "R").charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-white truncate font-mono">{treeData.username}</h3>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <span>{treeData.id || treeData._id || "PEH0000"}</span>
              <button
                onClick={() => onCopy && onCopy(treeData.id || treeData._id)}
                className="hover:text-white cursor-pointer"
                title="Copy ID"
              >
                {copiedId === (treeData.id || treeData._id) ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Active Package</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              ${Number(treeData.investment || treeData.activeInvestment || 0).toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* 🌿 Level 2: 3 Tri-Leg Accordion Sections */}
      <div className="space-y-3">
        {[1, 2, 3].map((pos) => {
          const legSlot = rootSlots.find((s) => (s?.matrixPosition || 1) === pos) || rootSlots[pos - 1];
          const isOccupied = legSlot && !legSlot.isVacant;
          const isExpanded = expandedLeg === pos;

          const theme =
            pos === 1
              ? { border: "border-cyan-500/40", text: "text-cyan-400", bg: "from-cyan-950/40 to-slate-900" }
              : pos === 2
              ? { border: "border-indigo-500/40", text: "text-indigo-400", bg: "from-indigo-950/40 to-slate-900" }
              : { border: "border-purple-500/40", text: "text-purple-400", bg: "from-purple-950/40 to-slate-900" };

          const level3Slots = legSlot?.slots || legSlot?.children || [];

          return (
            <div
              key={pos}
              className={`border-2 ${theme.border} rounded-3xl overflow-hidden bg-slate-900/90 shadow-lg transition-all duration-200`}
            >
              {/* Leg Header Bar */}
              <div
                onClick={() => setExpandedLeg((prev) => (prev === pos ? null : pos))}
                className={`p-4 bg-gradient-to-r ${theme.bg} flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center font-black text-xs ${theme.text} border border-slate-800`}
                  >
                    #{pos}
                  </div>
                  <div>
                    <h4 className={`text-sm font-black ${theme.text} font-mono`}>
                      Leg #{pos} — {isOccupied ? legSlot.username : "Vacant Slot"}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {isOccupied ? `ID: ${legSlot.id || "PEH0000"}` : "Position Available"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOccupied && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ${Number(legSlot.investment || 0).toFixed(0)}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {/* Leg Expanded Content */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/70">
                  {isOccupied ? (
                    <div className="space-y-3">
                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectNode && onSelectNode(legSlot)}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" /> Member Details
                        </button>
                        <button
                          onClick={() => onDrilldown && onDrilldown(legSlot)}
                          className="flex-1 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Network className="w-3.5 h-3.5" /> Focus Subtree
                        </button>
                      </div>

                      {/* Level 3 Sub-Branches (3 children per leg) */}
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-indigo-400" /> Level 3 Downline Branches ({level3Slots.length}/3 Filled):
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[1, 2, 3].map((subPos) => {
                            const subSlot =
                              level3Slots.find((s) => (s?.matrixPosition || 1) === subPos) ||
                              level3Slots[subPos - 1];
                            const isSubOccupied = subSlot && !subSlot.isVacant;

                            return (
                              <div
                                key={subPos}
                                onClick={() => isSubOccupied && onSelectNode && onSelectNode(subSlot)}
                                className={`p-2.5 rounded-2xl border text-xs ${
                                  isSubOccupied
                                    ? "bg-slate-900 border-indigo-500/40 hover:border-cyan-400 cursor-pointer"
                                    : "bg-slate-950/40 border-dashed border-slate-800 text-slate-600"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                  <span className="font-bold text-slate-400">Slot #{subPos}</span>
                                  {isSubOccupied && (
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        subSlot.isActive !== false ? "bg-emerald-400" : "bg-rose-400"
                                      }`}
                                    />
                                  )}
                                </div>
                                <div className="font-bold text-white truncate font-mono">
                                  {isSubOccupied ? subSlot.username : "+ Vacant Leg"}
                                </div>
                                {isSubOccupied && (
                                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                                    ${Number(subSlot.investment || 0).toFixed(0)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-500 font-mono">
                      This leg position is currently vacant and open for new sponsor registrations.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default User3MatrixGenealogy;

