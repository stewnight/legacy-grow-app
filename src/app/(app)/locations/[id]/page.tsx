'use client';

import * as React from 'react';
import { api } from '~/trpc/react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Skeleton } from '~/components/ui/skeleton';
import Link from 'next/link';
import { MapPin, Thermometer, Droplets, Ruler, Users } from 'lucide-react';
import { AppSheet } from '../../../../components/layout/app-sheet';
import { LocationForm } from '../_components/locations-form';
import { Badge } from '../../../../components/ui/badge';
import JobsTab from '../../../../components/jobs/tab';

export default function LocationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);

  const { data: location, isLoading } = api.location.get.useQuery(resolvedParams.id, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    return format(new Date(date), 'PP');
  };

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
    );
  }

  if (!location) {
    return notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{location.name}</h2>
          <p className="text-muted-foreground">
            {location.room?.name ? (
              <>
                In{' '}
                <Link href={`/rooms/${location.room.id}`} className="hover:underline">
                  {location.room.name}
                </Link>
              </>
            ) : (
              'No room assigned'
            )}
          </p>
        </div>
        <AppSheet mode="edit" entity="location">
          <LocationForm mode="edit" defaultValues={location} />
        </AppSheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{location.capacity}</div>
            <p className="text-xs text-muted-foreground">Maximum capacity</p>
          </CardContent>
        </Card>

        {location.dimensions && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dimensions</CardTitle>
              <Ruler className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {location.dimensions.length} x {location.dimensions.width}
                {location.dimensions.height ? ` x ${location.dimensions.height}` : ''}{' '}
                {location.dimensions.unit}
              </div>
              <p className="text-xs text-muted-foreground">L x W x H</p>
            </CardContent>
          </Card>
        )}

        {location.properties?.temperature && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {location.properties.temperature.min}°C - {location.properties.temperature.max}°C
              </div>
              <p className="text-xs text-muted-foreground">Target range</p>
            </CardContent>
          </Card>
        )}

        {location.properties?.humidity && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Humidity</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {location.properties.humidity.min}% - {location.properties.humidity.max}%
              </div>
              <p className="text-xs text-muted-foreground">Target range</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
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
                    <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                    <dd className="text-sm capitalize">{location.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="text-sm capitalize">{location.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                    <dd className="text-sm">
                      {formatDate(location.createdAt)} by {location.createdBy?.name}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {location.dimensions && (
              <Card>
                <CardHeader>
                  <CardTitle>Physical Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Dimensions</dt>
                      <dd className="text-sm">
                        {location.dimensions.length} x {location.dimensions.width}
                        {location.dimensions.height ? ` x ${location.dimensions.height}` : ''}{' '}
                        {location.dimensions.unit}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Capacity</dt>
                      <dd className="text-sm">{location.capacity} units</dd>
                    </div>
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
              {location.properties ? (
                <dl className="space-y-2">
                  {location.properties.temperature && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Temperature Range
                      </dt>
                      <dd className="text-sm">
                        {location.properties.temperature.min}°C -{' '}
                        {location.properties.temperature.max}°C
                      </dd>
                    </div>
                  )}
                  {location.properties.humidity && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Humidity Range</dt>
                      <dd className="text-sm">
                        {location.properties.humidity.min}% - {location.properties.humidity.max}%
                      </dd>
                    </div>
                  )}
                  {location.properties.light && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Lighting</dt>
                      <dd className="text-sm">
                        {location.properties.light.type} - {location.properties.light.intensity}%
                        intensity
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-muted-foreground">No environmental settings configured.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle>Sensors</CardTitle>
              <CardDescription>Monitoring devices in this location</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Sensor list implementation here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <JobsTab entityId={location.id} entityType="location" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
