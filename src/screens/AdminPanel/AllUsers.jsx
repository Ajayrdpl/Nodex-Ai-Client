import React, { useEffect, useState } from "react";
import {
  BlockUser,
  getAllUsers,
  getIncomeTotalForAdmin,
  getUserDashboardAccess,
  HoldCapitalIncome,
  RoiGenerate,
  updateUserDetails,
  lockUnlockCapitalInvestment,
} from "../../api/admin.api";
import { setLoading } from "../../redux/slices/loadingSlice";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import Swal from "sweetalert2";
import { loginUser } from "../../redux/slices/authSlice";
import { AuthenticatedUserRouters } from "../../constants/routes";
import { useDispatch } from "react-redux";
import { maskWalletAddress } from "../../utils/additionalFunc";
import { useLocation, useNavigate } from "react-router-dom";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { Copy, Check } from "lucide-react";
import { toast } from "react-toastify";

const AllUsers = () => {
  const location = useLocation();
  const data = location.state;
  const [allUsers, setAllUsers] = useState([]);
  const [copiedText, setCopiedText] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: "",
    account: "",
    email: "",
    countryCode: "",
    mobile: "",
    country: "",
    password: ""
  });
  const [totalIncome, setTotalIncome] = useState({});
  const fetchAllUsers = async () => {
    try {
      dispatch(setLoading(true));
      const [response, response2] = await Promise.all([
        getAllUsers(),
        getIncomeTotalForAdmin(),
      ]);

      const list = Array.isArray(response?.data?.users)
        ? response.data.users
        : Array.isArray(response?.data?.history)
        ? response.data.history
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setAllUsers(list);

      if (response2?.success) {
        setTotalIncome(response2.data || response2);
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(setLoading(false));
    }
  };
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      username: user?.username || "",
      account: user?.account || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
      country: user?.country || "",
      countryCode: user?.countryCode || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      dispatch(setLoading(true));
      const response = await updateUserDetails(selectedUser._id, editFormData);

      if (response?.success) {
        Swal.fire({
          icon: "success",
          text: response?.message || "User updated successfully",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        // Update UI
        setAllUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === selectedUser._id ? { ...user, ...editFormData } : user
          )
        );

        setIsEditModalOpen(false);
        setSelectedUser(null);
      } else {
        Swal.fire({
          icon: "error",
          text: response?.message || "Failed to update user",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (err) {
      console.error("Failed to update user:", err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const filteredUsers = allUsers?.filter((user) => {
    if (data === "active") {
      return user.active?.isActive === true;
    } else if (data === "inactive") {
      return user.active?.isActive === false;
    }
    return true; // If no filter, return all users
  });

  const handleBlock = async (id) => {
    try {
      dispatch(setLoading(true));
      const response = await BlockUser(id);
      if (response?.success) {
        Swal.fire({
          icon: "success",
          text: response?.message || "User block/unblock successful",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        setAllUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === id
              ? {
                ...user,
                active: {
                  ...user.active,
                  isBlocked: !user.active?.isBlocked,
                },
              }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      Swal.fire({
        icon: "error",
        text: "Something went wrong!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };
  const handleBlockIncome = async (id) => {
    try {
      dispatch(setLoading(true));
      const response = await HoldCapitalIncome(id);
      if (response?.success) {
        Swal.fire({
          icon: "success",
          text: response?.message || "User income hold/unhold successful",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        setAllUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === id
              ? {
                ...user,
                active: {
                  ...user.active,
                  isCurrentIncomeHold: !user.active?.isCurrentIncomeHold,
                },
              }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      Swal.fire({
        icon: "error",
        text: "Something went wrong!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };
  const handleRoiGenerate = async (id) => {
    try {
      dispatch(setLoading(true));
      const response = await RoiGenerate(id);
      if (response?.success) {
        Swal.fire({
          icon: "success",
          text: response?.message || "User ROI status changes successfully",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        setAllUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === id
              ? {
                ...user,
                active: {
                  ...user.active,
                  isRoiBlocked: !user.active?.isRoiBlocked,
                },
              }
              : user
          )
        );
      } else {
        Swal.fire({
          icon: "error",
          text: response?.message || "Something went wrong!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error("Error changing ROI status of user:", error);
      Swal.fire({
        icon: "error",
        text: "Something went wrong!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCapitalLock = async (id) => {
    try {
      dispatch(setLoading(true));
      const response = await lockUnlockCapitalInvestment(id);
      if (response?.success) {
        Swal.fire({
          icon: "success",
          text: response?.message || "Capital investment lock/unlock successful",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        // Refresh the users list to get updated data
        fetchAllUsers();
      } else {
        Swal.fire({
          icon: "error",
          text: response?.message || "Something went wrong!",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error("Error locking/unlocking capital:", error);
      Swal.fire({
        icon: "error",
        text: "Something went wrong!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAccess = async (id) => {
    setLoading(true);
    try {
      const response = await getUserDashboardAccess({ id });
      if (response?.success) {
        await dispatch(
          loginUser({
            token: response?.token,
            userId: response?.data?._id,
            role: response?.data?.role,
            data: response?.data,
          })
        );
        localStorage.setItem("access", response.admin);
        navigate(AuthenticatedUserRouters.DASHBOARD);
        Swal.fire({
          icon: "success",
          text: response?.message || "Access granted successfully",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          text: response?.message || "Failed to grant access",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Something went wrong while granting access!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "ID",
      accessor: "id",
      cell: (row, rowIndex) => (
        <span className="font-medium text-white">{rowIndex + 1}</span> // 1-based index
      ),
    },
    {
      header: "Name",
      accessor: "username",
      cell: (row) => (
        <span className="font-medium text-white">{row?.username}</span>
      ),
      searchValue: (row) => row?.username || "",
    },
    {
      header: "User ID",
      accessor: "id",
      cell: (row) => {
        const userId = row?.id || "";
        const isCopied = copiedText === userId;
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="font-semibold text-white">{userId || "—"}</span>
            {userId && (
              <button
                type="button"
                onClick={() => handleCopy(userId, "User ID")}
                className="text-slate-400 hover:text-cyan-300 transition cursor-pointer p-0.5"
                title="Copy User ID"
              >
                {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        );
      },
      searchValue: (row) => row?.id || "",
    },
    {
      header: "Sponsor",
      accessor: "sponsor.username",
      cell: (row) => {
        const sp = row?.sponsor;
        if (!sp) {
          return (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              Root / None
            </span>
          );
        }
        const spName = typeof sp === "object" ? sp.username || sp.id : sp;
        const spId = typeof sp === "object" ? sp.id || sp.referralLink : "";
        const isCopied = copiedText === spId;
        return (
          <div>
            <div className="font-bold text-cyan-300 text-xs flex items-center gap-1">
              <i className="fa-solid fa-user-tag text-[10px] text-cyan-400"></i>
              {spName}
            </div>
            {spId && spId !== spName && (
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                <span>{spId}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(spId, "Sponsor ID")}
                  className="text-slate-500 hover:text-cyan-300 transition cursor-pointer"
                  title="Copy Sponsor ID"
                >
                  {isCopied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                </button>
              </div>
            )}
          </div>
        );
      },
      searchValue: (row) => {
        const sp = row?.sponsor;
        if (!sp) return "none root";
        return typeof sp === "object" ? `${sp.username || ""} ${sp.id || ""}` : String(sp);
      },
    },
    {
      header: "Referral Code",
      accessor: "referralLink",
      cell: (row) => {
        const refCode = row?.referralLink || row?.id || "";
        const isCopied = copiedText === refCode;
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="font-semibold text-amber-300">{refCode || "—"}</span>
            {refCode && (
              <button
                type="button"
                onClick={() => handleCopy(refCode, "Referral Code")}
                className="text-slate-400 hover:text-amber-300 transition cursor-pointer p-0.5"
                title="Copy Referral Code"
              >
                {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        );
      },
      searchValue: (row) => row?.referralLink || row?.id || "",
    },
    {
      header: "Investment",
      accessor: "investment",
      cell: (row) => (
        <span className="font-bold text-white font-mono text-nowrap">
          $ {Number(row?.investment || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
      searchValue: (row) => row?.investment?.toString() || "0",
    },
    {
      header: "Wallet Address",
      accessor: "account",
      cell: (row) => {
        const addr = row?.account || "";
        const isCopied = copiedText === addr;
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="font-medium text-slate-200">
              {maskWalletAddress(addr)}
            </span>
            {addr && addr !== "Admin Credit" && (
              <button
                type="button"
                onClick={() => handleCopy(addr, "Wallet Address")}
                className="text-slate-400 hover:text-cyan-300 transition cursor-pointer p-0.5"
                title="Copy Full Wallet Address"
              >
                {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        );
      },
      searchValue: (row) => row?.account || "",
    },
    {
      header: "Status",
      accessor: "active.isActive",
      cell: (row) => {
        return row?.active?.isActive === true ? (
          <span className="font-semibold text-green-400">Active</span>
        ) : (
          <span className="font-semibold text-red-400">Inactive</span>
        );
      },
      searchValue: (row) => (row?.active?.isActive ? "active" : "inactive"),
    },
    {
      header: "Block/Unblock",
      accessor: "isBlocked",
      exportable: false,
      cell: (row) => {
        return row?.active?.isBlocked === true ? (
          <div
            className="font-semibold text-green-400 text-xl flex items-center justify-center w-full"
            onClick={() => handleBlock(row?._id)}
          >
            <i class="fa-solid fa-toggle-on"></i>
          </div>
        ) : (
          <div
            className="font-semibold text-white text-xl flex items-center justify-center w-full"
            onClick={() => handleBlock(row?._id)}
          >
            <i class="fa-solid fa-toggle-off"></i>
          </div>
        );
      },
    },
    {
      header: "Hold Current Income",
      accessor: "isCurrentIncomeHold",
      exportable: false,
      cell: (row) => {
        return row?.active?.isCurrentIncomeHold === true ? (
          <div
            className="font-semibold text-green-400 text-xl flex items-center justify-center w-full cursor-pointer"
            onClick={() => handleBlockIncome(row?._id)}
          >
            <i class="fa-solid fa-toggle-on"></i>
          </div>
        ) : (
          <div
            className="font-semibold text-white text-xl flex items-center justify-center w-full cursor-pointer"
            onClick={() => handleBlockIncome(row?._id)}
          >
            <i class="fa-solid fa-toggle-off"></i>
          </div>
        );
      },
    },
    // {
    //   header: "Lock/Unlock Capital Investment",
    //   accessor: "isCapitalLocked",
    //   exportable: false,
    //   cell: (row) => {
    //     // Check if capital is locked - adjust field name based on backend response
    //     const isLocked = row?.active?.isCapitalLocked === true || row?.isCapitalLocked === true;
    //     return isLocked ? (
    //       <div
    //         className="font-semibold text-green-400 text-xl flex items-center justify-center w-full cursor-pointer"
    //         onClick={() => handleCapitalLock(row?._id)}
    //         title="Capital Investment Locked - Click to unlock"
    //       >
    //         <i class="fa-solid fa-lock"></i>
    //       </div>
    //     ) : (
    //       <div
    //         className="font-semibold text-yellow-400 text-xl flex items-center justify-center w-full cursor-pointer"
    //         onClick={() => handleCapitalLock(row?._id)}
    //         title="Capital Investment Unlocked - Click to lock"
    //       >
    //         <i class="fa-solid fa-lock-open"></i>
    //       </div>
    //     );
    //   },
    // },
    {
      header: "User ROI Status",
      accessor: "active.isRoiBlocked",
      exportable: false,
      cell: (row) => {
        return row?.active?.isRoiBlocked === true ? (
          <span
            className="font-semibold text-green-400 text-xl flex items-center justify-center w-full"
            onClick={() => handleRoiGenerate(row?._id)}
          >
            <i class="fa-solid fa-toggle-on"></i>
          </span>
        ) : (
          <span
            className="font-semibold text-white text-xl flex items-center justify-center w-full"
            onClick={() => handleRoiGenerate(row?._id)}
          >
            <i class="fa-solid fa-toggle-off"></i>
          </span>
        );
      },
      searchValue: (row) =>
        row?.active?.isRoiBlocked === true ? "true" : "false",
    },

    {
      header: "Date",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-slate-300">
          {new Date(row?.createdAt)?.toLocaleDateString()}
        </span>
      ),
      searchValue: (row) => {
        return new Date(row?.createdAt)?.toLocaleDateString();
      },
    },
    {
      header: "Action",
      exportable: false,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
            onClick={() => handleAccess(row?._id)}
          >
            Access User
          </button>
          <button
            className="px-4 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
            onClick={() => handleOpenEditModal(row)}
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  const cardData = [
    {
      title: "All Users",
      value: `${Number(totalIncome?.users ?? 0)}`,
      icon: "https://img.icons8.com/3d-fluency/94/group--v2.png",
    },
    {
      title: "Active Users",
      value: ` ${Number(totalIncome?.userActive ?? 0)}`,
      icon: "https://img.icons8.com/3d-fluency/94/group.png",
    },
    {
      title: "Inactive Users",
      value: ` ${Number(totalIncome?.userInactive ?? 0)}`,
      icon: "https://img.icons8.com/3d-fluency/94/group--v4.png",
    },
  ];

  return (
    <div className="space-y-5 mt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            iconImage={item.icon}
            change={item.change}
            changeType={item.changeType}
          />
        ))}
      </div>
      <DataTable
        title={
          data === "active"
            ? "Active Users"
            : data === "inactive"
              ? "Inactive Users"
              : "All Users"
        }
        columns={columns}
        data={filteredUsers}
        pageSize={10}
        dropdownFilters={[
          {
            accessor: "active.isActive",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
          {
            accessor: "active.isRoiBlocked",
            label: "ROI Status",
            options: [
              { value: true, label: "Blocked" },
              { value: false, label: "Unblocked" },
            ],
          },
        ]}
      />
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 py-5 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neon-glow-card p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black gold-metallic-text mb-4 uppercase">Edit User Details</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <span className="text-sky-300 text-xs font-bold">Username</span>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username}
                  onChange={handleEditInputChange}
                  placeholder="Username"
                  className="w-full p-2.5 rounded-xl border border-sky-500/30 bg-slate-950 text-white text-xs outline-none focus:border-sky-400"
                />
              </div>
              <div className="space-y-1">
                <span className="text-sky-300 text-xs font-bold">Wallet Address</span>
                <input
                  type="text"
                  name="account"
                  value={editFormData.account}
                  onChange={handleEditInputChange}
                  placeholder="Wallet Address"
                  className="w-full p-2.5 rounded-xl border border-sky-500/30 bg-slate-950 text-white text-xs outline-none focus:border-sky-400 font-mono"
                />
              </div>
              <div className="space-y-1">
                <span className="text-sky-300 text-xs font-bold">Email</span>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  placeholder="Email"
                  className="w-full p-2.5 rounded-xl border border-sky-500/30 bg-slate-950 text-white text-xs outline-none focus:border-sky-400"
                />
              </div>
              <div className="space-y-1">
                <span className="text-sky-300 text-xs font-bold">Country Code</span>
                <input
                  type="text"
                  name="countryCode"
                  value={editFormData.countryCode}
                  onChange={handleEditInputChange}
                  placeholder="Country Code"
                  className="w-full p-2.5 rounded-xl border border-sky-500/30 bg-slate-950 text-white text-xs outline-none focus:border-sky-400"
                />
              </div>
              <div className="space-y-1">
                <span className="text-sky-300 text-xs font-bold">Mobile Number</span>
                <input
                  type="tel"
                  name="mobile"
                  value={editFormData.mobile}
                  onChange={handleEditInputChange}
                  placeholder="Mobile Number"
                  className="w-full p-2.5 rounded-xl border border-sky-500/30 bg-slate-950 text-white text-xs outline-none focus:border-sky-400"
                />
              </div>
              <div className="space-y-1">
                <span className="text-sky-300 text-xs font-bold">Country Name</span>
                <input
                  type="text"
                  name="country"
                  value={editFormData.country}
                  onChange={handleEditInputChange}
                  placeholder="Country Name"
                  className="w-full p-2.5 rounded-xl border border-sky-500/30 bg-slate-950 text-white text-xs outline-none focus:border-sky-400"
                />
              </div>
              <div className="space-y-1">
                <span className="text-sky-300 text-xs font-bold">Password</span>
                <input
                  type="text"
                  name="password"
                  value={editFormData.password}
                  onChange={handleEditInputChange}
                  placeholder="Password"
                  className="w-full p-2.5 rounded-xl border border-sky-500/30 bg-slate-950 text-white text-xs outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-xl hover:from-amber-400 hover:to-yellow-300 text-xs cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
