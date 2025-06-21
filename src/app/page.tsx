
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/login'); // Changed from /dashboard to /login
}
