import { type ResidentAllocation } from '../../api';
import { AuthenticatedScreen } from '../../components/AuthenticatedScreen';
import { Copy } from '../../components/Screen';

export default function Parking() {
  return (
    <AuthenticatedScreen<ResidentAllocation> title="Current parking" path="/resident/dashboard">
      {({ resident, vehicle, parking, cycle }) => (
        <>
          <Copy>Flat {resident.flatNumber}{vehicle ? ` ? ${vehicle.number}` : ''}</Copy>
          {cycle && <Copy>{cycle.name} ? {cycle.remainingDays} days remaining</Copy>}
          <Copy>{parking ? (parking.status === 'OUTSIDE' ? 'Outside parking' : `Slot ${parking.slot}`)
            : 'No current parking assignment.'}</Copy>
        </>
      )}
    </AuthenticatedScreen>
  );
}
