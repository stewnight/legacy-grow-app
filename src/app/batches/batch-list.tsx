'use client'

import { type Batch } from '~/server/db/schemas'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { formatDistance } from 'date-fns'
import Link from 'next/link'
import { Button } from '~/components/ui/button'

interface BatchListProps {
  batches: Batch[]
}

export function BatchList({ batches }: BatchListProps) {
  if (!batches.length) {
    return (
      <div className="text-center text-gray-500">
        No batches found. Create your first batch to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {batches.map((batch) => (
        <Card key={batch.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{batch.name}</CardTitle>
                <CardDescription>Strain: {batch.strain}</CardDescription>
              </div>
              <Badge>{batch.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Plants:</span>
                <span>{batch.plantCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Started:</span>
                <span>
                  {batch.startDate
                    ? formatDistance(new Date(batch.startDate), new Date(), {
                        addSuffix: true,
                      })
                    : 'Not started'}
                </span>
              </div>
              {batch.notes && (
                <div className="text-sm text-gray-500">{batch.notes}</div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Link href={`/batches/${batch.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
                <Link href={`/batches/${batch.id}/plants`}>
                  <Button variant="outline" size="sm">
                    View Plants
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
