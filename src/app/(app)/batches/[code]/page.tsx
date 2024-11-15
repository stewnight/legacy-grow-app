import { notFound } from 'next/navigation'
import { api } from '~/trpc/server'
import { format } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

export default async function BatchPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  try {
    const resolvedParams = await params
    const batch = await api.batch.get(resolvedParams.code)

    if (!batch) {
      return notFound()
    }

    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              {batch.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your batch and view its details
            </p>
          </div>
          {/* <BatchActions batch={batch} /> */}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plants">Plants</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Batch Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
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
                    <span className="text-muted-foreground">Status:</span>{' '}
                    {batch.status}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>{' '}
                    {batch.createdAt && format(batch.createdAt, 'PPP')}
                  </div>
                </div>

                {batch.notes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Notes</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {batch.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plants</CardTitle>
              </CardHeader>
              <CardContent>
                <PlantList batchId={batch.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    return notFound()
  }
}
