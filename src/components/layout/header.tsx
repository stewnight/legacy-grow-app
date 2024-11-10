import { SidebarTrigger } from '../ui/sidebar'
import { auth } from '~/server/auth'
export default async function Header() {
  const session = await auth()
  return (
    <header className="flex h-16 shrink-0 items-center border-b">
      <div className="flex items-center gap-2 px-4">
        {session ? <SidebarTrigger className="-ml-1" /> : null}
        <h1 className="text-xl font-bold">Legacy Grow App</h1>
      </div>
    </header>
  )
}
