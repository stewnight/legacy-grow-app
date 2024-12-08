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
  Dna,
  Sprout,
  Timer,
  Ruler,
  Leaf,
  Droplets,
  Scale,
  Microscope,
} from 'lucide-react'
import { AppSheet } from '../../../../components/layout/app-sheet'
import { GeneticForm } from '../../../../components/genetics/genetics-form'
import { Badge } from '../../../../components/ui/badge'

export default function GeneticPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)

  const { data: genetic, isLoading } = api.genetic.get.useQuery(
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

  if (!genetic) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{genetic.name}</h2>
          <p className="text-muted-foreground">
            {genetic.breeder ? (
              <>Bred by {genetic.breeder}</>
            ) : (
              'Unknown breeder'
            )}
          </p>
        </div>
        <AppSheet mode="edit" entity="genetic">
          <GeneticForm mode="edit" defaultValues={genetic} />
        </AppSheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{genetic.type}</div>
            <p className="text-xs text-muted-foreground">
              {genetic.inHouse ? 'In-house strain' : 'External strain'}
            </p>
          </CardContent>
        </Card>

        {genetic.properties?.thc && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">THC Content</CardTitle>
              <Dna className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {genetic.properties.thc.min}% - {genetic.properties.thc.max}%
              </div>
              <p className="text-xs text-muted-foreground">Target range</p>
            </CardContent>
          </Card>
        )}

        {genetic.growProperties?.floweringTime && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Flowering Time
              </CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {genetic.growProperties.floweringTime.min}-
                {genetic.growProperties.floweringTime.max}{' '}
                {genetic.growProperties.floweringTime.unit}
              </div>
              <p className="text-xs text-muted-foreground">Duration range</p>
            </CardContent>
          </Card>
        )}

        {genetic.growProperties?.yield && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yield</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {genetic.growProperties.yield.min}-
                {genetic.growProperties.yield.max}{' '}
                {genetic.growProperties.yield.unit}
              </div>
              <p className="text-xs text-muted-foreground">Expected range</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="lineage">Lineage</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
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
                    <dd className="text-sm capitalize">{genetic.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="text-sm capitalize">{genetic.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Created
                    </dt>
                    <dd className="text-sm">
                      {formatDate(genetic.createdAt)} by{' '}
                      {genetic.createdBy?.name}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {genetic.growProperties && (
              <Card>
                <CardHeader>
                  <CardTitle>Growing Characteristics</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {genetic.growProperties.difficulty && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Difficulty
                        </dt>
                        <dd className="text-sm capitalize">
                          {genetic.growProperties.difficulty}
                        </dd>
                      </div>
                    )}
                    {genetic.growProperties.environment && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Environment
                        </dt>
                        <dd className="text-sm capitalize">
                          {genetic.growProperties.environment}
                        </dd>
                      </div>
                    )}
                    {genetic.growProperties.height && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Height Range
                        </dt>
                        <dd className="text-sm">
                          {genetic.growProperties.height.min}-
                          {genetic.growProperties.height.max}{' '}
                          {genetic.growProperties.height.unit}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="properties">
          <div className="grid gap-4 md:grid-cols-2">
            {genetic.properties && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Chemical Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      {genetic.properties.thc && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">
                            THC Range
                          </dt>
                          <dd className="text-sm">
                            {genetic.properties.thc.min}% -{' '}
                            {genetic.properties.thc.max}%
                          </dd>
                        </div>
                      )}
                      {genetic.properties.cbd && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">
                            CBD Range
                          </dt>
                          <dd className="text-sm">
                            {genetic.properties.cbd.min}% -{' '}
                            {genetic.properties.cbd.max}%
                          </dd>
                        </div>
                      )}
                      {genetic.properties.terpenes && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">
                            Terpenes
                          </dt>
                          <dd className="flex flex-wrap gap-1">
                            {genetic.properties.terpenes.map((terpene) => (
                              <Badge
                                key={terpene.name}
                                variant="secondary"
                                className="text-xs"
                              >
                                {terpene.name}
                                {terpene.percentage &&
                                  ` ${terpene.percentage}%`}
                              </Badge>
                            ))}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Characteristics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      {genetic.properties.effects && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">
                            Effects
                          </dt>
                          <dd className="flex flex-wrap gap-1">
                            {genetic.properties.effects.map((effect) => (
                              <Badge
                                key={effect}
                                variant="secondary"
                                className="text-xs"
                              >
                                {effect}
                              </Badge>
                            ))}
                          </dd>
                        </div>
                      )}
                      {genetic.properties.flavors && (
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">
                            Flavors
                          </dt>
                          <dd className="flex flex-wrap gap-1">
                            {genetic.properties.flavors.map((flavor) => (
                              <Badge
                                key={flavor}
                                variant="secondary"
                                className="text-xs"
                              >
                                {flavor}
                              </Badge>
                            ))}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="lineage">
          <Card>
            <CardHeader>
              <CardTitle>Genetic Lineage</CardTitle>
            </CardHeader>
            <CardContent>
              {genetic.lineage ? (
                <dl className="space-y-2">
                  {genetic.lineage.mother && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Mother
                      </dt>
                      <dd className="text-sm">{genetic.lineage.mother}</dd>
                    </div>
                  )}
                  {genetic.lineage.father && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Father
                      </dt>
                      <dd className="text-sm">{genetic.lineage.father}</dd>
                    </div>
                  )}
                  {genetic.lineage.generation && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Generation
                      </dt>
                      <dd className="text-sm">F{genetic.lineage.generation}</dd>
                    </div>
                  )}
                  {genetic.lineage.hybridRatio && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Hybrid Ratio
                      </dt>
                      <dd className="text-sm">{genetic.lineage.hybridRatio}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-muted-foreground">
                  No lineage information available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches">
          <Card>
            <CardHeader>
              <CardTitle>Related Batches</CardTitle>
              <CardDescription>Batches using this genetic</CardDescription>
            </CardHeader>
            <CardContent>
              {genetic.batches && genetic.batches.length > 0 ? (
                <div className="space-y-4">
                  {genetic.batches.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between rounded border p-4"
                    >
                      <div>
                        <Link
                          href={`/batches/${batch.id}`}
                          className="font-medium hover:underline"
                        >
                          {batch.identifier}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Started: {formatDate(batch.startDate)}
                        </p>
                      </div>
                      <Badge variant="secondary">{batch.batchStatus}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No batches found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
