import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { useState } from "react";
import { MainContent } from "../../constants/mainContent";
import {
  AuthenticatedUserRouters,
  LandingRouters,
} from "../../constants/routes";
import { loginUser } from "../../redux/slices/authSlice";
import { getWalletAddress } from "../../utils/additionalFunc";
import { setLoading } from "../../redux/slices/loadingSlice";
import { loginUserApi } from "../../api/auth.api";
import WalletOptionModal from "../../components/Screen/Landing/WalletOptionModal";
import { toast } from "react-toastify";
import { Wallet, ShieldCheck, ArrowRight } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const getWalletAddressConnect = async (type) => {
    try {
      dispatch(setLoading(true));
      const response = await getWalletAddress(type);
      handleLogin(response);
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Wallet Connect Failed",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
      });
      dispatch(setLoading(false));
    }
  };

  const handleLogin = async (walletAddress) => {
    try {
      dispatch(setLoading(true));
      const response = await loginUserApi({ walletAddress });
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
          title: "Login Success",
          text: "You have logged in successfully to Veltrion Capital",
          timer: 2500,
        }).then(() => {
          navigate(AuthenticatedUserRouters.DASHBOARD);
        });
      } else {
        toast.error(response?.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong",
        timer: 3000,
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
        className="text-ecru pt-24 pb-12 min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: "#020817" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "url(/bg.jpg)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", opacity: 0.15 }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(2,8,23,0.85) 0%, rgba(2,8,23,0.5) 50%, rgba(2,8,23,0.95) 100%)" }} />

        {/* Ambient Backlight Glows */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md hero-glass rounded-3xl p-8 shadow-2xl border border-cyan-500/20 text-center space-y-6 backdrop-blur-xl bg-[#030d1d]/80">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-4">
            <Link to={LandingRouters.DASHBOARD} className="group">
              <div className="relative">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-amber-400 to-cyan-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition duration-300" />
                <img
                  src="/image/veltrion-logo.jpg"
                  alt="Veltrion Capital"
                  className="relative h-24 sm:h-28 w-auto max-w-[280px] rounded-xl object-contain border border-cyan-400/40 shadow-[0_0_25px_rgba(0,210,255,0.35)] group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-slate-400 mt-4 uppercase">
              <span className="text-amber-400">BNB SMART CHAIN</span>
              <span>•</span>
              <span className="text-cyan-400">USDT (BEP-20)</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron',monospace] tracking-wider">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Connect your decentralized Web3 wallet to access your Veltrion Capital dashboard
            </p>
          </div>

          {/* Wallet Connect */}
          <div className="space-y-4 pt-4">
            <button
              onClick={() => setShowWalletModal(true)}
              className="w-full cursor-pointer rounded-xl flex items-center justify-center gap-3 py-3.5 font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_25px_rgba(0,210,255,0.3)] bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 text-white font-['Orbitron',monospace]"
            >
              <Wallet className="w-5 h-5 text-white" />
              <span>Connect Wallet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure non-custodial cryptographic authentication</span>
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="text-xs pt-4 border-t border-cyan-500/15">
            <p className="text-slate-400">
              New to Veltrion Capital?{" "}
              <Link
                to={LandingRouters.USER_REGISTER}
                className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors ml-1"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
