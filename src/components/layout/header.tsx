import { SidebarTrigger } from '../ui/sidebar'
import { auth } from '~/server/auth'
import { CustomBreadcrumbs } from '../layout/custom-breadcrumbs'

export default async function Header() {
  const session = await auth()

  return (
    <header className="flex h-16 shrink-0 items-center border-b">
      <div className="flex w-full items-center gap-4 px-4">
        {session ? <SidebarTrigger className="-ml-1" /> : null}
        <div className="flex flex-col gap-1">
          {/* <h1 className="text-xl font-bold">Legacy Grow App</h1> */}
          <CustomBreadcrumbs />
        </div>
      </div>
    </header>
  )
}
