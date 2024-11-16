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
import { Building2, MapPin, Users, Settings, Shield, Zap } from 'lucide-react'
import { AppSheet } from '../../../../components/layout/app-sheet'
import { FacilitiesForm } from '../_components/facilities-form'
import { Badge } from '../../../../components/ui/badge'
import { AreaForm } from '../../areas/_components/areas-form'

export default function FacilityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)

  const { data: facility, isLoading } = api.facility.get.useQuery(
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!facility) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{facility.name}</h2>
          <p className="text-muted-foreground">
            {facility.type.charAt(0).toUpperCase() + facility.type.slice(1)}{' '}
            Facility
          </p>
        </div>
        <AppSheet mode="edit" entity="facility">
          <FacilitiesForm mode="edit" defaultValues={facility} />
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
              {facility.address?.city || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {facility.address?.country || 'No location set'}
            </p>
          </CardContent>
        </Card>

        {facility.properties?.climate && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Climate Control
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {facility.properties.climate.controlType}
              </div>
              <p className="text-xs text-muted-foreground">
                {facility.properties.climate.hvacSystem || 'Standard HVAC'}
              </p>
            </CardContent>
          </Card>
        )}

        {facility.properties?.security && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge
                  variant={
                    facility.properties.security.accessControl
                      ? 'default'
                      : 'secondary'
                  }
                >
                  Access Control
                </Badge>
                <Badge
                  variant={
                    facility.properties.security.cameraSystem
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

        {facility.properties?.power && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Power System
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {facility.properties.power.mainSource}
              </div>
              <p className="text-xs text-muted-foreground">
                {facility.properties.power.backup
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
          <TabsTrigger value="areas">Areas</TabsTrigger>
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
                    <dd className="text-sm capitalize">{facility.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="text-sm capitalize">{facility.status}</dd>
                  </div>
                  {facility.licenseNumber && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        License Number
                      </dt>
                      <dd className="text-sm">{facility.licenseNumber}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Created
                    </dt>
                    <dd className="text-sm">
                      {formatDate(facility.createdAt)} by{' '}
                      {facility.createdBy?.name}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {facility.address && (
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
                      <dd className="text-sm">{facility.address.street}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        City, State
                      </dt>
                      <dd className="text-sm">
                        {facility.address.city}, {facility.address.state}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Country
                      </dt>
                      <dd className="text-sm">{facility.address.country}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Postal Code
                      </dt>
                      <dd className="text-sm">{facility.address.postalCode}</dd>
                    </div>
                    {facility.address.coordinates && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Coordinates
                        </dt>
                        <dd className="text-sm">
                          {facility.address.coordinates.latitude},{' '}
                          {facility.address.coordinates.longitude}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="areas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Facility Areas</CardTitle>
                <AppSheet mode="create" entity="area">
                  <AreaForm
                    mode="create"
                    defaultValues={{
                      id: '',
                      facilityId: facility.id,
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
                      facility: facility,
                      createdBy: { id: '', name: '', email: '' },
                    }}
                  />
                </AppSheet>
              </div>
              <CardDescription>Areas within this facility</CardDescription>
            </CardHeader>
            <CardContent>
              {facility.areas && facility.areas.length > 0 ? (
                <div className="space-y-4">
                  {facility.areas.map((area) => (
                    <div
                      key={area.id}
                      className="flex items-center justify-between border rounded p-4"
                    >
                      <div>
                        <Link
                          href={`/areas/${area.id}`}
                          className="font-medium hover:underline"
                        >
                          {area.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {area.type}
                        </p>
                      </div>
                      <Badge variant="secondary">{area.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No areas found in this facility.</p>
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
              {facility.description ? (
                <div className="prose dark:prose-invert">
                  <p>{facility.description}</p>
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
