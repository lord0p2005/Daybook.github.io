
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/logs');
  // This component will not render anything as it redirects.
  // You can optionally return null or a loading spinner if preferred,
  // but redirect() should handle it.
  return null;
}
