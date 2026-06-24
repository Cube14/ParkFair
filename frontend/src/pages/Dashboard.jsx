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
  Gauge,
  ArrowRight,
  Clock3,
  MapPinned,
  CarFront,
} from "lucide-react";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  getThemeClasses,
} from "../utils/theme";

function Dashboard() {
  const [stats, setStats] =
    useState(null);

  const { theme } =
    useTheme();

  const styles =
    getThemeClasses(theme);

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
      <div
        className={`
          min-h-[60vh]
          flex
          items-center
          justify-center
          text-xl
          ${styles.muted}
        `}
      >
        Loading Command Center...
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* HERO SECTION */}

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
            w-64
            h-64
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
            <Activity size={16} />
            PARKFAIR COMMAND CENTER
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
            Smart Parking
            <br />
            Management
          </h1>

          <p
            className={`
              mt-4
              max-w-2xl
              text-lg
              ${styles.muted}
            `}
          >
            Monitor occupancy,
            assignments, parking
            cycles and resident
            activity from a
            single command center.
          </p>

          {/* OCCUPANCY */}

          <div className="mt-10">

            <div
              className="
                flex
                justify-between
                items-center
                mb-3
              "
            >
              <span
                className={
                  styles.muted
                }
              >
                Parking Occupancy
              </span>

              <span
                className="
                  text-red-500
                  font-bold
                  text-lg
                "
              >
                {
                  stats.occupancyPercentage
                }
                %
              </span>
            </div>

            <div
              className={`
                w-full
                h-4
                rounded-full
                overflow-hidden
                ${
                  theme === "dark"
                    ? "bg-zinc-800"
                    : "bg-zinc-200"
                }
              `}
            >
              <div
                className="
                  h-full
                  bg-red-500
                  rounded-full
                  transition-all
                  duration-700
                "
                style={{
                  width: `${stats.occupancyPercentage}%`,
                }}
              />
            </div>

            <div
              className="
                mt-4
                flex
                justify-between
                items-center
              "
            >
              <span
                className={
                  styles.muted
                }
              >
                Occupied Spaces
              </span>

              <span
                className="
                  font-semibold
                "
              >
                {
                  stats.totalCapacity -
                  stats.availableCapacity
                }
                /
                {
                  stats.totalCapacity
                }
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* PRIMARY STATS */}

      <div
        className="
          grid
          sm:grid-cols-2
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
            <MapPinned />
          }
          color="red"
        />

        <StatCard
          title="Outside"
          value={
            stats.outsideAssignments
          }
          icon={
            <CarFront />
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

      {/* ACTIVE CYCLE + CAPACITY */}

      <div
        className="
          grid
          xl:grid-cols-2
          gap-8
        "
      >

        {/* ACTIVE CYCLE */}

        <div
          className={`
            ${styles.card}
            border
            rounded-3xl
            p-8
          `}
        >
          <div
            className="
              flex
              items-center
              gap-3
              mb-6
            "
          >
            <Clock3
              className="
                text-red-500
              "
            />

            <h2
              className="
                text-2xl
                font-bold
              "
            >
              Active Cycle
            </h2>
          </div>

          {stats.activeCycle ? (
            <>
              <h3
                className="
                  text-4xl
                  font-black
                  text-red-500
                "
              >
                {
                  stats.activeCycle
                }
              </h3>

              <div
                className="
                  mt-6
                  space-y-4
                "
              >
                <div
                  className="
                    flex
                    justify-between
                  "
                >
                  <span
                    className={
                      styles.muted
                    }
                  >
                    Status
                  </span>

                  <span
                    className="
                      text-green-500
                      font-semibold
                    "
                  >
                    {
                      stats.activeCycleStatus
                    }
                  </span>
                </div>

                <div
                  className="
                    flex
                    justify-between
                  "
                >
                  <span
                    className={
                      styles.muted
                    }
                  >
                    Assignments
                  </span>

                  <span>
                    {
                      stats.activeCycleAssignments
                    }
                  </span>
                </div>

                <div
                  className="
                    flex
                    justify-between
                  "
                >
                  <span
                    className={
                      styles.muted
                    }
                  >
                    Start Date
                  </span>

                  <span>
                    {new Date(
                      stats.activeCycleStartDate
                    ).toLocaleDateString()}
                  </span>
                </div>

                <div
                  className="
                    flex
                    justify-between
                  "
                >
                  <span
                    className={
                      styles.muted
                    }
                  >
                    End Date
                  </span>

                  <span>
                    {new Date(
                      stats.activeCycleEndDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div>

              <h3
                className="
                  text-3xl
                  font-bold
                  text-yellow-500
                "
              >
                No Active Cycle
              </h3>

              <p
                className={`
                  mt-3
                  ${styles.muted}
                `}
              >
                Create or activate
                a parking cycle to
                begin allocation.
              </p>

            </div>
          )}
        </div>

        {/* CAPACITY OVERVIEW */}

        <div
          className={`
            ${styles.card}
            border
            rounded-3xl
            p-8
          `}
        >
          <h2
            className="
              text-2xl
              font-bold
              mb-8
            "
          >
            Capacity Overview
          </h2>

          <div
            className="
              flex
              justify-center
            "
          >
            <div
              className="
                relative
                w-56
                h-56
                rounded-full
                flex
                items-center
                justify-center
                border-8
                border-red-500
              "
            >
              <div
                className="
                  text-center
                "
              >
                <div
                  className="
                    text-5xl
                    font-black
                  "
                >
                  {
                    stats.occupancyPercentage
                  }
                  %
                </div>

                <div
                  className={
                    styles.muted
                  }
                >
                  Occupied
                </div>
              </div>
            </div>
          </div>

          <div
            className="
              mt-8
              grid
              grid-cols-2
              gap-4
            "
          >
            <div
              className="
                text-center
              "
            >
              <div
                className="
                  text-3xl
                  font-bold
                "
              >
                {
                  stats.availableCapacity
                }
              </div>

              <div
                className={
                  styles.muted
                }
              >
                Available
              </div>
            </div>

            <div
              className="
                text-center
              "
            >
              <div
                className="
                  text-3xl
                  font-bold
                "
              >
                {
                  stats.totalCapacity
                }
              </div>

              <div
                className={
                  styles.muted
                }
              >
                Capacity
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RECENT ACTIVITY */}

      <div
        className={`
          ${styles.card}
          border
          rounded-3xl
          p-8
        `}
      >
        <h2
          className="
            text-3xl
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
              (item) => (
                <div
                  key={item._id}
                  className={`
                    ${styles.glassCard}
                    border
                    rounded-2xl
                    p-4
                    flex
                    justify-between
                    items-center
                  `}
                >
                  <div>
                    <div
                      className="
                        font-semibold
                      "
                    >
                      Flat{" "}
                      {
                        item.flatId
                          ?.flatNumber
                      }
                      {" "}
                      assigned
                      to Slot{" "}
                      {
                        item.slotId
                          ?.slotNumber
                      }
                    </div>

                    <div
                      className={`
                        text-sm
                        mt-1
                        ${styles.muted}
                      `}
                    >
                      {
                        item.parkingType
                      }
                    </div>
                  </div>

                  <ArrowRight
                    size={18}
                    className="
                      text-red-500
                    "
                  />
                </div>
              )
            )
          ) : (
            <p
              className={
                styles.muted
              }
            >
              No recent activity.
            </p>
          )}

        </div>
      </div>

      {/* QUICK COMMANDS */}

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
              className={`
                ${styles.card}
                border
                rounded-3xl
                p-6
                hover:border-red-500
                transition-all
                duration-300
                hover:-translate-y-1
              `}
            >
              Create Cycle
            </div>
          </Link>

          <Link to="/vehicles">
            <div
              className={`
                ${styles.card}
                border
                rounded-3xl
                p-6
                hover:border-red-500
                transition-all
                duration-300
                hover:-translate-y-1
              `}
            >
              Add Vehicle
            </div>
          </Link>

          <Link to="/flats">
            <div
              className={`
                ${styles.card}
                border
                rounded-3xl
                p-6
                hover:border-red-500
                transition-all
                duration-300
                hover:-translate-y-1
              `}
            >
              Add Flat
            </div>
          </Link>

          <Link to="/assignments">
            <div
              className={`
                ${styles.card}
                border
                rounded-3xl
                p-6
                hover:border-red-500
                transition-all
                duration-300
                hover:-translate-y-1
              `}
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