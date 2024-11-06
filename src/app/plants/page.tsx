import { Suspense } from 'react'
import { PlantList } from './_components/plant-list'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '~/components/ui/card'

export default function PlantsPage() {
  return (
    <main className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Plants</CardTitle>
          <Button asChild>
            <Link href="/plants/create">Add Plant</Link>
          </Button>
        </CardHeader>
      </Card>
      <Suspense fallback={<div>Loading...</div>}>
        <PlantList />
      </Suspense>
    </main>
  )
}
