import Sidebar from "../components/Sidebar";
import BackgroundGlow from "../components/BackgroundGlow";

import ThemeToggle from "../components/ThemeToggle";

import {
  useTheme,
} from "../context/ThemeContext";

function MainLayout({
  children,
}) {
  const { theme } =
    useTheme();

  return (
    <div
      className={`
        min-h-screen
        relative
        overflow-x-hidden
        transition-all
        duration-300

        ${
          theme === "dark"
            ? "bg-black text-white"
            : "bg-zinc-100 text-black"
        }
      `}
    >
      {theme === "dark" && (
        <BackgroundGlow />
      )}

      <Sidebar />

      {/* GLOBAL THEME TOGGLE */}

      <div
  className="
    fixed
    top-3
    right-4
    md:top-5
    md:right-5
    z-50
  "
>
        <ThemeToggle />
      </div>

      <main
        className="
          relative
          z-10
          p-4
          pt-20
          md:p-10
          md:pt-10
          md:ml-72
        "
      >
        {children}
      </main>
    </div>
  );
}

export default MainLayout;