import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'

import { TRPCReactProvider } from '~/trpc/react'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import { auth } from '../server/auth'

export const metadata: Metadata = {
  title: 'LegacyAG - Growing app',
  description: 'An all-in-one cannabis growing app',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          {/* Navigation Bar */}
          <nav className="border-b">
            <div className="container mx-auto flex h-16 items-center px-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold">LegacyAG</h1>
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
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  )
}
