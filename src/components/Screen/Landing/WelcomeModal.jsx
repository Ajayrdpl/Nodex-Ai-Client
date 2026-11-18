import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { LandingRouters, AuthenticatedUserRouters } from "../../../constants/routes";

const WelcomeModal = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const isLoggedIn = useSelector((state) => state?.isLoggedUser?.isLoggedIn);

  const handleClose = () => {
    setOpen(false);
  };

  const handleAction = () => {
    setOpen(false);
    if (isLoggedIn) {
      navigate(AuthenticatedUserRouters?.MY_REFERRALS || "/my-referrals");
    } else {
      navigate(LandingRouters?.USER_REGISTER || "/register");
    }
  };

  const handleLogin = () => {
    setOpen(false);
    navigate(LandingRouters?.USER_LOGIN || "/login");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="welcome-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Background Backdrop */}
          <div
            className="welcome-backdrop"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            className="welcome-modal"
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 20,
            }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Close Button */}
            <button
              className="welcome-close"
              onClick={handleClose}
              aria-label="Close"
            >
              ×
            </button>

            {/* Top 3D Animated Referral Coin */}
            <motion.div
              className="bonus-wrapper"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="bonus-orbit">
                <span className="orbit-dot" />
              </div>

              <div className="bonus-coin">
                <div className="bonus-percent">10%</div>
                <div className="bonus-label">DIRECT</div>
              </div>
            </motion.div>

            {/* Modal Content */}
            <div className="welcome-content">
              {/* Badge */}
              <div className="offer-tag">
                <span className="offer-dot" />
                DIRECT REFERRAL PROGRAM
              </div>

              {/* Heading */}
              <h2>
                Refer & Earn
                <br />
                <span>10% Direct Commission</span>
              </h2>

              {/* Description */}
              <p>
                Invite friends and network partners. Receive an{" "}
                <strong>instant 10% direct commission</strong> straight to your wallet on every investment.
              </p>

              {/* Example Calculation Box */}
              <div className="bonus-example">
                <div className="example-item">
                  <span className="example-label">
                    FRIEND'S INVESTMENT
                  </span>
                  <span className="example-value">
                    100 USDT
                  </span>
                </div>

                <div className="example-symbol">
                  ➔
                </div>

                <div className="example-item">
                  <span className="example-label">
                    YOUR 10% COMMISSION
                  </span>
                  <span className="example-value bonus-value">
                    +10 USDT
                  </span>
                </div>
              </div>

              {/* Perks / Features Row */}
              <div className="referral-perks">
                <div className="perk-pill">
                  <span>⚡</span> Instant Credit
                </div>
                <div className="perk-pill">
                  <span>👥</span> Unlimited Invites
                </div>
                <div className="perk-pill">
                  <span>💰</span> 10% On Every Deposit
                </div>
              </div>

              {/* CTA Button */}
              <button
                className="welcome-invest"
                onClick={handleAction}
              >
                <span>{isLoggedIn ? "Get Your Referral Link" : "Join Now & Start Referring"}</span>
                <span className="arrow">→</span>
              </button>

              {/* Maybe Later */}
              <button
                className="welcome-later"
                onClick={handleClose}
              >
                Maybe later
              </button>

              {/* Divider */}
              <div className="welcome-divider" />

              {/* Login / Switch */}
              {!isLoggedIn ? (
                <div className="welcome-login">
                  Already have an account?{" "}
                  <button onClick={handleLogin}>
                    Log in
                  </button>
                </div>
              ) : (
                <div className="welcome-login">
                  Ready to invite? Head over to your{" "}
                  <button onClick={handleAction}>
                    Referral Dashboard
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          <style>{`
            /* ================================
               OVERLAY
            ================================= */
            .welcome-overlay {
              position: fixed;
              inset: 0;
              z-index: 99999;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 16px;
              font-family: 'Poppins', sans-serif;
            }

            .welcome-backdrop {
              position: absolute;
              inset: 0;
              background: radial-gradient(
                circle at center,
                rgba(2, 6, 23, 0.75),
                rgba(0, 0, 0, 0.94)
              );
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
            }

            /* ================================
               MODAL (Compact & Premium)
            ================================= */
            .welcome-modal {
              position: relative;
              z-index: 2;
              width: min(100%, 460px);
              max-height: 90vh;
              overflow-y: auto;
              padding: 95px 26px 22px;
              border-radius: 24px;
              background: linear-gradient(
                160deg,
                rgba(11, 20, 38, 0.98),
                rgba(5, 10, 20, 0.99)
              );
              border: 1px solid rgba(0, 210, 255, 0.28);
              box-shadow:
                0 20px 60px rgba(0, 0, 0, 0.9),
                0 0 40px rgba(0, 210, 255, 0.12),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
              text-align: center;
              scrollbar-width: none;
            }

            .welcome-modal::-webkit-scrollbar {
              display: none;
            }

            .welcome-modal::before {
              content: "";
              position: absolute;
              inset: 1px;
              border-radius: 23px;
              pointer-events: none;
              border: 1px solid rgba(255, 255, 255, 0.04);
            }

            /* ================================
               CLOSE BUTTON
            ================================= */
            .welcome-close {
              position: absolute;
              top: 14px;
              right: 14px;
              width: 34px;
              height: 34px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              border: 1px solid rgba(255, 255, 255, 0.12);
              background: rgba(255, 255, 255, 0.05);
              color: #94a3b8;
              font-size: 20px;
              font-weight: 300;
              cursor: pointer;
              transition: all 0.25s ease;
              z-index: 10;
            }

            .welcome-close:hover {
              color: #00D2FF;
              border-color: rgba(0, 210, 255, 0.5);
              background: rgba(0, 210, 255, 0.1);
              transform: rotate(90deg);
            }

            /* ================================
               BONUS COIN (Cyan/Blue Brand Theme)
            ================================= */
            .bonus-wrapper {
              position: absolute;
              top: 10px;
              left: 0;
              right: 0;
              margin: 0 auto;
              width: 105px;
              height: 105px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .bonus-orbit {
              position: absolute;
              inset: 0;
              border-radius: 50%;
              border: 1.5px dashed rgba(0, 210, 255, 0.4);
              animation: bonus-spin 12s linear infinite;
            }

            .orbit-dot {
              position: absolute;
              width: 8px;
              height: 8px;
              top: 6px;
              right: 10px;
              border-radius: 50%;
              background: #00D2FF;
              box-shadow:
                0 0 8px #00D2FF,
                0 0 16px rgba(0, 210, 255, 0.9);
            }

            .bonus-coin {
              position: relative;
              width: 82px;
              height: 82px;
              border-radius: 50%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: radial-gradient(
                circle at 35% 25%,
                #a5f3fc 0%,
                #38bdf8 25%,
                #0284c7 65%,
                #0369a1 100%
              );
              border: 3px solid #38bdf8;
              box-shadow:
                inset 0 0 14px rgba(255, 255, 255, 0.6),
                inset 0 -8px 14px rgba(2, 44, 80, 0.4),
                0 0 24px rgba(0, 210, 255, 0.4),
                0 8px 20px rgba(0, 0, 0, 0.6);
            }

            .bonus-coin::after {
              content: "";
              position: absolute;
              inset: 4px;
              border-radius: 50%;
              border: 1px solid rgba(255, 255, 255, 0.5);
            }

            .bonus-percent {
              position: relative;
              z-index: 2;
              color: #041b2d;
              font-size: 22px;
              font-weight: 900;
              line-height: 1;
              font-family: 'Orbitron', monospace;
            }

            .bonus-label {
              position: relative;
              z-index: 2;
              margin-top: 2px;
              color: #041b2d;
              font-size: 8px;
              font-weight: 900;
              letter-spacing: 0.12em;
              font-family: 'Orbitron', monospace;
            }

            @keyframes bonus-spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }

            /* ================================
               OFFER TAG
            ================================= */
            .offer-tag {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 4px 12px;
              border-radius: 30px;
              background: rgba(0, 210, 255, 0.08);
              border: 1px solid rgba(0, 210, 255, 0.28);
              color: #00D2FF;
              font-family: 'Orbitron', monospace;
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.1em;
            }

            .offer-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #00D2FF;
              box-shadow: 0 0 6px #00D2FF;
              animation: offer-pulse 1.8s ease-in-out infinite;
            }

            @keyframes offer-pulse {
              0%, 100% {
                opacity: 1;
                transform: scale(1);
              }
              50% {
                opacity: 0.4;
                transform: scale(0.85);
              }
            }

            /* ================================
               CONTENT
            ================================= */
            .welcome-content {
              position: relative;
              z-index: 3;
            }

            .welcome-content h2 {
              margin: 10px 0 0;
              color: #fff;
              font-size: clamp(20px, 3.5vw, 24px);
              line-height: 1.2;
              font-weight: 900;
              font-family: 'Orbitron', monospace;
              letter-spacing: -0.3px;
            }

            .welcome-content h2 span {
              background: linear-gradient(
                135deg,
                #67e8f9,
                #00D2FF,
                #38bdf8
              );
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              filter: drop-shadow(0 0 15px rgba(0, 210, 255, 0.3));
            }

            .welcome-content p {
              margin: 8px auto 14px;
              max-width: 390px;
              color: rgba(255, 255, 255, 0.7);
              font-size: 13px;
              line-height: 1.5;
            }

            .welcome-content p strong {
              color: #00D2FF;
              font-weight: 700;
            }

            /* ================================
               BONUS EXAMPLE
            ================================= */
            .bonus-example {
              width: 100%;
              max-width: 390px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              margin: 12px auto;
              padding: 10px 14px;
              border-radius: 12px;
              background: linear-gradient(
                145deg,
                rgba(0, 210, 255, 0.06),
                rgba(255, 255, 255, 0.02)
              );
              border: 1px solid rgba(0, 210, 255, 0.18);
            }

            .example-item {
              display: flex;
              flex-direction: column;
              gap: 2px;
              flex: 1;
            }

            .example-label {
              color: rgba(255, 255, 255, 0.45);
              font-family: 'Orbitron', monospace;
              font-size: 8px;
              letter-spacing: 0.08em;
              font-weight: 700;
            }

            .example-value {
              color: #fff;
              font-size: 15px;
              font-weight: 800;
              font-family: 'Orbitron', monospace;
            }

            .bonus-value {
              color: #00D2FF;
              text-shadow: 0 0 10px rgba(0, 210, 255, 0.3);
            }

            .example-symbol {
              width: 26px;
              height: 26px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              color: #00D2FF;
              background: rgba(0, 210, 255, 0.12);
              font-size: 13px;
              font-weight: 800;
            }

            /* ================================
               PERKS ROW
            ================================= */
            .referral-perks {
              display: flex;
              align-items: center;
              justify-content: center;
              flex-wrap: wrap;
              gap: 6px;
              margin: 0 auto 16px;
            }

            .perk-pill {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 4px 10px;
              border-radius: 20px;
              background: rgba(255, 255, 255, 0.04);
              border: 1px solid rgba(0, 210, 255, 0.15);
              color: rgba(255, 255, 255, 0.85);
              font-size: 11px;
              font-weight: 600;
            }

            .perk-pill span {
              font-size: 11px;
            }

            /* ================================
               CTA BUTTON
            ================================= */
            .welcome-invest {
              width: 100%;
              max-width: 390px;
              height: 48px;
              border: none;
              border-radius: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              margin: 0 auto;
              background: linear-gradient(
                135deg,
                #00D2FF 0%,
                #3B82F6 100%
              );
              color: #030712;
              font-family: 'Orbitron', monospace;
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 0.03em;
              cursor: pointer;
              box-shadow: 0 8px 20px rgba(0, 210, 255, 0.35);
              transition: all 0.3s ease;
            }

            .welcome-invest:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 28px rgba(0, 210, 255, 0.5);
            }

            .arrow {
              font-size: 16px;
              transition: transform 0.25s ease;
            }

            .welcome-invest:hover .arrow {
              transform: translateX(4px);
            }

            /* ================================
               MAYBE LATER
            ================================= */
            .welcome-later {
              display: block;
              margin: 10px auto 0;
              border: none;
              background: transparent;
              color: rgba(255, 255, 255, 0.45);
              font-family: inherit;
              font-size: 12px;
              font-weight: 500;
              cursor: pointer;
              transition: color 0.25s ease;
            }

            .welcome-later:hover {
              color: #fff;
            }

            /* ================================
               DIVIDER
            ================================= */
            .welcome-divider {
              width: 100%;
              height: 1px;
              margin: 14px 0 10px;
              background: linear-gradient(
                90deg,
                transparent,
                rgba(0, 210, 255, 0.2),
                transparent
              );
            }

            /* ================================
               LOGIN
            ================================= */
            .welcome-login {
              color: rgba(255, 255, 255, 0.55);
              font-size: 12px;
            }

            .welcome-login button {
              padding: 0;
              border: none;
              background: transparent;
              color: #00D2FF;
              font: inherit;
              font-weight: 700;
              cursor: pointer;
              transition: color 0.2s ease;
            }

            .welcome-login button:hover {
              color: #67e8f9;
              text-decoration: underline;
            }

            /* ================================
               RESPONSIVE (MOBILE)
            ================================= */
            @media (max-width: 480px) {
              .welcome-modal {
                padding: 85px 18px 18px;
                border-radius: 20px;
              }

              .bonus-wrapper {
                width: 90px;
                height: 90px;
              }

              .bonus-coin {
                width: 70px;
                height: 70px;
              }

              .bonus-percent {
                font-size: 18px;
              }

              .bonus-label {
                font-size: 7px;
              }

              .welcome-content h2 {
                font-size: 19px;
              }

              .welcome-content p {
                font-size: 12px;
              }

              .example-value {
                font-size: 13px;
              }

              .welcome-invest {
                height: 44px;
                font-size: 12px;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;