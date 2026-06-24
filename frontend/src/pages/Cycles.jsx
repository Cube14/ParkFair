import { useEffect, useState } from "react";

import api from "../services/api";

import toast from "react-hot-toast";

import PageHeader from "../components/ui/PageHeader";
import ActionButton from "../components/ui/ActionButton";
import StatusBadge from "../components/ui/StatusBadge";
import Modal from "../components/ui/Modal";

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
    selectedCycle,
    setSelectedCycle,
  ] = useState(null);
const [
  showCreateModal,
  setShowCreateModal,
] = useState(false);

const [createData, setCreateData] =
  useState({
    cycleName: "",
    startDate: "",
    durationDays: 15,
  });
const createCycle = async () => {
  try {

    const start =
      new Date(createData.startDate);

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

    setShowCreateModal(false);

    setCreateData({
      cycleName: "",
      startDate: "",
      durationDays: 15,
    });

    loadCycles();

  } catch (error) {

    toast.error(
      error.response?.data
        ?.message ||
        "Creation Failed"
    );

  }
};
  const [cloneData, setCloneData] =
    useState({
      cycleName: "",
      startDate: "",
      endDate: "",
      durationDays: 15,
    });
const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);
const [
    cycleToDelete,
    setCycleToDelete,
  ] = useState(null);

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

    } catch (error) {
      toast.error(
        "Failed to load cycles"
      );
    } finally {
      setLoading(false);
    }
  };

  const activateCycle = async (
    cycleId
  ) => {
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
    } catch (error) {
      toast.error(
        "Activation Failed"
      );
    }
  };

  const completeCycle = async (
    cycleId
  ) => {
    try {
      await api.put(
        `/cycles/${cycleId}/complete`
      );

      toast.success(
        "Cycle Completed"
      );

      loadCycles();
    } catch (error) {
      toast.error(
        "Completion Failed"
      );
    }
  };

 const deleteCycle = async (
  cycleId
) => {

  const cycle =
    cycles.find(
      (c) => c._id === cycleId
    );

  if (
    cycle?.status ===
    "ACTIVE"
  ) {
    toast.error(
      "Complete cycle before deleting"
    );
    return;
  }

  try {

    await api.delete(
      `/cycles/${cycleId}`
    );

    toast.success(
      "Cycle Deleted"
    );

    loadCycles();

  } catch (error) {

    toast.error(
      "Delete Failed"
    );

  }
};

  const openCloneModal = (
    cycle
  ) => {
    const endDate =
      new Date(cycle.endDate);

    const nextStartDate =
      new Date(endDate);

    nextStartDate.setDate(
      nextStartDate.getDate() + 1
    );

    const nextEndDate =
      new Date(nextStartDate);

    nextEndDate.setDate(
      nextEndDate.getDate() +
        cycle.durationDays -
        1
    );

    const cycleNumberMatch =
      cycle.cycleName.match(/\d+$/);

    let nextCycleName =
      `${cycle.cycleName} Copy`;

    if (cycleNumberMatch) {
      const currentNumber =
        parseInt(
          cycleNumberMatch[0]
        );

      nextCycleName =
        cycle.cycleName.replace(
          /\d+$/,
          currentNumber + 1
        );
    }

    setCloneData({
      cycleName: nextCycleName,

      startDate:
        nextStartDate
          .toISOString()
          .split("T")[0],

      endDate:
        nextEndDate
          .toISOString()
          .split("T")[0],

      durationDays:
        cycle.durationDays,
    });

    setSelectedCycle(cycle);

    setShowCloneModal(true);
  };

  const cloneCycle = async () => {
    try {
      await api.post(
        `/cycles/${selectedCycle._id}/clone`,
        cloneData
      );

      toast.success(
        "Cycle Cloned Successfully"
      );

      setShowCloneModal(false);

      loadCycles();
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Clone Failed"
      );
    }
  };

  if (loading) {
    return (
      <div>
        Loading Cycles...
      </div>
    );
  }

  return (
    <div  className="
    flex
    flex-col
    md:flex-row
    md:justify-between
    md:items-center
    mb-8
  "
  >

      <PageHeader
    title="Parking Cycles"
    subtitle="Manage parking rotation cycles"
  />
  <ActionButton
    onClick={() =>
      setShowCreateModal(true)
    }
  >
    + Create Cycle
  </ActionButton>

     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
    <p className="text-zinc-500 text-sm">
      Total Cycles
    </p>
    <p className="text-3xl font-bold">
      {cycles.length}
    </p>
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
    <p className="text-zinc-500 text-sm">
      Active
    </p>
    <p className="text-3xl font-bold text-green-400">
      {
        cycles.filter(
          c => c.status === "ACTIVE"
        ).length
      }
    </p>
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
    <p className="text-zinc-500 text-sm">
      Planned
    </p>
    <p className="text-3xl font-bold text-blue-400">
      {
        cycles.filter(
          c => c.status === "PLANNED"
        ).length
      }
    </p>
  </div>

  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
    <p className="text-zinc-500 text-sm">
      Completed
    </p>
    <p className="text-3xl font-bold text-zinc-300">
      {
        cycles.filter(
          c => c.status === "COMPLETED"
        ).length
      }
    </p>
  </div>

</div>
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
            className="
              bg-zinc-900/80
              border
              border-zinc-800
              rounded-3xl
              p-6
              backdrop-blur-xl
            "
          >
            <h2
              className="
                text-2xl
                font-bold
                mb-2
              "
            >
              {cycle.cycleName}
            </h2>

            <p
              className="
                text-zinc-400
                mb-4
              "
            >
              {new Date(
                cycle.startDate
              ).toLocaleDateString()}
              {" - "}
              {new Date(
                cycle.endDate
              ).toLocaleDateString()}
            </p>

            <StatusBadge
              status={cycle.status}
            />
            <p className="text-zinc-500 text-sm mt-3">
                Duration:{cycle.durationDays} days
              </p>
            <div
              className="
                mt-6
                flex
                flex-col
                md:flex-row
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
                Clone
              </ActionButton>

              <ActionButton
  variant="danger"
  onClick={() => {
    setCycleToDelete(cycle);
    setShowDeleteModal(true);
  }}
>
  Delete
</ActionButton>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showCloneModal}
        onClose={() =>
          setShowCloneModal(false)
        }
        title="Clone Cycle"
      >
        <div className="space-y-4">

          <input
            type="text"
            value={cloneData.cycleName}
            onChange={(e) =>
              setCloneData({
                ...cloneData,
                cycleName:
                  e.target.value,
              })
            }
            placeholder="Cycle Name"
            className="
              w-full
              bg-zinc-900
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
            "
          />

          <input
            type="date"
            value={cloneData.startDate}
            onChange={(e) =>
              setCloneData({
                ...cloneData,
                startDate:
                  e.target.value,
              })
            }
            className="
              w-full
              bg-zinc-900
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
            "
          />

          <input
            type="date"
            value={cloneData.endDate}
            onChange={(e) =>
              setCloneData({
                ...cloneData,
                endDate:
                  e.target.value,
              })
            }
            className="
              w-full
              bg-zinc-900
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
            "
          />

          <input
            type="number"
            value={
              cloneData.durationDays
            }
            onChange={(e) =>
              setCloneData({
                ...cloneData,
                durationDays:
                  Number(
                    e.target.value
                  ),
              })
            }
            className="
              w-full
              bg-zinc-900
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
            "
          />

<div className="flex gap-3">

  <ActionButton
    variant="secondary"
    onClick={() =>
      setShowCloneModal(false)
    }
  >
    Cancel
  </ActionButton>

  <ActionButton
    onClick={cloneCycle}
  >
    Clone Cycle
  </ActionButton>

</div>
        </div>
      </Modal>
<Modal
  isOpen={showDeleteModal}
  onClose={() =>
    setShowDeleteModal(false)
  }
  title="Delete Cycle"
>

  <p className="mb-6">
    Are you sure you want to
    delete
    <strong>
      {" "}
      {cycleToDelete?.cycleName}
    </strong>
    ?
  </p>

  <div className="flex gap-3">

    <ActionButton
      variant="secondary"
      onClick={() =>
        setShowDeleteModal(false)
      }
    >
      Cancel
    </ActionButton>

    <ActionButton
      variant="danger"
      onClick={() => {

        deleteCycle(
          cycleToDelete._id
        );

        setShowDeleteModal(
          false
        );

      }}
    >
      Delete
    </ActionButton>

  </div>

</Modal>
<Modal
  isOpen={showCreateModal}
  onClose={() =>
    setShowCreateModal(false)
  }
  title="Create New Cycle"
>

  <div className="space-y-4">

    <input
      type="text"
      placeholder="Cycle Name"
      value={createData.cycleName}
      onChange={(e) =>
        setCreateData({
          ...createData,
          cycleName:
            e.target.value,
        })
      }
      className="
        w-full
        bg-zinc-900
        border
        border-zinc-700
        rounded-xl
        px-4
        py-3
      "
    />

    <input
      type="date"
      value={createData.startDate}
      onChange={(e) =>
        setCreateData({
          ...createData,
          startDate:
            e.target.value,
        })
      }
      className="
        w-full
        bg-zinc-900
        border
        border-zinc-700
        rounded-xl
        px-4
        py-3
      "
    />

    <input
      type="number"
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
      className="
        w-full
        bg-zinc-900
        border
        border-zinc-700
        rounded-xl
        px-4
        py-3
      "
    />

    <ActionButton
      onClick={createCycle}
    >
      Create Cycle
    </ActionButton>

  </div>

</Modal>
    </div>
  );
}

export default Cycles;