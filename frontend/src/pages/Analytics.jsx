// ANALYTICS.JSX
// PART 1 / 4

import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";

import {
  Building2,
  CarFront,
  ParkingSquare,
  ClipboardList,
  Activity,
  Trophy,
  Gauge,
  CalendarRange,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  getThemeClasses,
} from "../utils/theme";

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

  const { theme } =
    useTheme();

  const styles =
    getThemeClasses(theme);

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
        slots:
          slotsRes.data.data,
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
      <div
        className="
          flex
          items-center
          justify-center
          h-[60vh]
          text-2xl
          font-bold
        "
      >
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
        cycle.status ===
        "ACTIVE"
    ).length;

  const plannedCycles =
    stats.cycles.filter(
      (cycle) =>
        cycle.status ===
        "PLANNED"
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

  const availableSlots =
    totalSlots -
    insideAssignments;

  const occupancy =
    totalSlots > 0
      ? Math.round(
          (insideAssignments /
            totalSlots) *
            100
        )
      : 0;

  const vehicleTypeStats =
    stats.vehicles.reduce(
      (acc, vehicle) => {
        const type =
          vehicle.vehicleType ||
          "CAR";

        acc[type] =
          (acc[type] || 0) + 1;

        return acc;
      },
      {}
    );

  const floorStats =
    stats.flats.reduce(
      (acc, flat) => {
        const floor =
          flat.floor || 0;

        acc[floor] =
          (acc[floor] || 0) + 1;

        return acc;
      },
      {}
    );

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="System Intelligence & Occupancy Insights"
      />

      <div
        className="
          grid
          gap-6
          md:grid-cols-2
          xl:grid-cols-4
          mb-8
        "
      >
        <AnalyticsCard
          title="Flats"
          value={totalFlats}
          icon={
            <Building2 />
          }
          color="blue"
          styles={styles}
        />

        <AnalyticsCard
          title="Vehicles"
          value={
            totalVehicles
          }
          icon={
            <CarFront />
          }
          color="green"
          styles={styles}
        />

        <AnalyticsCard
          title="Slots"
          value={totalSlots}
          icon={
            <ParkingSquare />
          }
          color="yellow"
          styles={styles}
        />

        <AnalyticsCard
          title="Assignments"
          value={
            totalAssignments
          }
          icon={
            <ClipboardList />
          }
          color="red"
          styles={styles}
        />
      </div>

      <div
        className="
          grid
          gap-6
          md:grid-cols-2
          xl:grid-cols-4
          mb-8
        "
      >
        <AnalyticsCard
          title="Inside"
          value={
            insideAssignments
          }
          icon={<Activity />}
          color="green"
          styles={styles}
        />

        <AnalyticsCard
          title="Outside"
          value={
            outsideAssignments
          }
          icon={<Activity />}
          color="orange"
          styles={styles}
        />

        <AnalyticsCard
          title="Available"
          value={
            availableSlots
          }
          icon={<Trophy />}
          color="blue"
          styles={styles}
        />

        <AnalyticsCard
          title="Occupancy"
          value={`${occupancy}%`}
          icon={<Gauge />}
          color="red"
          styles={styles}
        />
      </div>
      // ANALYTICS.JSX
// PART 2 / 4

      {/* OCCUPANCY OVERVIEW */}

      <div
        className={`
          ${styles.card}
          border
          rounded-3xl
          p-8
          mb-8
        `}
      >
        <div
          className="
            flex
            justify-between
            items-center
            mb-6
          "
        >
          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Occupancy Overview
          </h2>

          <span
            className="
              text-red-500
              font-bold
            "
          >
            {occupancy}% Utilized
          </span>
        </div>

        <div
          className="
            h-5
            bg-zinc-700/30
            rounded-full
            overflow-hidden
          "
        >
          <div
            className="
              h-full
              bg-red-500
              transition-all
              duration-700
            "
            style={{
              width: `${occupancy}%`,
            }}
          />
        </div>

        <div
          className="
            mt-6
            grid
            md:grid-cols-2
            gap-4
          "
        >
          <div
            className="
              p-5
              rounded-2xl
              bg-green-500/10
              border
              border-green-500/20
            "
          >
            <h3
              className="
                text-green-500
                font-bold
              "
            >
              Inside Parking
            </h3>

            <p className="text-3xl font-bold mt-2">
              {insideAssignments}
            </p>
          </div>

          <div
            className="
              p-5
              rounded-2xl
              bg-orange-500/10
              border
              border-orange-500/20
            "
          >
            <h3
              className="
                text-orange-500
                font-bold
              "
            >
              Outside Parking
            </h3>

            <p className="text-3xl font-bold mt-2">
              {outsideAssignments}
            </p>
          </div>
        </div>
      </div>

      {/* FLOOR ANALYTICS */}

      <div
        className="
          grid
          xl:grid-cols-2
          gap-8
          mb-8
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
          <h2
            className="
              text-2xl
              font-bold
              mb-6
            "
          >
            Floor Distribution
          </h2>

          <div className="space-y-5">
            {Object.entries(
              floorStats
            )
              .sort(
                (a, b) =>
                  Number(a[0]) -
                  Number(b[0])
              )
              .map(
                ([floor, count]) => {
                  const percentage =
                    Math.round(
                      (count /
                        totalFlats) *
                        100
                    );

                  return (
                    <div
                      key={floor}
                    >
                      <div
                        className="
                          flex
                          justify-between
                          mb-2
                        "
                      >
                        <span>
                          Floor {floor}
                        </span>

                        <span>
                          {count}
                        </span>
                      </div>

                      <div
                        className="
                          h-3
                          bg-zinc-700/30
                          rounded-full
                          overflow-hidden
                        "
                      >
                        <div
                          className="
                            h-full
                            bg-blue-500
                          "
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
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
          <h2
            className="
              text-2xl
              font-bold
              mb-6
            "
          >
            Vehicle Types
          </h2>

          <div className="space-y-6">

            {Object.entries(
              vehicleTypeStats
            ).map(
              ([type, count]) => {
                const percentage =
                  Math.round(
                    (count /
                      totalVehicles) *
                      100
                  );

                return (
                  <div
                    key={type}
                  >
                    <div
                      className="
                        flex
                        justify-between
                        mb-2
                      "
                    >
                      <span>
                        {type}
                      </span>

                      <span>
                        {count}
                      </span>
                    </div>

                    <div
                      className="
                        h-3
                        bg-zinc-700/30
                        rounded-full
                        overflow-hidden
                      "
                    >
                      <div
                        className="
                          h-full
                          bg-green-500
                        "
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}

          </div>
        </div>
      </div>
      // ANALYTICS.JSX
// PART 3 / 4

      {/* SLOT UTILIZATION */}

      <div
        className={`
          ${styles.card}
          border
          rounded-3xl
          p-6
          mb-8
        `}
      >
        <div
          className="
            flex
            items-center
            justify-between
            mb-6
          "
        >
          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Slot Utilization
          </h2>

          <ParkingSquare
            className="
              text-red-500
            "
          />
        </div>

        <div className="space-y-4">
          {stats.slots.map(
            (slot) => {
              const used =
                stats.assignments.filter(
                  (a) =>
                    a.slotId?._id ===
                    slot._id
                ).length;

              const percentage =
                slot.maxCapacity > 0
                  ? Math.round(
                      (used /
                        slot.maxCapacity) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={slot._id}
                  className="
                    p-4
                    rounded-2xl
                    border
                    border-zinc-700/30
                  "
                >
                  <div
                    className="
                      flex
                      justify-between
                      mb-2
                    "
                  >
                    <span
                      className="
                        font-semibold
                      "
                    >
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

                  <div
                    className="
                      h-3
                      bg-zinc-700/30
                      rounded-full
                      overflow-hidden
                    "
                  >
                    <div
                      className={`
                        h-full
                        ${
                          percentage >= 100
                            ? "bg-red-500"
                            : percentage >= 50
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }
                      `}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* CYCLE STATUS OVERVIEW */}

      <div
        className="
          grid
          md:grid-cols-3
          gap-6
          mb-8
        "
      >
        <div
          className="
            rounded-3xl
            p-6
            bg-green-500/10
            border
            border-green-500/20
          "
        >
          <div
            className="
              flex
              justify-between
              items-center
            "
          >
            <div>
              <p
                className="
                  text-green-500
                "
              >
                Active Cycles
              </p>

              <h2
                className="
                  text-5xl
                  font-black
                  mt-2
                "
              >
                {activeCycles}
              </h2>
            </div>

            <Activity
              className="
                text-green-500
              "
              size={40}
            />
          </div>
        </div>

        <div
          className="
            rounded-3xl
            p-6
            bg-blue-500/10
            border
            border-blue-500/20
          "
        >
          <div
            className="
              flex
              justify-between
              items-center
            "
          >
            <div>
              <p
                className="
                  text-blue-500
                "
              >
                Planned Cycles
              </p>

              <h2
                className="
                  text-5xl
                  font-black
                  mt-2
                "
              >
                {plannedCycles}
              </h2>
            </div>

            <CalendarRange
              className="
                text-blue-500
              "
              size={40}
            />
          </div>
        </div>

        <div
          className="
            rounded-3xl
            p-6
            bg-zinc-500/10
            border
            border-zinc-500/20
          "
        >
          <div
            className="
              flex
              justify-between
              items-center
            "
          >
            <div>
              <p
                className="
                  text-zinc-400
                "
              >
                Completed Cycles
              </p>

              <h2
                className="
                  text-5xl
                  font-black
                  mt-2
                "
              >
                {completedCycles}
              </h2>
            </div>

            <Trophy
              className="
                text-zinc-400
              "
              size={40}
            />
          </div>
        </div>
      </div> 
      // ANALYTICS.JSX
// PART 4 / 4

      {/* CYCLE TABLE */}

      <div
        className={`
          ${styles.card}
          border
          rounded-3xl
          p-6
          mb-8
        `}
      >
        <div
          className="
            flex
            justify-between
            items-center
            mb-6
          "
        >
          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Cycle Intelligence
          </h2>

          <CalendarRange
            className="
              text-red-500
            "
          />
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr
                className="
                  border-b
                  border-zinc-700
                "
              >
                <th className="p-4 text-left">
                  Cycle
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
                    key={cycle._id}
                    className={`
                      border-b
                      ${styles.tableRow}
                    `}
                  >
                    <td className="p-4 font-semibold">
                      {
                        cycle.cycleName
                      }
                    </td>

                    <td className="p-4">

                      <span
                        className={`
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-bold

                          ${
                            cycle.status ===
                            "ACTIVE"
                              ? "bg-green-500/20 text-green-500"
                              : cycle.status ===
                                "PLANNED"
                              ? "bg-blue-500/20 text-blue-500"
                              : "bg-zinc-500/20 text-zinc-400"
                          }
                        `}
                      >
                        {
                          cycle.status
                        }
                      </span>

                    </td>

                    <td className="p-4">
                      {
                        cycle.durationDays
                      }
                      {" "}
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

      {/* SYSTEM HEALTH */}

      <div
        className="
          grid
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
          mb-8
        "
      >
        <HealthCard
          title="Occupancy"
          value={`${occupancy}%`}
          color="red"
        />

        <HealthCard
          title="Available Slots"
          value={availableSlots}
          color="green"
        />

        <HealthCard
          title="Outside Vehicles"
          value={
            outsideAssignments
          }
          color="orange"
        />

        <HealthCard
          title="Active Cycles"
          value={
            activeCycles
          }
          color="blue"
        />
      </div>

    </div>
  );
}

function AnalyticsCard({
  title,
  value,
  icon,
  color,
  styles,
}) {
  const colors = {
    red: "text-red-500",
    green:
      "text-green-500",
    blue: "text-blue-500",
    yellow:
      "text-yellow-500",
    orange:
      "text-orange-500",
  };

  return (
    <div
      className={`
        ${styles.card}
        border
        rounded-3xl
        p-6
      `}
    >
      <div
        className="
          flex
          justify-between
          items-center
        "
      >
        <div>

          <p
            className={
              styles.muted
            }
          >
            {title}
          </p>

          <h2
            className="
              text-4xl
              font-black
              mt-2
            "
          >
            {value}
          </h2>

        </div>

        <div
          className={`
            text-3xl
            ${colors[color]}
          `}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

function HealthCard({
  title,
  value,
  color,
}) {
  const colors = {
    red: "text-red-500",
    green:
      "text-green-500",
    blue: "text-blue-500",
    orange:
      "text-orange-500",
  };

  return (
    <div
      className="
        border
        border-zinc-700/30
        rounded-3xl
        p-6
      "
    >
      <p
        className="
          text-zinc-500
          mb-2
        "
      >
        {title}
      </p>

      <h2
        className={`
          text-4xl
          font-black
          ${colors[color]}
        `}
      >
        {value}
      </h2>
    </div>
  );
}

export default Analytics; 