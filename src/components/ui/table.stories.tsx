import type { Meta, StoryObj } from '@storybook/react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { Badge } from './badge'

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof Table>

const invoices = [
  {
    invoice: 'INV001',
    paymentStatus: 'Paid',
    totalAmount: '$250.00',
    paymentMethod: 'Credit Card',
  },
  {
    invoice: 'INV002',
    paymentStatus: 'Pending',
    totalAmount: '$150.00',
    paymentMethod: 'PayPal',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    paymentMethod: 'Bank Transfer',
  },
]

export const Default: Story = {
  args: {
    children: (
      <>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.invoice}>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    invoice.paymentStatus === 'Paid'
                      ? 'default'
                      : invoice.paymentStatus === 'Pending'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {invoice.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell className="text-right">
                {invoice.totalAmount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </>
    ),
  },
}

export const WithoutCaption: Story = {
  args: {
    children: (
      <>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>TASK-1234</TableCell>
            <TableCell>Update documentation</TableCell>
            <TableCell>
              <Badge>In Progress</Badge>
            </TableCell>
            <TableCell className="text-right">Edit</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>TASK-1235</TableCell>
            <TableCell>Fix navigation bug</TableCell>
            <TableCell>
              <Badge variant="secondary">Todo</Badge>
            </TableCell>
            <TableCell className="text-right">Edit</TableCell>
          </TableRow>
        </TableBody>
      </>
    ),
  },
}
