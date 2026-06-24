import {
  useTheme,
} from "../../context/ThemeContext";

function ActionButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
}) {
  const { theme } =
    useTheme();

  const variants = {
    primary:
      "bg-red-500 hover:bg-red-600 text-white border-red-500",

    success:
      "bg-green-500 hover:bg-green-600 text-white border-green-500",

    warning:
      "bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500",

    danger:
      "bg-red-700 hover:bg-red-800 text-white border-red-700",

    secondary:
      theme === "dark"
        ? `
          bg-zinc-800
          hover:bg-zinc-700
          text-white
          border-zinc-700
        `
        : `
          bg-white
          hover:bg-zinc-100
          text-zinc-900
          border-zinc-300
        `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4
        py-2
        rounded-xl
        font-medium
        border
        transition-all
        duration-300
        hover:scale-105
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:scale-100
        shadow-sm
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default ActionButton;