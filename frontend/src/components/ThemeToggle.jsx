import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const {
    theme,
    toggleTheme,
  } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        flex
        items-center
        justify-center
        w-12
        h-12
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900/80
        backdrop-blur-xl
        hover:border-red-500
        hover:shadow-lg
        hover:shadow-red-500/20
        transition-all
        duration-300
      "
    >
      {theme === "dark" ? (
        <Sun size={20} />
      ) : (
        <Moon size={20} />
      )}
    </button>
  );
}

export default ThemeToggle;