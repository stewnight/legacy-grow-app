import type { StorybookConfig } from '@storybook/nextjs'
import path from 'path'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-viewport',
    '@storybook/addon-onboarding',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {
      nextConfigPath: '../next.config.js',
    },
  },
  docs: {
    autodocs: true,
  },
  webpackFinal: async (config) => {
    if (!config.resolve) {
      config.resolve = {}
    }

    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.resolve(__dirname, '../src'),
      '@': path.resolve(__dirname, '../src'),
      // Mock modules
      'geist/font/sans': path.resolve(__dirname, '../src/__mocks__/geist.ts'),
      '@/server/auth/config': path.resolve(__dirname, '../src/__mocks__/auth.ts'),
      '@/server/db': path.resolve(__dirname, '../src/__mocks__/db.ts'),
      '@/env': path.resolve(__dirname, '../src/__mocks__/env.ts'),
    }

    // Exclude server-side modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      perf_hooks: false,
      pg: false,
      postgres: false,
    }

    return config
  },
}

export default config
