import Link from 'next/link'
import { Button } from './ui/button'
import { auth } from '../server/auth'

export default async function Header() {
  const session = await auth()
  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex-1">
          <Link href="/">
            <h1 className="text-2xl font-bold">Legacy Grow App</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/batches">
                <Button variant="ghost">Batches</Button>
              </Link>
              <Link href="/plants">
                <Button variant="ghost">Plants</Button>
              </Link>
              <Link href="/api/auth/signout">
                <Button variant="outline">Sign out</Button>
              </Link>
            </>
          ) : (
            <Link href="/api/auth/signin">
              <Button>Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
