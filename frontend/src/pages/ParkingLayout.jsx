import { useEffect, useState } from "react";
import api from "../services/api";

import { useCycle } from "../context/CycleContext";
import CycleSelector from "../components/CycleSelector";

function ParkingLayout() {
  const [matrix, setMatrix] =
    useState(null);

  const { selectedCycle } =
    useCycle();

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
      "border-zinc-800";

    let glow = "";

    let status = "EMPTY";

    if (isFull) {
      border =
        "border-red-500";

      glow =
        "shadow-red-500/20";

      status = "FULL";
    }

    if (isPartial) {
      border =
        "border-yellow-500";

      glow =
        "shadow-yellow-500/20";

      status = "PARTIAL";
    }

    return (
      <div
  className={`
    bg-zinc-900/90
    backdrop-blur-xl
    border
    ${border}
    rounded-3xl
    p-4
    flex
    flex-col
    transition-all
    duration-300
    hover:scale-105
    hover:shadow-xl
    overflow-y-auto
    ${glow}
    ${extraClass}
  `}
>
        <div>

          <div className="flex justify-between items-center">

            <h3 className="font-bold text-xl">
              SLOT {slotNumber}
            </h3>

            <span
              className="
              text-xs
              px-2
              py-1
              rounded-full
              bg-zinc-800
            "
            >
              {status}
            </span>

          </div>

          <div className="mt-3 text-sm text-zinc-400">

            Capacity

            <span className="ml-2 text-white font-semibold">
              {occupied}/{capacity}
            </span>

          </div>

        </div>

        <div className="mt-4 flex flex-col gap-2">

          {flats.length > 0 ? (
            flats.map((flat) => (
              <div
                key={flat}
                className="
                  bg-red-500/10
                  border
                  border-red-500/30
                  rounded-xl
                  px-3
                  py-2
                  mb-2
                  text-center
                  font-medium
                  min-h-[42px]
                "
              >
                Flat {flat}
              </div>
            ))
          ) : (
            <div
              className="
                h-16
                flex
                items-center
                justify-center
                text-zinc-500
              "
            >
              Available
            </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <div>

      {/* HEADER */}

      <div className="mb-8">

        <h1
          className="
          text-5xl
          font-bold
          mb-3
        "
        >
          SIDDH-A
          Parking Command Center
        </h1>

        <p className="text-zinc-400">
          Live Parking Matrix
        </p>

      </div>

      {/* CYCLE SELECTOR */}

      <div className="mb-8">
        <CycleSelector />
      </div>

      {/* STATS */}

      <div
        className="
        grid
        md:grid-cols-4
        gap-4
        mb-8
      "
      >

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <p className="text-zinc-400">
            Occupancy
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {occupancyPercentage}%
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <p className="text-zinc-400">
            Occupied
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {occupiedSpaces}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <p className="text-zinc-400">
            Available
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {availableSpaces}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <p className="text-zinc-400">
            Total Capacity
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {totalCapacity}
          </h2>
        </div>

      </div>

      {/* OCCUPANCY BAR */}

      <div
        className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-5
        mb-8
      "
      >

        <div className="flex justify-between mb-2">
          <span>Occupancy</span>

          <span>
            {occupancyPercentage}%
          </span>
        </div>

        <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">

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

      {/* OUTSIDE AREA */}

      <div className="flex justify-center mb-6">

        <div
          className="
          bg-orange-500/10
          border
          border-orange-500/40
          rounded-3xl
          px-10
          py-5
          text-center
        "
        >
          <h2
            className="
            text-xl
            font-bold
            text-orange-400
          "
          >
            OUTSIDE PARKING
          </h2>

          <p className="text-zinc-400 mt-2">
            Capacity 0 / 4
          </p>
        </div>

      </div>

      {/* GATE */}

      <div
        className="
        text-center
        text-red-500
        font-bold
        text-2xl
        mb-8
      "
      >
        ═══ 🚧 MAIN GATE 🚧 ═══
      </div>

      {/* LEGEND */}

      <div
        className="
        flex
        justify-center
        gap-6
        flex-wrap
        mb-8
      "
      >

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-500" />
          Empty
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          Partial
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          Full
        </div>

      </div>

      {/* MOBILE HINT */}

      <div
        className="
        md:hidden
        text-center
        text-zinc-500
        mb-4
      "
      >
        ← Swipe to view layout →
      </div>

      {/* PARKING MAP */}

      <div className="overflow-x-auto">

        <div
          className="
          min-w-[950px]
          max-w-7xl
          mx-auto
          grid
        "
          style={{
            gridTemplateColumns:
              "240px 1fr 240px",

            gridTemplateRows:
              "140px 140px 140px 140px 140px 140px",

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
            className="
            bg-zinc-800/30
            border
            border-zinc-800
            flex
            items-center
            justify-center
            text-zinc-500
            font-semibold
          "
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
            className="
            bg-gradient-to-br
            from-zinc-700
            to-zinc-900
            border
            border-zinc-600
            flex
            items-center
            justify-center
            text-6xl
            font-black
            text-zinc-300
            tracking-widest
          "
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
            className="
            bg-zinc-800/30
            border
            border-zinc-800
            flex
            items-center
            justify-center
            text-zinc-500
            font-semibold
          "
          >
            ROADWAY
          </div>

        </div>

      </div>

    </div>
  );
}

export default ParkingLayout;