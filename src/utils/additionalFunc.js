import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const getMoneySymbol = () => {
  return "$";
};

export const MIN_INVESTMENT_AMOUNT = 20;

export const maskMemberId = (memberId) => {
  if (!memberId || memberId.length <= 2) {
    return memberId;
  }

  const firstChar = memberId[0];
  const lastChar = memberId[memberId.length - 1];
  const maskedChars = "*".repeat(memberId.length - 2);

  return `${firstChar}${maskedChars}${lastChar}`;
};

export const maskWalletAddress = (walletAddress) => {
  if (!walletAddress || walletAddress.length < 10) {
    return walletAddress;
  }

  const firstFourChars = walletAddress.slice(0, 4);
  const lastFourChars = walletAddress.slice(-4);
  const maskedChars = " **** ".repeat(1);

  return `${firstFourChars}${maskedChars}${lastFourChars}`;
};
export const maskEmailAddress = (email) => {
  if (!email) return "";

  const [username, domain] = email.split("@");
  if (!domain) return email;

  if (username.length <= 2) {
    return `${username[0]}*@${domain}`;
  }

  const maskedUsername = username.slice(0, 2) + "*".repeat(2);
  return `${maskedUsername}@${domain}`;
};

export const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

export const shareReferralCode = async (referralCode) => {
  const baseUrl = window.location.origin;
  const shareUrl = referralCode?.startsWith("http")
    ? referralCode
    : `${baseUrl}/register?referral=${encodeURIComponent(referralCode)}`;

  const shareData = {
    title: `Invite to ${MainContent.appName}`,
    text: `Join ${MainContent.appName} with my referral link!`,
    url: shareUrl,
  };

  const isSecure =
    window.isSecureContext || window.location.hostname === "localhost";

  if (!isSecure) {
    alert(
      `Sharing is only supported on secure websites. Please copy manually: ${shareUrl}`
    );
    return;
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      console.log("Shared successfully");
    } catch (error) {
      if (error.name !== "AbortError") {
        alert(`Failed to share: ${error.message}`);
      }
    }
  } else if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard! Paste it to share.");
    } catch {
      alert(`Failed to copy link. Please copy manually: ${shareUrl}`);
    }
  } else {
    alert(`Sharing not supported. Please copy this link: ${shareUrl}`);
  }
};

export const calculateProfitOrLoss = ({
  purchaseValue,
  currentValue,
  holdingToken,
}) => {
  const totalPurchaseCost = purchaseValue * holdingToken;
  const currentValueOfHolding = currentValue * holdingToken;
  const profitOrLoss = currentValueOfHolding - totalPurchaseCost;
  return profitOrLoss;
};

import axios from "axios";
import { ethers } from "ethers";
import { MainContent } from "../constants/mainContent";
export const fetchDataWithCache = async () => {
  const cacheKey = "cryptoData";
  const cacheTimeKey = "cryptoDataTimestamp";
  const cacheExpiry = 60 * 1000; // Cache for 1 minute

  const cachedData = localStorage.getItem(cacheKey);
  const cachedTime = localStorage.getItem(cacheTimeKey);

  const currentTime = new Date().getTime();

  // If cached data exists and is still valid, use it
  if (cachedData && cachedTime && currentTime - cachedTime < cacheExpiry) {
    console.log("Using cached data");
    return JSON.parse(cachedData);
  }

  try {
    // Fetch live data from API if cache is expired or not present
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          // ids: 'bitcoin,binancecoin,ethereum',
          ids: "bitcoin,binancecoin,ethereum,dogecoin,ripple,litecoin",
          order: "market_cap_desc",
        },
      }
    );

    // Cache the response data and timestamp
    localStorage.setItem(cacheKey, JSON.stringify(response.data));
    localStorage.setItem(cacheTimeKey, currentTime.toString());

    console.log("Fetched live data");
    return response.data;
  } catch (error) {
    console.error("Error fetching live data:", error);
    // Return cached data in case of error (fallback)
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    throw error;
  }
};

/**
 * Detect and return the appropriate Ethereum provider object based on walletType
 */
export const getInjectedProvider = (walletType = "metamask") => {
  const type = (walletType || "metamask").toLowerCase();

  // 1. Trust Wallet Specific Injections
  if (type === "trustwallet") {
    // A. Check window.trustwallet direct object
    if (window.trustwallet?.ethereum) return window.trustwallet.ethereum;
    if (window.trustwallet && typeof window.trustwallet.request === "function") return window.trustwallet;

    // B. Check window.ethereum.providers array (when multiple extensions are installed)
    if (window.ethereum?.providers?.length) {
      const trust = window.ethereum.providers.find(
        (p) => p.isTrust || p.isTrustWallet || p.isTrustExtension
      );
      if (trust) return trust;
    }

    // C. Check window.ethereum direct flags
    if (window.ethereum?.isTrust || window.ethereum?.isTrustWallet || window.ethereum?.isTrustExtension) {
      return window.ethereum;
    }

    // D. If window.ethereum exists, use it as fallback
    if (window.ethereum) return window.ethereum;
  }

  // 2. SafePal Specific Injections
  if (type === "safepal") {
    if (window.safepalProvider) return window.safepalProvider;
    if (window.safepal && typeof window.safepal.request === "function") return window.safepal;
    if (window.ethereum?.providers?.length) {
      const sp = window.ethereum.providers.find((p) => p.isSafePal);
      if (sp) return sp;
    }
    if (window.ethereum?.isSafePal) return window.ethereum;
    if (window.ethereum) return window.ethereum;
  }

  // 3. MetaMask Specific Injections
  if (type === "metamask") {
    if (window.ethereum?.providers?.length) {
      const mm = window.ethereum.providers.find(
        (p) => p.isMetaMask && !p.isTrust && !p.isSafePal && !p.isBraveWallet
      );
      if (mm) return mm;
    }
    if (window.ethereum?.isMetaMask) return window.ethereum;
    if (window.ethereum) return window.ethereum;
  }

  // 4. General fallback to any available provider
  if (window.ethereum) return window.ethereum;
  if (window.trustwallet?.ethereum) return window.trustwallet.ethereum;
  if (window.trustwallet) return window.trustwallet;
  if (window.safepalProvider) return window.safepalProvider;

  return null;
};

export const getWalletAddress = async (walletType = "metamask") => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const walletDisplayNames = {
    metamask: "MetaMask",
    safepal: "SafePal",
    trustwallet: "Trust Wallet",
  };

  const displayName = walletDisplayNames[walletType?.toLowerCase?.()] || "Wallet";
  const provider = getInjectedProvider(walletType);

  if (!provider) {
    if (isMobile) {
      throw new Error(
        `Please open the ${displayName} app and visit this site using the in-app browser.`
      );
    } else {
      throw new Error(
        `${displayName} is not detected. If you just installed it, please refresh the page (F5) or ensure the extension is enabled.`
      );
    }
  }

  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    if (!accounts || !accounts.length) {
      throw new Error("No accounts found. Please unlock your wallet.");
    }

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x38" }],
      });
    } catch (switchError) {
      if (
        switchError.code === 4902 ||
        switchError.data?.originalError?.code === 4902 ||
        switchError?.message?.includes("Unrecognized chain")
      ) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x38",
                chainName: "Binance Smart Chain",
                nativeCurrency: {
                  name: "BNB",
                  symbol: "BNB",
                  decimals: 18,
                },
                rpcUrls: ["https://bsc-dataseed1.binance.org/"],
                blockExplorerUrls: ["https://bscscan.com/"],
              },
            ],
          });
        } catch (addError) {
          console.warn("Failed to auto-add BSC network:", addError);
        }
      } else {
        console.warn("Chain switch warning:", switchError);
      }
    }

    let userAddress = accounts[0];
    try {
      const browserProvider = new ethers.BrowserProvider(provider);
      const signer = await browserProvider.getSigner();
      userAddress = await signer.getAddress();
    } catch (signerErr) {
      console.warn("Ethers signer fallback to direct account:", signerErr);
      userAddress = accounts[0];
    }

    console.log("Connected wallet address:", userAddress);
    return userAddress;
  } catch (error) {
    console.error("Wallet connection failed:", error);
    throw error;
  }
};
