'use client'

import { api } from '~/trpc/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { format } from 'date-fns'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'

export function PlantList() {
  const { data: plants, isLoading } = api.plant.list.useQuery()

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  if (!plants?.length) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">No plants found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Batch ID</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Plant Date</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Health Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plants.map((plant) => (
          <TableRow key={plant.id}>
            <TableCell>{plant.id}</TableCell>
            <TableCell>{plant.batchId ?? 'N/A'}</TableCell>
            <TableCell>
              <Badge variant="outline">{plant.source}</Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  plant.stage === 'flowering'
                    ? 'default'
                    : plant.stage === 'vegetative'
                      ? 'secondary'
                      : 'outline'
                }
              >
                {plant.stage}
              </Badge>
            </TableCell>
            <TableCell>
              {plant.plantDate
                ? format(new Date(plant.plantDate), 'MMM d, yyyy')
                : 'N/A'}
            </TableCell>
            <TableCell>{plant.location?.name ?? 'N/A'}</TableCell>
            <TableCell>
              <Badge
                variant={
                  plant.healthStatus === 'healthy'
                    ? 'default'
                    : plant.healthStatus === 'sick'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {plant.healthStatus ?? 'N/A'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
