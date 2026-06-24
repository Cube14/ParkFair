function ActionButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
}) {
  const variants = {
    primary:
      "bg-red-500 hover:bg-red-600 text-white",

    success:
      "bg-green-500 hover:bg-green-600 text-white",

    warning:
      "bg-yellow-500 hover:bg-yellow-600 text-black",

    danger:
      "bg-red-700 hover:bg-red-800 text-white",

    secondary:
      "bg-zinc-800 hover:bg-zinc-700 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4
        py-2
        rounded-xl
        font-medium
        transition-all
        duration-300
        hover:scale-105
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default ActionButton;