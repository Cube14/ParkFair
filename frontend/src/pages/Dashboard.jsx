import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import toast from "react-hot-toast";

import StatCard from "../components/StatCard";

import {
  Building2,
  Car,
  ParkingCircle,
  CalendarDays,
  Activity,
  Trophy,
  LayoutDashboard,
  Gauge,
} from "lucide-react";

function Dashboard() {
  const [stats, setStats] =
    useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard =
    async () => {
      try {
        const res =
          await api.get(
            "/dashboard"
          );

        setStats(
          res.data.data
        );
      } catch (error) {
        toast.error(
          "Failed to load dashboard"
        );
      }
    };

  if (!stats) {
    return (
      <div className="text-xl">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* HERO */}

      <div
        className="
        bg-gradient-to-r
        from-zinc-900
        to-black
        border
        border-zinc-800
        rounded-3xl
        p-8
      "
      >
        <h1
          className="
          text-5xl
          font-bold
          mb-3
        "
        >
          ParkFair
          Control Center
        </h1>

        <p className="text-zinc-400">
          Smart Parking
          Management Dashboard
        </p>

        <div className="mt-8">

          <div className="flex justify-between mb-2">
            <span>
              Parking Occupancy
            </span>

            <span>
              {
                stats.occupancyPercentage
              }
              %
            </span>
          </div>

          <div
            className="
            w-full
            h-4
            bg-zinc-800
            rounded-full
            overflow-hidden
          "
          >
            <div
              className="
              h-full
              bg-red-500
              rounded-full
            "
              style={{
                width: `${stats.occupancyPercentage}%`,
              }}
            />
          </div>

          <p className="text-zinc-500 mt-3">
            {
              stats.totalCapacity -
              stats.availableCapacity
            }
            /
            {
              stats.totalCapacity
            }
            {" "}
            Spaces Occupied
          </p>

        </div>
      </div>

      {/* PRIMARY STATS */}

      <div
        className="
        grid
        md:grid-cols-4
        xl:grid-cols-4
        gap-6
      "
      >
        <StatCard
          title="Flats"
          value={
            stats.totalFlats
          }
          icon={
            <Building2 />
          }
          color="blue"
        />

        <StatCard
          title="Vehicles"
          value={
            stats.totalVehicles
          }
          icon={<Car />}
          color="green"
        />

        <StatCard
          title="Slots"
          value={
            stats.totalSlots
          }
          icon={
            <ParkingCircle />
          }
          color="yellow"
        />

        <StatCard
          title="Cycles"
          value={
            stats.totalCycles
          }
          icon={
            <CalendarDays />
          }
          color="purple"
        />

        <StatCard
          title="Inside"
          value={
            stats.insideAssignments
          }
          icon={
            <Activity />
          }
          color="red"
        />

        <StatCard
          title="Outside"
          value={
            stats.outsideAssignments
          }
          icon={
            <Activity />
          }
          color="orange"
        />

        <StatCard
          title="Available"
          value={
            stats.availableCapacity
          }
          icon={
            <Trophy />
          }
          color="green"
        />

        <StatCard
          title="Occupancy"
          value={`${stats.occupancyPercentage}%`}
          icon={
            <Gauge />
          }
          color="red"
        />
      </div>

      {/* ACTIVE CYCLE + RECENT */}

      <div
        className="
        grid
        lg:grid-cols-2
        gap-8
      "
      >

        {/* ACTIVE CYCLE */}

        <div
          className="
          bg-zinc-900/70
          border
          border-zinc-800
          rounded-3xl
          p-8
        "
        >
          <h2
            className="
            text-2xl
            font-bold
            mb-6
          "
          >
            Active Cycle
          </h2>

          {stats.activeCycle ? (
            <>
              <h3
                className="
                text-4xl
                font-bold
                text-red-400
              "
              >
                {
                  stats.activeCycle
                }
              </h3>

              <div className="mt-6 space-y-3">

                <p>
                  Status:
                  {" "}
                  <span className="text-green-400">
                    {
                      stats.activeCycleStatus
                    }
                  </span>
                </p>

                <p>
                  Assignments:
                  {" "}
                  {
                    stats.activeCycleAssignments
                  }
                </p>

                <p>
                  Start:
                  {" "}
                  {new Date(
                    stats.activeCycleStartDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  End:
                  {" "}
                  {new Date(
                    stats.activeCycleEndDate
                  ).toLocaleDateString()}
                </p>

              </div>
            </>
          ) : (
            <div>
              <h3
                className="
                text-3xl
                font-bold
                text-yellow-400
              "
              >
                No Active Cycle
              </h3>

              <p className="text-zinc-500 mt-3">
                Activate or create
                a cycle.
              </p>
            </div>
          )}
        </div>

        {/* RECENT ACTIVITY */}

        <div
          className="
          bg-zinc-900/70
          border
          border-zinc-800
          rounded-3xl
          p-8
        "
        >
          <h2
            className="
            text-2xl
            font-bold
            mb-6
          "
          >
            Recent Activity
          </h2>

          <div className="space-y-4">

            {stats.recentAssignments
              ?.length > 0 ? (
              stats.recentAssignments.map(
                (
                  item
                ) => (
                  <div
                    key={
                      item._id
                    }
                    className="
                    bg-zinc-800/60
                    rounded-xl
                    p-4
                  "
                  >
                    Flat{" "}
                    {
                      item.flatId
                        ?.flatNumber
                    }
                    {" "}
                    →
                    Slot{" "}
                    {
                      item.slotId
                        ?.slotNumber
                    }

                    <div
                      className="
                      text-zinc-500
                      text-sm
                      mt-1
                    "
                    >
                      {
                        item.parkingType
                      }
                    </div>
                  </div>
                )
              )
            ) : (
              <p className="text-zinc-500">
                No activity found.
              </p>
            )}

          </div>
        </div>

      </div>

      {/* QUICK ACTIONS */}

      <div>

        <h2
          className="
          text-3xl
          font-bold
          mb-6
        "
        >
          Quick Commands
        </h2>

        <div
          className="
          grid
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
        "
        >

          <Link to="/cycles">
            <div
              className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-3xl
              p-6
              hover:border-red-500
              transition
            "
            >
              Create Cycle
            </div>
          </Link>

          <Link to="/vehicles">
            <div
              className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-3xl
              p-6
              hover:border-red-500
              transition
            "
            >
              Add Vehicle
            </div>
          </Link>

          <Link to="/flats">
            <div
              className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-3xl
              p-6
              hover:border-red-500
              transition
            "
            >
              Add Flat
            </div>
          </Link>

          <Link to="/assignments">
            <div
              className="
              bg-zinc-900
              border
              border-zinc-800
              rounded-3xl
              p-6
              hover:border-red-500
              transition
            "
            >
              Manage Assignments
            </div>
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;