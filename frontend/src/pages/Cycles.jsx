

import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

import PageHeader from "../components/ui/PageHeader";
import ActionButton from "../components/ui/ActionButton";
import StatusBadge from "../components/ui/StatusBadge";
import Modal from "../components/ui/Modal";

import {
  CalendarRange,
  PlayCircle,
  CheckCircle2,
  Clock3,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  getThemeClasses,
} from "../utils/theme";

function Cycles() {
  const [cycles, setCycles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    showCloneModal,
    setShowCloneModal,
  ] = useState(false);

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    selectedCycle,
    setSelectedCycle,
  ] = useState(null);

  const [
    cycleToDelete,
    setCycleToDelete,
  ] = useState(null);

  const [createData, setCreateData] =
    useState({
      cycleName: "",
      startDate: "",
      durationDays: 15,
    });

  const [cloneData, setCloneData] =
    useState({
      cycleName: "",
      startDate: "",
      endDate: "",
      durationDays: 15,
    });

  const { theme } =
    useTheme();

  const styles =
    getThemeClasses(theme);

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      setLoading(true);

      const res =
        await api.get("/cycles");

      const sorted =
        [...res.data.data].sort(
          (a, b) => {
            const order = {
              ACTIVE: 0,
              PLANNED: 1,
              COMPLETED: 2,
            };

            return (
              order[a.status] -
              order[b.status]
            );
          }
        );

      setCycles(sorted);
    } catch {
      toast.error(
        "Failed to load cycles"
      );
    } finally {
      setLoading(false);
    }
  };

  const createCycle =
    async () => {
      try {
        const start =
          new Date(
            createData.startDate
          );

        const end =
          new Date(start);

        end.setDate(
          end.getDate() +
            createData.durationDays -
            1
        );

        await api.post(
          "/cycles",
          {
            cycleName:
              createData.cycleName,
            startDate:
              createData.startDate,
            endDate: end,
            durationDays:
              createData.durationDays,
          }
        );

        toast.success(
          "Cycle Created"
        );

        setShowCreateModal(
          false
        );

        loadCycles();

      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Creation Failed"
        );
      }
    };

  const activateCycle =
    async (cycleId) => {
      try {
        await api.put(
          `/cycles/${cycleId}/status`,
          {
            status: "ACTIVE",
          }
        );

        toast.success(
          "Cycle Activated"
        );

        loadCycles();

      } catch {
        toast.error(
          "Activation Failed"
        );
      }
    };

  const completeCycle =
    async (cycleId) => {
      try {
        await api.put(
          `/cycles/${cycleId}/complete`
        );

        toast.success(
          "Cycle Completed"
        );

        loadCycles();

      } catch {
        toast.error(
          "Completion Failed"
        );
      }
    };
    const openCloneModal = (
  cycle
) => {
  setSelectedCycle(cycle);

  setCloneData({
    cycleName: `${cycle.cycleName} Copy`,
    startDate: "",
    endDate: "",
    durationDays:
      cycle.durationDays || 15,
  });

  setShowCloneModal(true);
};

const cloneCycle =
  async () => {
    try {
      if (!selectedCycle) {
        toast.error(
          "No cycle selected"
        );
        return;
      }

      const start =
        new Date(
          cloneData.startDate
        );

      const end =
        new Date(start);

      end.setDate(
        end.getDate() +
          cloneData.durationDays -
          1
      );

      await api.post(
        "/cycles",
        {
          cycleName:
            cloneData.cycleName,
          startDate:
            cloneData.startDate,
          endDate: end,
          durationDays:
            cloneData.durationDays,
        }
      );

      toast.success(
        "Cycle Cloned"
      );

      setShowCloneModal(
        false
      );

      loadCycles();

    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Clone Failed"
      );
    }
  };

const deleteCycle =
  async () => {
    try {
      if (!cycleToDelete)
        return;

      await api.delete(
        `/cycles/${cycleToDelete._id}`
      );

      toast.success(
        "Cycle Deleted"
      );

      setShowDeleteModal(
        false
      );

      setCycleToDelete(
        null
      );

      loadCycles();

    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Delete Failed"
      );
    }
  };

  
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
        Loading Cycles...
      </div>
    );
  }

  const activeCount =
    cycles.filter(
      (c) =>
        c.status === "ACTIVE"
    ).length;

  const plannedCount =
    cycles.filter(
      (c) =>
        c.status === "PLANNED"
    ).length;

  const completedCount =
    cycles.filter(
      (c) =>
        c.status ===
        "COMPLETED"
    ).length;

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
            <CalendarRange
              size={16}
            />
            CYCLE CONTROL
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
            Cycles
          </h1>

          <p
            className={`
              mt-4
              text-lg
              ${styles.muted}
            `}
          >
            Manage parking
            rotation cycles,
            activations and
            scheduling.
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
                Total Cycles
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {cycles.length}
              </h2>
            </div>

            <CalendarRange
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
                  text-green-500
                "
              >
                {activeCount}
              </h2>
            </div>

            <PlayCircle
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
                Planned
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                  text-blue-500
                "
              >
                {plannedCount}
              </h2>
            </div>

            <Clock3
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
                Completed
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                  text-zinc-400
                "
              >
                {completedCount}
              </h2>
            </div>

            <CheckCircle2
              className="
                text-zinc-400
              "
              size={36}
            />
          </div>
        </div>

      </div>

      {/* ACTION BAR */}

      <div
        className="
          flex
          justify-end
        "
      >
        <ActionButton
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          <Plus size={18} />
          Create Cycle
        </ActionButton>
      </div>

      {/* CYCLE CARDS */}

      <div
        className="
          grid
          lg:grid-cols-2
          gap-6
        "
      >
        {cycles.map((cycle) => (
          <div
            key={cycle._id}
            className={`
              ${styles.card}
              border
              rounded-3xl
              p-6
            `}
          >
            <div className="flex justify-between items-start">

              <div>

                <h2
                  className="
                    text-2xl
                    font-black
                  "
                >
                  {cycle.cycleName}
                </h2>

                <p
                  className={`
                    mt-2
                    ${styles.muted}
                  `}
                >
                  {new Date(
                    cycle.startDate
                  ).toLocaleDateString()}
                  {" - "}
                  {new Date(
                    cycle.endDate
                  ).toLocaleDateString()}
                </p>

              </div>

              <StatusBadge
                status={
                  cycle.status
                }
              />

            </div>

            <div
              className="
                mt-4
                text-sm
                text-zinc-500
              "
            >
              Duration :
              {" "}
              <strong>
                {
                  cycle.durationDays
                }
              </strong>
              {" "}
              Days
            </div>

            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-3
              "
            >

              {cycle.status ===
                "PLANNED" && (
                <ActionButton
                  onClick={() =>
                    activateCycle(
                      cycle._id
                    )
                  }
                >
                  Activate
                </ActionButton>
              )}

              {cycle.status ===
                "ACTIVE" && (
                <ActionButton
                  variant="success"
                  onClick={() =>
                    completeCycle(
                      cycle._id
                    )
                  }
                >
                  Complete
                </ActionButton>
              )}

              <ActionButton
                variant="secondary"
                onClick={() =>
                  openCloneModal(
                    cycle
                  )
                }
              >
                <Copy size={16} />
                Clone
              </ActionButton>

              <ActionButton
                variant="danger"
                onClick={() => {
                  setCycleToDelete(
                    cycle
                  );

                  setShowDeleteModal(
                    true
                  );
                }}
              >
                <Trash2 size={16} />
                Delete
              </ActionButton>

            </div>

          </div>
        ))}
      </div>

      {/* CLONE MODAL */}

      <Modal
        isOpen={showCloneModal}
        onClose={() =>
          setShowCloneModal(
            false
          )
        }
        title="Clone Cycle"
      >
        <div className="space-y-4">


          <input
            type="text"
            placeholder="Cycle Name"
            value={
              cloneData.cycleName
            }
            onChange={(e) =>
              setCloneData({
                ...cloneData,
                cycleName:
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
          />

          <input
            type="date"
            value={
              cloneData.startDate
            }
            onChange={(e) =>
              setCloneData({
                ...cloneData,
                startDate:
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
          />

          <div
            className="
              flex
              justify-end
              gap-3
            "
          >
            <ActionButton
              variant="secondary"
              onClick={() =>
                setShowCloneModal(
                  false
                )
              }
            >
              Cancel
            </ActionButton>

            <ActionButton
              onClick={
                cloneCycle
              }
            >
              Clone Cycle
            </ActionButton>

          </div>

        </div>
      </Modal>

      {/* CREATE MODAL */}

      <Modal
        isOpen={showCreateModal}
        onClose={() =>
          setShowCreateModal(
            false
          )
        }
        title="Create New Cycle"
      >
        <div className="space-y-4">

          <input
            type="text"
            placeholder="Cycle Name"
            value={
              createData.cycleName
            }
            onChange={(e) =>
              setCreateData({
                ...createData,
                cycleName:
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
          />

          <input
            type="date"
            value={
              createData.startDate
            }
            onChange={(e) =>
              setCreateData({
                ...createData,
                startDate:
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
          />

          <input
            type="number"
            min="1"
            value={
              createData.durationDays
            }
            onChange={(e) =>
              setCreateData({
                ...createData,
                durationDays:
                  Number(
                    e.target.value
                  ),
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

          <div
            className="
              flex
              justify-end
              gap-3
            "
          >
            <ActionButton
              variant="secondary"
              onClick={() =>
                setShowCreateModal(
                  false
                )
              }
            >
              Cancel
            </ActionButton>

            <ActionButton
              onClick={
                createCycle
              }
            >
              Create Cycle
            </ActionButton>

          </div>

        </div>
      </Modal>

      {/* DELETE MODAL */}

      <Modal
        isOpen={showDeleteModal}
        onClose={() =>
          setShowDeleteModal(
            false
          )
        }
        title="Delete Cycle"
      >
        <div className="space-y-6">

          <p
            className={styles.muted}
          >
            Are you sure you want
            to permanently delete
            cycle
            {" "}
            <strong>
              {
                cycleToDelete?.cycleName
              }
            </strong>
            ?
          </p>

          <div
            className="
              flex
              justify-end
              gap-3
            "
          >
            <ActionButton
              variant="secondary"
              onClick={() =>
                setShowDeleteModal(
                  false
                )
              }
            >
              Cancel
            </ActionButton>

            <ActionButton
              variant="danger"
              onClick={
                deleteCycle
              }
            >
              Delete Cycle
            </ActionButton>

          </div>

        </div>
      </Modal>

    </div>
  );
}

export default Cycles;  