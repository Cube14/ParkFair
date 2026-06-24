function StatusBadge({
  status,
}) {
  const colors = {
    ACTIVE:
      "bg-green-500/20 text-green-400 border-green-500/40",

    COMPLETED:
      "bg-blue-500/20 text-blue-400 border-blue-500/40",

    PLANNED:
      "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  };

  return (
    <span
      className={`
        inline-block
        px-3
        py-1
        rounded-full
        border
        text-sm
        font-medium
        ${colors[status]}
      `}
    >
      {status}
    </span>
  );
}

export default StatusBadge;