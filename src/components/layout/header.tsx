import { SidebarTrigger } from '../ui/sidebar'

export default async function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-xl font-bold">Legacy Grow App</h1>
      </div>
    </header>
  )
}
