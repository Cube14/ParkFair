import {
  useEffect,
  useState,
} from "react";

import { ThemeContext } from "./theme";

export function ThemeProvider({
  children,
}) {
  const [theme, setTheme] =
    useState(() => {
      return (
        localStorage.getItem(
          "parkfair-theme"
        ) || "dark"
      );
    });

  useEffect(() => {
    localStorage.setItem(
      "parkfair-theme",
      theme
    );

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "dark"
        ? "light"
        : "dark"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
