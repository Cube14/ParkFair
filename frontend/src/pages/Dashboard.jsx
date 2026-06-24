import { useEffect, useState } from "react";
import api from "../services/api";

import StatCard from "../components/StatCard";

import toast from "react-hot-toast";

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/dashboard");

        setStats(res.data.data);
      } catch (error) {
        console.error(
          "Dashboard Load Error:",
          error
        );

        toast.error(
          "Failed to load dashboard"
        );
      }
    };

    load();
  }, []);

  if (!stats) {
    return (
      <div className="text-xl">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}

      <div className="mb-10">
        <h1 className="text-5xl font-bold">
          ParkFair Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Parking Management Control Center
        </p>
      </div>

      {/* Statistics Cards */}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">

        <StatCard
          title="Flats"
          value={stats.totalFlats}
        />

        <StatCard
          title="Vehicles"
          value={stats.totalVehicles}
        />

        <StatCard
          title="Slots"
          value={stats.totalSlots}
        />

        <StatCard
          title="Cycles"
          value={stats.totalCycles}
        />

        <StatCard
          title="Assignments"
          value={
            stats.activeCycleAssignments || 0
          }
        />

      </div>

      {/* Current Active Cycle */}

      <div className="mt-10">

        <h2 className="text-3xl font-bold mb-6">
          Current Active Cycle
        </h2>

        <div
          className="
            bg-zinc-900/70
            border
            border-zinc-800
            rounded-2xl
            p-6
            backdrop-blur-xl
          "
        >
          {stats.activeCycle ? (
            <>
              <h3 className="text-2xl font-semibold">
                {stats.activeCycle}
              </h3>

              <div className="mt-4 space-y-2">

                <p className="text-zinc-400">
                  Status:
                  {" "}
                  <span className="text-green-400 font-medium">
                    {stats.activeCycleStatus}
                  </span>
                </p>

                <p className="text-zinc-400">
                  Start Date:
                  {" "}
                  {new Date(
                    stats.activeCycleStartDate
                  ).toLocaleDateString()}
                </p>

                <p className="text-zinc-400">
                  End Date:
                  {" "}
                  {new Date(
                    stats.activeCycleEndDate
                  ).toLocaleDateString()}
                </p>

                <p className="text-zinc-400">
                  Active Assignments:
                  {" "}
                  {stats.activeCycleAssignments}
                </p>

              </div>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-semibold">
                No Active Cycle
              </h3>

              <p className="text-zinc-500 mt-2">
                Activate a cycle to begin
                parking allocation.
              </p>
            </>
          )}
        </div>

      </div>

      {/* Quick Actions */}

      <div className="mt-10">

        <h2 className="text-3xl font-bold mb-6">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              p-6
              cursor-pointer
              hover:border-red-500
              transition
            "
          >
            Create New Cycle
          </div>

          <div
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              p-6
              cursor-pointer
              hover:border-red-500
              transition
            "
          >
            View Parking Layout
          </div>

          <div
            className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              p-6
              cursor-pointer
              hover:border-red-500
              transition
            "
          >
            Manage Assignments
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;