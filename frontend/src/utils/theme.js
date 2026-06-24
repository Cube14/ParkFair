export const getThemeClasses = (
  theme
) => ({
  /*
  --------------------------------
  GLOBAL
  --------------------------------
  */

  page:
    theme === "dark"
      ? "bg-black text-white"
      : "bg-zinc-100 text-zinc-900",

  text:
    theme === "dark"
      ? "text-white"
      : "text-zinc-900",

  muted:
    theme === "dark"
      ? "text-zinc-400"
      : "text-zinc-600",

  /*
  --------------------------------
  CARDS
  --------------------------------
  */

  card:
    theme === "dark"
      ? `
        bg-zinc-900/80
        border-zinc-800
        backdrop-blur-xl
      `
      : `
        bg-white
        border-zinc-200
        shadow-xl
      `,

  glassCard:
    theme === "dark"
      ? `
        bg-zinc-900/60
        border-zinc-800
        backdrop-blur-xl
      `
      : `
        bg-white/90
        border-zinc-200
        backdrop-blur-xl
        shadow-xl
      `,

  /*
  --------------------------------
  TABLES
  --------------------------------
  */

  table:
    theme === "dark"
      ? `
        bg-zinc-900/80
        border-zinc-800
      `
      : `
        bg-white
        border-zinc-200
        shadow-lg
      `,

  tableRow:
    theme === "dark"
      ? "border-zinc-800 hover:bg-zinc-800/50"
      : "border-zinc-200 hover:bg-zinc-50",

  /*
  --------------------------------
  FORMS
  --------------------------------
  */

  input:
    theme === "dark"
      ? `
        bg-zinc-900
        border-zinc-700
        text-white
      `
      : `
        bg-white
        border-zinc-300
        text-zinc-900
      `,

  modal:
    theme === "dark"
      ? `
        bg-zinc-900
        border-zinc-800
      `
      : `
        bg-white
        border-zinc-200
      `,

  /*
  --------------------------------
  SIDEBAR
  --------------------------------
  */

  sidebar:
    theme === "dark"
      ? `
        bg-zinc-950/90
        border-zinc-800
      `
      : `
        bg-white/95
        border-zinc-200
        shadow-xl
      `,

  /*
  --------------------------------
  PARKING LAYOUT
  --------------------------------
  */

  slot:
    theme === "dark"
      ? `
        bg-zinc-900
        border-zinc-800
      `
      : `
        bg-white
        border-zinc-300
        shadow-md
      `,

  roadway:
    theme === "dark"
      ? `
        bg-zinc-800
        text-zinc-400
      `
      : `
        bg-zinc-300
        text-zinc-700
      `,

  building:
    theme === "dark"
      ? `
        bg-zinc-700
        text-zinc-200
      `
      : `
        bg-zinc-800
        text-white
      `,

  outside:
    theme === "dark"
      ? `
        bg-orange-500/20
        border-orange-500/40
      `
      : `
        bg-orange-100
        border-orange-300
        text-orange-700
      `,

  /*
  --------------------------------
  STATUS COLORS
  --------------------------------
  */

  success:
    theme === "dark"
      ? `
        bg-green-500/20
        text-green-400
      `
      : `
        bg-green-100
        text-green-700
      `,

  warning:
    theme === "dark"
      ? `
        bg-yellow-500/20
        text-yellow-400
      `
      : `
        bg-yellow-100
        text-yellow-700
      `,

  danger:
    theme === "dark"
      ? `
        bg-red-500/20
        text-red-400
      `
      : `
        bg-red-100
        text-red-700
      `,

  /*
  --------------------------------
  SPECIAL PARKFAIR RED
  --------------------------------
  */

  accent:
    "text-red-500",

  accentBg:
    "bg-red-500",

  accentBorder:
    "border-red-500",
});