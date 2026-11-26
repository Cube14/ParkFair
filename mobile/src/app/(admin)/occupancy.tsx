import { type AdminOccupancy } from '../../api';
import { AuthenticatedScreen } from '../../components/AuthenticatedScreen';
import { Copy } from '../../components/Screen';

export default function Occupancy() {
  return (
    <AuthenticatedScreen<AdminOccupancy> title="Current occupancy" path="/dashboard">
      {({ data }) => data.activeCycle ? (
        <>
          <Copy>{data.activeCycle}</Copy>
          <Copy>{data.activeCycleAssignments} assigned out of {data.totalCapacity} spaces</Copy>
          <Copy>{data.availableCapacity} spaces available</Copy>
        </>
      ) : <Copy>No active parking cycle.</Copy>}
    </AuthenticatedScreen>
  );
}
