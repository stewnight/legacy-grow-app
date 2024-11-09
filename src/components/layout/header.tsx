import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { auth } from '~/server/auth'
import { MobileSidebar } from './sidebar'

export default async function Header() {
  const session = await auth()
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b bg-background px-4">
      <div className="flex items-center gap-4 md:gap-8">
        <MobileSidebar />
        <Link href="/">
          <h1 className="text-xl font-bold md:text-2xl">Legacy Grow App</h1>
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {session ? (
          <>
            <Link href="/api/auth/signout">
              <Button variant="outline" size="sm">
                Sign out
              </Button>
            </Link>
          </>
        ) : (
          <Link href="/api/auth/signin">
            <Button size="sm">Sign in</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
