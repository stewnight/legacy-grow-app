import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'

import { TRPCReactProvider } from '~/trpc/react'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Header from '../components/header'

export const metadata: Metadata = {
  title: 'Legacy Grow App',
  description: 'An all-in-one cannabis growing app',
  icons: [{ rel: 'icon', url: '/favicon.svg' }],
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <Header />
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </TRPCReactProvider>
      </body>
    </html>
  )
}
