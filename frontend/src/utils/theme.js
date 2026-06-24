export const getThemeClasses = (
  theme
) => ({
  page:
    theme === "dark"
      ? "bg-black text-white"
      : "bg-zinc-100 text-zinc-900",

  card:
    theme === "dark"
      ? "bg-zinc-900/80 border-zinc-800"
      : "bg-white border-zinc-200 shadow-lg",

  table:
    theme === "dark"
      ? "bg-zinc-900/80 border-zinc-800"
      : "bg-white border-zinc-200",

  input:
    theme === "dark"
      ? "bg-zinc-900 border-zinc-700 text-white"
      : "bg-white border-zinc-300 text-black",

  modal:
    theme === "dark"
      ? "bg-zinc-900 border-zinc-800"
      : "bg-white border-zinc-200",

  sidebar:
    theme === "dark"
      ? "bg-zinc-950/80 border-zinc-800"
      : "bg-white border-zinc-200",

  muted:
    theme === "dark"
      ? "text-zinc-400"
      : "text-zinc-600",
});