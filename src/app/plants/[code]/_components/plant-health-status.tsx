'use client'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { type Plant } from '~/server/db/schema/cultivation'

export function PlantHealthStatus({ plant }: { plant: Plant }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Status</p>
              <p className="font-medium">{plant.healthStatus}</p>
            </div>
            {plant.destroyReason && (
              <div>
                <p className="text-sm text-muted-foreground">Destroy Reason</p>
                <p className="font-medium">{plant.destroyReason}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
