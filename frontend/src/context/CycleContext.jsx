import {
  useState,
} from "react";

import { CycleContext } from "./cycle";

export function CycleProvider({
  children,
}) {
  const [
    selectedCycle,
    setSelectedCycle,
  ] = useState(null);

  return (
    <CycleContext.Provider
      value={{
        selectedCycle,
        setSelectedCycle,
      }}
    >
      {children}
    </CycleContext.Provider>
  );
}
