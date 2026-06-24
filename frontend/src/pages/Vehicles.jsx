import { useEffect, useState } from "react";
import api from "../services/api";

import toast from "react-hot-toast";

import PageHeader from "../components/ui/PageHeader";
import ActionButton from "../components/ui/ActionButton";
import Modal from "../components/ui/Modal";

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

  useEffect(() => {
    loadVehicles();
    loadFlats();
  }, []);

  const loadVehicles = async () => {
    try {
      const res =
        await api.get("/vehicles");

      setVehicles(res.data.data);
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

      setFlats(res.data);
    } catch (error) {
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
        vehicle.flatId?._id || "",
      isActive:
        vehicle.isActive,
    });

    setShowModal(true);
  };

  const saveVehicle = async () => {
    try {
      if (editingVehicle) {
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

  const deleteVehicle = async (
    vehicleId
  ) => {
    if (
      !window.confirm(
        "Delete this vehicle?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/vehicles/${vehicleId}`
      );

      toast.success(
        "Vehicle Deleted"
      );

      loadVehicles();
    } catch (error) {
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

  if (loading) {
    return (
      <div>
        Loading Vehicles...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Vehicle Management"
        subtitle="Manage resident vehicles"
      />

      <div
        className="
          flex
          flex-col
          md:flex-row
          gap-4
          mb-8
        "
      >
        <input
          type="text"
          placeholder="Search Vehicle..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="
            flex-1
            bg-zinc-900
            border
            border-zinc-800
            rounded-xl
            px-4
            py-3
          "
        />

        <ActionButton
          onClick={
            openAddModal
          }
        >
          Add Vehicle
        </ActionButton>
      </div>

      <div
        className="
          overflow-x-auto
          bg-zinc-900/80
          border
          border-zinc-800
          rounded-3xl
        "
      >
        <table className="w-full">
          <thead>
            <tr
              className="
                border-b
                border-zinc-800
              "
            >
              <th className="p-4 text-left">
                Vehicle No.
              </th>

              <th className="p-4 text-left">
                Type
              </th>

              <th className="p-4 text-left">
                Flat
              </th>

              <th className="p-4 text-left">
                Owner
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
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
                  className="
                    border-b
                    border-zinc-800
                  "
                >
                  <td className="p-4">
                    {
                      vehicle.vehicleNumber
                    }
                  </td>

                  <td className="p-4">
                    {
                      vehicle.vehicleType
                    }
                  </td>

                  <td className="p-4">
                    {vehicle.flatId
                      ?.flatNumber ||
                      "Unassigned"}
                  </td>

                  <td className="p-4">
                    {vehicle.flatId
                      ?.ownerName ||
                      "-"}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        vehicle.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {vehicle.isActive
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>
                  </td>

                  <td className="p-4 flex gap-2">
                    <ActionButton
                      variant="secondary"
                      onClick={() =>
                        openEditModal(
                          vehicle
                        )
                      }
                    >
                      Edit
                    </ActionButton>

                    <ActionButton
                      variant="danger"
                      onClick={() =>
                        deleteVehicle(
                          vehicle._id
                        )
                      }
                    >
                      Delete
                    </ActionButton>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

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
                  e.target.value,
              })
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
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
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
          >
            <option value="CAR">
              CAR
            </option>

            <option value="BIKE">
              BIKE
            </option>

            <option value="OTHER">
              OTHER
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
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
          >
            <option value="">
              Select Flat
            </option>

            {flats.map(
              (flat) => (
                <option
                  key={
                    flat._id
                  }
                  value={
                    flat._id
                  }
                >
                  {
                    flat.flatNumber
                  }
                </option>
              )
            )}
          </select>

          <label className="flex items-center gap-3">
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
            />

            Active Vehicle
          </label>

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