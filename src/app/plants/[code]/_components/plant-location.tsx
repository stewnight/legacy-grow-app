'use client'

import { MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { type Plant } from '~/server/db/schema/cultivation'

export function PlantLocation({ plant }: { plant: Plant }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Location</CardTitle>
      </CardHeader>
      <CardContent>
        {/* {plant.location ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Location Name</p>
              <p className="font-medium">{plant.location.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location Type</p>
              <p className="font-medium">{plant.location.type}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No location assigned</p>
        )} */}

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>No location assigned</span>
          <span className="text-sm text-mono text-muted-foreground">
            Locations coming soon..
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
