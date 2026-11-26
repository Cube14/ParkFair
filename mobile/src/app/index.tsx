import { Redirect } from 'expo-router';
import { useSession } from '../session';

export default function LandingRoute() {
  const { session } = useSession();
  if (session?.user.role === 'ADMIN') return <Redirect href="/occupancy" />;
  if (session?.user.role === 'RESIDENT') return <Redirect href="/parking" />;
  return <Redirect href="/sign-in" />;
}
