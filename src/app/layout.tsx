import '~/styles/globals.css'
import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import { TRPCReactProvider } from '~/trpc/react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Header from '~/components/layout/header'
import { Sidebar } from '~/components/layout/sidebar'
import { auth } from '~/server/auth'

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
            <div className="relative">
              <Header />
              <div className="flex h-full">
                <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 pt-16">
                  <Sidebar />
                </div>
                <main className="md:pl-72 pt-16 w-full">{children}</main>
              </div>
            </div>
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
