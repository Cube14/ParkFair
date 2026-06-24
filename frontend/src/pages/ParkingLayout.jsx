import { useEffect, useState } from "react";

import api from "../services/api";

import { useCycle } from "../context/CycleContext";
import { useTheme } from "../context/ThemeContext";

import { getThemeClasses } from "../utils/theme";

import CycleSelector from "../components/CycleSelector";

import {
  ParkingCircle,
  Gauge,
  Building2,
  MapPinned,
  Activity,
  CarFront,
} from "lucide-react";

function ParkingLayout() {
  const [matrix, setMatrix] =
    useState(null);

  const { selectedCycle } =
    useCycle();

  const { theme } =
    useTheme();

  const styles =
    getThemeClasses(theme);

  useEffect(() => {
    if (selectedCycle) {
      setMatrix(null);
      loadLayout();
    }
  }, [selectedCycle]);

  const loadLayout = async () => {
    try {
      const response =
        await api.get(
          `/cycles/${selectedCycle._id}/matrix`
        );

      setMatrix(
        response.data.data
      );
    } catch (error) {
      console.error(
        "Layout Load Error:",
        error
      );

      setMatrix({});
    }
  };

  if (!selectedCycle) {
    return (
      <div>
        <CycleSelector />

        <div className="mt-8">
          Loading Cycle...
        </div>
      </div>
    );
  }

  if (!matrix) {
    return (
      <div>
        <div className="mb-8">
          <CycleSelector />
        </div>

        <div className="mt-8">
          Loading Layout...
        </div>
      </div>
    );
  }

  const totalCapacity = 16;

  const occupiedSpaces =
    Object.values(matrix)
      .flat()
      .length;

  const availableSpaces =
    totalCapacity -
    occupiedSpaces;

  const occupancyPercentage =
    Math.round(
      (occupiedSpaces /
        totalCapacity) *
        100
    );

  const outsideCount =
    matrix?.OUTSIDE?.length ||
    0;

 const renderSlot = (
  slotNumber,
  extraClass = ""
) => {
  const flats =
    matrix?.[slotNumber] || [];

  const capacityMap = {
    "1": 2,
    "2": 2,
    "3": 1,
    "4": 1,
    "5": 2,
    "6": 2,
    "7": 1,
    "8": 1,
    OUTSIDE: 4,
  };

  const capacity =
    capacityMap[slotNumber];

  const occupied =
    flats.length;

  const isFull =
    occupied >= capacity;

  const isPartial =
    occupied > 0 &&
    occupied < capacity;

  let border =
    theme === "dark"
      ? "border-zinc-800"
      : "border-zinc-300";

  let glow = "";

  let badge =
    theme === "dark"
      ? "bg-zinc-800"
      : "bg-zinc-200";

  let status = "EMPTY";

  if (isFull) {
    border =
      "border-red-500";

    glow =
      "shadow-red-500/20";

    badge =
      "bg-red-500 text-white";

    status = "FULL";
  }

  if (isPartial) {
    border =
      "border-yellow-500";

    glow =
      "shadow-yellow-500/20";

    badge =
      "bg-yellow-500 text-black";

    status = "PARTIAL";
  }

  return (
    <div
      className={`
        ${styles.slot}
        border
        ${border}
        rounded-3xl
        p-4
        flex
        flex-col
        transition-all
        duration-300
        hover:scale-[1.02]
        hover:shadow-xl
        ${glow}
        ${extraClass}
      `}
    >
      <div>

        <div className="flex justify-between items-center">

          <h3
            className="
              font-black
              text-xl
              tracking-wide
            "
          >
            SLOT {slotNumber}
          </h3>

          <span
            className={`
              text-xs
              px-3
              py-1
              rounded-full
              font-semibold
              ${badge}
            `}
          >
            {status}
          </span>

        </div>

        <div
          className={`
            mt-3
            text-sm
            ${styles.muted}
          `}
        >
          Capacity

          <span
            className="
              ml-2
              font-bold
            "
          >
            {occupied}/{capacity}
          </span>

        </div>

      </div>

      <div
        className={`
          mt-4
          flex-1
          ${
            flats.length > 1
              ? "grid grid-cols-1 gap-2"
              : "flex items-center"
          }
        `}
      >

        {flats.length > 0 ? (
          flats.map((flat) => (
            <div
              key={`${slotNumber}-${flat}`}
              className="
                bg-red-500/10
                border
                border-red-500/30
                rounded-xl
                px-3
                py-3
                text-center
                font-semibold
                min-h-[48px]
                flex
                items-center
                justify-center
              "
            >
              Flat {flat}
            </div>
          ))
        ) : (
          <div
            className={`
              h-16
              w-full
              flex
              items-center
              justify-center
              ${styles.muted}
            `}
          >
            Available
          </div>
        )}

      </div>
    </div>
  );
};

  return (
    <div className="space-y-8">

      {/* HERO */}

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
            <ParkingCircle size={16} />
            LIVE PARKING MATRIX
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
            SIDDH-A
            <br />
            Parking Grid
          </h1>

          <p
            className={`
              mt-4
              text-lg
              ${styles.muted}
            `}
          >
            Real-time parking
            allocation overview
            for the selected cycle.
          </p>

        </div>
      </div>

      {/* SELECTOR */}

      <div>
        <CycleSelector />
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
                Occupancy
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {
                  occupancyPercentage
                }
                %
              </h2>
            </div>

            <Gauge
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
                Occupied
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {
                  occupiedSpaces
                }
              </h2>
            </div>

            <Activity
              className="
                text-yellow-500
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
                Available
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {
                  availableSpaces
                }
              </h2>
            </div>

            <Building2
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
                Outside
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {outsideCount}
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

      {/* OCCUPANCY BAR */}

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
            mb-3
          "
        >
          <span>
            Occupancy
          </span>

          <span
            className="
              font-bold
              text-red-500
            "
          >
            {
              occupancyPercentage
            }
            %
          </span>
        </div>

        <div
          className={`
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
            "
            style={{
              width: `${occupancyPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* OUTSIDE */}

      <div className="flex justify-center">

        <div
          className={`
            ${styles.outside}
            border
            rounded-3xl
            px-12
            py-6
            text-center
          `}
        >
          <h2
            className="
              text-xl
              font-bold
            "
          >
            OUTSIDE PARKING
          </h2>

          <p className="mt-2">
            {outsideCount} / 4 Occupied
          </p>
        </div>

      </div>

      {/* GATE */}

      <div
        className="
          text-center
          text-red-500
          font-black
          text-2xl
        "
      >
        ═══ 🚧 MAIN GATE 🚧 ═══
      </div>

      {/* LEGEND */}

      <div
        className="
          flex
          justify-center
          flex-wrap
          gap-6
        "
      >
        <div className="flex items-center gap-2">
          <div
            className="
              w-4
              h-4
              rounded
              bg-zinc-500
            "
          />
          Empty
        </div>

        <div className="flex items-center gap-2">
          <div
            className="
              w-4
              h-4
              rounded
              bg-yellow-500
            "
          />
          Partial
        </div>

        <div className="flex items-center gap-2">
          <div
            className="
              w-4
              h-4
              rounded
              bg-red-500
            "
          />
          Full
        </div>
      </div>

      {/* MOBILE */}

      <div
        className={`
          md:hidden
          text-center
          ${styles.muted}
        `}
      >
        ← Swipe horizontally →
      </div>

      {/* GRID */}

      <div className="overflow-x-auto">

        <div
          className="
            min-w-[1000px]
            max-w-7xl
            mx-auto
            grid
          "
          style={{
            gridTemplateColumns:
              "260px 1fr 260px",

            gridTemplateRows:
              "160px 160px 160px 160px 160px 160px",

            gridTemplateAreas: `
              "slot7 openTop slot1"
              "siddha siddha slot2"
              "siddha siddha slot3"
              "siddha siddha slot4"
              "slot8 openBottom slot5"
              "slot8 openBottom slot6"
            `,
          }}
        >
          <div style={{ gridArea: "slot7" }}>
            {renderSlot("7", "h-full")}
          </div>

          <div
            style={{
              gridArea: "openTop",
            }}
            className={`
              ${styles.roadway}
              border
              flex
              items-center
              justify-center
              font-bold
            `}
          >
            ROADWAY
          </div>

          <div style={{ gridArea: "slot1" }}>
            {renderSlot("1", "h-full")}
          </div>

          <div
            style={{
              gridArea: "siddha",
            }}
            className={`
              ${styles.building}
              border
              flex
              items-center
              justify-center
              text-6xl
              font-black
              tracking-widest
            `}
          >
            SIDDH-A
          </div>

          <div style={{ gridArea: "slot2" }}>
            {renderSlot("2", "h-full")}
          </div>

          <div style={{ gridArea: "slot3" }}>
            {renderSlot("3", "h-full")}
          </div>

          <div style={{ gridArea: "slot4" }}>
            {renderSlot("4", "h-full")}
          </div>

          <div style={{ gridArea: "slot5" }}>
            {renderSlot("5", "h-full")}
          </div>

          <div style={{ gridArea: "slot6" }}>
            {renderSlot("6", "h-full")}
          </div>

          <div style={{ gridArea: "slot8" }}>
            {renderSlot("8", "h-full")}
          </div>

          <div
            style={{
              gridArea: "openBottom",
            }}
            className={`
              ${styles.roadway}
              border
              flex
              items-center
              justify-center
              font-bold
            `}
          >
            ROADWAY
          </div>

        </div>

      </div>

    </div>
  );
}

export default ParkingLayout;