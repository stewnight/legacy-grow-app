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
import { Timeline } from '~/components/notes/timeline'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { GeneticActions } from '../_components/genetic-actions'
import { Skeleton } from '~/components/ui/skeleton'
import { type RouterOutputs } from '~/trpc/shared'
import Link from 'next/link'
import { Leaf as PlantIcon, Dna, Sprout, LineChart } from 'lucide-react'
import { type Plant, type Batch } from '~/server/db/schemas'
import { type Genetic } from '~/server/db/schemas'
import { type GeneticWithRelations } from '~/lib/validations/genetic'

export default function GeneticPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = React.use(params)
  const utils = api.useUtils()

  const { data: genetic, isLoading } = api.genetic.getBySlug.useQuery(
    resolvedParams.slug,
    {
      staleTime: 5 * 60 * 1000,
      networkMode: 'offlineFirst',
    }
  )

  const updateGenetic = api.genetic.update.useMutation({
    onMutate: async (newData) => {
      await utils.genetic.getBySlug.cancel(resolvedParams.slug)
      const previousGenetic = utils.genetic.getBySlug.getData(
        resolvedParams.slug
      )

      utils.genetic.getBySlug.setData(resolvedParams.slug, (old) => {
        if (!old) return old
        return {
          ...old,
          ...newData.data,
          thcPotential:
            newData.data.thcPotential?.toString() ?? old.thcPotential,
          cbdPotential:
            newData.data.cbdPotential?.toString() ?? old.cbdPotential,
          terpeneProfile: newData.data.terpeneProfile
            ? Object.fromEntries(
                Object.entries(newData.data.terpeneProfile).map(([k, v]) => [
                  k,
                  Number(v),
                ])
              )
            : old.terpeneProfile,
          updatedAt: new Date(),
        }
      })

      return { previousGenetic }
    },
    onError: (err, newData, context) => {
      utils.genetic.getBySlug.setData(
        resolvedParams.slug,
        context?.previousGenetic
      )
    },
    onSettled: () => {
      void utils.genetic.getBySlug.invalidate(resolvedParams.slug)
    },
  })

  const formatDate = (date: Date | string | null) => {
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{genetic.name}</h2>
          <p className="text-muted-foreground">
            {genetic.breeder ? `By ${genetic.breeder}` : 'Unknown breeder'}
          </p>
        </div>
        <GeneticActions genetic={genetic} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plants</CardTitle>
            <PlantIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {genetic._count?.plants ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently growing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Batches
            </CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {genetic._count?.batches ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">In production</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potency</CardTitle>
            <Dna className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {genetic.thcPotential ? `${genetic.thcPotential}% THC` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {genetic.cbdPotential
                ? `${genetic.cbdPotential}% CBD`
                : 'No CBD data'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Flowering Time
            </CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {genetic.floweringTime ? `${genetic.floweringTime} weeks` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average time to harvest
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plants">Plants</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="notes">Notes & Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
                  {genetic.breeder && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Breeder
                      </dt>
                      <dd className="text-sm">{genetic.breeder}</dd>
                    </div>
                  )}
                  {genetic.description && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Description
                      </dt>
                      <dd className="text-sm">{genetic.description}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {genetic.growthCharacteristics && (
              <Card>
                <CardHeader>
                  <CardTitle>Growth Characteristics</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {genetic.growthCharacteristics.height && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Height
                        </dt>
                        <dd className="text-sm">
                          {genetic.growthCharacteristics.height}cm
                        </dd>
                      </div>
                    )}
                    {genetic.growthCharacteristics.spread && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Spread
                        </dt>
                        <dd className="text-sm">
                          {genetic.growthCharacteristics.spread}cm
                        </dd>
                      </div>
                    )}
                    {genetic.growthCharacteristics.internodeSpacing && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Internode Spacing
                        </dt>
                        <dd className="text-sm">
                          {genetic.growthCharacteristics.internodeSpacing}cm
                        </dd>
                      </div>
                    )}
                    {genetic.growthCharacteristics.leafPattern && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          Leaf Pattern
                        </dt>
                        <dd className="text-sm">
                          {genetic.growthCharacteristics.leafPattern}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="plants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Plants</CardTitle>
              <CardDescription>
                Currently growing plants of this strain
              </CardDescription>
            </CardHeader>
            <CardContent>
              {genetic?.plants && genetic.plants.length > 0 ? (
                <div className="space-y-4">
                  {genetic.plants.map((plant) => (
                    <div
                      key={plant.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <Link
                          href={`/plants/${plant.code}`}
                          className="font-medium hover:underline"
                        >
                          {plant.code}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Stage: {plant.stage} • Health: {plant.healthStatus}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Planted: {formatDate(plant.plantDate)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Batches</CardTitle>
              <CardDescription>
                Current production batches using this strain
              </CardDescription>
            </CardHeader>
            <CardContent>
              {genetic?.batches && genetic.batches.length > 0 ? (
                <div className="space-y-4">
                  {genetic.batches.map((batch) => (
                    <div
                      key={batch.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <Link
                          href={`/batches/${batch.id}`}
                          className="font-medium hover:underline"
                        >
                          {batch.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {batch.plantCount} plants • Status: {batch.status}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created: {formatDate(batch.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes & Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline entityType="genetic" entityId={genetic.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
