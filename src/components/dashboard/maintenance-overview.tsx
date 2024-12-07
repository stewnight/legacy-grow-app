'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { api } from '~/trpc/react'
import { format, isBefore } from 'date-fns'
import { Skeleton } from '~/components/ui/skeleton'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import Link from 'next/link'
import { WrenchIcon, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

export function MaintenanceOverview() {
  const { data: equipment, isLoading } = api.equipment.getAll.useQuery(
    {
      limit: 100,
      filters: {
        maintenanceNeeded: true,
      },
    },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Overview</CardTitle>
          <CardDescription>Equipment requiring maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const sortedEquipment = equipment?.items.sort((a, b) => {
    if (!a.nextMaintenanceDate || !b.nextMaintenanceDate) return 0
    return (
      new Date(a.nextMaintenanceDate).getTime() -
      new Date(b.nextMaintenanceDate).getTime()
    )
  })

  const getMaintenanceStatus = (date: Date | null) => {
    if (!date) return { label: 'Not Scheduled', color: 'default' as const }
    const isOverdue = isBefore(new Date(date), new Date())
    return isOverdue
      ? { label: 'Overdue', color: 'destructive' as const }
      : { label: 'Scheduled', color: 'default' as const }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Maintenance Overview</CardTitle>
            <CardDescription>Equipment requiring maintenance</CardDescription>
          </div>
          <Link href="/equipment?filter=maintenance">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {sortedEquipment && sortedEquipment.length > 0 ? (
              sortedEquipment.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <WrenchIcon className="h-4 w-4 text-muted-foreground" />
                      <Link
                        href={`/equipment/${item.id}`}
                        className="font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <p>
                        {item.room ? `${item.room.name} • ` : ''}
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={
                        getMaintenanceStatus(item.nextMaintenanceDate).color
                      }
                    >
                      {getMaintenanceStatus(item.nextMaintenanceDate).label}
                    </Badge>
                    {item.nextMaintenanceDate && (
                      <p className="text-sm text-muted-foreground">
                        Due {format(new Date(item.nextMaintenanceDate), 'PP')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <CheckCircle2 className="mb-2 h-8 w-8" />
                <p>No maintenance tasks due</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
