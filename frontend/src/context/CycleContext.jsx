import {
  createContext,
  useContext,
  useState,
} from "react";

const CycleContext =
  createContext();

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

export function useCycle() {
  return useContext(
    CycleContext
  );
}