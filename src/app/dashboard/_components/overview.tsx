'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const data = [
  {
    name: 'Jan',
    plants: 12,
    harvests: 4,
  },
  {
    name: 'Feb',
    plants: 18,
    harvests: 6,
  },
  {
    name: 'Mar',
    plants: 24,
    harvests: 8,
  },
  {
    name: 'Apr',
    plants: 32,
    harvests: 10,
  },
  {
    name: 'May',
    plants: 28,
    harvests: 12,
  },
  {
    name: 'Jun',
    plants: 36,
    harvests: 14,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar dataKey="plants" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="harvests" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
