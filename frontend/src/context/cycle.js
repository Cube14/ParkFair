import { createContext, useContext } from "react";

export const CycleContext = createContext();
export const useCycle = () => useContext(CycleContext);
