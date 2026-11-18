import React, { useEffect, useState } from "react";
import { getAllTradingList, getIncomeTotalForAdmin, triggerDailyRoiCron } from "../../api/admin.api";
import { setLoading } from "../../redux/slices/loadingSlice";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { isToday } from "../../utils/helper";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { AuthenticatedAdminRouters } from "../../constants/routes";
import { toast } from "react-toastify";
import { PlayCircle, RefreshCw, Zap } from "lucide-react";

const TradingList = () => {
  const [allTradingList, setAllTradingList] = useState([]);
  const [totalIncome, setTotalIncome] = useState({});
  const [triggering, setTriggering] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const data = location?.state;

  const fetchAllTradingList = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getAllTradingList();
      if (response?.success) {
        const history = Array.isArray(response?.data?.history)
          ? response.data.history
          : Array.isArray(response?.data)
          ? response.data
          : [];
        setAllTradingList(history);
      } else {
        setAllTradingList([]);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch trading profit list");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAllTradingList();
  }, []);

  const handleTriggerDailyRoi = async () => {
    try {
      setTriggering(true);
      const res = await triggerDailyRoiCron();
      if (res?.success) {
        toast.success(res?.message || "Daily ROI distributed successfully!");
        fetchAllTradingList();
        fetchCardData();
      } else {
        toast.error(res?.message || "Failed to trigger ROI distribution");
      }
    } catch (err) {
      toast.error(err?.message || "Error distributing daily ROI");
    } finally {
      setTriggering(false);
    }
  };

  const filteredIncomeHistory =
    data === "today"
      ? allTradingList.filter((item) => isToday(new Date(item.createdAt)))
      : allTradingList;

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (row, rowIndex) => (
        <span className="font-medium text-white">{rowIndex + 1}</span>
      ),
    },
    {
      header: "User ID",
      accessor: "user.username",
      cell: (row) => (
        <span className="font-medium text-white">
          {row?.user?.username || row?.userId?.username || row?.username || "N/A"}
        </span>
      ),
      searchValue: (row) => row?.user?.username || row?.username,
    },
    {
      header: "Package",
      accessor: "package.title",
      cell: (row) => (
        <span className="font-medium text-white">
          {row?.package?.title || row?.type || "Standard Package"}
        </span>
      ),
      searchValue: (row) => row?.package?.title || row?.type,
    },
    {
      header: "Principal Amount",
      accessor: "amount",
      cell: (row) => (
        <span className="font-medium text-white text-nowrap">
          $ {Number(row?.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "ROI Income",
      accessor: "income",
      cell: (row) => (
        <span className="font-medium text-green-400">
          + $ {Number(row?.income || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Daily %",
      accessor: "percentage",
      cell: (row) => (
        <span className="font-medium text-white">
          {Number(row?.percentage || 1.0).toFixed(2)}%
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`font-medium px-2.5 py-1 rounded-full text-xs ${
            (row?.status || "Completed").toLowerCase() === "completed"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          }`}
        >
          {row?.status || "Completed"}
        </span>
      ),
      searchValue: (row) => row?.status,
    },
    {
      header: "Date & Time",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-slate-300 text-xs">
          {row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
        </span>
      ),
      searchValue: (row) => {
        return row?.createdAt ? new Date(row.createdAt)?.toLocaleDateString() : "";
      },
    },
  ];

  const cardData = [
    {
      title: "Total Income",
      value: `$ ${Number(totalIncome?.totalIncome ?? 0).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",
      path: AuthenticatedAdminRouters.INCOME_HISTORY,
    },
    {
      title: "Total Referral Income",
      value: `$ ${Number(totalIncome?.totalReferral ?? 0).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-plastilina/69/share--v1.png",
      path: AuthenticatedAdminRouters.REFERRAL_INCOME_HISTORY,
    },
    {
      title: "Total Level Income",
      value: `$ ${Number(totalIncome?.totalLevel ?? 0).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/bar-chart.png",
      path: AuthenticatedAdminRouters.LEVEL_INCOME_HISTORY,
    },
    {
      title: "Total Trading ROI",
      value: `$ ${Number(totalIncome?.totalTrading ?? 0).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/candle-sticks.png",
      path: AuthenticatedAdminRouters.TRADING_LIST,
    },
  ];

  const fetchCardData = async () => {
    try {
      const response = await getIncomeTotalForAdmin();
      if (response?.success) {
        setTotalIncome(response || {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCardData();
  }, []);

  return (
    <div className="space-y-6 mt-4">
      {/* Header & Cron Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-400" />
            Trading ROI Income List
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Standard Daily ROI (1.0%) and Booster ROI (2.0%) distributions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllTradingList}
            className="p-2.5 rounded-xl text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleTriggerDailyRoi}
            disabled={triggering}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg border border-amber-500/40"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              boxShadow: "0 0 20px rgba(245,158,11,0.4)",
            }}
          >
            <PlayCircle className={`w-4 h-4 ${triggering ? "animate-spin" : ""}`} />
            {triggering ? "Distributing ROI..." : "Trigger Daily ROI Cron"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            iconImage={item.icon}
            change={item.change}
            changeType={item.changeType}
            path={item.path}
          />
        ))}
      </div>

      <DataTable
        title="Trading ROI Income Records"
        columns={columns}
        data={filteredIncomeHistory}
        pageSize={10}
        emptyMessage="No trading ROI records found yet."
      />
    </div>
  );
};

export default TradingList;
