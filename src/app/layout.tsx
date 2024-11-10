import '~/styles/globals.css'
import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import { TRPCReactProvider } from '~/trpc/react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Header from '~/components/layout/header'
import { AppSidebar } from '~/components/app-sidebar'
import { auth } from '~/server/auth'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import { ThemeProvider } from '~/components/theme-provider'

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
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            {session ? (
              <SidebarProvider>
                <AppSidebar user={session.user} />
                <SidebarInset className="max-w-full mx-auto">
                  <Header />
                  {children}
                </SidebarInset>
              </SidebarProvider>
            ) : (
              <div className="relative">
                <Header />
                {children}
              </div>
            )}
            <ReactQueryDevtools initialIsOpen={false} />
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
