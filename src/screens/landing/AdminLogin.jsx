import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { useState } from "react";
import { MainContent } from "../../constants/mainContent";
import { AuthenticatedUserRouters } from "../../constants/routes";
import { loginUser } from "../../redux/slices/authSlice";
import { setLoading } from "../../redux/slices/loadingSlice";
import { toast } from "react-toastify";
import { adminLogin } from "../../api/admin.api";
import { Shield, Mail, Lock, ArrowRight, Activity, Cpu, Database } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [payload, setPayload] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const response = await adminLogin(payload);
      if (response?.success) {
        await dispatch(
          loginUser({
            token: response?.token,
            userId: response?.data?._id,
            role: response?.data?.role,
            data: response?.data,
          })
        );
        localStorage.setItem("adminId", response?.data?._id);
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "Welcome to Admin Dashboard",
          timer: 2500,
          showConfirmButton: false,
        }).then(() => navigate(AuthenticatedUserRouters.DASHBOARD));
      } else {
        toast.error(response?.message || "Something went wrong");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleChange = (e, field) => {
    setPayload({ ...payload, [field]: e.target.value });
  };

  return (
    <>
      <style>{`
        @keyframes adm-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes adm-glow-breathe {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.05); }
        }
        @keyframes adm-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes adm-pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.08); opacity: 0.08; }
        }
        @keyframes adm-scan {
          0% { top: -2px; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes adm-spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes adm-btn-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 210, 255, 0.3), 0 0 40px rgba(59, 130, 246, 0.1); }
          50% { box-shadow: 0 0 30px rgba(0, 210, 255, 0.5), 0 0 60px rgba(59, 130, 246, 0.2); }
        }
        @keyframes adm-node-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.4); }
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#050914" }}>

        {/* Background image & Gradients */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url(/bg.jpg)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.15 }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(5,9,20,0.85) 0%, rgba(5,9,20,0.5) 50%, rgba(5,9,20,0.9) 100%)" }} />

        {/* Radial glows */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 50% at 25% 45%, rgba(0,210,255,0.1) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 45% 45% at 75% 55%, rgba(59,130,246,0.1) 0%, transparent 65%)", animation: "adm-glow-breathe 8s ease-in-out infinite" }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(90deg, rgba(0,210,255,0.5) 1px, transparent 1px), linear-gradient(0deg, rgba(0,210,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, #000 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, #000 20%, transparent 100%)",
        }} />

        {/* Floating particles */}
        {[
          { top: "12%", left: "10%", d: "0s", s: 3 },
          { top: "25%", right: "15%", d: "1s", s: 4 },
          { top: "60%", left: "8%", d: "2s", s: 3 },
          { top: "80%", right: "10%", d: "0.5s", s: 4 },
          { top: "45%", left: "85%", d: "1.5s", s: 3 },
        ].map((dot, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none" style={{
            top: dot.top, left: dot.left, right: dot.right,
            width: dot.s, height: dot.s, background: "#00D2FF",
            boxShadow: `0 0 ${dot.s * 3}px rgba(0,210,255,0.6)`,
            animation: `adm-node-pulse 3.5s ease-in-out infinite ${dot.d}`,
          }} />
        ))}

        {/* Scan line */}
        <div className="absolute left-0 right-0 h-[1px] pointer-events-none z-[1]" style={{ background: "linear-gradient(90deg, transparent, rgba(0,210,255,0.25), transparent)", animation: "adm-scan 10s linear infinite" }} />

        {/* ═══════ CONTENT CONTAINER ═══════ */}
        <div className="relative z-10 w-full max-w-6xl flex items-center justify-between gap-14 px-6 py-10">

          {/* ── Left: Login Card ── */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="relative rounded-2xl overflow-hidden" style={{
              background: "linear-gradient(rgba(10, 17, 34, 0.75), rgba(10, 17, 34, 0.75)) padding-box, linear-gradient(135deg, rgba(0, 210, 255, 0.25), rgba(59, 130, 246, 0.25)) border-box",
              border: "1px solid transparent",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,210,255,0.08)",
            }}>
              {/* Top edge glow */}
              <div className="absolute top-0 left-[10%] right-[10%] h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(0,210,255,0.6), transparent)" }} />

              <div className="p-8 md:p-10">
                {/* Official Logo */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative group">
                    <div className="p-1 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_25px_rgba(0,210,255,0.4)] transition-all duration-300 group-hover:shadow-[0_0_35px_rgba(0,210,255,0.6)]">
                      <img
                        src={MainContent.fullLogo}
                        alt="Veltrion Capital Logo"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-slate-400 mt-2">
                    <span className="text-amber-400">VELTRION CAPITAL</span>
                    <span>•</span>
                    <span className="text-[#00D2FF]">INVEST • GROW • EARN</span>
                  </div>
                </div>

                {/* Badge */}
                <div className="flex justify-center mb-5">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full" style={{
                    background: "linear-gradient(rgba(0,210,255,0.05), rgba(0,210,255,0.05)) padding-box, linear-gradient(135deg, rgba(0,210,255,0.25), rgba(59,130,246,0.25)) border-box",
                    border: "1px solid transparent",
                  }}>
                    <Shield size={13} style={{ color: "#00D2FF" }} />
                    <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, fontFamily: "'Orbitron', monospace", background: "#fff", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      Secure Admin Access
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                  <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(1.4rem, 3.5vw, 1.8rem)", fontWeight: 800, marginBottom: 8 }}>
                    <span className="text-white">Admin </span>
                    <span style={{ background: "linear-gradient(135deg, #00D2FF, #3B82F6)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto", animation: "adm-shimmer 4s linear infinite", filter: "drop-shadow(0 0 30px rgba(0,210,255,0.4))" }}>Portal</span>
                  </h1>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Sign in to manage Veltrion Capital platform</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="text-xs tracking-wider uppercase font-semibold mb-2 block" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Orbitron', monospace" }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: focusedField === "email" ? "#00D2FF" : "rgba(255,255,255,0.25)" }} />
                      <input
                        type="email"
                        placeholder="admin@example.com"
                        className="w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300"
                        style={{
                          background: "rgba(0,210,255,0.03)",
                          border: focusedField === "email" ? "1px solid rgba(0,210,255,0.4)" : "1px solid rgba(255,255,255,0.08)",
                          boxShadow: focusedField === "email" ? "0 0 20px rgba(0,210,255,0.12)" : "none",
                        }}
                        value={payload.email}
                        onChange={(e) => handleChange(e, "email")}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs tracking-wider uppercase font-semibold mb-2 block" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Orbitron', monospace" }}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: focusedField === "password" ? "#00D2FF" : "rgba(255,255,255,0.25)" }} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        className="w-full rounded-xl py-3.5 pl-11 pr-16 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-300"
                        style={{
                          background: "rgba(0,210,255,0.03)",
                          border: focusedField === "password" ? "1px solid rgba(0,210,255,0.4)" : "1px solid rgba(255,255,255,0.08)",
                          boxShadow: focusedField === "password" ? "0 0 20px rgba(0,210,255,0.12)" : "none",
                        }}
                        value={payload.password}
                        onChange={(e) => handleChange(e, "password")}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] tracking-wider uppercase font-bold cursor-pointer transition-colors duration-200"
                        style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Orbitron', monospace" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#00D2FF"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-xs tracking-widest uppercase cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
                    style={{
                      fontFamily: "'Orbitron', monospace",
                      background: "linear-gradient(135deg, #00D2FF, #3B82F6)",
                      color: "#000",
                      animation: "adm-btn-glow 3s ease-in-out infinite",
                      marginTop: 8,
                    }}
                  >
                    Sign In
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00D2FF", boxShadow: "0 0 6px #00D2FF" }} />
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Enterprise-grade security enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Futuristic Hub Showcase ── */}
          <div className="hidden lg:flex flex-col items-center w-1/2 space-y-8">
            <div className="relative flex items-center justify-center">
              {/* Radial glow */}
              <div className="absolute w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,210,255,0.18) 0%, rgba(59,130,246,0.06) 45%, transparent 70%)", filter: "blur(30px)" }} />

              {/* Pulsing orbit rings */}
              <div className="absolute w-72 h-72 rounded-full pointer-events-none" style={{ border: "1px dashed rgba(0,210,255,0.25)", animation: "adm-spin-slow 25s linear infinite" }} />
              <div className="absolute w-60 h-60 rounded-full pointer-events-none" style={{ border: "1px solid rgba(59,130,246,0.2)", animation: "adm-pulse-ring 4s ease-in-out infinite" }} />

              {/* Center Holographic Logo Card */}
              <div
                className="relative z-10 p-6 rounded-3xl flex flex-col items-center text-center backdrop-blur-xl"
                style={{
                  background: "linear-gradient(rgba(10, 18, 38, 0.85), rgba(5, 10, 24, 0.9)) padding-box, linear-gradient(135deg, rgba(0, 210, 255, 0.35), rgba(59, 130, 246, 0.35)) border-box",
                  border: "1px solid transparent",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0,210,255,0.15)",
                  animation: "adm-float 6s ease-in-out infinite",
                }}
              >
                <div className="relative mb-4">
                  <div className="p-1 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_30px_rgba(0,210,255,0.5)]">
                    <img
                      src={MainContent.fullLogo}
                      alt="Veltrion Capital"
                      className="w-48 h-auto rounded-xl object-contain"
                    />
                  </div>
                </div>

                <h3 className="text-xl font-bold font-['Orbitron',monospace] text-white">
                  Veltrion <span className="text-amber-400">Capital</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
                  Autonomous Protocol Engine
                </p>

                {/* Floating Metric Badges */}
                <div className="grid grid-cols-2 gap-2 mt-5 w-full">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-left">
                    <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase">Core Status</div>
                      <div className="text-[11px] font-bold text-cyan-300">Operational</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-950/40 border border-blue-500/20 text-left">
                    <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase">Engine</div>
                      <div className="text-[11px] font-bold text-blue-300">PEH Core v2</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center max-w-md">
              <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(1.4rem, 3vw, 1.8rem)", fontWeight: 800, marginBottom: 8 }}>
                <span className="text-white">Control & </span>
                <span style={{ background: "linear-gradient(135deg, #00D2FF, #3B82F6)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto", animation: "adm-shimmer 4s linear infinite", filter: "drop-shadow(0 0 30px rgba(0,210,255,0.4))" }}>Monitor</span>
              </h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                Powerful administrative dashboard to manage and scale Veltrion Capital platform securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
