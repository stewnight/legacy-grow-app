import { api } from '~/trpc/server'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { format } from 'date-fns'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Timeline } from '~/components/notes/timeline'
import Link from 'next/link'

export default async function BatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const resolvedParams = await params
    const batch = await api.batch.getById({
      id: parseInt(resolvedParams.id),
    })

    if (!batch) {
      return notFound()
    }

    const firstPlant = batch.plants[0]

    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{batch.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold">Batch Details</h3>
                <div>
                  <span className="text-muted-foreground">Genetic:</span>{' '}
                  {batch.genetic ? (
                    <Link
                      href={`/genetics/${batch.genetic.slug}`}
                      className="hover:underline"
                    >
                      {batch.genetic.name}
                    </Link>
                  ) : (
                    'N/A'
                  )}
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
                    <span className="text-muted-foreground">
                      Health Status:
                    </span>{' '}
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

        {/* Notes Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Notes & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Timeline
              entityType="batch"
              entityId={parseInt(resolvedParams.id)}
            />
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading batch:', error)
    return notFound()
  }
}

export const metadata: Metadata = {
  title: 'Batch Details',
}
