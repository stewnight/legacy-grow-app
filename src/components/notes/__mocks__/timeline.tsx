import React from 'react'

interface TimelineProps {
  entityType: string
  entityId: number
}

export function Timeline({ entityType, entityId }: TimelineProps) {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Timeline (Mock)</h3>
      <div className="text-sm text-muted-foreground">
        Mock Timeline for {entityType} #{entityId}
      </div>
      <div className="space-y-2">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Sample Note</div>
            <div className="text-sm text-muted-foreground">2 hours ago</div>
          </div>
          <p className="mt-2 text-sm">This is a sample timeline entry.</p>
        </div>
      </div>
    </div>
  )
}
