import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { LandingRouters } from "../../../constants/routes";
import { FiTrendingUp, FiShield, FiZap, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { RiRobot2Fill } from "react-icons/ri";

/* ── Animated Counter Component ── */
const Counter = ({ target, prefix = "", suffix = "", decimals = 0 }) => {
  const [display, setDisplay] = useState("0");
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const numeric = parseFloat(String(target).replace(/[^0-9.]/g, ""));
          const ctrl = animate(0, numeric, {
            duration: 2.2,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => {
              if (decimals > 0) setDisplay(v.toFixed(decimals));
              else setDisplay(Math.floor(v).toLocaleString());
            },
            onComplete: () => setDisplay(String(target).replace(/[^0-9.,]/g, "")),
          });
          return () => ctrl.stop();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, decimals]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { damping: 45, stiffness: 180 });
  const springY = useSpring(cursorY, { damping: 45, stiffness: 180 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const handleMove = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [cursorX, cursorY, isMobile]);

  /* ── Interactive Particle Background ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const count = Math.min(Math.floor((width * height) / 22000), 55);
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
      color: Math.random() > 0.4 ? "rgba(214, 168, 58, " : "rgba(0, 210, 255, ",
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ")";
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(0, 210, 255, " + (0.12 * (1 - dist / 110)) + ")";
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const fadeLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  const fadeRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <>

      {!isMobile && (
        <motion.div
          style={{
            x: springX,
            y: springY,
            position: "fixed",
            width: 32,
            height: 32,
            border: "1.5px solid rgba(214,168,58,0.5)",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 9999,
            boxShadow: "0 0 12px rgba(214,168,58,0.4)",
          }}
        />
      )}

      <section id="home" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#020817] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl bg-[radial-gradient(ellipse_at_center,rgba(214,168,58,0.06)_0%,transparent_70%)] pointer-events-none" />

        {/* Tech Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 210, 255, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 210, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 100%)",
          }}
        />

        {/* Interactive Particles Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50" />

        {/* Main Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* ── LEFT COLUMN: Hero Copy & Stats ── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left"
            >
              {/* Status Badge */}
              <motion.div variants={fadeLeft} className="mb-4">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/30 backdrop-blur-md shadow-[0_0_15px_rgba(214,168,58,0.2)]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-xs font-semibold tracking-wider text-amber-300 font-mono uppercase">
                    SMART CONTRACT • COMMUNITY DRIVEN • DECENTRALIZED
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-400/20 text-amber-200">
                    BEP-20
                  </span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.div variants={fadeLeft} className="space-y-2">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] font-['Orbitron',sans-serif]">
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                    VELTRION
                  </span>{" "}
                  <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                    CAPITAL
                  </span>
                </h1>
                <p className="text-sm sm:text-base font-semibold tracking-[0.2em] uppercase text-cyan-300 font-mono">
                  INVEST • GROW • EARN — THE FUTURE OF DEFI
                </p>
              </motion.div>

              {/* Subtitle / Value Pitch */}
              <motion.p
                variants={fadeLeft}
                className="mt-5 text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl"
              >
                Discover a next-generation DeFi ecosystem designed around blockchain technology with{" "}
                <span className="text-amber-300 font-semibold underline decoration-amber-500/40 underline-offset-4">
                  4.5% to 7.5% Daily ROI
                </span>
                , 10-Level Affiliate Rewards, Auto Compounding, and up to{" "}
                <span className="text-cyan-300 font-semibold">220% Maximum Return Cap</span>.
              </motion.p>

              {/* Key Metric Highlights */}
              <motion.div
                variants={fadeLeft}
                className="mt-7 grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg"
              >
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#08152c]/70 border border-amber-500/20 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:border-amber-400/50 transition-all duration-300">
                  <div className="flex items-center justify-between text-amber-400 mb-1">
                    <FiTrendingUp className="text-sm sm:text-base" />
                    <span className="text-[9px] font-mono text-amber-400/80 uppercase">Daily ROI</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-black font-['Orbitron',sans-serif] bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                    4.5% - 7.5%
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">6 Package Tiers</div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#08152c]/70 border border-cyan-500/15 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:border-cyan-400/40 transition-all duration-300">
                  <div className="flex items-center justify-between text-cyan-400 mb-1">
                    <FiShield className="text-sm sm:text-base" />
                    <span className="text-[9px] font-mono text-cyan-400/70 uppercase">Max Cap</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-black font-['Orbitron',sans-serif] text-cyan-300">
                    220%
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Overall ROI Limit</div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#08152c]/70 border border-emerald-500/20 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:border-emerald-400/40 transition-all duration-300">
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <FiZap className="text-sm sm:text-base" />
                    <span className="text-[9px] font-mono text-emerald-400/80 uppercase">Min Start</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-black font-['Orbitron',sans-serif] text-white">
                    $10
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">USDT (BEP-20)</div>
                </div>
              </motion.div>

              {/* Call-to-Action Buttons */}
              <motion.div
                variants={fadeLeft}
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full"
              >
                <button
                  onClick={() => navigate(LandingRouters.USER_REGISTER)}
                  className="relative group px-7 py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_45px_rgba(245,158,11,0.6)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer font-['Orbitron',sans-serif]"
                >
                  <RiRobot2Fill className="text-lg text-slate-950" />
                  <span>Start Participating</span>
                  <FiArrowRight className="text-base group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate(LandingRouters.USER_LOGIN)}
                  className="px-6 py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-amber-400/50 bg-[#0a172e]/60 hover:bg-amber-500/10 backdrop-blur-md transition-all duration-300 flex items-center gap-2 cursor-pointer"
                >
                  <span>Connect Wallet</span>
                </button>
              </motion.div>

              {/* Trust Micro-Bullets */}
              <motion.div
                variants={fadeLeft}
                className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-400"
              >
                <div className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-400" />
                  <span>Min Start: $10</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-400" />
                  <span>BNB Smart Chain (BEP-20)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-400" />
                  <span>10-Level Community Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-400" />
                  <span>+0.5% Auto Compounding</span>
                </div>
              </motion.div>
            </motion.div>

            {/* ── RIGHT COLUMN: Official Brand Logo Showcase ── */}
            <motion.div
              variants={fadeRight}
              initial="hidden"
              animate="visible"
              className="lg:col-span-5 flex items-center justify-center relative"
            >
              <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
                
                {/* Orbit Rings with Glowing Particles */}
                <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-[spin_30s_linear_infinite]" />
                <div className="absolute inset-8 rounded-full border border-dashed border-cyan-400/25 animate-[spin_20s_linear_infinite_reverse]" />
                <div className="absolute inset-16 rounded-full border border-amber-400/25 animate-[spin_15s_linear_infinite]" />
                
                {/* Radial Glow Core */}
                <div className="absolute inset-20 rounded-full bg-gradient-to-tr from-amber-500/20 via-cyan-600/15 to-blue-500/10 blur-2xl" />

                {/* Orbiting Satellite Dot */}
                <div className="absolute inset-0 animate-[spin_12s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_15px_#f59e0b]" />
                </div>

                {/* Floating Telemetry Badge 1 */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-2 left-2 z-20 px-3.5 py-2 rounded-xl bg-[#08152c]/90 border border-amber-400/40 backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.6)] flex items-center gap-2.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-amber-300 font-mono">Network</span>
                    <span className="text-[9px] text-cyan-300">BNB Smart Chain (BEP-20)</span>
                  </div>
                </motion.div>

                {/* Floating Telemetry Badge 2 */}
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-2 right-2 z-20 px-3.5 py-2 rounded-xl bg-[#08152c]/90 border border-cyan-400/40 backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.6)] flex items-center gap-2.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00D2FF]" />
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-cyan-300 font-mono">Maximum ROI Cap</span>
                    <span className="text-[9px] text-emerald-400 font-semibold">220% Total Return</span>
                  </div>
                </motion.div>

                {/* Official Veltrion Logo Card */}
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-full p-4 flex items-center justify-center"
                >
                  <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#091b3a]/90 via-[#040e21]/95 to-[#020817] border border-amber-400/40 p-4 sm:p-6 shadow-[0_0_60px_rgba(214,168,58,0.3)] flex flex-col items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(214,168,58,0.18),transparent_70%)]" />
                    
                    {/* Official Veltrion Logo Image as specified */}
                    <img
                      src="/image/veltrion-logo.jpg"
                      alt="Veltrion Capital"
                      className="relative z-10 w-full h-auto max-h-[260px] object-contain rounded-2xl filter drop-shadow-[0_0_35px_rgba(214,168,58,0.45)] group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="relative z-10 mt-4 text-center">
                      <span className="text-xs font-mono font-bold tracking-widest text-amber-300 uppercase">
                        Powering Your Financial Freedom with USDT
                      </span>
                    </div>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
