import React, { useEffect, useState } from "react";
import { setLoading } from "../../redux/slices/loadingSlice";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { NumberFormatCommas } from "../../utils/FormatText";
import { useLocation } from "react-router-dom";
import { isToday } from "../../utils/helper";
import { getAllInvestmentHistory } from "../../api/user.api";
import { maskWalletAddress } from "../../utils/additionalFunc";
import { Copy, Check, ExternalLink } from "lucide-react";

const InvestmentHistoryPage = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const data = location?.state;

  const fetchAllTransactions = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getAllInvestmentHistory();
      if (response?.success) {
        const list = Array.isArray(response?.data?.history)
          ? response.data.history
          : Array.isArray(response?.data)
          ? response.data
          : [];
        setAllTransactions(list);
      } else {
        toast.error(response?.message || "Something went wrong");
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredIncomeHistory =
    data === "today"
      ? allTransactions.filter((item) => isToday(new Date(item.createdAt)))
      : allTransactions;

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-semibold text-slate-400">{rowIndex + 1}</span>
      ),
    },
    {
      header: "Transaction ID",
      accessor: "id",
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400 font-semibold">
          <span>{row?.id || row?._id || "N/A"}</span>
          <button
            onClick={() => handleCopy(row?.id || row?._id, row?.id || row?._id)}
            className="text-slate-500 hover:text-cyan-300 transition cursor-pointer"
          >
            {copiedId === (row?.id || row?._id) ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      ),
    },
    {
      header: "Amount ($)",
      accessor: "amount",
      cell: (row) => (
        <span className="font-mono font-black text-emerald-400 text-sm">
          +${Number(row?.investment || row?.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      cell: (row) => (
        <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          {row?.type || "Deposit"}
        </span>
      ),
    },
    {
      header: "Txn Hash",
      accessor: "hash",
      cell: (row) => {
        const hash = row?.hash || row?.txnHash;
        if (!hash) return <span className="text-slate-500 text-xs">-</span>;
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
            <span>{maskWalletAddress(hash)}</span>
            <a
              href={`https://bscscan.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition"
              title="View on BscScan"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          {row?.status || "Completed"}
        </span>
      ),
    },
    {
      header: "Date & Time",
      accessor: "date",
      cell: (row) => (
        <span className="text-xs text-slate-400">
          {row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="mt-4">
      <DataTable
        title="Investment History Reports"
        columns={columns}
        data={filteredIncomeHistory}
        pageSize={10}
      />
    </div>
  );
};

export default InvestmentHistoryPage;
