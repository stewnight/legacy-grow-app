'use client'

import * as React from 'react'
import { api } from '~/trpc/react'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/components/ui/card'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import {
  MapPin,
  Box,
  Thermometer,
  Droplets,
  Lightbulb,
  Wind,
} from 'lucide-react'
import { AppSheet } from '../../../../components/layout/app-sheet'
import { RoomForm } from '../_components/rooms-form'
import { Badge } from '../../../../components/ui/badge'
import EquipmentTab from '../../../../components/equipment/tab'

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)

  const { data: room, isLoading } = api.room.get.useQuery(resolvedParams.id, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  if (!room && !isLoading) {
    return notFound()
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
                <Skeleton className="h-4 w-36" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A'
    return format(new Date(date), 'PP')
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{room?.name}</h2>
          <p className="text-muted-foreground">
            {room?.building?.name ? (
              <>
                In{' '}
                <Link
                  href={`/buildings/${room.building.id}`}
                  className="hover:underline"
                >
                  {room.building.name}
                </Link>
              </>
            ) : (
              'No building assigned'
            )}
          </p>
        </div>
        <AppSheet mode="edit" entity="room">
          <RoomForm mode="edit" defaultValues={room} />
        </AppSheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{room?.capacity ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total capacity</p>
          </CardContent>
        </Card>

        {room?.properties?.temperature && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Temperature Range
              </CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {room?.properties?.temperature.min}° -{' '}
                {room?.properties?.temperature.max}°
              </div>
              <p className="text-xs text-muted-foreground">Target range</p>
            </CardContent>
          </Card>
        )}

        {room?.properties?.humidity && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Humidity Range
              </CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {room?.properties?.humidity.min}% -{' '}
                {room?.properties?.humidity.max}%
              </div>
              <p className="text-xs text-muted-foreground">Target range</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="children">Sub Rooms</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Type
                    </dt>
                    <dd className="text-sm capitalize">{room?.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="text-sm capitalize">{room?.status}</dd>
                  </div>
                  {room?.dimensions && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Dimensions
                        </dt>
                        <dd className="text-sm">
                          {room?.dimensions.length} x {room?.dimensions.width}
                          {room?.dimensions.height
                            ? ` x ${room?.dimensions.height}`
                            : ''}{' '}
                          {room?.dimensions.unit}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Total Area
                        </dt>
                        <dd className="text-sm">
                          {room?.dimensions.length * room?.dimensions.width}{' '}
                          {room?.dimensions.unit}²
                        </dd>
                      </div>
                      {room?.dimensions.usableSqDimensions && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">
                            Usable Area
                          </dt>
                          <dd className="text-sm">
                            {room?.dimensions.usableSqDimensions}{' '}
                            {room?.dimensions.unit}²
                          </dd>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Created
                    </dt>
                    <dd className="text-sm">
                      {formatDate(room?.createdAt ?? null)} by{' '}
                      {room?.createdBy?.name}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {room?.properties && (
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {room?.properties.light && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Lighting
                        </dt>
                        <dd className="text-sm">
                          {room?.properties.light.type} -{' '}
                          {room?.properties.light.intensity}%
                        </dd>
                      </div>
                    )}
                    {room?.properties.co2 && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          CO2 Range
                        </dt>
                        <dd className="text-sm">
                          {room?.properties.co2.min} -{' '}
                          {room?.properties.co2.max} ppm
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="children">
          <Card>
            <CardHeader>
              <CardTitle>Sub Rooms</CardTitle>
              <CardDescription>
                Rooms or tents contained within this room
              </CardDescription>
            </CardHeader>
            <CardContent>
              {room?.children && room?.children.length > 0 ? (
                <div className="space-y-4">
                  {room?.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between rounded border p-4"
                    >
                      <div>
                        <Link
                          href={`/rooms/${child.id}`}
                          className="font-medium hover:underline"
                        >
                          {child.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {child.type}
                        </p>
                      </div>
                      <Badge variant="secondary">{child.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No sub rooms found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <EquipmentTab entityId={room?.id ?? ''} entityType="room" />

        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle>Sensors</CardTitle>
              <CardDescription>Monitoring devices in this room</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Sensor list implementation here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
