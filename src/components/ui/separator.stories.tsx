import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  args: {
    className: 'my-4',
  },
  decorators: [
    (Story) => (
      <div className="w-[300px] space-y-1">
        <div className="text-sm font-medium">Radix Primitives</div>
        <Story />
        <div className="text-sm text-muted-foreground">An open-source UI component library.</div>
      </div>
    ),
  ],
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    className: 'mx-4 h-5',
  },
  decorators: [
    (Story) => (
      <div className="flex h-5 items-center">
        <div className="text-sm">Blog</div>
        <Story />
        <div className="text-sm">Docs</div>
        <Story />
        <div className="text-sm">Source</div>
      </div>
    ),
  ],
};
