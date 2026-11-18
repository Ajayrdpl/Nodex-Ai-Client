// // import React from "react";
// // import { motion } from "framer-motion";

// // const pillars = [
// //   {
// //     title: "About Us",
// //     body: "The Sui Group brings over 20 years of experience in crafting bespoke AI solutions across multiple industries, combining research, automation, and secure digital infrastructure.",
// //     accent: "AI + Strategy",
// //   },
// //   {
// //     title: "Project Overview",
// //     body: "This initiative develops advanced machine learning models and intelligent systems that improve decision-making, efficiency, and predictive accuracy across complex domains.",
// //     accent: "Vision",
// //   },
// //   {
// //     title: "Problem Statement",
// //     body: "We focus on the most meaningful challenges in analytics, NLP, computer vision, and automation, turning high-value opportunities into practical AI solutions.",
// //     accent: "Challenge",
// //   },
// // ];

// // const methodology = [
// //   "Data Collection",
// //   "Preprocessing & cleaning",
// //   "Model development",
// //   "Evaluation metrics",
// //   "Results & impact",
// //   "Future direction",
// // ];

// // const industryApps = [
// //   "Healthcare",
// //   "Finance",
// //   "Transportation",
// //   "Entertainment",
// //   "Robotics",
// //   "Enterprise Automation",
// // ];

// // const investmentPoints = [
// //   "Base investment: $100 to $1,000",
// //   "Unlimited upgrade available after 5 direct joins of $100 minimum",
// //   "Daily staking return from 0.50% to 0.75%",
// //   "90-day staking lock period",
// // ];

// // const rewardPoints = [
// //   "Staking Income",
// //   "Rank & Rewards",
// //   "Salary Income",
// //   "Royalty Club",
// //   "Mentorship Bonus",
// // ];

// // const terms = [
// //   "10% withdrawal fee deduction",
// //   "Minimum withdrawal of $10",
// //   "Weekly staking withdrawals",
// //   "Salary income paid on the 15th and 30th",
// //   "Royalty and mentorship income paid monthly",
// // ];

// // const MLSSection = () => {
// //   return (
// //     <>
// //       <style>{`
// //         @keyframes mlsFloat {
// //           0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
// //           50% { transform: translate3d(18px, -24px, 0) scale(1.05); }
// //         }
// //         @keyframes mlsPulse {
// //           0%, 100% { opacity: 0.28; transform: scale(1); }
// //           50% { opacity: 0.55; transform: scale(1.08); }
// //         }
// //         @keyframes mlsShimmer {
// //           0% { background-position: -200% center; }
// //           100% { background-position: 200% center; }
// //         }

// //         .mls-shell {
// //           position: relative;
// //           overflow: hidden;
// //           border-radius: 32px;
// //           padding: clamp(1.2rem, 3vw, 2.2rem);
// //           margin: clamp(1rem, 3vw, 2rem) auto 0;
// //           max-width: 1280px;
        
// //           border: 1px solid rgba(255, 255, 255, 0.12);
// //           box-shadow: 0 35px 80px rgba(0, 0, 0, 0.38);
// //           backdrop-filter: blur(26px);
// //         }

// //         .mls-grid {
// //           position: relative;
// //           z-index: 2;
// //           display: grid;
// //           gap: 1rem;
// //         }

// //         .mls-card {
// //           position: relative;
// //           overflow: hidden;
// //           border-radius: 24px;
// //           padding: 1.25rem;
// //           border: 1px solid rgba(255, 255, 255, 0.08);
// //           background: rgba(255, 255, 255, 0.04);
// //           backdrop-filter: blur(20px);
// //           box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
// //           transition: transform 0.3s ease, border-color 0.3s ease;
// //         }

// //         .mls-card:hover {
// //           transform: translateY(-6px);
// //           border-color: rgba(0, 210, 255, 0.24);
// //         }

// //         .mls-blob {
// //           position: absolute;
// //           border-radius: 999px;
// //           filter: blur(24px);
// //           opacity: 0.35;
// //           animation: mlsFloat 9s ease-in-out infinite;
// //           pointer-events: none;
// //         }

// //         .mls-title-gradient {
// //           background: linear-gradient(135deg, #00D2FF 0%, #67e8f9 28%, #ffffff 68%, #c0c0c0 100%);
// //           background-size: 200% auto;
// //           -webkit-background-clip: text;
// //           background-clip: text;
// //           -webkit-text-fill-color: transparent;
// //           animation: mlsShimmer 4.5s linear infinite;
// //         }

// //         .mls-chip {
// //           display: inline-flex;
// //           align-items: center;
// //           gap: 0.5rem;
// //           border-radius: 999px;
// //           padding: 0.38rem 0.75rem;
// //           margin-bottom: 0.75rem;
// //           background: rgba(0, 210, 255, 0.11);
// //           border: 1px solid rgba(0, 210, 255, 0.2);
// //           color: #9be6ff;
// //           font-size: 0.72rem;
// //           font-weight: 700;
// //           text-transform: uppercase;
// //           letter-spacing: 0.22em;
// //         }
// //       `}</style>

// //       <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
// //         <div className="mls-shell">
// //           <div className="mls-blob" style={{ top: "-8%", left: "-4%", width: 280, height: 280, background: "rgba(0, 210, 255, 0.16)" }} />
// //           <div className="mls-blob" style={{ bottom: "-10%", right: "-5%", width: 320, height: 320, background: "rgba(192, 192, 192, 0.12)", animationDelay: "1.2s" }} />
// //           <div className="mls-blob" style={{ top: "25%", right: "12%", width: 180, height: 180, background: "rgba(255, 255, 255, 0.08)", animation: "mlsPulse 7s ease-in-out infinite" }} />

// //           <div className="mls-grid">
// //             <motion.div
// //               initial={{ opacity: 0, y: 24 }}
// //               whileInView={{ opacity: 1, y: 0 }}
// //               viewport={{ once: true, amount: 0.2 }}
// //               className="mls-card"
// //               style={{ padding: "clamp(1.25rem, 3vw, 2rem)" }}
// //             >
// //               <div className="mls-chip">
// //                 <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00D2FF", boxShadow: "0 0 10px rgba(0, 210, 255, 0.55)" }} />
// //                 Super smooth liquid interface
// //               </div>
// //               <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-center">
// //                 <div>
// //                   <p style={{ color: "#9be6ff", textTransform: "uppercase", letterSpacing: "0.24em", fontSize: "0.72rem", fontWeight: 700, marginBottom: "0.6rem" }}>
// //                     Introducing MLS powered by Sui.io
// //                   </p>
// //                   <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1.05, fontWeight: 800, color: "#ffffff", marginBottom: "0.8rem" }}>
// //                     <span className="mls-title-gradient">AI Intelligence</span> with a fluid, future-ready experience.
// //                   </h2>
// //                   <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "1rem", lineHeight: 1.85, maxWidth: 720 }}>
// //                     This interface blends machine learning storytelling, investment clarity, and blockchain confidence into one elegant experience. It is designed to feel effortless, polished, and premium while keeping the core message clear.
// //                   </p>
// //                 </div>
// //                 <div className="grid gap-3">
// //                   {[
// //                     ["20+ years", "of AI craftsmanship"],
// //                     ["24/7", "autonomous execution"],
// //                     ["Global", "trusted access"],
// //                   ].map(([value, label]) => (
// //                     <div key={value} className="mls-card" style={{ padding: "0.9rem 1rem" }}>
// //                       <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>{value}</div>
// //                       <div style={{ color: "rgba(255,255,255,0.66)", fontSize: "0.88rem" }}>{label}</div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             </motion.div>

// //             <div className="grid lg:grid-cols-3 gap-4">
// //               {pillars.map((item, index) => (
// //                 <motion.article
// //                   key={item.title}
// //                   initial={{ opacity: 0, y: 22 }}
// //                   whileInView={{ opacity: 1, y: 0 }}
// //                   viewport={{ once: true, amount: 0.2 }}
// //                   transition={{ delay: index * 0.08 }}
// //                   className="mls-card"
// //                 >
// //                   <div style={{ color: "#00D2FF", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.55rem" }}>
// //                     {item.accent}
// //                   </div>
// //                   <h3 style={{ color: "#ffffff", fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.5rem" }}>{item.title}</h3>
// //                   <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.75, fontSize: "0.95rem" }}>{item.body}</p>
// //                 </motion.article>
// //               ))}
// //             </div>

// //             <motion.div
// //               initial={{ opacity: 0, y: 22 }}
// //               whileInView={{ opacity: 1, y: 0 }}
// //               viewport={{ once: true, amount: 0.2 }}
// //               className="mls-card"
// //             >
// //               <div className="mls-chip">Methodology</div>
// //               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
// //                 {methodology.map((step, index) => (
// //                   <div key={step} className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
// //                     <div style={{ color: "#00D2FF", fontSize: "0.72rem", letterSpacing: "0.2em", fontWeight: 700, marginBottom: "0.35rem", textTransform: "uppercase" }}>
// //                       Step {index + 1}
// //                     </div>
// //                     <div style={{ color: "#ffffff", fontWeight: 700 }}>{step}</div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </motion.div>

// //             <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
// //               <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="mls-card">
// //                 <div className="mls-chip">AI applications</div>
// //                 <div className="grid sm:grid-cols-2 gap-3">
// //                   {industryApps.map((item) => (
// //                     <div key={item} className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
// //                       <div style={{ color: "#ffffff", fontWeight: 700 }}>{item}</div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </motion.div>

// //               <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="mls-card">
// //                 <div className="mls-chip">Investment policy</div>
// //                 <ul style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.8, paddingLeft: "1rem" }}>
// //                   {investmentPoints.map((point) => (
// //                     <li key={point}>{point}</li>
// //                   ))}
// //                 </ul>
// //               </motion.div>
// //             </div>

// //             <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-4">
// //               <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="mls-card">
// //                 <div className="mls-chip">Growth plan</div>
// //                 <div className="grid gap-3">
// //                   {rewardPoints.map((point) => (
// //                     <div key={point} className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
// //                       <div style={{ color: "#ffffff", fontWeight: 700 }}>{point}</div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </motion.div>

// //               <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="mls-card">
// //                 <div className="mls-chip">Terms & conditions</div>
// //                 <ul style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.8, paddingLeft: "1rem" }}>
// //                   {terms.map((point) => (
// //                     <li key={point}>{point}</li>
// //                   ))}
// //                 </ul>
// //               </motion.div>
// //             </div>

// //             <motion.div
// //               initial={{ opacity: 0, y: 22 }}
// //               whileInView={{ opacity: 1, y: 0 }}
// //               viewport={{ once: true, amount: 0.2 }}
// //               className="mls-card"
// //               style={{ textAlign: "center" }}
// //             >
// //               <div className="mls-chip">Ready to engage</div>
// //               <h3 style={{ color: "#ffffff", fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)", fontWeight: 800, marginBottom: "0.55rem" }}>
// //                 Thank you — let’s build a brighter, smarter future with MLS.
// //               </h3>
// //               <p style={{ color: "rgba(255,255,255,0.74)", lineHeight: 1.8, maxWidth: 760, margin: "0 auto" }}>
// //                 From strategic AI storytelling to investment clarity and growth planning, this section brings your message together in a premium, modern experience powered by Sui.io.
// //               </p>
// //             </motion.div>
// //           </div>
// //         </div>
// //       </section>
// //     </>
// //   );
// // };

// // export default MLSSection;


// import React from "react";
// import { motion } from "framer-motion";

// const pillars = [
//   {
//     title: "About Us",
//     body: "The Sui Group brings over 20 years of experience in crafting bespoke AI solutions across multiple industries, combining research, automation, and secure digital infrastructure.",
//     accent: "AI + Strategy",
//     icon: "⚡",
//   },
//   {
//     title: "Project Overview",
//     body: "This initiative develops advanced machine learning models and intelligent systems that improve decision-making, efficiency, and predictive accuracy across complex domains.",
//     accent: "Vision",
//     icon: "🎯",
//   },
//   {
//     title: "Problem Statement",
//     body: "We focus on the most meaningful challenges in analytics, NLP, computer vision, and automation, turning high-value opportunities into practical AI solutions.",
//     accent: "Challenge",
//     icon: "💡",
//   },
// ];

// const methodology = [
//   "Data Collection",
//   "Preprocessing & cleaning",
//   "Model development",
//   "Evaluation metrics",
//   "Results & impact",
//   "Future direction",
// ];

// const industryApps = [
//   "Healthcare",
//   "Finance",
//   "Transportation",
//   "Entertainment",
//   "Robotics",
//   "Enterprise Automation",
// ];

// const investmentPoints = [
//   "Base investment: $100 to $1,000",
//   "Unlimited upgrade available after 5 direct joins of $100 minimum",
//   "Daily staking return from 0.50% to 0.75%",
//   "90-day staking lock period",
// ];

// const rewardPoints = [
//   "Staking Income",
//   "Rank & Rewards",
//   "Salary Income",
//   "Royalty Club",
//   "Mentorship Bonus",
// ];

// const terms = [
//   "10% withdrawal fee deduction",
//   "Minimum withdrawal of $10",
//   "Weekly staking withdrawals",
//   "Salary income paid on the 15th and 30th",
//   "Royalty and mentorship income paid monthly",
// ];

// const MLSSection = () => {
//   return (
//     <>
//       <style>{`
//         /* Dynamic Animated Grid Background */
//         .mls-bg-wrapper {
//           position: relative;
//           background-color: #030712;
//           overflow: hidden;
//         }

//         .mls-animated-grid {
//           position: absolute;
//           inset: 0;
//           background-image: 
//             linear-gradient(to right, rgba(0, 210, 255, 0.05) 1px, transparent 1px),
//             linear-gradient(to bottom, rgba(0, 210, 255, 0.05) 1px, transparent 1px);
//           background-size: 50px 50px;
//           animation: gridMove 20s linear infinite;
//         }

//         @keyframes gridMove {
//           0% { transform: translateY(0); }
//           100% { transform: translateY(50px); }
//         }

//         /* Ambient Pulsing Glow Orbs */
//         .mls-orb-1 {
//           position: absolute;
//           top: 10%;
//           left: 15%;
//           width: 400px;
//           height: 400px;
//           background: radial-gradient(circle, rgba(0, 210, 255, 0.22) 0%, rgba(0, 0, 0, 0) 70%);
//           filter: blur(50px);
//           animation: floatOrb1 12s ease-in-out infinite alternate;
//           pointer-events: none;
//         }

//         .mls-orb-2 {
//           position: absolute;
//           bottom: 15%;
//           right: 10%;
//           width: 450px;
//           height: 450px;
//           background: radial-gradient(circle, rgba(147, 51, 234, 0.18) 0%, rgba(0, 0, 0, 0) 70%);
//           filter: blur(60px);
//           animation: floatOrb2 15s ease-in-out infinite alternate;
//           pointer-events: none;
//         }

//         @keyframes floatOrb1 {
//           0% { transform: translate(0, 0) scale(1); }
//           100% { transform: translate(80px, -60px) scale(1.15); }
//         }

//         @keyframes floatOrb2 {
//           0% { transform: translate(0, 0) scale(1); }
//           100% { transform: translate(-70px, 50px) scale(1.1); }
//         }

//         /* Shimmer Title Gradient */
//         .mls-title-gradient {
//           background: linear-gradient(135deg, #00D2FF 0%, #38bdf8 30%, #a855f7 70%, #ffffff 100%);
//           background-size: 200% auto;
//           -webkit-background-clip: text;
//           background-clip: text;
//           -webkit-text-fill-color: transparent;
//           animation: shimmer 6s linear infinite;
//         }

//         @keyframes shimmer {
//           0% { background-position: 0% center; }
//           100% { background-position: 200% center; }
//         }

//         /* Premium Glassmorphism Cards */
//         .mls-card {
//           position: relative;
//           background: rgba(15, 23, 42, 0.65);
//           backdrop-filter: blur(16px);
//           -webkit-backdrop-filter: blur(16px);
//           border: 1px solid rgba(255, 255, 255, 0.08);
//           border-radius: 20px;
//           box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//         }

//         .mls-card:hover {
//           border-color: rgba(0, 210, 255, 0.3);
//           box-shadow: 0 15px 35px -5px rgba(0, 210, 255, 0.15);
//         }

//         /* Custom Badge Styling */
//         .mls-chip {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.5rem;
//           border-radius: 9999px;
//           padding: 0.35rem 0.85rem;
//           background: rgba(0, 210, 255, 0.08);
//           border: 1px solid rgba(0, 210, 255, 0.25);
//           color: #38bdf8;
//           font-size: 0.75rem;
//           font-weight: 700;
//           text-transform: uppercase;
//           letter-spacing: 0.15em;
//         }
//       `}</style>

//       <section className="mls-bg-wrapper min-h-screen text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
//         {/* Dynamic Animated Background Elements */}
//         <div className="mls-animated-grid" />
//         <div className="mls-orb-1" />
//         <div className="mls-orb-2" />

//         <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          
//           {/* Main Hero Card */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//             className="mls-card p-6 sm:p-10"
//           >
//             <div className="mls-chip mb-6">
//               <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
//               Super smooth liquid interface
//             </div>
            
//             <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
//               <div>
//                 <p className="text-cyan-400 font-bold tracking-widest text-xs uppercase mb-2">
//                   Introducing MLS powered by Sui.io
//                 </p>
//                 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
//                   <span className="mls-title-gradient">AI Intelligence</span> with a fluid, future-ready experience.
//                 </h2>
//                 <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
//                   This interface blends machine learning storytelling, investment clarity, and blockchain confidence into one elegant experience. Designed to feel effortless, polished, and premium.
//                 </p>
//               </div>

//               {/* Stats Highlights */}
//               <div className="grid gap-3">
//                 {[
//                   ["20+ years", "of AI craftsmanship"],
//                   ["24/7", "autonomous execution"],
//                   ["Global", "trusted access"],
//                 ].map(([value, label], idx) => (
//                   <motion.div
//                     key={value}
//                     whileHover={{ scale: 1.02 }}
//                     className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
//                   >
//                     <span className="text-xl font-black text-cyan-400">{value}</span>
//                     <span className="text-sm text-slate-400 font-medium">{label}</span>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           </motion.div>

//           {/* Pillars Grid */}
//           <div className="grid md:grid-cols-3 gap-6">
//             {pillars.map((item, index) => (
//               <motion.article
//                 key={item.title}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 whileHover={{ y: -6 }}
//                 className="mls-card p-6 flex flex-col justify-between"
//               >
//                 <div>
//                   <div className="flex justify-between items-center mb-4">
//                     <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{item.accent}</span>
//                     <span className="text-xl">{item.icon}</span>
//                   </div>
//                   <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
//                   <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
//                 </div>
//               </motion.article>
//             ))}
//           </div>

//           {/* Methodology */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//             className="mls-card p-6 sm:p-8"
//           >
//             <div className="mls-chip mb-6">Methodology</div>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//               {methodology.map((step, index) => (
//                 <motion.div
//                   key={step}
//                   whileHover={{ scale: 1.05 }}
//                   className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all text-center"
//                 >
//                   <div className="text-xs font-bold text-cyan-400 mb-1">STEP 0{index + 1}</div>
//                   <div className="text-xs font-semibold text-slate-200">{step}</div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>

//           {/* Applications & Investment */}
//           <div className="grid lg:grid-cols-2 gap-6">
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//               className="mls-card p-6 sm:p-8"
//             >
//               <div className="mls-chip mb-6">AI Applications</div>
//               <div className="grid grid-cols-2 gap-3">
//                 {industryApps.map((item) => (
//                   <div key={item} className="p-3.5 rounded-xl bg-white/5 border border-white/5 font-semibold text-sm text-slate-300 flex items-center gap-2">
//                     <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
//                     {item}
//                   </div>
//                 ))}
//               </div>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//               className="mls-card p-6 sm:p-8"
//             >
//               <div className="mls-chip mb-6">Investment Policy</div>
//               <ul className="space-y-3">
//                 {investmentPoints.map((point) => (
//                   <li key={point} className="flex items-start gap-3 text-sm text-slate-300">
//                     <span className="text-cyan-400 mt-0.5">✓</span>
//                     <span>{point}</span>
//                   </li>
//                 ))}
//               </ul>
//             </motion.div>
//           </div>

//           {/* Growth Plan & Terms */}
//           <div className="grid lg:grid-cols-2 gap-6">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               className="mls-card p-6 sm:p-8"
//             >
//               <div className="mls-chip mb-6">Growth Plan</div>
//               <div className="grid gap-3">
//                 {rewardPoints.map((point) => (
//                   <div key={point} className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-sm font-semibold text-slate-200">
//                     🚀 {point}
//                   </div>
//                 ))}
//               </div>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               className="mls-card p-6 sm:p-8"
//             >
//               <div className="mls-chip mb-6">Terms & Conditions</div>
//               <ul className="space-y-3">
//                 {terms.map((point) => (
//                   <li key={point} className="flex items-start gap-3 text-sm text-slate-300">
//                     <span className="text-purple-400 mt-0.5">⚡</span>
//                     <span>{point}</span>
//                   </li>
//                 ))}
//               </ul>
//             </motion.div>
//           </div>

//           {/* Footer Callout Card */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.98 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             viewport={{ once: true }}
//             className="mls-card p-8 sm:p-12 text-center relative overflow-hidden"
//           >
//             <div className="relative z-10 max-w-2xl mx-auto space-y-4">
//               <div className="mls-chip mx-auto">Ready to engage</div>
//               <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
//                 Thank you — let’s build a brighter, smarter future with MLS.
//               </h3>
//               <p className="text-slate-400 text-sm leading-relaxed">
//                 From strategic AI storytelling to investment clarity and growth planning, this section brings your message together in a premium, modern experience.
//               </p>
//             </div>
//           </motion.div>

//         </div>
//       </section>
//     </>
//   );
// };

// export default MLSSection;

import React from "react";
import { motion } from "framer-motion";

const pillars = [
  {
    title: "About Us",
    body: "The Veltrion Capital Group brings over 20 years of experience in crafting bespoke digital trading and secure decentralized solutions across multiple industries, combining research, automation, and robust digital infrastructure.",
    accent: "AI + Strategy",
    icon: "⚡",
  },
  {
    title: "Project Overview",
    body: "This initiative develops advanced machine learning models and intelligent systems that improve decision-making, efficiency, and predictive accuracy across complex domains.",
    accent: "Vision",
    icon: "🎯",
  },
  {
    title: "Problem Statement",
    body: "We focus on the most meaningful challenges in analytics, NLP, computer vision, and automation, turning high-value opportunities into practical AI solutions.",
    accent: "Challenge",
    icon: "💡",
  },
];

const methodology = [
  "Data Collection",
  "Preprocessing & cleaning",
  "Model development",
  "Evaluation metrics",
  "Results & impact",
  "Future direction",
];

const industryApps = [
  "Healthcare",
  "Finance",
  "Transportation",
  "Entertainment",
  "Robotics",
  "Enterprise Automation",
];

const investmentPoints = [
  "Base investment: $100 to $1,000",
  "Unlimited upgrade available after 5 direct joins of $100 minimum",
  "Daily staking return from 0.50% to 0.75%",
  "90-day staking lock period",
];

const rewardPoints = [
  "Staking Income",
  "Rank & Rewards",
  "Salary Income",
  "Royalty Club",
  "Mentorship Bonus",
];

const terms = [
  "10% withdrawal fee deduction",
  "Minimum withdrawal of $10",
  "Weekly staking withdrawals",
  "Weekly salary income upon rank qualification",
  "Royalty and mentorship income paid monthly",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const MLSSection = () => {
  return (
    <>
      <style>{`
        .mls-bg-wrapper {
          position: relative;
          background-color: #020617;
          overflow: hidden;
        }

        .mls-animated-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(0, 210, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 210, 255, 0.08) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }

        @keyframes scanbeam {
          0% { top: 0%; opacity: 0.2; }
          50% { opacity: 0.8; }
          100% { top: 100%; opacity: 0.2; }
        }

        .scan-line {
          position: absolute;
          left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #00d2ff, #a855f7, transparent);
          animation: scanbeam 3.5s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 8px #00d2ff);
        }

        .mls-title-gradient {
          background: linear-gradient(135deg, #00D2FF 0%, #38bdf8 35%, #a855f7 70%, #ffffff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .mls-card {
          position: relative;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 210, 255, 0.22);
          border-radius: 20px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7);
          transition: all 0.3s ease;
        }

        .mls-card:hover {
          border-color: rgba(0, 210, 255, 0.5);
          box-shadow: 0 0 30px rgba(0, 210, 255, 0.25);
        }

        .mls-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 9999px;
          padding: 0.35rem 0.9rem;
          background: rgba(0, 210, 255, 0.12);
          border: 1px solid rgba(0, 210, 255, 0.4);
          color: #38bdf8;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        /* Matrix Glow Bars */
        .matrix-bar {
          background: linear-gradient(180deg, #00d2ff 0%, rgba(0, 210, 255, 0.1) 100%);
          border-radius: 4px;
        }
      `}</style>

      <section className="mls-bg-wrapper min-h-screen text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="mls-animated-grid" />

        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-12">
          
          {/* MAIN HERO CARD WITH AI ADVANCED HUD BOX */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mls-card p-6 sm:p-10 lg:p-12"
          >
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="mls-chip">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  Super smooth liquid interface
                </div>

                <div>
                  <p className="text-cyan-300 font-bold tracking-widest text-xs uppercase mb-2">
                    Introducing MLS powered by Veltrion Capital
                  </p>
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                    <span className="mls-title-gradient">AI Intelligence</span> with a fluid, future-ready experience.
                  </h1>
                </div>

                <p className="text-white text-base sm:text-lg leading-relaxed font-normal">
                  This interface blends machine learning storytelling, investment clarity, and blockchain confidence into one elegant experience. Designed to feel effortless, polished, and premium.
                </p>

                {/* Grid Stats */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-3 gap-3 pt-2"
                >
                  {[
                    ["20+ years", "of AI craftsmanship"],
                    ["24/7", "autonomous execution"],
                    ["Global", "trusted access"],
                  ].map(([value, label]) => (
                    <motion.div
                      key={value}
                      variants={itemVariants}
                      whileHover={{ scale: 1.04, translateY: -2 }}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-col justify-center text-left"
                    >
                      <span className="text-lg sm:text-xl font-black text-cyan-300">{value}</span>
                      <span className="text-xs text-white font-medium mt-0.5">{label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Right Column: ADVANCED AI HUD TERMINAL (No Images) */}
              <div className="lg:col-span-5 relative">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="relative p-6 sm:p-8 rounded-2xl bg-slate-950/90 border border-cyan-400/40 overflow-hidden shadow-[0_0_50px_rgba(0,210,255,0.2)] flex flex-col justify-between space-y-6"
                >
                  <div className="scan-line pointer-events-none" />

                  {/* Header Tag & Status */}
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
                        AI ADVANCED ENGINE
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                      v4.2.8
                    </span>
                  </div>

                  {/* Large Center Feature Typography */}
                  <div className="space-y-2 py-2">
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase leading-none">
                      AI <span className="text-cyan-400">ADVANCED</span>
                    </h2>
                    <p className="text-xs font-mono text-cyan-200/90 tracking-wide">
                      NEURAL QUANTUM NETWORK // AUTONOMOUS ECOSYSTEM
                    </p>
                  </div>

                  {/* Matrix Neural Visualizer Bars */}
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/20 space-y-3">
                    <div className="flex justify-between text-[11px] font-mono text-white">
                      <span>PROCESSING SPEEDS</span>
                      <span className="text-cyan-300 font-bold">12.4 TFLOPS</span>
                    </div>
                    
                    {/* Animated Audio/Matrix Bars */}
                    <div className="flex items-end justify-between h-12 gap-1.5 pt-1">
                      {[60, 85, 45, 95, 70, 100, 55, 80, 90, 65, 85, 40, 75, 95].map((height, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [`${height}%`, `${(height + 30) % 100}%`, `${height}%`] }}
                          transition={{ duration: 1.5 + (i % 3) * 0.3, repeat: Infinity, ease: "easeInOut" }}
                          className="w-full matrix-bar"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Telemetry Bottom Bar */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 font-mono">
                      <div className="text-[10px] text-cyan-300">SYSTEM LATENCY</div>
                      <div className="text-sm font-bold text-white">0.04 MS</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 font-mono">
                      <div className="text-[10px] text-cyan-300">MODEL ACCURACY</div>
                      <div className="text-sm font-bold text-white">99.85%</div>
                    </div>
                  </div>

                  {/* Live Status Footer */}
                  <div className="w-full bg-slate-900/90 p-3 rounded-xl border border-cyan-400/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                      </span>
                      <span className="text-xs font-mono text-white font-bold">NODE: ACTIVE</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-300 font-bold">SECURE POWER CHAIN</span>
                  </div>

                </motion.div>
              </div>

            </div>
          </motion.div>

          {/* THREE PILLARS SECTION */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {pillars.map((item) => (
              <motion.article
                key={item.title}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="mls-card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">{item.accent}</span>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white text-sm leading-relaxed font-normal">{item.body}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* METHODOLOGY SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mls-card p-6 sm:p-8"
          >
            <div className="mls-chip mb-6">Methodology</div>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {methodology.map((step, index) => (
                <motion.div
                  key={step}
                  variants={itemVariants}
                  whileHover={{ scale: 1.04, borderColor: "rgba(0, 210, 255, 0.6)" }}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 transition-all text-center"
                >
                  <div className="text-xs font-bold text-cyan-300 mb-1">STEP 0{index + 1}</div>
                  <div className="text-xs font-semibold text-white">{step}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* APPLICATIONS & INVESTMENT POLICIES */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mls-card p-6 sm:p-8"
            >
              <div className="mls-chip mb-6">AI Applications</div>
              <div className="grid grid-cols-2 gap-3">
                {industryApps.map((item) => (
                  <motion.div 
                    key={item} 
                    whileHover={{ x: 4 }}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 font-semibold text-sm text-white flex items-center gap-2.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d2ff]" />
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mls-card p-6 sm:p-8"
            >
              <div className="mls-chip mb-6">Investment Policy</div>
              <ul className="space-y-3">
                {investmentPoints.map((point) => (
                  <motion.li key={point} whileHover={{ x: 4 }} className="flex items-start gap-3 text-sm text-white font-normal">
                    <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                    <span>{point}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* GROWTH PLAN & TERMS */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mls-card p-6 sm:p-8"
            >
              <div className="mls-chip mb-6">Growth Plan</div>
              <div className="grid gap-3">
                {rewardPoints.map((point) => (
                  <motion.div 
                    key={point} 
                    whileHover={{ scale: 1.02 }}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm font-semibold text-white flex items-center gap-2"
                  >
                    <span className="text-cyan-300">🚀</span> {point}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mls-card p-6 sm:p-8"
            >
              <div className="mls-chip mb-6">Terms & Conditions</div>
              <ul className="space-y-3">
                {terms.map((point) => (
                  <motion.li key={point} whileHover={{ x: 4 }} className="flex items-start gap-3 text-sm text-white font-normal">
                    <span className="text-purple-400 font-bold mt-0.5">⚡</span>
                    <span>{point}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* FOOTER CALLOUT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mls-card p-8 sm:p-12 text-center relative overflow-hidden"
          >
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="mls-chip mx-auto">Ready to engage</div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Thank you — let’s build a brighter, smarter future with Veltrion Capital.
              </h3>
              <p className="text-white text-sm sm:text-base leading-relaxed font-normal">
                From strategic AI storytelling to investment clarity and growth planning, this section brings your message together in a premium, modern experience.
              </p>
            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
};

export default MLSSection;