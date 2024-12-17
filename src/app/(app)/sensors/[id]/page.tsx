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
  CardFooter,
} from '~/components/ui/card'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import Link from 'next/link'
import {
  CalendarDays,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Wifi,
  Ruler,
  Activity,
  Timer,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Factory,
  PencilIcon,
  Trash2,
  ArrowLeft,
  Link as LinkIcon,
  Cpu,
  BarChart,
} from 'lucide-react'
import { AppSheet } from '~/components/layout/app-sheet'
import { SensorForm } from '~/components/sensors/sensors-form'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { NoteForm } from '../../../../components/notes/notes-form'
import {
  NoteWithRelations,
  SensorWithRelations,
} from '../../../../server/db/schema'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SensorPage({ params }: PageProps) {
  const resolvedParams = React.use(params)

  const { data: sensor, isLoading } = api.sensor.get.useQuery(
    resolvedParams.id,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  const utils = api.useUtils()
  const { mutate: deleteSensor } = api.sensor.delete.useMutation({
    onSuccess: () => {
      window.location.href = '/sensors'
    },
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="h-5 w-5" />
      case 'humidity':
        return <Droplets className="h-5 w-5" />
      case 'airflow':
        return <Wind className="h-5 w-5" />
      case 'pressure':
        return <Gauge className="h-5 w-5" />
      case 'network':
        return <Wifi className="h-5 w-5" />
      case 'distance':
        return <Ruler className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    )
  }

  if (!sensor) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/sensors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">
              {sensor.id.slice(0, 8)}
            </h2>
          </div>
          <p className="text-muted-foreground">
            {sensor.manufacturer} {sensor.model}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <AppSheet
            mode="edit"
            entity="sensor"
            trigger={
              <Button variant="outline" size="icon">
                <PencilIcon className="h-4 w-4" />
              </Button>
            }
          >
            <SensorForm
              mode="edit"
              initialData={sensor as SensorWithRelations}
            />
          </AppSheet>
          <Button
            variant="outline"
            size="icon"
            onClick={() => deleteSensor(sensor.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
            {getTypeIcon(sensor.type)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{sensor.type}</div>
            <p className="text-xs text-muted-foreground">Sensor type</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {sensor.status === 'active' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : sensor.status === 'inactive' ? (
              <XCircle className="h-4 w-4 text-gray-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{sensor.status}</div>
            <p className="text-xs text-muted-foreground">Current status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manufacturer</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sensor.manufacturer}</div>
            <p className="text-xs text-muted-foreground">{sensor.model}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calibration</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sensor.nextCalibration
                ? format(sensor.nextCalibration, 'PP')
                : 'Not Set'}
            </div>
            <p className="text-xs text-muted-foreground">
              Next calibration due
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="readings">Readings</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="details">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Sensor details and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Serial Number
                  </span>
                  <span className="font-medium">{sensor.serialNumber}</span>
                </div>
                {sensor.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Location
                    </span>
                    <Link
                      href={`/locations/${sensor.location.id}`}
                      className="flex items-center gap-1 font-medium hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {sensor.location?.name ?? ''}
                    </Link>
                  </div>
                )}
                {sensor.equipment && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Equipment
                    </span>
                    <Link
                      href={`/equipment/${sensor.equipment.id}`}
                      className="flex items-center gap-1 font-medium hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {sensor.equipment?.name ?? ''}
                    </Link>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last Calibration
                  </span>
                  <span className="font-medium">
                    {sensor.lastCalibration
                      ? format(sensor.lastCalibration, 'PPp')
                      : 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Calibration Interval
                  </span>
                  <span className="font-medium">
                    {sensor.calibrationInterval
                      ? `${sensor.calibrationInterval} days`
                      : 'Not set'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Additional information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {sensor.notes && sensor.notes.length > 0
                    ? sensor.notes.map((note) => note.content).join('\n')
                    : 'No notes available'}
                </p>
              </CardContent>
              <CardFooter>
                <AppSheet mode="create" entity="note">
                  <NoteForm
                    mode="create"
                    initialData={
                      {
                        entityType: 'sensor',
                        entityId: sensor.id,
                      } as NoteWithRelations
                    }
                  />
                </AppSheet>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specifications">
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
              <CardDescription>
                Detailed sensor specifications and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sensor.specifications ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 font-medium">Range</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Minimum</span>
                          <span>
                            {sensor.specifications.range.min}{' '}
                            {sensor.specifications.range.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maximum</span>
                          <span>
                            {sensor.specifications.range.max}{' '}
                            {sensor.specifications.range.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium">Accuracy</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Value</span>
                          <span>
                            ±{sensor.specifications.accuracy.value}{' '}
                            {sensor.specifications.accuracy.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 font-medium">Resolution</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Value</span>
                          <span>
                            {sensor.specifications.resolution.value}{' '}
                            {sensor.specifications.resolution.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                    {sensor.specifications.responseTime && (
                      <div>
                        <h4 className="mb-2 font-medium">Response Time</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Value</span>
                            <span>
                              {sensor.specifications.responseTime.value}{' '}
                              {sensor.specifications.responseTime.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {sensor.specifications.powerRequirements && (
                    <div>
                      <h4 className="mb-2 font-medium">Power Requirements</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Voltage</span>
                          <span>
                            {sensor.specifications.powerRequirements.voltage}V
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current</span>
                          <span>
                            {sensor.specifications.powerRequirements.current}A
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type</span>
                          <span>
                            {sensor.specifications.powerRequirements.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No specifications available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readings">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Readings</CardTitle>
              <CardDescription>Recent measurements and data</CardDescription>
            </CardHeader>
            <CardContent>
              {sensor.readings && sensor.readings.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Latest Reading</span>
                    <span className="text-sm text-muted-foreground">
                      {format(
                        sensor.readings[0]?.timestamp ?? new Date(),
                        'PPp'
                      )}
                    </span>
                  </div>
                  <div className="h-[200px] w-full">
                    <BarChart className="h-full w-full text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No readings available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>
                Calibration and maintenance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sensor.metadata?.maintenance &&
              sensor.metadata.maintenance.length > 0 ? (
                <div className="space-y-4">
                  {sensor.metadata.maintenance.map((record, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between border-b pb-4 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{record.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          By {record.performedBy}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(record.date), 'PPp')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No maintenance records available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
