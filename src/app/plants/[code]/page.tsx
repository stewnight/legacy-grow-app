'use client'

import { api } from '~/trpc/react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { PlantHealthStatus } from './_components/plant-health-status'
import { Timeline } from '~/components/notes/timeline'
import { format } from 'date-fns'
import Link from 'next/link'
import { LeafIcon } from 'lucide-react'
import { PlantActions } from '../_components/plant-actions'

export default function PlantPage() {
  const params = useParams()
  const code = params.code as string
  const { data: plant } = api.plant.get.useQuery(code)
  const updatePlant = api.plant.update.useMutation()
  const deletePlant = api.plant.delete.useMutation()

  if (!plant) return null

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <span className="text-muted-foreground">
              <LeafIcon />
            </span>
            {plant.code}
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your plant and view its details
          </p>
        </div>
        <PlantActions plant={plant} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plant Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">Batch:</span>{' '}
                    {plant.batch ? (
                      <Link
                        href={`/batches/${plant.batch.code}`}
                        className="hover:underline"
                      >
                        {plant.batch.name}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Genetic:</span>{' '}
                    {plant.genetic ? (
                      <Link
                        href={`/genetics/${plant.genetic.slug}`}
                        className="hover:underline"
                      >
                        {plant.genetic.name}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stage:</span>{' '}
                    {plant.stage}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source:</span>{' '}
                    {plant.source}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plant Date:</span>{' '}
                    {plant.plantDate &&
                      format(new Date(plant.plantDate), 'PPP')}
                  </div>
                </div>
              </div>
              <PlantHealthStatus plant={plant} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Timeline entityId={plant.id} entityType="plant" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
