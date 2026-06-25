

import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

import PageHeader from "../components/ui/PageHeader";
import ActionButton from "../components/ui/ActionButton";
import Modal from "../components/ui/Modal";

import {
  CarFront,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Bike,
} from "lucide-react";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  getThemeClasses,
} from "../utils/theme";

function Vehicles() {
  const [vehicles, setVehicles] =
    useState([]);

  const [flats, setFlats] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [
    editingVehicle,
    setEditingVehicle,
  ] = useState(null);

  const [formData, setFormData] =
    useState({
      vehicleNumber: "",
      vehicleType: "CAR",
      flatId: "",
      isActive: true,
    });

  const { theme } =
    useTheme();

  const styles =
    getThemeClasses(theme);

  useEffect(() => {
    loadVehicles();
    loadFlats();
  }, []);

  const loadVehicles = async () => {
    try {
      const res =
        await api.get(
          "/vehicles"
        );

      setVehicles(
        res.data.data || []
      );
    } catch (error) {
      toast.error(
        "Failed to load vehicles"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFlats = async () => {
    try {
      const res =
        await api.get("/flats");

      setFlats(
        res.data.data ||
          res.data ||
          []
      );
    } catch {
      toast.error(
        "Failed to load flats"
      );
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);

    setFormData({
      vehicleNumber: "",
      vehicleType: "CAR",
      flatId: "",
      isActive: true,
    });

    setShowModal(true);
  };

  const openEditModal = (
    vehicle
  ) => {
    setEditingVehicle(vehicle);

    setFormData({
      vehicleNumber:
        vehicle.vehicleNumber,
      vehicleType:
        vehicle.vehicleType,
      flatId:
        vehicle.flatId?._id ||
        "",
      isActive:
        vehicle.isActive,
    });

    setShowModal(true);
  };

  const saveVehicle =
    async () => {
      try {
        if (
          editingVehicle
        ) {
          await api.put(
            `/vehicles/${editingVehicle._id}`,
            formData
          );

          toast.success(
            "Vehicle Updated"
          );
        } else {
          await api.post(
            "/vehicles",
            formData
          );

          toast.success(
            "Vehicle Created"
          );
        }

        setShowModal(false);
        loadVehicles();

      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Save Failed"
        );
      }
    };

  const deleteVehicle =
    async (vehicleId) => {
      if (
        !window.confirm(
          "Delete this vehicle?"
        )
      )
        return;

      try {
        await api.delete(
          `/vehicles/${vehicleId}`
        );

        toast.success(
          "Vehicle Deleted"
        );

        loadVehicles();

      } catch {
        toast.error(
          "Delete Failed"
        );
      }
    };

  const filteredVehicles =
    vehicles.filter(
      (vehicle) =>
        vehicle.vehicleNumber
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        vehicle.flatId?.flatNumber
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        vehicle.flatId?.ownerName
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  const activeVehicles =
    vehicles.filter(
      (v) => v.isActive
    ).length;

  const inactiveVehicles =
    vehicles.filter(
      (v) => !v.isActive
    ).length;

  const cars =
    vehicles.filter(
      (v) =>
        v.vehicleType ===
        "CAR"
    ).length;

  const bikes =
    vehicles.filter(
      (v) =>
        v.vehicleType ===
        "BIKE"
    ).length;

  if (loading) {
    return (
      <div
        className="
          min-h-[60vh]
          flex
          items-center
          justify-center
          text-xl
        "
      >
        Loading Vehicles...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HERO */}

      <div
        className={`
          ${styles.glassCard}
          border
          rounded-3xl
          p-8
          relative
          overflow-hidden
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
            "
          >
            <CarFront size={16} />
            VEHICLE CONTROL
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
            Vehicle
            <br />
            Registry
          </h1>

          <p
            className={`
              mt-4
              text-lg
              ${styles.muted}
            `}
          >
            Manage all
            registered resident
            vehicles.
          </p>

        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
        "
      >
        <div
          className={`
            ${styles.card}
            border
            rounded-3xl
            p-6
          `}
        >
          <p className={styles.muted}>
            Total Vehicles
          </p>

          <div
            className="
              flex
              items-center
              justify-between
              mt-4
            "
          >
            <h2
              className="
                text-4xl
                font-black
              "
            >
              {vehicles.length}
            </h2>

            <CarFront
              size={34}
              className="
                text-red-500
              "
            />
          </div>
        </div>

        <div
          className={`
            ${styles.card}
            border
            rounded-3xl
            p-6
          `}
        >
          <p className={styles.muted}>
            Active
          </p>

          <div
            className="
              flex
              items-center
              justify-between
              mt-4
            "
          >
            <h2
              className="
                text-4xl
                font-black
                text-green-500
              "
            >
              {activeVehicles}
            </h2>

            <CheckCircle2
              size={34}
              className="
                text-green-500
              "
            />
          </div>
        </div>

        <div
          className={`
            ${styles.card}
            border
            rounded-3xl
            p-6
          `}
        >
          <p className={styles.muted}>
            Cars
          </p>

          <div
            className="
              flex
              items-center
              justify-between
              mt-4
            "
          >
            <h2
              className="
                text-4xl
                font-black
                text-blue-500
              "
            >
              {cars}
            </h2>

            <CarFront
              size={34}
              className="
                text-blue-500
              "
            />
          </div>
        </div>

        <div
          className={`
            ${styles.card}
            border
            rounded-3xl
            p-6
          `}
        >
          <p className={styles.muted}>
            Bikes
          </p>

          <div
            className="
              flex
              items-center
              justify-between
              mt-4
            "
          >
            <h2
              className="
                text-4xl
                font-black
                text-yellow-500
              "
            >
              {bikes}
            </h2>

            <Bike
              size={34}
              className="
                text-yellow-500
              "
            />
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          gap-4
        "
      >
        <div className="flex-1 relative">

          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-zinc-500
            "
          />

          <input
            type="text"
            placeholder="Search vehicle, flat or owner..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className={`
              ${styles.input}
              w-full
              border
              rounded-2xl
              pl-11
              pr-4
              py-3
            `}
          />
        </div>

      <ActionButton
  onClick={
    openAddModal
  }
  className="
    relative
    w-full
    flex
    items-center
    justify-center
  "
>
  <Plus
    size={22}
    className="
      absolute
      left-5
    "
  />

  <span>
    Add Vehicle
  </span>
</ActionButton>

      </div>

      {/* TABLE */}

      <div
        className={`
          ${styles.table}
          overflow-x-auto
          border
          rounded-3xl
        `}
      >
        <table className="w-full">

          <thead>

            <tr
              className="
                border-b
                border-zinc-700
              "
            >
              <th className="p-5 text-left">
                Vehicle
              </th>

              <th className="p-5 text-left">
                Type
              </th>

              <th className="p-5 text-left">
                Flat
              </th>

              <th className="p-5 text-left">
                Owner
              </th>

              <th className="p-5 text-left">
                Status
              </th>

              <th className="p-5 text-left">
                Actions
              </th>
            </tr>

          </thead>

          <tbody>

            {filteredVehicles.map(
              (vehicle) => (
                <tr
                  key={
                    vehicle._id
                  }
                  className={`
                    border-b
                    ${styles.tableRow}
                  `}
                >
                  <td className="p-5 font-semibold">
                    {
                      vehicle.vehicleNumber
                    }
                  </td>

                  <td className="p-5">
                    {
                      vehicle.vehicleType
                    }
                  </td>

                  <td className="p-5">
                    {vehicle.flatId
                      ?.flatNumber ||
                      "Unassigned"}
                  </td>

                  <td className="p-5">
                    {vehicle.flatId
                      ?.ownerName ||
                      "-"}
                  </td>

                  <td className="p-5">
                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-bold

                        ${
                          vehicle.isActive
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        }
                      `}
                    >
                      {vehicle.isActive
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>
                  </td>

                  <td className="p-5">
                    <div className="flex gap-2">
                      <ActionButton
                        variant="secondary"
                        onClick={() =>
                          openEditModal(
                            vehicle
                          )
                        }
                      >
                        <Pencil size={16} />
                      </ActionButton>

                      <ActionButton
                        variant="danger"
                        onClick={() =>
                          deleteVehicle(
                            vehicle._id
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              )
            )}

          </tbody>

        </table>
      </div>

      {/* MODAL */}

      <Modal
        isOpen={showModal}
        onClose={() =>
          setShowModal(false)
        }
        title={
          editingVehicle
            ? "Edit Vehicle"
            : "Add Vehicle"
        }
      >
        <div className="space-y-4">


          <input
            type="text"
            placeholder="Vehicle Number"
            value={
              formData.vehicleNumber
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                vehicleNumber:
                  e.target.value.toUpperCase(),
              })
            }
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
            value={
              formData.vehicleType
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                vehicleType:
                  e.target.value,
              })
            }
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
          >
            <option value="CAR">
              CAR
            </option>

            <option value="BIKE">
              BIKE
            </option>
          </select>

          <select
            value={
              formData.flatId
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                flatId:
                  e.target.value,
              })
            }
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
          >
            <option value="">
              Select Flat
            </option>

            {flats.map(
              (flat) => (
                <option
                  key={flat._id}
                  value={flat._id}
                >
                  Flat{" "}
                  {
                    flat.flatNumber
                  }
                  {flat.ownerName
                    ? ` - ${flat.ownerName}`
                    : ""}
                </option>
              )
            )}
          </select>

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <input
              type="checkbox"
              checked={
                formData.isActive
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive:
                    e.target.checked,
                })
              }
              className="
                h-4
                w-4
              "
            />

            <span>
              Active Vehicle
            </span>
          </div>

          <div
            className="
              flex
              justify-end
              gap-3
              pt-4
            "
          >
            <ActionButton
              variant="secondary"
              onClick={() =>
                setShowModal(
                  false
                )
              }
            >
              Cancel
            </ActionButton>

            <ActionButton
              onClick={
                saveVehicle
              }
            >
              {editingVehicle
                ? "Update Vehicle"
                : "Create Vehicle"}
            </ActionButton>

          </div>

        </div>
      </Modal>

    </div>
  );
}

export default Vehicles;	