import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";

import {
  useCycle,
} from "../context/CycleContext";

function CycleSelector() {
  const {
    selectedCycle,
    setSelectedCycle,
  } = useCycle();

  const [cycles, setCycles] =
    useState([]);

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      const res =
        await api.get("/cycles");

      const cycleData =
        res.data.data || [];

      setCycles(cycleData);

      if (
        !selectedCycle &&
        cycleData.length > 0
      ) {
        setSelectedCycle(
          cycleData[0]
        );
      }
    } catch (error) {
      console.error(
        "Cycle Load Error:",
        error
      );
    }
  };

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