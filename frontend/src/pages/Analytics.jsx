import { useEffect, useState } from "react";
import api from "../services/api";

import PageHeader from "../components/ui/PageHeader";

function Analytics() {
  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState({
      flats: [],
      vehicles: [],
      slots: [],
      cycles: [],
      assignments: [],
    });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        flatsRes,
        vehiclesRes,
        slotsRes,
        cyclesRes,
        assignmentsRes,
      ] = await Promise.all([
        api.get("/flats"),
        api.get("/vehicles"),
        api.get("/slots"),
        api.get("/cycles"),
        api.get("/assignments"),
      ]);

      setStats({
        flats: flatsRes.data,
        vehicles:
          vehiclesRes.data.data,
        slots: slotsRes.data.data,
        cycles:
          cyclesRes.data.data,
        assignments:
          assignmentsRes.data.data,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        Loading Analytics...
      </div>
    );
  }

  const totalFlats =
    stats.flats.length;

  const totalVehicles =
    stats.vehicles.length;

  const totalSlots =
    stats.slots.length;

  const totalAssignments =
    stats.assignments.length;

  const activeCycles =
    stats.cycles.filter(
      (cycle) =>
        cycle.status === "ACTIVE"
    ).length;

  const plannedCycles =
    stats.cycles.filter(
      (cycle) =>
        cycle.status === "PLANNED"
    ).length;

  const completedCycles =
    stats.cycles.filter(
      (cycle) =>
        cycle.status ===
        "COMPLETED"
    ).length;

  const insideAssignments =
    stats.assignments.filter(
      (a) =>
        a.parkingType ===
        "INSIDE"
    ).length;

  const outsideAssignments =
    stats.assignments.filter(
      (a) =>
        a.parkingType ===
        "OUTSIDE"
    ).length;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="ParkFair System Overview"
      />

      <div
        className="
          grid
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
          mb-10
        "
      >
        <StatCard
          title="Total Flats"
          value={totalFlats}
        />

        <StatCard
          title="Total Vehicles"
          value={totalVehicles}
        />

        <StatCard
          title="Total Slots"
          value={totalSlots}
        />

        <StatCard
          title="Assignments"
          value={totalAssignments}
        />
      </div>

      <div
        className="
          grid
          md:grid-cols-3
          gap-6
          mb-10
        "
      >
        <StatCard
          title="Active Cycles"
          value={activeCycles}
        />

        <StatCard
          title="Planned Cycles"
          value={plannedCycles}
        />

        <StatCard
          title="Completed Cycles"
          value={completedCycles}
        />
      </div>

      <div
        className="
          grid
          md:grid-cols-2
          gap-6
          mb-10
        "
      >
        <StatCard
          title="Inside Parking"
          value={
            insideAssignments
          }
        />

        <StatCard
          title="Outside Parking"
          value={
            outsideAssignments
          }
        />
      </div>

      <div
        className="
          bg-zinc-900/80
          border
          border-zinc-800
          rounded-3xl
          p-6
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            mb-6
          "
        >
          Slot Utilization
        </h2>

        <div className="space-y-3">
          {stats.slots.map(
            (slot) => {
              const used =
                stats.assignments.filter(
                  (a) =>
                    a.slotId?._id ===
                    slot._id
                ).length;

              return (
                <div
                  key={slot._id}
                  className="
                    flex
                    justify-between
                    bg-zinc-800/50
                    p-4
                    rounded-xl
                  "
                >
                  <span>
                    Slot{" "}
                    {
                      slot.slotNumber
                    }
                  </span>

                  <span>
                    {used}/
                    {
                      slot.maxCapacity
                    }
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>

      <div
        className="
          mt-10
          bg-zinc-900/80
          border
          border-zinc-800
          rounded-3xl
          p-6
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            mb-6
          "
        >
          Cycles
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="
                  border-b
                  border-zinc-800
                "
              >
                <th className="p-4 text-left">
                  Name
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Duration
                </th>

                <th className="p-4 text-left">
                  Start
                </th>

                <th className="p-4 text-left">
                  End
                </th>
              </tr>
            </thead>

            <tbody>
              {stats.cycles.map(
                (cycle) => (
                  <tr
                    key={
                      cycle._id
                    }
                    className="
                      border-b
                      border-zinc-800
                    "
                  >
                    <td className="p-4">
                      {
                        cycle.cycleName
                      }
                    </td>

                    <td className="p-4">
                      {
                        cycle.status
                      }
                    </td>

                    <td className="p-4">
                      {
                        cycle.durationDays
                      }{" "}
                      Days
                    </td>

                    <td className="p-4">
                      {new Date(
                        cycle.startDate
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      {new Date(
                        cycle.endDate
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}) {
  return (
    <div
      className="
        bg-zinc-900/80
        border
        border-zinc-800
        rounded-3xl
        p-6
      "
    >
      <p
        className="
          text-zinc-400
          mb-2
        "
      >
        {title}
      </p>

      <h3
        className="
          text-4xl
          font-bold
        "
      >
        {value}
      </h3>
    </div>
  );
}

export default Analytics;