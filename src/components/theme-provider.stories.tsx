import type { Meta, StoryObj } from '@storybook/react';

import { ThemeProvider } from './theme-provider';

const meta = {
  component: ThemeProvider,
} satisfies Meta<typeof ThemeProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};