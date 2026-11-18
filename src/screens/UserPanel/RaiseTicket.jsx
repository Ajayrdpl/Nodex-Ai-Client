import React, { useState } from "react";
import {
  Headphones,
  MessageSquare,
  AlertCircle,
  Send,
  CheckCircle,
  Clock,
  Sparkles,
  FileText,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";
import { toast } from "react-toastify";
import { createTicket } from "../../api/user.api";

const RaiseTicket = () => {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    natureOfComplain: "",
  });
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message || !formData.natureOfComplain) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setIsLoading(true);
      dispatch(setLoading(true));
      const response = await createTicket(formData);
      if (response?.success) {
        toast.success(response?.message || "Ticket raised successfully");
        setFormData({ subject: "", message: "", natureOfComplain: "" });
      } else {
        toast.error(response?.message || "Error raising ticket");
      }
    } catch (error) {
      console.error("Error raising ticket:", error);
      toast.error("Failed to submit support ticket");
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  const complaintOptions = [
    { value: "transaction", label: "Transaction / Payment Query" },
    { value: "withdrawal", label: "Withdrawal / Split Payout Query" },
    { value: "deposit", label: "Deposit / Staking Activation Query" },
    { value: "account", label: "Account / KYC / Security Query" },
    { value: "technical", label: "Platform / Node Technical Issue" },
    { value: "other", label: "General Inquiries" },
  ];

  const isFormValid =
    formData.subject && formData.message && formData.natureOfComplain;

  return (
    <div className="p-4 sm:p-6 w-full max-w-5xl mx-auto">
      <div className="neon-glow-card border border-sky-400/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(14,165,233,0.22)] backdrop-blur-xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-6 border-b border-sky-500/20">
          <div className="gold-badge-icon w-14 h-14 flex items-center justify-center shadow-lg shrink-0">
            <Headphones className="w-7 h-7 text-slate-950 font-black" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
              <span className="gold-metallic-text">Raise a Priority Support Ticket</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold tracking-wider uppercase mt-1">
              24/7 Institutional Desk Support • Fast Resolution Guarantee
            </p>
          </div>
        </div>

        {/* Support Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <div className="bg-[#050c18] border border-sky-500/30 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white text-xs uppercase">Avg. Response Time</div>
              <div className="text-xs text-amber-300 font-mono font-bold">2 - 4 Hours SLA</div>
            </div>
          </div>

          <div className="bg-[#050c18] border border-sky-500/30 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white text-xs uppercase">Desk Coverage</div>
              <div className="text-xs text-sky-300 font-mono font-bold">24/7 Tier-1 Ops</div>
            </div>
          </div>

          <div className="bg-[#050c18] border border-sky-500/30 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-white text-xs uppercase">Resolution Rate</div>
              <div className="text-xs text-emerald-400 font-mono font-bold">99.8% Success</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Subject Field */}
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-300 mb-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Ticket Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter clear subject line"
                className="w-full px-4 py-3 rounded-xl bg-[#060e1e] border border-sky-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
              />
            </div>

            {/* Nature of Complaint */}
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-300 mb-2">
                <AlertCircle className="w-4 h-4 text-sky-400" />
                Issue Category
              </label>
              <select
                name="natureOfComplain"
                value={formData.natureOfComplain}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#060e1e] border border-sky-500/30 text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm cursor-pointer"
              >
                <option value="" disabled className="bg-[#0b1324] text-slate-400">
                  Select issue category
                </option>
                {complaintOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#0b1324] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message Field */}
          <div>
            <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-300 mb-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Detailed Message
            </label>
            <textarea
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe your issue with transaction IDs, amounts, or usernames if applicable..."
              className="w-full px-4 py-3 rounded-xl bg-[#060e1e] border border-sky-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
            />
          </div>

          {/* Form Summary */}
          {isFormValid && (
            <div className="p-4 bg-[#050c18] border border-sky-500/30 rounded-2xl">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Ticket Summary Preview
              </h3>
              <div className="text-xs text-slate-300 space-y-1">
                <div>Subject: <strong className="text-white">{formData.subject}</strong></div>
                <div>Category: <strong className="text-sky-300">{formData.natureOfComplain}</strong></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                isLoading || !isFormValid
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Support Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseTicket;
