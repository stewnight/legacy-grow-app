import type { Meta, StoryObj } from "@storybook/react";

import { HealthStatusIcon } from "./icons";

const meta = {
  component: HealthStatusIcon,
} satisfies Meta<typeof HealthStatusIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: {},
  },
};
