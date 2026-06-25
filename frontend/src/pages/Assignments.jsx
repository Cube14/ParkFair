
import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

import PageHeader from "../components/ui/PageHeader";
import ActionButton from "../components/ui/ActionButton";
import Modal from "../components/ui/Modal";
import StatusBadge from "../components/ui/StatusBadge";

import {
  ClipboardList,
  Search,
  CarFront,
  ParkingSquare,
  Building2,
  CircleDot,
} from "lucide-react";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  getThemeClasses,
} from "../utils/theme";

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

  const { theme } =
    useTheme();

  const styles =
    getThemeClasses(theme);

  useEffect(() => {
    loadAssignments();
    loadCycles();
    loadSlots();
    loadFlats();
    loadVehicles();
  }, []);

  const handleFlatChange = (
    flatId
  ) => {
    const vehicle =
      vehicles.find(
        (v) =>
          v.flatId?._id ===
          flatId
      );

    setFormData((prev) => ({
      ...prev,
      flatId,
      vehicleId:
        vehicle?._id || "",
    }));
  };

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

      setCycles(
        res.data.data
      );
    } catch {}
  };

  const loadSlots = async () => {
    try {
      const res =
        await api.get("/slots");

      setSlots(
        res.data.data
      );
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
      } catch {
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
      } catch {
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

  const totalAssignments =
    assignments.length;

  const insideAssignments =
    assignments.filter(
      (a) =>
        a.parkingType ===
        "INSIDE"
    ).length;

  const outsideAssignments =
    assignments.filter(
      (a) =>
        a.parkingType ===
        "OUTSIDE"
    ).length;

  const activeAssignments =
    assignments.filter(
      (a) =>
        a.assignmentStatus ===
        "ACTIVE"
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
        Loading Assignments...
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
            <ClipboardList
              size={16}
            />
            ASSIGNMENT CONTROL
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
            Parking
            <br />
            Assignments
          </h1>

          <p
            className={`
              mt-4
              text-lg
              ${styles.muted}
            `}
          >
            Manage cycle
            allocations, slot
            occupancy and
            vehicle placement.
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
          <div className="flex justify-between">
            <div>
              <p className={styles.muted}>
                Total Assignments
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {totalAssignments}
              </h2>
            </div>

            <ClipboardList
              className="
                text-red-500
              "
              size={36}
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
          <div className="flex justify-between">
            <div>
              <p className={styles.muted}>
                Active
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {activeAssignments}
              </h2>
            </div>

            <CircleDot
              className="
                text-green-500
              "
              size={36}
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
          <div className="flex justify-between">
            <div>
              <p className={styles.muted}>
                Inside Parking
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {insideAssignments}
              </h2>
            </div>

            <ParkingSquare
              className="
                text-blue-500
              "
              size={36}
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
          <div className="flex justify-between">
            <div>
              <p className={styles.muted}>
                Outside Parking
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {outsideAssignments}
              </h2>
            </div>

            <CarFront
              className="
                text-orange-500
              "
              size={36}
            />
          </div>
        </div>

      </div>

      {/* SEARCH + ACTIONS */}

      <div
        className="
          flex
          flex-col
          lg:flex-row
          gap-4
        "
      >
        <div className="relative flex-1">

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
            placeholder="Search assignment..."
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
              pl-12
              pr-4
              py-3
            `}
          />

        </div>

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

      {/* DESKTOP TABLE */}

      <div
        className={`
          hidden
          lg:block
          ${styles.table}
          border
          rounded-3xl
          overflow-hidden
        `}
      >
        <table className="w-full">

          <thead>

            <tr
              className={`
                border-b
                ${styles.tableRow}
              `}
            >
              <th className="p-4 text-left">
                Cycle
              </th>

              <th className="p-4 text-left">
                Flat
              </th>

              <th className="p-4 text-left">
                Vehicle
              </th>

              <th className="p-4 text-left">
                Slot
              </th>

              <th className="p-4 text-left">
                Type
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

            {filteredAssignments.map(
              (
                assignment
              ) => (
                <tr
                  key={
                    assignment._id
                  }
                  className={`
                    border-b
                    ${styles.tableRow}
                  `}
                >
                  <td className="p-4">
                    {
                      assignment
                        .cycleId
                        ?.cycleName
                    }
                  </td>

                  <td className="p-4 font-bold">
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
                    Slot{" "}
                    {
                      assignment
                        .slotId
                        ?.slotNumber
                    }
                  </td>

                  <td className="p-4">
                    <span
                      className={
                        assignment.parkingType ===
                        "INSIDE"
                          ? `
                            px-3
                            py-1
                            rounded-full
                            bg-green-500/10
                            text-green-500
                            text-sm
                          `
                          : `
                            px-3
                            py-1
                            rounded-full
                            bg-orange-500/10
                            text-orange-500
                            text-sm
                          `
                      }
                    >
                      {
                        assignment.parkingType
                      }
                    </span>
                  </td>

                  <td className="p-4">
                    <StatusBadge
                      status={
                        assignment.assignmentStatus
                      }
                    />
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">

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

                    </div>
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>
      </div>

      {/* MOBILE CARDS */}

      <div
        className="
          lg:hidden
          grid
          gap-4
        "
      >
        {filteredAssignments.map(
          (
            assignment
          ) => (
            <div
              key={
                assignment._id
              }
              className={`
                ${styles.card}
                border
                rounded-3xl
                p-5
              `}
            >
              <div className="flex justify-between">

                <div>

                  <h3
                    className="
                      text-2xl
                      font-black
                    "
                  >
                    Flat{" "}
                    {
                      assignment
                        .flatId
                        ?.flatNumber
                    }
                  </h3>

                  <p
                    className={
                      styles.muted
                    }
                  >
                    {
                      assignment
                        .cycleId
                        ?.cycleName
                    }
                  </p>

                </div>

                <StatusBadge
                  status={
                    assignment.assignmentStatus
                  }
                />

              </div>

              <div className="mt-4 space-y-2">

                <div>
                  Vehicle :
                  {" "}
                  {
                    assignment
                      .vehicleId
                      ?.vehicleNumber
                  }
                </div>

                <div>
                  Slot :
                  {" "}
                  {
                    assignment
                      .slotId
                      ?.slotNumber
                  }
                </div>

                <div>
                  Type :
                  {" "}
                  {
                    assignment.parkingType
                  }
                </div>

              </div>

              <div className="flex gap-2 mt-5">

                <ActionButton
                  variant="secondary"
                  onClick={() =>
                    openEditModal(
                      assignment
                    )
                  }
                  className="flex-1"
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
                  className="flex-1"
                >
                  Delete
                </ActionButton>

              </div>

            </div>
          )
        )}
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
              Select Cycle
            </option>

            {cycles.map(
              (cycle) => (
                <option
                  key={cycle._id}
                  value={cycle._id}
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
              handleFlatChange(
                e.target.value
              )
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
              Select Slot
            </option>

            {slots.map(
              (slot) => (
                <option
                  key={slot._id}
                  value={slot._id}
                >
                  Slot{" "}
                  {
                    slot.slotNumber
                  }
                </option>
              )
            )}
          </select>

          <select
            value={
              formData.parkingType
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                parkingType:
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
            <option value="INSIDE">
              INSIDE
            </option>

            <option value="OUTSIDE">
              OUTSIDE
            </option>
          </select>

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
                saveAssignment
              }
            >
              {editingAssignment
                ? "Update Assignment"
                : "Create Assignment"}
            </ActionButton>

          </div>

        </div>
      </Modal>

    </div>
  );
}

export default Assignments;
	