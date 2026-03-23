import { redirect } from 'next/navigation'

// Redirect to login. Middleware will forward authenticated users to /inicio.
export default function Home() {
  redirect('/login')
}
