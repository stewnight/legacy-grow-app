import type { Meta, StoryObj } from "@storybook/react";

import { CreateFormWrapper } from "./create-form-wrapper";

const meta = {
  component: CreateFormWrapper,
} satisfies Meta<typeof CreateFormWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: {},
  },
};
