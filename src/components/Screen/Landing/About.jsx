import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiCpu, FiUsers, FiDollarSign, FiShield, FiCheckCircle } from "react-icons/fi";

const coreValues = [
  {
    number: "01",
    title: "TRANSPARENCY",
    subtitle: "Clear Ecosystem Rules",
    desc: "Clear ecosystem rules, fully automated on-chain processes, and clearly defined participation criteria.",
    icon: <FiEye className="text-xl" />,
    color: "#00D2FF",
    stats: "100% Verifiable",
  },
  {
    number: "02",
    title: "DECENTRALIZATION",
    subtitle: "Smart Contract Architecture",
    desc: "Built around blockchain technology and smart contracts on BNB Smart Chain for trustless participation.",
    icon: <FiCpu className="text-xl" />,
    color: "#D6A83A",
    stats: "Smart Contract",
  },
  {
    number: "03",
    title: "COMMUNITY DRIVEN",
    subtitle: "Global Network Growth",
    desc: "Designed to encourage active participation, community collaboration, and transparent network rewards.",
    icon: <FiUsers className="text-xl" />,
    color: "#00D2FF",
    stats: "10-Level Depth",
  },
  {
    number: "04",
    title: "ACCESSIBILITY",
    subtitle: "Low-Barrier Entry",
    desc: "Flexible participation options starting from only $10 USDT, making financial freedom accessible to everyone.",
    icon: <FiDollarSign className="text-xl" />,
    color: "#D6A83A",
    stats: "Starting $10",
  },
  {
    number: "05",
    title: "SUSTAINABILITY",
    subtitle: "Long-Term Viability",
    desc: "Disciplined mathematical caps with 220% maximum ROI limits ensuring responsible long-term growth.",
    icon: <FiShield className="text-xl" />,
    color: "#10b981",
    stats: "220% Max Cap",
  },
];

const AboutSafealtCoin = () => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Tech Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 210, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 210, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/25 mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              ABOUT VELTRION CAPITAL • CORE VALUES
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight leading-tight"
          >
            Building A Smarter{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
              DeFi Ecosystem
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={visible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed"
          >
            <strong className="text-amber-400 font-semibold">Veltrion Capital</strong> brings together blockchain technology, smart contracts, community participation, and a structured reward ecosystem in one unified decentralized platform.
          </motion.p>
        </div>

        {/* 5 Core Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {coreValues.map((item, index) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 25 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="relative group p-6 rounded-2xl bg-gradient-to-b from-[#07152d]/80 to-[#030c1d]/95 border border-slate-800 hover:border-amber-400/50 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
            >
              {/* Top Accent Line */}
              <div
                className="absolute top-0 inset-x-0 h-1 transition-all duration-300 opacity-60 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`,
                }}
              />

              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${item.color}15`,
                      borderColor: `${item.color}40`,
                      color: item.color,
                      boxShadow: `0 0 15px ${item.color}20`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="text-xs font-mono font-bold tracking-widest opacity-80"
                    style={{ color: item.color }}
                  >
                    {item.number}
                  </span>
                </div>

                <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-1">
                  {item.subtitle}
                </div>

                <h3 className="text-base font-bold text-white font-['Orbitron',sans-serif] tracking-wide mb-2.5">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Card Footer Metric */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Key Metric</span>
                <span
                  className="font-mono font-bold text-[11px] flex items-center gap-1.5"
                  style={{ color: item.color }}
                >
                  <FiCheckCircle className="text-xs" />
                  {item.stats}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* The Veltrion Approach Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#051833]/90 via-[#0a2347]/80 to-[#051833]/90 border border-amber-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-amber-400 font-bold">
              THE VELTRION CAPITAL APPROACH
            </span>
            <h4 className="text-lg sm:text-2xl font-bold font-['Orbitron',sans-serif] text-white">
              ACCESS • PARTICIPATE • CONNECT • BUILD • GROW
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              ⚡ Powered By Technology | 👥 Driven By Community. Designed with simplicity and accessibility in mind, providing multiple ways for participants to engage from package-based participation to compounding features.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-amber-950/60 border border-amber-400/40 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Starting Slabs</div>
              <div className="text-xl font-black font-['Orbitron',sans-serif] text-amber-300">From $10</div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-cyan-950/60 border border-cyan-400/40 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Max ROI Capping</div>
              <div className="text-xl font-black font-['Orbitron',sans-serif] text-cyan-300">Up to 220%</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutSafealtCoin;
