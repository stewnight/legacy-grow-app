import '../src/styles/globals.css'
import { Preview } from '@storybook/react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '~/components/theme-provider'
import React from 'react'
import './styles.css'

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '360px',
            height: '640px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '800px',
          },
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <SessionProvider
        session={{
          user: {
            id: 'cl1234567890',
            name: 'John Doe',
            email: 'john@example.com',
            image: 'https://github.com/shadcn.png',
          },
          expires: '2025-01-01',
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Story />
        </ThemeProvider>
      </SessionProvider>
    ),
  ],
}

export default preview
