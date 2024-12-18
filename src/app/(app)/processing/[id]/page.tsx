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
  ArrowLeft,
  PencilIcon,
  Trash2,
  Link as LinkIcon,
  Scale,
  Percent,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Beaker,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Users,
  ClipboardCheck,
  Receipt,
} from 'lucide-react'
import { AppSheet } from '~/components/layout/app-sheet'
import { ProcessingForm } from '~/components/processing/processing-form'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { NoteForm } from '~/components/notes/notes-form'
import {
  type NoteWithRelations,
  type ProcessingWithRelations,
} from '~/server/db/schema'
import { useToast } from '~/hooks/use-toast'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProcessingPage({ params }: PageProps) {
  const resolvedParams = React.use(params)
  const { toast } = useToast()
  const utils = api.useUtils()

  const { data: process, isLoading } = api.processing.get.useQuery(
    resolvedParams.id,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  ) as { data: ProcessingWithRelations; isLoading: boolean }

  const { mutate: deleteProcessing } = api.processing.delete.useMutation({
    onSuccess: async () => {
      toast({
        title: 'Processing deleted successfully',
      })
      await utils.processing.invalidate()
      window.location.href = '/processing'
    },
    onError: (error) => {
      toast({
        title: 'Error deleting processing',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

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

  if (!process) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/processing">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">
              {process.id?.slice(0, 8)}
            </h2>
          </div>
          <p className="text-muted-foreground">
            {process.type} - {process.method}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <AppSheet
            mode="edit"
            entity="processing"
            trigger={
              <Button variant="outline" size="icon">
                <PencilIcon className="h-4 w-4" />
              </Button>
            }
          >
            <ProcessingForm mode="edit" />
          </AppSheet>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you want to delete this processing record?'
                )
              ) {
                deleteProcessing(process.id)
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {process.status === 'completed' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : process.status === 'in_progress' ? (
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {process.status}
            </div>
            <p className="text-xs text-muted-foreground">Current status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yield</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {process.yieldPercentage?.toString() ?? 'N/A'}%
            </div>
            <p className="text-xs text-muted-foreground">Process yield</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {process.inputWeight.toString()}g →{' '}
              {process.outputWeight?.toString() ?? 'N/A'}g
            </div>
            <p className="text-xs text-muted-foreground">
              Input to output weight
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {process.estimatedDuration?.toString() ?? 'N/A'} hours
            </div>
            <p className="text-xs text-muted-foreground">Estimated duration</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="details">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Process details and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline">{process.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Method</span>
                  <span className="font-medium">{process.method}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Started At
                  </span>
                  <span className="font-medium">
                    {process.startedAt
                      ? format(process.startedAt, 'PPp')
                      : 'Not started'}
                  </span>
                </div>
                {process.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Completed At
                    </span>
                    <span className="font-medium">
                      {format(process.completedAt, 'PPp')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Items</CardTitle>
                <CardDescription>Connected records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {process.harvestId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Harvest
                    </span>
                    <Link
                      href={`/harvests/${process.harvestId}`}
                      className="flex items-center gap-1 font-medium hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" />
                      View Harvest
                    </Link>
                  </div>
                )}
                {process.batchId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Batch</span>
                    <Link
                      href={`/batches/${process.batchId}`}
                      className="flex items-center gap-1 font-medium hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" />
                      View Batch
                    </Link>
                  </div>
                )}
                {process.locationId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Location
                    </span>
                    <Link
                      href={`/locations/${process.locationId}`}
                      className="flex items-center gap-1 font-medium hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" />
                      View Location
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environment">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Conditions</CardTitle>
              <CardDescription>Process environment data</CardDescription>
            </CardHeader>
            <CardContent>
              {process.properties?.environment ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {process.properties.environment.temperature && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                          Temperature
                        </span>
                      </div>
                      <span className="font-medium">
                        {process.properties.environment.temperature}°C
                      </span>
                    </div>
                  )}
                  {process.properties.environment.humidity && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                          Humidity
                        </span>
                      </div>
                      <span className="font-medium">
                        {process.properties.environment.humidity}%
                      </span>
                    </div>
                  )}
                  {process.properties.environment.pressure && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                          Pressure
                        </span>
                      </div>
                      <span className="font-medium">
                        {process.properties.environment.pressure} hPa
                      </span>
                    </div>
                  )}
                  {process.properties.environment.airflow && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                          Airflow
                        </span>
                      </div>
                      <span className="font-medium">
                        {process.properties.environment.airflow} m/s
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No environmental data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Used</CardTitle>
              <CardDescription>Process equipment and settings</CardDescription>
            </CardHeader>
            <CardContent>
              {process.properties?.equipment &&
              process.properties.equipment.length > 0 ? (
                <div className="space-y-4">
                  {process.properties.equipment.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.id}</p>
                        {item.settings && (
                          <p className="text-sm text-muted-foreground">
                            {Object.entries(item.settings)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No equipment data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Additional information and comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {process.notes && process.notes.length > 0 ? (
                <div className="space-y-4">
                  {process.notes.map((note) => (
                    <div key={note.id} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{note.title}</h4>
                        <Badge variant="outline">{note.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {note.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(note.createdAt, 'PPp')}</span>
                        <span>•</span>
                        <span>{note.createdById}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No notes available
                </p>
              )}
            </CardContent>
            <CardFooter>
              <AppSheet mode="create" entity="note">
                <NoteForm
                  mode="create"
                  initialData={
                    {
                      entityType: 'processing',
                      entityId: process.id,
                    } as NoteWithRelations
                  }
                />
              </AppSheet>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
