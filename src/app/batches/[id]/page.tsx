import { api } from '~/trpc/server'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { format } from 'date-fns'

interface Plant {
  id: number
  plantDate: Date
  source: 'seed' | 'clone' | 'mother'
  stage: 'seedling' | 'vegetative' | 'flowering'
  healthStatus: 'healthy' | 'sick' | 'pest' | 'nutrient'
}

export default async function BatchPage({
  params,
}: {
  params: { id: string }
}) {
  const batch = await api.batch.getById({ id: parseInt(params.id) })

  if (!batch) {
    return <div>Batch not found</div>
  }

  const firstPlant = batch.plants[0]

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{batch.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold">Batch Details</h3>
              <div>
                <span className="text-muted-foreground">Strain:</span>{' '}
                {batch.strain}
              </div>
              <div>
                <span className="text-muted-foreground">Plant Count:</span>{' '}
                {batch.plantCount}
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>{' '}
                {format(batch.createdAt!, 'PPP')}
              </div>
            </div>

            {firstPlant && (
              <div className="space-y-2">
                <h3 className="font-semibold">Plant Details</h3>
                <div>
                  <span className="text-muted-foreground">Source:</span>{' '}
                  {firstPlant.source}
                </div>
                <div>
                  <span className="text-muted-foreground">Stage:</span>{' '}
                  {firstPlant.stage}
                </div>
                <div>
                  <span className="text-muted-foreground">Health Status:</span>{' '}
                  {firstPlant.healthStatus}
                </div>
                <div>
                  <span className="text-muted-foreground">Plant Date:</span>{' '}
                  {firstPlant.plantDate
                    ? format(new Date(firstPlant.plantDate), 'PPP')
                    : 'N/A'}
                </div>
              </div>
            )}
          </div>

          {batch.notes && (
            <div className="mt-6">
              <h3 className="font-semibold">Notes</h3>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                {batch.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
