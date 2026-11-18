import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../../components/Screen/Landing/Hero";
import AboutSafealtCoin from "../../components/Screen/Landing/About";
import VisionEcosystem from "../../components/Screen/Landing/VisionEcosystem ";
import PackageSection from "../../components/Screen/Landing/PackageSection";
import IncomeTypes from "../../components/Screen/Landing/IncomeTypes";
import DirectReferralIncome from "../../components/Screen/Landing/Directreferal";
import BoosterIncome from "../../components/Screen/Landing/BoosterIncome";
import LevelIncome from "../../components/Screen/Landing/Levelincome";
import ChooseUs from "./Chooseus";
import TermsConditions from "../../components/Screen/Landing/TermsConditions";
import JoinMovement from "../../components/Screen/Landing/JoinMovement";

const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target) {
        setTimeout(() => {
          const headerOffset = 76;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }, 120);
      }
    }
  }, [location]);

  return (
    <div className="w-full bg-[#020817] text-white">
      <Hero />
      <AboutSafealtCoin />
      <VisionEcosystem />
      <PackageSection />
      <IncomeTypes />
      <DirectReferralIncome />
      <BoosterIncome />
      <LevelIncome />
      <ChooseUs />
      <TermsConditions />
      <JoinMovement />
    </div>
  );
};

export default LandingPage;
