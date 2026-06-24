function OccupancyStats({ matrix }) {

  if (!matrix) return null;

  let occupied = 0;

  Object.values(matrix.data).forEach(
    (slot) => {
      occupied += slot.length;
    }
  );

  const totalCapacity = 12; // temporary

  const available =
    totalCapacity - occupied;

  const utilization =
    ((occupied / totalCapacity) * 100)
      .toFixed(0);

  return (
    <div className="
      grid
      md:grid-cols-3
      gap-4
      mb-8
    ">
      <div className="bg-zinc-900 rounded-xl p-4">
        <h3>Occupied</h3>
        <p className="text-3xl font-bold">
          {occupied}
        </p>
      </div>

      <div className="bg-zinc-900 rounded-xl p-4">
        <h3>Available</h3>
        <p className="text-3xl font-bold">
          {available}
        </p>
      </div>

      <div className="bg-zinc-900 rounded-xl p-4">
        <h3>Utilization</h3>
        <p className="text-3xl font-bold">
          {utilization}%
        </p>
      </div>
    </div>
  );
}

export default OccupancyStats;