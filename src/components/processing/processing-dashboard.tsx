'use client'

import { type Processing } from '~/server/db/schema'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { formatDistanceToNow, format } from 'date-fns'
import { Badge } from '~/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ProcessingDashboardProps {
  processing: Processing[]
}

type Row = {
  original: Processing
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'completed':
      return 'secondary'
    case 'in_progress':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'cancelled':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function ProcessingDashboard({ processing }: ProcessingDashboardProps) {
  // Calculate type statistics
  const typeStats = processing.reduce(
    (acc, proc) => {
      acc[proc.type] = (acc[proc.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Calculate average yield percentage
  const averageYield =
    processing.reduce((sum, proc) => {
      return sum + Number(proc.yieldPercentage) || 0
    }, 0) / processing.length

  // Get active processes
  const activeProcesses = processing.filter(
    (proc) => proc.status === 'in_progress'
  )

  // Get recent processes (last 5)
  const recentProcesses = [...processing]
    .sort((a, b) => {
      if (!a.startedAt || !b.startedAt) return 0
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    })
    .slice(0, 5)

  // Prepare data for yield chart
  const yieldData = processing
    .filter((proc) => proc.yieldPercentage !== null)
    .map((proc) => ({
      id: proc.id.slice(0, 8),
      yield: Number(proc.yieldPercentage) || 0,
    }))
    .slice(-10)

  const sortedProcessing = processing.sort((a, b) => {
    if (!a.startedAt || !b.startedAt) return 0
    return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  })

  // Replace processStatus with status
  const statusCounts = processing.reduce(
    (acc, curr) => {
      const status = curr.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Use id instead of identifier
  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }: { row: Row }) => (
        <div className="font-medium">{row.original.id.slice(0, 8)}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: Row }) => (
        <Badge
          variant={getStatusVariant(row.original.status)}
          className="capitalize"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'startedAt',
      header: 'Started',
      cell: ({ row }: { row: Row }) => {
        const date = row.original.startedAt
        return date ? format(new Date(date), 'PPp') : '-'
      },
    },
  ]

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md">
      <div className="flex w-full space-x-4 pb-4">
        {/* Active Processes */}
        <Card className="min-w-[300px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Processes</CardTitle>
            <CardDescription>Currently running processes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProcesses.length}</div>
            <p className="text-xs text-muted-foreground">
              processes in progress
            </p>
          </CardContent>
        </Card>

        {/* Average Yield */}
        <Card className="min-w-[300px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Yield</CardTitle>
            <CardDescription>Overall process efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageYield.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              across all processes
            </p>
          </CardContent>
        </Card>

        {/* Process Types */}
        <Card className="min-w-[300px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Process Types</CardTitle>
            <CardDescription>Distribution by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeStats).map(([type, count]) => (
                <Badge key={type} variant="secondary">
                  {type}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="min-w-[300px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Activity</CardTitle>
            <CardDescription>Latest processes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProcesses.map((proc) => (
                <div key={proc.id} className="flex items-center gap-4">
                  <Badge
                    variant={
                      proc.status === 'in_progress'
                        ? 'default'
                        : proc.status === 'completed'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {proc.status}
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {proc.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {proc.startedAt
                        ? formatDistanceToNow(new Date(proc.startedAt), {
                            addSuffix: true,
                          })
                        : 'Not started'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yield Chart */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Yield Performance</CardTitle>
          <CardDescription>Recent process yields</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="yield" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  )
}
