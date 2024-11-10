import '~/styles/globals.css'
import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import { TRPCReactProvider } from '~/trpc/react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Header from '~/components/layout/header'
import { AppSidebar } from '~/components/app-sidebar'
import { auth } from '~/server/auth'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '~/components/ui/sidebar'
export const metadata: Metadata = {
  title: 'Legacy Grow App',
  description: 'An all-in-one cannabis growing app',
  icons: [{ rel: 'icon', url: '/favicon.svg' }],
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="min-h-screen">
        <TRPCReactProvider>
          {session ? (
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center border-b">
                  <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <h1 className="text-xl font-bold">Legacy Grow App</h1>
                  </div>
                  <div className="ml-auto flex items-center gap-2 px-4">
                    <Link href="/api/auth/signout">
                      <Button variant="outline" size="sm">
                        Sign out
                      </Button>
                    </Link>
                  </div>
                </header>
                {children}
              </SidebarInset>
            </SidebarProvider>
          ) : (
            <div className="relative">
              <Header />
              <main className="pt-16">{children}</main>
            </div>
          )}
          <ReactQueryDevtools initialIsOpen={false} />
        </TRPCReactProvider>
      </body>
    </html>
  )
}
