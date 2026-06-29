import { useEffect, useState } from "react";
import api from "../services/api";

import toast from "react-hot-toast";

import ActionButton from "../components/ui/ActionButton";
import Modal from "../components/ui/Modal";

import {
  Building2,
  Search,
  Users,
  Layers3,
  Crown,
  Phone,
  Mail,
} from "lucide-react";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  getThemeClasses,
} from "../utils/theme";

function Flats() {
  const [flats, setFlats] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFlatModal, setShowFlatModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingFlat, setEditingFlat] = useState(null);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [accountMode, setAccountMode] = useState("create");
  const [formData, setFormData] = useState({
    flatNumber: "",
    ownerName: "",
    contactNumber: "",
    email: "",
    wing: "A",
    floor: 1,
  });
  const [accountForm, setAccountForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const { theme } = useTheme();
  const styles = getThemeClasses(theme);

  useEffect(() => {
    loadFlats();
  }, []);

  const loadFlats = async () => {
    try {
      setLoading(true);

      const [flatsRes, vehiclesRes] = await Promise.all([
        api.get("/flats"),
        api.get("/vehicles"),
      ]);

      const vehicles = vehiclesRes.data.data || [];
      const vehicleMap = vehicles.reduce((acc, vehicle) => {
        const flatId = vehicle.flatId?._id;
        if (!flatId) return acc;

        if (!acc[flatId]) {
          acc[flatId] = [];
        }

        acc[flatId].push(vehicle.vehicleNumber);
        return acc;
      }, {});

      setFlats(
        flatsRes.data.map((flat) => ({
          ...flat,
          vehicleNumbers: vehicleMap[flat._id] || [],
          vehicleCount: (vehicleMap[flat._id] || []).length,
        }))
      );
    } catch (error) {
      toast.error("Failed to load flats");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingFlat(null);
    setFormData({
      flatNumber: "",
      ownerName: "",
      contactNumber: "",
      email: "",
      wing: "A",
      floor: 1,
    });
    setShowFlatModal(true);
  };

  const openEditModal = (flat) => {
    setEditingFlat(flat);
    setFormData({
      flatNumber: flat.flatNumber || "",
      ownerName: flat.ownerName || "",
      contactNumber: flat.contactNumber || "",
      email: flat.email || "",
      wing: flat.wing || "A",
      floor: flat.floor || 1,
    });
    setShowFlatModal(true);
  };

  const openCreateAccountModal = (flat) => {
    setSelectedFlat(flat);
    setAccountMode("create");
    setAccountForm({ password: "", confirmPassword: "" });
    setShowAccountModal(true);
  };

  const openResetPasswordModal = (flat) => {
    setSelectedFlat(flat);
    setAccountMode("reset");
    setAccountForm({ password: "", confirmPassword: "" });
    setShowAccountModal(true);
  };

  const saveFlat = async () => {
    try {
      if (editingFlat) {
        await api.put(`/flats/${editingFlat._id}`, formData);
        toast.success("Flat updated");
      } else {
        await api.post("/flats", formData);
        toast.success("Flat added");
      }

      setShowFlatModal(false);
      loadFlats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
    }
  };

  const toggleFlatActive = async (flat) => {
    const action = flat.isActive ? "deactivate" : "reactivate";

    if (!window.confirm(`Are you sure you want to ${action} this flat?`)) {
      return;
    }

    try {
      await api.put(`/flats/${flat._id}`, { isActive: !flat.isActive });
      toast.success(`Flat ${flat.isActive ? "deactivated" : "reactivated"}`);
      loadFlats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const toggleAccount = async (flat) => {
    if (!flat.account?.userId) return;

    try {
      await api.patch(`/auth/resident/${flat.account.userId}/toggle`);
      toast.success(flat.account.isActive ? "Account disabled" : "Account enabled");
      loadFlats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Account update failed");
    }
  };

  const submitAccountForm = async () => {
    if (!accountForm.password.trim() || !accountForm.confirmPassword.trim()) {
      toast.error("Please fill both password fields.");
      return;
    }

    if (accountForm.password !== accountForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!selectedFlat) return;

    try {
      if (accountMode === "create") {
        await api.post("/auth/resident", {
          flatId: selectedFlat._id,
          password: accountForm.password,
        });
        toast.success("Resident account created");
      } else {
        if (!selectedFlat.account?.userId) {
          toast.error("No resident account available.");
          return;
        }
        await api.put(`/auth/resident/${selectedFlat.account.userId}/password`, {
          password: accountForm.password,
        });
        toast.success("Password reset successfully");
      }

      setShowAccountModal(false);
      loadFlats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed");
    }
  };

  const getAccountStatus = (flat) => {
    if (!flat.account?.exists) {
      return {
        label: "Not Created",
        badge: "bg-amber-100 text-amber-700",
        icon: "🟡",
      };
    }

    if (flat.account.isActive) {
      return {
        label: "Account Active",
        badge: "bg-green-100 text-green-700",
        icon: "🟢",
      };
    }

    return {
      label: "Account Disabled",
      badge: "bg-zinc-100 text-zinc-700",
      icon: "⚫",
    };
  };

  const getVehicleText = (flat) => {
    if (!flat.vehicleCount) {
      return "No Vehicle";
    }

    if (flat.vehicleCount === 1) {
      return "🚗 1 Vehicle";
    }

    return `🚗 ${flat.vehicleCount} Vehicles`;
  };

  const filteredFlats = flats.filter((flat) => {
    const q = search.toLowerCase();
    const accountStatus = flat.account?.exists
      ? flat.account.isActive
        ? "active"
        : "disabled"
      : "not created";
    const vehicleNumbers = (flat.vehicleNumbers || []).join(" ");

    return (
      flat.flatNumber?.toLowerCase().includes(q) ||
      flat.ownerName?.toLowerCase().includes(q) ||
      flat.contactNumber?.toLowerCase().includes(q) ||
      flat.email?.toLowerCase().includes(q) ||
      accountStatus.includes(q) ||
      vehicleNumbers.toLowerCase().includes(q)
    );
  });

  const totalFlats = flats.length;
  const accountsCreated = flats.filter((flat) => flat.account?.exists).length;
  const vehiclesRegistered = flats.reduce((sum, flat) => sum + (flat.vehicleCount || 0), 0);
  const pendingAccounts = flats.filter((flat) => !flat.account?.exists).length;
  const residents = flats.filter((flat) => flat.ownerName).length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xl">
        Loading residences...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div
        className={`
          ${styles.glassCard}
          border
          rounded-3xl
          p-8
          overflow-hidden
          relative
        `}
      >
        <div
          className="
            absolute
            top-0
            right-0
            w-72
            h-72
            bg-red-500/10
            blur-3xl
            rounded-full
          "
        />

        <div className="relative z-10">
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-red-500/10
              border
              border-red-500/20
              text-red-500
              text-sm
              font-medium
            "
          >
            <Building2 size={16} />
            RESIDENT MANAGEMENT
          </div>

          <h1
            className={`
              text-5xl
              lg:text-6xl
              font-black
              mt-6
              ${styles.text}
            `}
          >
            Residences
            <br />
            Command Center
          </h1>

          <p className={`mt-4 text-lg ${styles.muted}`}>
            Manage flats, residents and ownership records.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className={`${styles.card} border rounded-3xl p-6`}>
          <div className="flex justify-between">
            <div>
              <p className={styles.muted}>Residents</p>
              <h2 className="text-4xl font-black mt-2">{residents}</h2>
            </div>
            <Users className="text-green-500" size={36} />
          </div>
        </div>

        <div className={`${styles.card} border rounded-3xl p-6`}>
          <div className="flex justify-between">
            <div>
              <p className={styles.muted}>Accounts Created</p>
              <h2 className="text-4xl font-black mt-2">{accountsCreated}</h2>
            </div>
            <Crown className="text-yellow-500" size={36} />
          </div>
        </div>

        <div className={`${styles.card} border rounded-3xl p-6`}>
          <div className="flex justify-between">
            <div>
              <p className={styles.muted}>Vehicles Registered</p>
              <h2 className="text-4xl font-black mt-2">{vehiclesRegistered}</h2>
            </div>
            <Building2 className="text-blue-500" size={36} />
          </div>
        </div>

        <div className={`${styles.card} border rounded-3xl p-6`}>
          <div className="flex justify-between">
            <div>
              <p className={styles.muted}>Pending Accounts</p>
              <h2 className="text-4xl font-black mt-2">{pendingAccounts}</h2>
            </div>
            <Layers3 className="text-amber-500" size={36} />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />

          <input
            type="text"
            placeholder="Search by flat, owner, phone, email, vehicle or account status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`
              ${styles.input}
              w-full
              border
              rounded-2xl
              pl-12
              pr-4
              py-3
            `}
          />
        </div>

        <ActionButton onClick={openAddModal}>Add Flat</ActionButton>
      </div>

      <div className={`
          hidden
          lg:block
          ${styles.table}
          border
          rounded-3xl
          overflow-hidden
        `}>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${styles.tableRow}`}>
              <th className="p-4 text-left">Flat</th>
              <th className="p-4 text-left">Owner</th>
              <th className="p-4 text-left">Vehicle</th>
              <th className="p-4 text-left">Account</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlats.map((flat) => {
              const accountStatus = getAccountStatus(flat);
              const vehicleText = getVehicleText(flat);

              return (
                <tr key={flat._id} className={`border-b ${styles.tableRow}`}>
                  <td className="p-4 font-bold">
                    <div>{flat.flatNumber}</div>
                    {!flat.isActive && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs">
                        Archived
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold">{flat.ownerName || "No Owner"}</div>
                    <div className="mt-2 text-sm text-zinc-500">{flat.contactNumber || "No Phone"}</div>
                    <div className="mt-1 text-sm text-zinc-500">{flat.email || "No Email"}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                      {vehicleText}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${accountStatus.badge}`}>
                      {accountStatus.icon}
                      {accountStatus.label}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="grid gap-2">
                      {!flat.account?.exists ? (
                        <ActionButton variant="warning" onClick={() => openCreateAccountModal(flat)}>
                          Create Account
                        </ActionButton>
                      ) : (
                        <ActionButton variant="warning" onClick={() => openResetPasswordModal(flat)}>
                          Reset Password
                        </ActionButton>
                      )}

                      {flat.account?.exists && (
                        <ActionButton variant={flat.account.isActive ? "danger" : "success"} onClick={() => toggleAccount(flat)}>
                          {flat.account.isActive ? "Disable Account" : "Enable Account"}
                        </ActionButton>
                      )}

                      <ActionButton variant="secondary" onClick={() => openEditModal(flat)}>
                        Edit
                      </ActionButton>

                      <ActionButton variant="danger" onClick={() => toggleFlatActive(flat)}>
                        {flat.isActive ? "Deactivate Flat" : "Reactivate Flat"}
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden grid gap-4">
        {filteredFlats.map((flat) => {
          const accountStatus = getAccountStatus(flat);
          const vehicleText = getVehicleText(flat);

          return (
            <div key={flat._id} className={`${styles.card} border rounded-3xl p-5`}>
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="text-2xl font-black">{flat.flatNumber}</h3>
                  <div className="mt-2 text-sm text-zinc-500">{flat.ownerName || "No Owner"}</div>
                </div>

                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${accountStatus.badge} text-sm`}>
                  {accountStatus.icon}
                  {accountStatus.label}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                    {vehicleText}
                  </span>

                  {!flat.isActive && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-sm">
                      Archived
                    </span>
                  )}
                </div>

                <div className="text-sm text-zinc-500 space-y-1">
                  <div>☎ {flat.contactNumber || "No Phone"}</div>
                  <div>✉ {flat.email || "No Email"}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-5">
                {!flat.account?.exists ? (
                  <ActionButton variant="warning" onClick={() => openCreateAccountModal(flat)}>
                    Create Account
                  </ActionButton>
                ) : (
                  <ActionButton variant="warning" onClick={() => openResetPasswordModal(flat)}>
                    Reset Password
                  </ActionButton>
                )}

                {flat.account?.exists && (
                  <ActionButton variant={flat.account.isActive ? "danger" : "success"} onClick={() => toggleAccount(flat)}>
                    {flat.account.isActive ? "Disable Account" : "Enable Account"}
                  </ActionButton>
                )}

                <ActionButton variant="secondary" onClick={() => openEditModal(flat)}>
                  Edit
                </ActionButton>

                <ActionButton variant="danger" onClick={() => toggleFlatActive(flat)}>
                  {flat.isActive ? "Deactivate Flat" : "Reactivate Flat"}
                </ActionButton>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showFlatModal} onClose={() => setShowFlatModal(false)} title={editingFlat ? "Edit Flat" : "Add Flat"}>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Flat Number"
            value={formData.flatNumber}
            onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
          />

          <input
            type="text"
            placeholder="Owner Name"
            value={formData.ownerName}
            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={formData.contactNumber}
            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
          />

          <select
            value={formData.wing}
            onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
          >
            <option value="A">A Wing</option>
            <option value="B">B Wing</option>
          </select>

          <input
            type="number"
            placeholder="Floor"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
          />

          <div className="flex justify-end gap-3 pt-4">
            <ActionButton variant="secondary" onClick={() => setShowFlatModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton onClick={saveFlat}>{editingFlat ? "Update Flat" : "Add Flat"}</ActionButton>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} title="Resident Account">
        <div className="space-y-4">
          <div className="text-sm text-zinc-500">
            {accountMode === "create"
              ? `Create an account for flat ${selectedFlat?.flatNumber || ""}.`
              : `Reset password for flat ${selectedFlat?.flatNumber || ""}.`}
          </div>
          <input
            type="password"
            placeholder="Password"
            value={accountForm.password}
            onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={accountForm.confirmPassword}
            onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
          />

          <div className="flex justify-end gap-3 pt-4">
            <ActionButton variant="secondary" onClick={() => setShowAccountModal(false)}>
              Cancel
            </ActionButton>
            <ActionButton onClick={submitAccountForm}>{accountMode === "create" ? "Create Account" : "Reset Password"}</ActionButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Flats;
