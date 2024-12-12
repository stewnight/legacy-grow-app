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
import { Skeleton } from '~/components/ui/skeleton'
import Link from 'next/link'
import { MapPin, Settings, Shield, Zap } from 'lucide-react'
import { AppSheet } from '~/components/Layout/app-sheet'
import { BuildingsForm } from '~/components/buildings/buildings-form'
import { Badge } from '~/components/ui/badge'
import { RoomForm } from '~/components/rooms/rooms-form'

export default function BuildingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)

  const { data: building, isLoading } = api.building.get.useQuery(
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

  if (!building) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{building.name}</h2>
          <p className="text-muted-foreground">
            {building.type.charAt(0).toUpperCase() + building.type.slice(1)}{' '}
            Facility
          </p>
        </div>
        <AppSheet mode="edit" entity="building">
          <BuildingsForm mode="edit" initialData={building} />
        </AppSheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {building.address?.city ?? 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {building.address?.country ?? 'No location set'}
            </p>
          </CardContent>
        </Card>

        {building.properties?.climate && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Climate Control
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {building.properties.climate.controlType}
              </div>
              <p className="text-xs text-muted-foreground">
                {building.properties.climate.hvacSystem ?? 'Standard HVAC'}
              </p>
            </CardContent>
          </Card>
        )}

        {building.properties?.security && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge
                  variant={
                    building.properties.security.accessControl
                      ? 'default'
                      : 'secondary'
                  }
                >
                  Access Control
                </Badge>
                <Badge
                  variant={
                    building.properties.security.cameraSystem
                      ? 'default'
                      : 'secondary'
                  }
                >
                  Camera System
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {building.properties?.power && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Power System
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {building.properties.power.mainSource}
              </div>
              <p className="text-xs text-muted-foreground">
                {building.properties.power.backup
                  ? 'Backup Available'
                  : 'No Backup'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Type
                    </dt>
                    <dd className="text-sm capitalize">{building.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="text-sm capitalize">{building.status}</dd>
                  </div>
                  {building.licenseNumber && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        License Number
                      </dt>
                      <dd className="text-sm">{building.licenseNumber}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Created
                    </dt>
                    <dd className="text-sm">
                      {formatDate(building.createdAt)} by{' '}
                      {building.createdBy?.name}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {building.address && (
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Street Address
                      </dt>
                      <dd className="text-sm">{building.address.street}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        City, State
                      </dt>
                      <dd className="text-sm">
                        {building.address.city}, {building.address.state}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Country
                      </dt>
                      <dd className="text-sm">{building.address.country}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Postal Code
                      </dt>
                      <dd className="text-sm">{building.address.postalCode}</dd>
                    </div>
                    {building.address.coordinates && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Coordinates
                        </dt>
                        <dd className="text-sm">
                          {building.address.coordinates.latitude},{' '}
                          {building.address.coordinates.longitude}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Building Rooms</CardTitle>
                <AppSheet mode="create" entity="room">
                  <RoomForm
                    mode="create"
                    initialData={{
                      id: '',
                      buildingId: building.id,
                      status: 'active' as const,
                      name: '',
                      type: 'storage' as const,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      createdById: '',
                      properties: null,
                      parent: null,
                      dimensions: null,
                      capacity: 0,
                      parentId: null,
                      children: [],
                      building: building,
                      createdBy: { id: '', name: '', email: '' },
                    }}
                  />
                </AppSheet>
              </div>
              <CardDescription>Rooms within this facility</CardDescription>
            </CardHeader>
            <CardContent>
              {building.rooms && building.rooms.length > 0 ? (
                <div className="space-y-4">
                  {building.rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between rounded border p-4"
                    >
                      <div>
                        <Link
                          href={`/rooms/${room.id}`}
                          className="font-medium hover:underline"
                        >
                          {room.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {room.type}
                        </p>
                      </div>
                      <Badge variant="secondary">{room.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No rooms found in this facility.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              {building.description ? (
                <div className="prose dark:prose-invert">
                  <p>{building.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No additional details available.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
