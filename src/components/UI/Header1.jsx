import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LandingRouters } from "../../constants/routes";
import { MainContent } from "../../constants/mainContent";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { FiArrowUpRight, FiLogIn, FiUserPlus } from "react-icons/fi";

const Header1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMobileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Ecosystem", href: "#ecosystem" },
    { name: "Packages", href: "#packages" },
    { name: "Income Streams", href: "#income" },
    { name: "Node Wonder", href: "#node-wonder" },
    { name: "Booster Bonus", href: "#booster" },
    { name: "Why Us", href: "#why-choose-us" },
    { name: "Terms & Rules", href: "#terms" },
  ];

  const handleNavClick = (href) => {
    setMobileOpen(false);

    if (location.pathname !== "/") {
      navigate("/" + href);
      return;
    }

    if (href === "#home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      const headerOffset = 76;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* ═══════════ DESKTOP & TABLET HEADER ═══════════ */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-2.5 sm:py-3 bg-[#030914]/92 backdrop-blur-xl border-b border-cyan-500/15 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,210,255,0.06)]"
            : "py-3.5 sm:py-4 bg-gradient-to-b from-[#030914]/95 via-[#030914]/85 to-transparent backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => {
              if (location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                navigate(LandingRouters.DASHBOARD);
              }
            }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-amber-400 rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition duration-300" />
              <img
                src="/NodexAI.jpeg"
                alt="NODEXAI"
                className="relative h-11 sm:h-12 w-auto max-w-[130px] rounded-lg object-contain border border-cyan-400/50 shadow-[0_0_15px_rgba(0,210,255,0.35)] group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base md:text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-white to-amber-300 bg-clip-text text-transparent font-['Orbitron',sans-serif]">
                NODEXAI
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-cyan-300/80 font-mono font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                INVEST • GROW • EARN
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#071326]/60 border border-cyan-500/15 backdrop-blur-md">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Action CTA Buttons */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate(LandingRouters.USER_LOGIN)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider text-amber-300 hover:text-amber-200 border border-amber-400/40 hover:border-amber-400/80 bg-amber-500/10 hover:bg-amber-500/20 backdrop-blur-sm transition-all duration-300 flex items-center gap-1.5 shadow-[0_0_12px_rgba(214,168,58,0.15)] cursor-pointer"
            >
              <FiLogIn className="text-sm" />
              <span>Login</span>
            </button>
            <button
              onClick={() => navigate(LandingRouters.USER_REGISTER)}
              className="relative group px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase text-white overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_0_20px_rgba(0,210,255,0.35)] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 transition-all duration-300 group-hover:brightness-110" />
              <span className="relative flex items-center gap-1.5">
                <FiUserPlus className="text-sm" />
                <span>Get Started</span>
                <FiArrowUpRight className="text-sm group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center gap-2">
            <button
              onClick={() => navigate(LandingRouters.USER_LOGIN)}
              className="sm:hidden px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 border border-amber-400/30 bg-amber-500/10"
            >
              Login
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenuAlt3 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════ MOBILE DRAWER MENU ═══════════ */}
      {mobileOpen && (
        <div
          ref={menuRef}
          className="xl:hidden fixed inset-x-0 top-[66px] z-40 bg-[#030914]/98 backdrop-blur-2xl border-b border-cyan-500/20 shadow-[0_20px_40px_rgba(0,0,0,0.9)] animate-in slide-in-from-top-4 duration-300"
        >
          <div className="max-w-7xl mx-auto px-5 py-6 flex flex-col gap-4">
            {/* Drawer Header Brand */}
            <div className="flex items-center gap-3 pb-3 border-b border-cyan-500/15">
              <img
                src="/NodexAI.jpeg"
                alt="NODEXAI"
                className="h-10 w-auto rounded-lg border border-cyan-500/30 shadow-[0_0_12px_rgba(0,210,255,0.25)]"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-wider text-white font-['Orbitron',sans-serif]">
                  NODEXAI
                </span>
                <span className="text-[9px] tracking-widest uppercase text-cyan-300/80 font-mono">
                  INVEST • GROW • EARN
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-slate-200 hover:text-cyan-300 bg-cyan-950/30 hover:bg-cyan-500/15 border border-cyan-500/10 rounded-xl transition-all cursor-pointer truncate"
                >
                  {link.name}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-cyan-500/15 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate(LandingRouters.USER_LOGIN);
                }}
                className="w-full py-3 rounded-xl text-center text-xs font-bold text-amber-300 border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiLogIn />
                <span>Account Login</span>
              </button>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate(LandingRouters.USER_REGISTER);
                }}
                className="w-full py-3 rounded-xl text-center text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiUserPlus />
                <span>Create New Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header1;
