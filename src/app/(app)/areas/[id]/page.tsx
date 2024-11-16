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
import {
  MapPin,
  Box,
  Thermometer,
  Droplets,
  Lightbulb,
  Wind,
} from 'lucide-react'
import { AppSheet } from '../../../../components/layout/app-sheet'
import { AreaForm } from '../_components/areas-form'
import { Badge } from '../../../../components/ui/badge'

export default function AreaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)

  const { data: area, isLoading } = api.area.get.useQuery(resolvedParams.id, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A'
    return format(new Date(date), 'PP')
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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

  if (!area) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{area.name}</h2>
          <p className="text-muted-foreground">
            {area.facility?.name
              ? `In ${area.facility.name}`
              : 'No facility assigned'}
          </p>
        </div>
        <AppSheet mode="edit" entity="area">
          <AreaForm mode="edit" defaultValues={area} />
        </AppSheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{area.capacity ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total capacity</p>
          </CardContent>
        </Card>

        {area.properties?.temperature && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Temperature Range
              </CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {area.properties.temperature.min}° -{' '}
                {area.properties.temperature.max}°
              </div>
              <p className="text-xs text-muted-foreground">Target range</p>
            </CardContent>
          </Card>
        )}

        {area.properties?.humidity && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Humidity Range
              </CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {area.properties.humidity.min}% - {area.properties.humidity.max}
                %
              </div>
              <p className="text-xs text-muted-foreground">Target range</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="children">Child Areas</TabsTrigger>
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
                    <dd className="text-sm capitalize">{area.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="text-sm capitalize">{area.status}</dd>
                  </div>
                  {area.dimensions && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Dimensions
                      </dt>
                      <dd className="text-sm">
                        {area.dimensions.length} x {area.dimensions.width}
                        {area.dimensions.height
                          ? ` x ${area.dimensions.height}`
                          : ''}{' '}
                        {area.dimensions.unit}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Created
                    </dt>
                    <dd className="text-sm">
                      {formatDate(area.createdAt)} by {area.createdBy?.name}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {area.properties && (
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {area.properties.light && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Lighting
                        </dt>
                        <dd className="text-sm">
                          {area.properties.light.type} -{' '}
                          {area.properties.light.intensity}%
                        </dd>
                      </div>
                    )}
                    {area.properties.co2 && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          CO2 Range
                        </dt>
                        <dd className="text-sm">
                          {area.properties.co2.min} - {area.properties.co2.max}{' '}
                          ppm
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
              <CardTitle>Child Areas</CardTitle>
              <CardDescription>
                Areas contained within this area
              </CardDescription>
            </CardHeader>
            <CardContent>
              {area.children && area.children.length > 0 ? (
                <div className="space-y-4">
                  {area.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between border rounded p-4"
                    >
                      <div>
                        <Link
                          href={`/areas/${child.id}`}
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
                <p>No child areas found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle>Sensors</CardTitle>
              <CardDescription>Monitoring devices in this area</CardDescription>
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
