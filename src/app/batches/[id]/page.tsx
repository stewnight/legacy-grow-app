import { api } from '~/trpc/server'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '~/components/ui/card'
import { format } from 'date-fns'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'

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
    <div className="container mx-auto py-8 space-y-8">
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

      {/* Timeline and Comments Section */}
      <div>
        <h2 className="text-2xl font-semibold">
          Logging features to be done, the below is just a placeholder
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Example timeline items */}
            <div className="border-l-2 border-muted pl-4 space-y-4">
              <div className="relative">
                <div className="absolute -left-[41px] h-6 w-6 rounded-full bg-muted-foreground flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-background" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p>Changed stage to Flowering</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] h-6 w-6 rounded-full bg-muted-foreground flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-background" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">3 days ago</p>
                  <p>Added nutrients</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Add Timeline Event
            </Button>
          </CardFooter>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Example comments */}
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">User</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
                <p>Plants are looking healthy, good leaf development.</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">User</p>
                  <p className="text-sm text-muted-foreground">5 days ago</p>
                </div>
                <p>Started LST on the larger plants.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Textarea placeholder="Add a comment..." className="w-full" />
            <Button className="w-full">Add Comment</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
