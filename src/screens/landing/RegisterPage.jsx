import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { getWalletAddress } from "../../utils/additionalFunc";
import { validateWalletAddress } from "../../utils/inputValidator";
import WalletOptionModal from "../../components/Screen/Landing/WalletOptionModal";
import { createUserApi, getSponsorByReferralApi } from "../../api/auth.api";
import { loginUser } from "../../redux/slices/authSlice";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  AuthenticatedUserRouters,
  LandingRouters,
} from "../../constants/routes";
import { MainContent } from "../../constants/mainContent";
import { User, Mail, Wallet, UserPlus, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorLoading, setSponsorLoading] = useState(false);

  const [formData, setFormData] = useState({
    referral: "",
    walletAddress: "",
    username: "",
    email: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (search) {
      const urlParams = new URLSearchParams(search);
      const referralCode =
        urlParams.get("referral") ||
        urlParams.get("ref") ||
        urlParams.get("referralCode") ||
        "";
      if (referralCode) {
        setFormData((prev) => ({
          ...prev,
          referral: referralCode.trim(),
        }));
      }
    }
  }, [search]);

  // Auto-fetch sponsor username when referral code is typed
  useEffect(() => {
    let active = true;
    const fetchSponsor = async () => {
      const ref = formData.referral.trim();
      if (ref.length >= 4) {
        setSponsorLoading(true);
        try {
          const res = await getSponsorByReferralApi(ref);
          if (active) {
            if (res?.success && res?.data?.username) {
              setSponsorName(res.data.username);
            } else {
              setSponsorName("");
            }
          }
        } catch {
          if (active) setSponsorName("");
        } finally {
          if (active) setSponsorLoading(false);
        }
      } else {
        setSponsorName("");
      }
    };

    const timer = setTimeout(fetchSponsor, 500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [formData.referral]);

  const handleChange = (e, field) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const validationErrors = {};
    let isValid = true;

    if (!formData.referral.trim()) {
      validationErrors.referral = "Referral code is mandatory";
      isValid = false;
    }

    if (!formData.username.trim()) {
      validationErrors.username = "Username is required";
      isValid = false;
    } else if (formData.username.trim().length < 3) {
      validationErrors.username = "Username must be at least 3 characters";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      validationErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email.trim())) {
      validationErrors.email = "Invalid email address format";
      isValid = false;
    }

    if (!formData.walletAddress.trim()) {
      validationErrors.walletAddress = "Please connect your Web3 wallet";
      isValid = false;
    } else {
      const walletErr = validateWalletAddress(formData.walletAddress);
      if (walletErr) {
        validationErrors.walletAddress = walletErr;
        isValid = false;
      }
    }

    setErrors(validationErrors);
    return isValid;
  };

  const handleRegisterClick = async (connectedWallet) => {
    const walletToUse = connectedWallet || formData.walletAddress;
    try {
      dispatch(setLoading(true));
      const response = await createUserApi({
        referral: formData.referral.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        walletAddress: walletToUse,
        password: walletToUse,
      });

      if (response?.success) {
        await dispatch(
          loginUser({
            token: response?.token,
            userId: response?.data?._id,
            role: response?.data?.role,
            data: response?.data,
          })
        );
        Swal.fire({
          icon: "success",
          title: "Registration Successful",
          text: "Welcome to NODEXAI! Your account has been activated.",
          timer: 2500,
        }).then(() => {
          navigate(AuthenticatedUserRouters.DASHBOARD);
        });
      } else {
        toast.error(response?.message || "Registration failed");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong during registration",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      handleRegisterClick();
    } else {
      toast.error("Please fill all required fields correctly.");
    }
  };

  const getWalletAddressConnect = async (type) => {
    try {
      dispatch(setLoading(true));
      const response = await getWalletAddress(type);
      setFormData((prev) => ({ ...prev, walletAddress: response }));
      sessionStorage.setItem("walletType", response);
      if (errors.walletAddress) {
        setErrors((prev) => ({ ...prev, walletAddress: "" }));
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Wallet Connect Failed",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Could not connect wallet",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <WalletOptionModal
        hide={() => setShowWalletModal(false)}
        connectWallet={(wallet) => getWalletAddressConnect(wallet)}
        show={showWalletModal}
      />
      <div
        className="text-white pt-24 pb-14 min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: "#020817" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(/bg.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.15,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,8,23,0.85) 0%, rgba(2,8,23,0.5) 50%, rgba(2,8,23,0.95) 100%)",
          }}
        />

        {/* Ambient Backlight Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-xl hero-glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-cyan-500/20 backdrop-blur-xl bg-[#030d1d]/85">
          {/* Header Brand */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center justify-center mb-4">
              <Link to={LandingRouters.DASHBOARD} className="group">
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-amber-400 to-cyan-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition duration-300" />
                  <img
                    src="/NodexAI.jpeg"
                    alt="NODEXAI"
                    className="relative h-22 sm:h-26 w-auto max-w-[260px] rounded-xl object-contain border border-cyan-400/40 shadow-[0_0_25px_rgba(0,210,255,0.35)] group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-slate-400 mt-3 uppercase">
                <span className="text-amber-400">BNB SMART CHAIN</span>
                <span>•</span>
                <span className="text-cyan-400">USDT (BEP-20)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 font-['Orbitron',monospace] tracking-wider">
              Create Your Account
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Join NODEXAI ecosystem and start earning 4.5% - 7.5% daily ROI
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Referral Code & Sponsor Info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                  Referral Code <span className="text-rose-400">*</span>
                </label>
                {sponsorLoading ? (
                  <span className="text-[11px] text-amber-400 animate-pulse">Checking sponsor...</span>
                ) : sponsorName ? (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Sponsor: {sponsorName}
                  </span>
                ) : null}
              </div>
              <input
                type="text"
                placeholder="Enter sponsor referral code (e.g. VLT123456)"
                className="w-full px-4 py-3 rounded-xl bg-[#06142a]/80 border border-cyan-500/25 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                value={formData.referral}
                onChange={(e) => handleChange(e, "referral")}
              />
              {errors.referral && <p className="text-rose-400 text-[11px] mt-1">{errors.referral}</p>}
            </div>

            {/* Username & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Username <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Choose unique username"
                  className="w-full px-4 py-3 rounded-xl bg-[#06142a]/80 border border-cyan-500/25 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  value={formData.username}
                  onChange={(e) => handleChange(e, "username")}
                />
                {errors.username && <p className="text-rose-400 text-[11px] mt-1">{errors.username}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 rounded-xl bg-[#06142a]/80 border border-cyan-500/25 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  value={formData.email}
                  onChange={(e) => handleChange(e, "email")}
                />
                {errors.email && <p className="text-rose-400 text-[11px] mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Wallet Address (Web3 Connect) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-400" />
                BNB Smart Chain Wallet <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Connect Web3 wallet to bind address"
                  readOnly
                  className="w-full px-4 py-3 pr-32 rounded-xl bg-[#06142a]/90 border border-cyan-500/25 text-cyan-300 font-mono text-xs sm:text-sm placeholder-slate-500 cursor-not-allowed truncate"
                  value={formData.walletAddress}
                />
                <button
                  type="button"
                  onClick={() => setShowWalletModal(true)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 transition-all shadow-[0_0_12px_rgba(0,210,255,0.3)] cursor-pointer"
                >
                  {formData.walletAddress ? "Change" : "Connect"}
                </button>
              </div>
              {errors.walletAddress && (
                <p className="text-rose-400 text-[11px] mt-1">{errors.walletAddress}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-center text-xs sm:text-sm font-bold tracking-wider uppercase text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:brightness-110 shadow-[0_0_25px_rgba(0,210,255,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-95 font-['Orbitron',monospace]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create NODEXAI Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-cyan-500/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
            <p>
              Already have an account?{" "}
              <Link
                to={LandingRouters.USER_LOGIN}
                className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors ml-1"
              >
                Log In
              </Link>
            </p>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Decentralized BEP-20</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
