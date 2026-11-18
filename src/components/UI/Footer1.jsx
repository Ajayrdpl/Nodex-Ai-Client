import React from "react";
import { useNavigate } from "react-router-dom";
import { MainContent } from "../../constants/mainContent";
import { LandingRouters } from "../../constants/routes";
import { FiArrowUp, FiShield, FiCheckCircle, FiLock, FiCpu } from "react-icons/fi";
import { FaTelegramPlane, FaTwitter, FaYoutube, FaDiscord } from "react-icons/fa";

const Footer1 = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Ecosystem",
      links: [
        { name: "About Platform", href: "#about" },
        { name: "5 Ecosystem Pillars", href: "#ecosystem" },
        { name: "Investment Packages", href: "#packages" },
        { name: "Why Choose Us", href: "#why-choose-us" },
      ],
    },
    {
      title: "Income Streams",
      links: [
        { name: "Daily ROI (4.5% - 7.5%)", href: "#packages" },
        { name: "Direct Booster (12%)", href: "#direct-referral" },
        { name: "10-Level Community Income", href: "#level-income" },
        { name: "Fast-Track Booster", href: "#booster" },
      ],
    },
    {
      title: "Quick Navigation",
      links: [
        { name: "Member Login", onClick: () => navigate(LandingRouters.USER_LOGIN) },
        { name: "Register Account", onClick: () => navigate(LandingRouters.USER_REGISTER) },
        { name: "Operating Rules", href: "#terms" },
        { name: "How to Join (8 Steps)", href: "#how-to-join" },
      ],
    },
    {
      title: "Security & Terms",
      links: [
        { name: "Operating Terms & Rules", href: "#terms" },
        { name: "Withdrawal Policies (5%)", href: "#terms" },
        { name: "Principal Withdrawal Policy", href: "#terms" },
        { name: "BNB Smart Chain Protocol", href: "#terms" },
      ],
    },
  ];

  const socials = [
    { name: "Telegram", icon: <FaTelegramPlane />, href: "https://t.me", color: "#00D2FF" },
    { name: "Twitter / X", icon: <FaTwitter />, href: "https://twitter.com", color: "#38bdf8" },
    { name: "YouTube", icon: <FaYoutube />, href: "https://youtube.com", color: "#f43f5e" },
    { name: "Discord", icon: <FaDiscord />, href: "https://discord.com", color: "#818cf8" },
  ];

  const trustBadges = [
    { icon: <FiLock className="text-cyan-400" />, label: "SSL 256-Bit Encrypted Protocol" },
    { icon: <FiCpu className="text-amber-400" />, label: "BNB Smart Chain (BEP-20) USDT" },
    { icon: <FiCheckCircle className="text-emerald-400" />, label: "Instant $1 Min Withdrawal (5% Fee)" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLinkClick = (link) => {
    if (link.onClick) {
      link.onClick();
      return;
    }
    if (link.href && link.href.startsWith("#")) {
      const el = document.querySelector(link.href);
      if (el) {
        const headerOffset = 76;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <footer className="relative bg-[#010611] border-t border-cyan-500/20 text-white pt-14 sm:pt-16 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-48 bg-[radial-gradient(ellipse_at_top,rgba(0,210,255,0.09),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Top Trust Badges Bar (Responsive) */}
        <div className="mb-12 pb-8 border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {trustBadges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center sm:justify-start gap-2.5 p-3 rounded-xl bg-[#040e21]/70 border border-slate-800 text-xs text-slate-300 font-mono"
            >
              <span className="text-base">{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Brand Col: span 4 on desktop */}
          <div className="md:col-span-12 lg:col-span-4 space-y-4 text-center sm:text-left">
            <div
              className="inline-flex sm:flex items-center gap-3 cursor-pointer group"
              onClick={scrollToTop}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-amber-400 rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition duration-300" />
                <img
                  src="/NodexAI.jpeg"
                  alt="NODEXAI"
                  className="relative h-12 sm:h-14 w-auto rounded-lg object-contain border border-cyan-400/50 shadow-[0_0_15px_rgba(0,210,255,0.3)] group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-white to-amber-300 bg-clip-text text-transparent font-['Orbitron',sans-serif]">
                  NODEXAI
                </span>
                <span className="text-[9px] tracking-[0.25em] uppercase text-cyan-300/80 font-mono font-semibold">
                  INVEST • GROW • EARN
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto sm:mx-0">
              Next-generation decentralized autonomous trading ecosystem engineered for consistent daily returns (4.5% - 7.5%), BNB Smart Chain USDT settlements, and multi-tier network compensation.
            </p>

            {/* Social Icons Strip */}
            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#061226] border border-slate-800 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
                  aria-label={s.name}
                >
                  <span className="text-base">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links Cols: 2 columns on mobile/tablet, 4 on desktop */}
          <div className="md:col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {footerSections.map((section, idx) => (
              <div key={idx} className="space-y-3.5">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-300 border-l-2 border-cyan-400 pl-2">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <button
                        onClick={() => handleLinkClick(link)}
                        className="text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer text-left py-1 block w-full truncate"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Bar (Responsive) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span>© {currentYear} NODEXAI. All Rights Reserved.</span>
            <span className="hidden sm:inline-block text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-cyan-400/80 font-mono text-[11px]">
              <FiShield className="text-xs" />
              <span>Decentralized & Encrypted Protocol</span>
            </span>
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#061226] hover:bg-[#0a1e3d] border border-cyan-500/25 hover:border-cyan-400 text-cyan-300 text-xs font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-sm"
          >
            <span>Back to top</span>
            <FiArrowUp className="text-sm" />
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer1;
