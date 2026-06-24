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

  const renderSlot = (
    slotNumber,
    extraClass = ""
  ) => {
    const flats =
      matrix?.[slotNumber] || [];

    return (
      <div
        className={`
          bg-zinc-900
          border
          border-zinc-800
          rounded-2xl
          p-4
          flex
          flex-col
          justify-center
          items-center
          transition-all
          hover:border-red-500
          hover:shadow-red-500/30
          hover:shadow-xl
          ${extraClass}
        `}
      >
        <h3 className="font-bold text-xl mb-2">
          Slot {slotNumber}
        </h3>

        {flats.length > 0 ? (
          flats.map((flat) => (
            <div
              key={flat}
              className="
                bg-red-500/20
                border
                border-red-500/40
                rounded-lg
                px-3
                py-1
                mb-1
              "
            >
              Flat {flat}
            </div>
          ))
        ) : (
          <span className="text-zinc-500">
            Empty
          </span>
        )}
      </div>
    );
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

  return (
    <div>
      <div className="mb-8">
        <CycleSelector />
      </div>

      {/* Outside Parking */}

      <div className="flex justify-center mb-4">
        <div
          className="
            bg-orange-500/20
            border
            border-orange-500/40
            rounded-2xl
            px-10
            py-4
            text-lg
            font-semibold
          "
        >
          OUTSIDE PARKING AREA
        </div>
      </div>

      {/* Gate */}

      <div
        className="
          text-center
          text-red-500
          font-bold
          text-xl
          mb-8
        "
      >
        🚧 GATE
      </div>

      {/* Mobile Hint */}

      <div
        className="
          md:hidden
          text-center
          text-zinc-500
          mb-4
          text-sm
        "
      >
        ← Swipe horizontally to view full layout →
      </div>

      {/* Layout Wrapper */}

      <div className="overflow-x-auto">

        <div
          className="
            min-w-[900px]
            max-w-7xl
            mx-auto
            grid
            gap-0
          "
          style={{
            gridTemplateColumns:
              "240px 1fr 220px",

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
          {/* TOP */}

          <div style={{ gridArea: "slot7" }}>
            {renderSlot("7", "h-full")}
          </div>

          <div
            style={{
              gridArea: "openTop",
            }}
            className="
              bg-zinc-800/40
              border
              border-zinc-800
              flex
              items-center
              justify-center
              font-semibold
              text-zinc-400
            "
          >
            OPEN AREA
          </div>

          <div style={{ gridArea: "slot1" }}>
            {renderSlot("1", "h-full")}
          </div>

          {/* SIDDH-A */}

          <div
            style={{
              gridArea: "siddha",
            }}
            className="
              bg-zinc-700
              border
              border-zinc-600
              flex
              items-center
              justify-center
              text-5xl
              font-bold
              text-zinc-300
            "
          >
            SIDDH-A
          </div>

          {/* RIGHT COLUMN */}

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

          {/* BOTTOM */}

          <div style={{ gridArea: "slot8" }}>
            {renderSlot("8", "h-full")}
          </div>

          <div
            style={{
              gridArea: "openBottom",
            }}
            className="
              bg-zinc-800/40
              border
              border-zinc-800
              flex
              items-center
              justify-center
              font-semibold
              text-zinc-400
            "
          >
            OPEN AREA
          </div>

        </div>

      </div>

    </div>
  );
}

export default ParkingLayout;