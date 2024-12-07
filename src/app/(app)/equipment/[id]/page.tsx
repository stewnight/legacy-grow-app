'use client'

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { api } from '~/trpc/react'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { Skeleton } from '~/components/ui/skeleton'
import { AppSheet } from '~/components/layout/app-sheet'
import { EquipmentForm } from '../_components/equipment-form'
import { format } from 'date-fns'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { ScrollArea } from '~/components/ui/scroll-area'
import { ArrowLeftIcon } from 'lucide-react'
import * as React from 'react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EquipmentDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params)
  const { data: equipment, isLoading } = api.equipment.getById.useQuery(
    resolvedParams.id,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A'
    return format(new Date(date), 'PP')
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!equipment) {
    return notFound()
  }

  const isMaintenanceDue = equipment.nextMaintenanceDate
    ? new Date(equipment.nextMaintenanceDate) < new Date()
    : false

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/equipment"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Equipment
            </Link>
            {equipment.room && (
              <>
                <span className="text-muted-foreground">•</span>
                <Link
                  href={`/rooms/${equipment.room.id}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {equipment.room.name}
                </Link>
              </>
            )}
            {equipment.location && (
              <>
                <span className="text-muted-foreground">•</span>
                <Link
                  href={`/locations/${equipment.location.id}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {equipment.location.name}
                </Link>
              </>
            )}
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            {equipment.name}
          </h2>
          <p className="text-muted-foreground">
            {equipment.type.charAt(0).toUpperCase() + equipment.type.slice(1)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant={equipment.status === 'active' ? 'default' : 'destructive'}
          >
            {equipment.status.charAt(0).toUpperCase() +
              equipment.status.slice(1)}
          </Badge>
          <AppSheet mode="edit" entity="equipment">
            <EquipmentForm mode="edit" initialData={equipment} />
          </AppSheet>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {equipment.room ? equipment.room.name : 'Unassigned'}
              </div>
              {equipment.room && (
                <div className="text-sm text-muted-foreground">
                  {equipment.location ? `${equipment.location.name} • ` : ''}
                  {equipment.room.type.charAt(0).toUpperCase() +
                    equipment.room.type.slice(1)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {equipment.nextMaintenanceDate
                  ? format(new Date(equipment.nextMaintenanceDate), 'PP')
                  : 'Not Scheduled'}
              </div>
              {isMaintenanceDue && (
                <Badge variant="destructive">Maintenance Due</Badge>
              )}
              <div className="text-sm text-muted-foreground">
                {equipment.maintenanceFrequency.charAt(0).toUpperCase() +
                  equipment.maintenanceFrequency.slice(1)}{' '}
                maintenance
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Connected Sensors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {equipment.sensors?.length ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Details</CardTitle>
              <CardDescription>
                Specifications and maintenance information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
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
                    <div>
                      {equipment.purchaseDate
                        ? format(new Date(equipment.purchaseDate), 'PP')
                        : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Warranty Expiration
                    </div>
                    <div>
                      {equipment.warrantyExpiration
                        ? format(new Date(equipment.warrantyExpiration), 'PP')
                        : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Last Maintenance
                    </div>
                    <div>
                      {equipment.lastMaintenanceDate
                        ? format(new Date(equipment.lastMaintenanceDate), 'PP')
                        : '-'}
                    </div>
                  </div>
                </div>

                {equipment.specifications && (
                  <div>
                    <div className="mb-2 text-sm font-medium text-muted-foreground">
                      Specifications
                    </div>
                    <div className="rounded border p-2">
                      <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(equipment.specifications, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {equipment.notes && (
                  <div>
                    <div className="mb-2 text-sm font-medium text-muted-foreground">
                      Notes
                    </div>
                    <p className="whitespace-pre-wrap">{equipment.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle>Connected Sensors</CardTitle>
              <CardDescription>
                Sensors monitoring this equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {equipment.sensors?.map((sensor) => (
                    <div
                      key={sensor.id}
                      className="flex items-center justify-between rounded border p-4"
                    >
                      <div>
                        <p className="font-medium">{sensor.identifier}</p>
                        <p className="text-sm text-muted-foreground">
                          {sensor.type.charAt(0).toUpperCase() +
                            sensor.type.slice(1)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {sensor.status.charAt(0).toUpperCase() +
                          sensor.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                  {!equipment.sensors?.length && (
                    <p className="text-center text-muted-foreground">
                      No sensors connected
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
