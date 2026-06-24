import { CalendarDays } from "lucide-react";

function CycleBanner({ cycle }) {

  if (!cycle) return null;

  return (
    <div
      className="
      bg-zinc-900/70
      border border-zinc-800
      rounded-2xl
      p-6
      mb-8
      backdrop-blur-xl
    "
    >
      <div className="flex items-center gap-3 mb-3">
        <CalendarDays size={22} />
        <h2 className="text-xl font-semibold">
          Active Cycle
        </h2>
      </div>

      <h3 className="text-3xl font-bold">
        {cycle.cycleName}
      </h3>

      <p className="text-zinc-400 mt-2">
        {new Date(
          cycle.startDate
        ).toLocaleDateString()}
        {" - "}
        {new Date(
          cycle.endDate
        ).toLocaleDateString()}
      </p>

      <span
        className="
        inline-block
        mt-4
        px-3
        py-1
        rounded-full
        bg-green-500/20
        text-green-400
      "
      >
        {cycle.status}
      </span>
    </div>
  );
}

export default CycleBanner;