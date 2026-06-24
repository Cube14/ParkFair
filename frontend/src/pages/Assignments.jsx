import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

import PageHeader from "../components/ui/PageHeader";
import ActionButton from "../components/ui/ActionButton";
import Modal from "../components/ui/Modal";

function Assignments() {
  const [assignments, setAssignments] =
    useState([]);

  const [cycles, setCycles] =
    useState([]);

  const [slots, setSlots] =
    useState([]);

  const [flats, setFlats] =
    useState([]);

  const [vehicles, setVehicles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [
    editingAssignment,
    setEditingAssignment,
  ] = useState(null);

  const [formData, setFormData] =
    useState({
      cycleId: "",
      slotId: "",
      flatId: "",
      vehicleId: "",
      parkingType: "INSIDE",
    });

  useEffect(() => {
    loadAssignments();
    loadCycles();
    loadSlots();
    loadFlats();
    loadVehicles();
  }, []);

  const loadAssignments =
    async () => {
      try {
        const res =
          await api.get(
            "/assignments"
          );

        setAssignments(
          res.data.data
        );
      } catch (error) {
        toast.error(
          "Failed to load assignments"
        );
      } finally {
        setLoading(false);
      }
    };

  const loadCycles = async () => {
    try {
      const res =
        await api.get("/cycles");

      setCycles(res.data.data);
    } catch {}
  };

  const loadSlots = async () => {
    try {
      const res =
        await api.get("/slots");

      setSlots(res.data.data);
    } catch {}
  };

  const loadFlats = async () => {
    try {
      const res =
        await api.get("/flats");

      setFlats(res.data);
    } catch {}
  };

  const loadVehicles =
    async () => {
      try {
        const res =
          await api.get(
            "/vehicles"
          );

        setVehicles(
          res.data.data
        );
      } catch {}
    };

  const openCreateModal = () => {
    setEditingAssignment(
      null
    );

    setFormData({
      cycleId: "",
      slotId: "",
      flatId: "",
      vehicleId: "",
      parkingType: "INSIDE",
    });

    setShowModal(true);
  };

  const openEditModal = (
    assignment
  ) => {
    setEditingAssignment(
      assignment
    );

    setFormData({
      cycleId:
        assignment.cycleId?._id,
      slotId:
        assignment.slotId?._id,
      flatId:
        assignment.flatId?._id,
      vehicleId:
        assignment.vehicleId?._id,
      parkingType:
        assignment.parkingType,
    });

    setShowModal(true);
  };

  const saveAssignment =
    async () => {
      try {
        if (
          editingAssignment
        ) {
          await api.put(
            `/assignments/${editingAssignment._id}`,
            {
              slotId:
                formData.slotId,
            }
          );

          toast.success(
            "Assignment Updated"
          );
        } else {
          await api.post(
            "/assignments",
            formData
          );

          toast.success(
            "Assignment Created"
          );
        }

        setShowModal(false);

        loadAssignments();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Operation Failed"
        );
      }
    };

  const deleteAssignment =
    async (id) => {
      if (
        !window.confirm(
          "Delete Assignment?"
        )
      )
        return;

      try {
        await api.delete(
          `/assignments/${id}`
        );

        toast.success(
          "Assignment Deleted"
        );

        loadAssignments();
      } catch (error) {
        toast.error(
          "Delete Failed"
        );
      }
    };

  const resetAssignments =
    async () => {
      if (
        !window.confirm(
          "Delete ALL Assignments?"
        )
      )
        return;

      try {
        await api.delete(
          "/assignments/reset"
        );

        toast.success(
          "Assignments Reset"
        );

        loadAssignments();
      } catch (error) {
        toast.error(
          "Reset Failed"
        );
      }
    };

  const filteredAssignments =
    assignments.filter(
      (item) =>
        item.flatId?.flatNumber
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        item.vehicleId?.vehicleNumber
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        item.slotId?.slotNumber
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        item.cycleId?.cycleName
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  if (loading) {
    return (
      <div>
        Loading Assignments...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="Manage Parking Assignments"
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
          placeholder="Search..."
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
            openCreateModal
          }
        >
          Create Assignment
        </ActionButton>

        <ActionButton
          variant="danger"
          onClick={
            resetAssignments
          }
        >
          Reset All
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
            <tr className="border-b border-zinc-800">
              <th className="p-4 text-left">
                Cycle
              </th>

              <th className="p-4 text-left">
                Slot
              </th>

              <th className="p-4 text-left">
                Flat
              </th>

              <th className="p-4 text-left">
                Vehicle
              </th>

              <th className="p-4 text-left">
                Type
              </th>

              <th className="p-4 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredAssignments.map(
              (assignment) => (
                <tr
                  key={
                    assignment._id
                  }
                  className="border-b border-zinc-800"
                >
                  <td className="p-4">
                    {
                      assignment
                        .cycleId
                        ?.cycleName
                    }
                  </td>

                  <td className="p-4">
                    {
                      assignment
                        .slotId
                        ?.slotNumber
                    }
                  </td>

                  <td className="p-4">
                    {
                      assignment
                        .flatId
                        ?.flatNumber
                    }
                  </td>

                  <td className="p-4">
                    {
                      assignment
                        .vehicleId
                        ?.vehicleNumber
                    }
                  </td>

                  <td className="p-4">
                    {
                      assignment.parkingType
                    }
                  </td>

                  <td className="p-4 flex gap-2">
                    <ActionButton
                      variant="secondary"
                      onClick={() =>
                        openEditModal(
                          assignment
                        )
                      }
                    >
                      Edit
                    </ActionButton>

                    <ActionButton
                      variant="danger"
                      onClick={() =>
                        deleteAssignment(
                          assignment._id
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
          editingAssignment
            ? "Edit Assignment"
            : "Create Assignment"
        }
      >
        <div className="space-y-4">

          {!editingAssignment && (
            <>
              <select
                value={
                  formData.cycleId
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cycleId:
                      e.target.value,
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
              >
                <option value="">
                  Select Cycle
                </option>

                {cycles.map(
                  (cycle) => (
                    <option
                      key={
                        cycle._id
                      }
                      value={
                        cycle._id
                      }
                    >
                      {
                        cycle.cycleName
                      }
                    </option>
                  )
                )}
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

              <select
                value={
                  formData.vehicleId
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicleId:
                      e.target.value,
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
              >
                <option value="">
                  Select Vehicle
                </option>

                {vehicles.map(
                  (
                    vehicle
                  ) => (
                    <option
                      key={
                        vehicle._id
                      }
                      value={
                        vehicle._id
                      }
                    >
                      {
                        vehicle.vehicleNumber
                      }
                    </option>
                  )
                )}
              </select>
            </>
          )}

          <select
            value={
              formData.slotId
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                slotId:
                  e.target.value,
              })
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
          >
            <option value="">
              Select Slot
            </option>

            {slots.map(
              (slot) => (
                <option
                  key={
                    slot._id
                  }
                  value={
                    slot._id
                  }
                >
                  Slot{" "}
                  {
                    slot.slotNumber
                  }
                </option>
              )
            )}
          </select>

          <div className="flex justify-end gap-3 pt-4">
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
                saveAssignment
              }
            >
              {editingAssignment
                ? "Update"
                : "Create"}
            </ActionButton>
          </div>

        </div>
      </Modal>
    </div>
  );
}

export default Assignments;