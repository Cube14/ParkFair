import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";

import {
  useCycle,
} from "../context/cycle";

function CycleSelector() {
  const {
    selectedCycle,
    setSelectedCycle,
  } = useCycle();

  const [cycles, setCycles] =
    useState([]);

  useEffect(() => {
    const controller = new AbortController();
    api.get("/cycles", { signal: controller.signal }).then(({ data }) => {
      const entries = data.data ?? [];
      setCycles(entries);
      if (entries.length) setSelectedCycle((current) => current ?? entries[0]);
    }).catch(() => {
      if (!controller.signal.aborted) console.error("Parking data request failed.");
    });
    return () => controller.abort();
  }, [setSelectedCycle]);

  const handleCycleChange = (
    e
  ) => {
    const cycle =
      cycles.find(
        (c) =>
          c._id ===
          e.target.value
      );

    if (cycle) {
      setSelectedCycle(cycle);
    }
  };

  return (
    <select
      value={
        selectedCycle?._id || ""
      }
      onChange={
        handleCycleChange
      }
      className="
        bg-zinc-900
        border
        border-zinc-700
        rounded-xl
        px-4
        py-3
        text-white
        min-w-[200px]
      "
    >
      {cycles.map(
        (cycle) => (
          <option
            key={cycle._id}
            value={cycle._id}
          >
            {cycle.cycleName}
          </option>
        )
      )}
    </select>
  );
}

export default CycleSelector;