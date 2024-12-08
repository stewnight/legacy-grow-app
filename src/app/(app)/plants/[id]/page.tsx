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
  Leaf,
  Calendar,
  Activity,
  Ruler,
  Sprout,
  Timer,
  MapPin,
  Box,
} from 'lucide-react'
import { AppSheet } from '../../../../components/layout/app-sheet'
import { PlantForm } from '../../../../components/plants/plants-form'
import { Badge } from '../../../../components/ui/badge'
import JobsTab from '../../../../components/jobs/tab'

export default function PlantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)

  const { data: plant, isLoading } = api.plant.get.useQuery(resolvedParams.id, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

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

  if (!plant) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {plant.identifier}
          </h2>
          <p className="text-muted-foreground">
            {plant.genetic ? (
              <>
                Strain:{' '}
                <Link
                  href={`/genetics/${plant.genetic.id}`}
                  className="hover:underline"
                >
                  {plant.genetic.name}
                </Link>
              </>
            ) : (
              'No genetic assigned'
            )}
          </p>
        </div>
        <AppSheet mode="edit" entity="plant">
          <PlantForm mode="edit" defaultValues={plant} />
        </AppSheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stage</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{plant.stage}</div>
            <p className="text-xs text-muted-foreground">
              Current growth stage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{plant.health}</div>
            <p className="text-xs text-muted-foreground">
              Current health status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Age</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(plant.plantedDate)}
            </div>
            <p className="text-xs text-muted-foreground">Planted date</p>
          </CardContent>
        </Card>

        {plant.properties?.height && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Height</CardTitle>
              <Ruler className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plant.properties.height} cm
              </div>
              <p className="text-xs text-muted-foreground">Current height</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
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
                      Location
                    </dt>
                    <dd className="text-sm">
                      {plant.location ? (
                        <Link
                          href={`/locations/${plant.location.id}`}
                          className="hover:underline"
                        >
                          {plant.location.name}
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Batch
                    </dt>
                    <dd className="text-sm">
                      {plant.batch ? (
                        <Link
                          href={`/batches/${plant.batch.id}`}
                          className="hover:underline"
                        >
                          {plant.batch.identifier}
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Source
                    </dt>
                    <dd className="text-sm capitalize">{plant.source}</dd>
                  </div>
                  {plant.source === 'clone' && plant.mother && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Mother Plant
                      </dt>
                      <dd className="text-sm">
                        <Link
                          href={`/plants/${plant.mother.id}`}
                          className="hover:underline"
                        >
                          {plant.mother.identifier}
                        </Link>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Sex
                    </dt>
                    <dd className="text-sm capitalize">{plant.sex}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {plant.properties && (
              <Card>
                <CardHeader>
                  <CardTitle>Growing Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {plant.properties.feeding && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Feeding Schedule
                        </dt>
                        <dd className="text-sm capitalize">
                          {plant.properties.feeding.schedule}
                        </dd>
                      </div>
                    )}
                    {plant.properties.training && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Training Method
                        </dt>
                        <dd className="text-sm capitalize">
                          {plant.properties.training.method}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              {plant.notes ? (
                <div className="prose dark:prose-invert">
                  <p>{plant.notes}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No additional notes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <JobsTab entityId={plant.id} entityType="plant" />
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes History</CardTitle>
              <CardDescription>Notes and observations</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Notes list implementation here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
