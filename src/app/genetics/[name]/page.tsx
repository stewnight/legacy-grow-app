'use client'

import { api } from '~/trpc/react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { notFound, useRouter } from 'next/navigation'
import { Timeline } from '~/components/notes/timeline'
import { NoteInput } from '~/components/notes/note-input'
import Link from 'next/link'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import { use } from 'react'
import { type TRPCClientErrorLike } from '@trpc/client'
import { type RouterOutputs } from '~/trpc/shared'

type Genetic = RouterOutputs['genetic']['getByName']

export default function GeneticPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const router = useRouter()
  const utils = api.useUtils()
  const resolvedParams = use(params)

  const {
    data: genetic,
    isLoading,
    error,
  } = api.genetic.getByName.useQuery(resolvedParams.name, {
    staleTime: 5 * 60 * 1000,
    networkMode: 'offlineFirst',
    retry: 1,
  })

  const updateGenetic = api.genetic.update.useMutation({
    onMutate: async (newGenetic) => {
      await utils.genetic.getByName.cancel(resolvedParams.name)
      const previousGenetic = utils.genetic.getByName.getData(
        resolvedParams.name
      )

      utils.genetic.getByName.setData(resolvedParams.name, (old) => {
        if (!old) return old
        return {
          ...old,
          ...newGenetic,
          thcPotential: newGenetic.thcPotential?.toString() ?? old.thcPotential,
          cbdPotential: newGenetic.cbdPotential?.toString() ?? old.cbdPotential,
        }
      })

      return { previousGenetic }
    },
    onError: (err, newGenetic, context) => {
      utils.genetic.getByName.setData(
        resolvedParams.name,
        context?.previousGenetic
      )
    },
    onSettled: () => {
      void utils.genetic.getByName.invalidate(resolvedParams.name)
    },
  })

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
              </div>
              <div className="space-y-2">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !genetic) {
    return notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{genetic.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold">Genetic Details</h3>
              <div>
                <span className="text-muted-foreground">Type:</span>{' '}
                <Badge variant="secondary">{genetic.type}</Badge>
              </div>
              {genetic.breeder && (
                <div>
                  <span className="text-muted-foreground">Breeder:</span>{' '}
                  {genetic.breeder}
                </div>
              )}
              {genetic.floweringTime && (
                <div>
                  <span className="text-muted-foreground">Flowering Time:</span>{' '}
                  {genetic.floweringTime} weeks
                </div>
              )}
              {genetic.thcPotential && (
                <div>
                  <span className="text-muted-foreground">THC %:</span>{' '}
                  {genetic.thcPotential}%
                </div>
              )}
              {genetic.cbdPotential && (
                <div>
                  <span className="text-muted-foreground">CBD %:</span>{' '}
                  {genetic.cbdPotential}%
                </div>
              )}
            </div>

            {genetic.description && (
              <div className="space-y-2">
                <h3 className="font-semibold">Description</h3>
                <p className="text-muted-foreground">{genetic.description}</p>
              </div>
            )}
          </div>

          {/* Growth Characteristics */}
          {genetic.growthCharacteristics && (
            <div className="mt-6">
              <h3 className="font-semibold">Growth Characteristics</h3>
              <div className="mt-2 grid gap-4 md:grid-cols-2">
                {genetic.growthCharacteristics.height && (
                  <div>
                    <span className="text-muted-foreground">Height:</span>{' '}
                    {genetic.growthCharacteristics.height}cm
                  </div>
                )}
                {genetic.growthCharacteristics.spread && (
                  <div>
                    <span className="text-muted-foreground">Spread:</span>{' '}
                    {genetic.growthCharacteristics.spread}cm
                  </div>
                )}
                {genetic.growthCharacteristics.internodeSpacing && (
                  <div>
                    <span className="text-muted-foreground">
                      Internode Spacing:
                    </span>{' '}
                    {genetic.growthCharacteristics.internodeSpacing}cm
                  </div>
                )}
                {genetic.growthCharacteristics.leafPattern && (
                  <div>
                    <span className="text-muted-foreground">Leaf Pattern:</span>{' '}
                    {genetic.growthCharacteristics.leafPattern}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lineage */}
          {genetic.lineage && (
            <div className="mt-6">
              <h3 className="font-semibold">Lineage</h3>
              <div className="mt-2 grid gap-4 md:grid-cols-2">
                {genetic.lineage.mother && (
                  <div>
                    <span className="text-muted-foreground">Mother:</span>{' '}
                    {genetic.lineage.mother}
                  </div>
                )}
                {genetic.lineage.father && (
                  <div>
                    <span className="text-muted-foreground">Father:</span>{' '}
                    {genetic.lineage.father}
                  </div>
                )}
                {genetic.lineage.generation && (
                  <div>
                    <span className="text-muted-foreground">Generation:</span> F
                    {genetic.lineage.generation}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Plants */}
          {genetic.plants?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold">Active Plants</h3>
              <div className="mt-2">
                <ul className="space-y-2">
                  {genetic.plants.map((plant) => (
                    <li key={plant.id}>
                      <Link
                        href={`/plants/${plant.code}`}
                        className="hover:underline"
                      >
                        {plant.code}
                      </Link>{' '}
                      - Stage: {plant.stage}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Notes & Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Timeline entityType="genetic" entityId={genetic.id} />
        </CardContent>
        <CardFooter>
          <NoteInput entityType="genetic" entityId={genetic.id} />
        </CardFooter>
      </Card>
    </div>
  )
}
