import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress';

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 40,
    className: 'w-[60%]',
  },
};

export const Indeterminate: Story = {
  args: {
    className: 'w-[60%]',
  },
};

export const Complete: Story = {
  args: {
    value: 100,
    className: 'w-[60%]',
  },
};
