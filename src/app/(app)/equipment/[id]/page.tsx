import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { api } from '~/trpc/server'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import { cn } from '~/lib/utils'
import { AppSheet } from '~/components/layout/app-sheet'
import { EquipmentForm } from '../_components/equipment-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Button } from '~/components/ui/button'
import { CalendarDays, Settings, Users } from 'lucide-react'

// Helper function to safely format dates
const formatDate = (date: Date | string | null) => {
  if (!date) return '-'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'PP')
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const equipment = await api.equipment.getById({ id: params.id })
  if (!equipment) notFound()

  const isMaintenanceDue = equipment.nextMaintenanceDate
    ? new Date(equipment.nextMaintenanceDate) < new Date()
    : false

  return (
    <main className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {equipment.name}
          </h2>
          <p className="text-muted-foreground">
            {equipment.type.charAt(0).toUpperCase() + equipment.type.slice(1)}
          </p>
        </div>
        <AppSheet mode="edit" entity="equipment">
          <EquipmentForm mode="edit" initialData={equipment} />
        </AppSheet>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={cn(
                'text-lg',
                equipment.status === 'active' &&
                  'border-green-500 text-green-500',
                equipment.status === 'maintenance' &&
                  'border-yellow-500 text-yellow-500',
                equipment.status === 'offline' && 'border-red-500 text-red-500'
              )}
            >
              {equipment.status.charAt(0).toUpperCase() +
                equipment.status.slice(1)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Maintenance
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={cn(
                'text-lg',
                isMaintenanceDue && 'border-red-500 text-red-500'
              )}
            >
              {formatDate(equipment.nextMaintenanceDate)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Room Assignments
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {equipment.roomAssignments?.length ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
          <TabsTrigger value="rooms">Room Assignments</TabsTrigger>
          <TabsTrigger value="sensors">Connected Sensors</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Details</CardTitle>
              <CardDescription>
                Detailed information about this equipment
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Manufacturer
                  </div>
                  <div>{equipment.manufacturer ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Model
                  </div>
                  <div>{equipment.model ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Serial Number
                  </div>
                  <div>{equipment.serialNumber ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Purchase Date
                  </div>
                  <div>{formatDate(equipment.purchaseDate)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Warranty Expiration
                  </div>
                  <div>{formatDate(equipment.warrantyExpiration)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Maintenance Frequency
                  </div>
                  <div>
                    {equipment.maintenanceFrequency.charAt(0).toUpperCase() +
                      equipment.maintenanceFrequency.slice(1)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Notes
                </div>
                <div className="mt-1">{equipment.notes ?? '-'}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>
                Record of all maintenance activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {/* TODO: Add maintenance history list */}
                    <div className="text-center text-muted-foreground">
                      No maintenance records found
                    </div>
                  </div>
                </ScrollArea>
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Room Assignments</CardTitle>
                  <CardDescription>
                    Rooms where this equipment is installed
                  </CardDescription>
                </div>
                <Button variant="outline">Add Room</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {equipment.roomAssignments?.map((assignment) => (
                      <Card key={assignment.id}>
                        <CardHeader>
                          <CardTitle>{assignment.room.name}</CardTitle>
                          <CardDescription>
                            {assignment.room.type.charAt(0).toUpperCase() +
                              assignment.room.type.slice(1)}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                    {!equipment.roomAssignments?.length && (
                      <div className="text-center text-muted-foreground">
                        No room assignments found
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Connected Sensors</CardTitle>
                  <CardDescription>
                    Sensors monitoring this equipment
                  </CardDescription>
                </div>
                <Button variant="outline">Add Sensor</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {equipment.sensors?.map((sensor) => (
                      <Card key={sensor.id}>
                        <CardHeader>
                          <CardTitle>{sensor.name}</CardTitle>
                          <CardDescription>
                            {sensor.type.charAt(0).toUpperCase() +
                              sensor.type.slice(1)}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                    {!equipment.sensors?.length && (
                      <div className="text-center text-muted-foreground">
                        No sensors connected
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
