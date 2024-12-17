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
import { type NoteWithRelations } from '~/server/db/schema'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProcessingPage({ params }: PageProps) {
  const resolvedParams = React.use(params)

  const { data: process, isLoading } = api.processing.get.useQuery(
    resolvedParams.id,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  const utils = api.useUtils()
  const { mutate: deleteProcessing } = api.processing.delete.useMutation({
    onSuccess: () => {
      window.location.href = '/processing'
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
              {process.identifier}
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
            <ProcessingForm mode="edit" initialData={process} />
          </AppSheet>
          <Button
            variant="outline"
            size="icon"
            onClick={() => deleteProcessing(process.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {process.processStatus === 'active' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : process.processStatus === 'completed' ? (
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {process.processStatus}
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
              {process.duration?.toString() ?? 'N/A'} hours
            </div>
            <p className="text-xs text-muted-foreground">Process duration</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>
        </ScrollArea>

        <TabsContent value="details">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Process details</CardDescription>
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
                    {format(process.startedAt, 'PPp')}
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
                {process.quality && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Quality
                    </span>
                    <Badge>{process.quality}</Badge>
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Harvest</span>
                  <Link
                    href={`/harvests/${process.harvestId}`}
                    className="flex items-center gap-1 font-medium hover:underline"
                  >
                    <LinkIcon className="h-3 w-3" />
                    View Harvest
                  </Link>
                </div>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environment">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Conditions</CardTitle>
                <CardDescription>Process environment</CardDescription>
              </CardHeader>
              <CardContent>
                {process.properties?.environment ? (
                  <div className="space-y-4">
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

            <Card>
              <CardHeader>
                <CardTitle>Equipment Used</CardTitle>
                <CardDescription>Process equipment</CardDescription>
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
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.type}
                          </p>
                        </div>
                        {item.settings && (
                          <Badge variant="outline">
                            {Object.keys(item.settings).length} settings
                          </Badge>
                        )}
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
          </div>
        </TabsContent>

        <TabsContent value="lab-results">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Potency Analysis</CardTitle>
                <CardDescription>Lab test results</CardDescription>
              </CardHeader>
              <CardContent>
                {process.labResults?.potency ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">THC</span>
                      <span className="font-medium">
                        {process.labResults.potency.thc}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">CBD</span>
                      <span className="font-medium">
                        {process.labResults.potency.cbd}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Cannabinoids
                      </span>
                      <span className="font-medium">
                        {process.labResults.potency.totalCannabinoids}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No potency data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Control</CardTitle>
                <CardDescription>Contaminant testing</CardDescription>
              </CardHeader>
              <CardContent>
                {process.labResults?.contaminants ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Microbial
                      </span>
                      {process.labResults.contaminants.microbial ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Heavy Metals
                      </span>
                      {process.labResults.contaminants.metals ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Pesticides
                      </span>
                      {process.labResults.contaminants.pesticides ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {process.labResults.contaminants.solvents !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Residual Solvents
                        </span>
                        {process.labResults.contaminants.solvents ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No contaminant data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Operators</CardTitle>
                <CardDescription>Staff involved</CardDescription>
              </CardHeader>
              <CardContent>
                {process.metadata?.operators &&
                process.metadata.operators.length > 0 ? (
                  <div className="space-y-4">
                    {process.metadata.operators.map((operator, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{operator.role}</p>
                            <p className="text-sm text-muted-foreground">
                              {operator.hours} hours
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No operator data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Checks</CardTitle>
                <CardDescription>Process verification</CardDescription>
              </CardHeader>
              <CardContent>
                {process.metadata?.qualityChecks &&
                process.metadata.qualityChecks.length > 0 ? (
                  <div className="space-y-4">
                    {process.metadata.qualityChecks.map((check, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{check.parameter}</p>
                            <p className="text-sm text-muted-foreground">
                              by {check.operator}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm">
                          {format(new Date(check.timestamp), 'PP')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No quality check data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Process expenses</CardDescription>
              </CardHeader>
              <CardContent>
                {process.metadata?.costs ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Labor
                      </span>
                      <span className="font-medium">
                        ${process.metadata.costs.labor}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Materials
                      </span>
                      <span className="font-medium">
                        ${process.metadata.costs.materials}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Energy
                      </span>
                      <span className="font-medium">
                        ${process.metadata.costs.energy}
                      </span>
                    </div>
                    {process.metadata.costs.other && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Other
                        </span>
                        <span className="font-medium">
                          ${process.metadata.costs.other}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">
                          $
                          {process.metadata.costs.labor +
                            process.metadata.costs.materials +
                            process.metadata.costs.energy +
                            (process.metadata.costs.other ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No cost data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Additional information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {process.notes || 'No notes available'}
                </p>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
