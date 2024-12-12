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
import { Calendar, Users, Sprout, Timer } from 'lucide-react'
import { AppSheet } from '~/components/Layout/app-sheet'
import { BatchForm } from '~/components/batches/batches-form'
import JobsTab from '~/components/jobs/tab'

export default function BatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)

  const { data: batch, isLoading } = api.batch.get.useQuery(resolvedParams.id, {
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

  if (!batch) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {batch.identifier}
          </h2>
          <p className="text-muted-foreground">
            {batch.genetic ? (
              <>
                Strain:{' '}
                <Link
                  href={`/genetics/${batch.genetic.id}`}
                  className="hover:underline"
                >
                  {batch.genetic.name}
                </Link>
              </>
            ) : (
              'No genetic assigned'
            )}
          </p>
        </div>
        <AppSheet mode="edit" entity="batch">
          <BatchForm mode="edit" initialData={batch} />
        </AppSheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stage</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{batch.stage}</div>
            <p className="text-xs text-muted-foreground">
              Current growth stage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plant Count</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batch.plantCount}</div>
            <p className="text-xs text-muted-foreground">Total plants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Start Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(batch.startDate)}
            </div>
            <p className="text-xs text-muted-foreground">Batch started</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {batch.batchStatus}
            </div>
            <p className="text-xs text-muted-foreground">Current status</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="plants">Plants</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
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
                      Location
                    </dt>
                    <dd className="text-sm">
                      {batch.location ? (
                        <Link
                          href={`/locations/${batch.location.id}`}
                          className="hover:underline"
                        >
                          {batch.location.name}
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Stage
                    </dt>
                    <dd className="text-sm capitalize">{batch.stage}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="text-sm capitalize">{batch.batchStatus}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Created
                    </dt>
                    <dd className="text-sm">
                      {formatDate(batch.createdAt)} by {batch.createdBy?.name}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {batch.properties && (
              <Card>
                <CardHeader>
                  <CardTitle>Growing Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {batch.properties.source && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Source
                        </dt>
                        <dd className="text-sm capitalize">
                          {batch.properties.source}
                        </dd>
                      </div>
                    )}
                    {batch.properties.medium && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Growing Medium
                        </dt>
                        <dd className="text-sm capitalize">
                          {batch.properties.medium}
                        </dd>
                      </div>
                    )}
                    {batch.properties.container && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Container
                        </dt>
                        <dd className="text-sm capitalize">
                          {batch.properties.container}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="environment">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {batch.properties?.environment ? (
                <dl className="space-y-2">
                  {batch.properties.environment.temperature && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Temperature Range
                      </dt>
                      <dd className="text-sm">
                        {batch.properties.environment.temperature.min}° -{' '}
                        {batch.properties.environment.temperature.max}°
                      </dd>
                    </div>
                  )}
                  {batch.properties.environment.humidity && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Humidity Range
                      </dt>
                      <dd className="text-sm">
                        {batch.properties.environment.humidity.min}% -{' '}
                        {batch.properties.environment.humidity.max}%
                      </dd>
                    </div>
                  )}
                  {batch.properties.environment.light && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Light Schedule
                      </dt>
                      <dd className="text-sm">
                        {batch.properties.environment.light.hours} hours
                        {batch.properties.environment.light.intensity &&
                          ` @ ${batch.properties.environment.light.intensity}% intensity`}
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-muted-foreground">
                  No environmental settings configured
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plants">
          <Card>
            <CardHeader>
              <CardTitle>Plants</CardTitle>
              <CardDescription>Plants in this batch</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Plant list implementation here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <JobsTab entityId={batch.id} entityType="batch" />
      </Tabs>
    </div>
  )
}
