'use client'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { type SensorWithRelations } from '~/server/db/schema'
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Wifi,
  Ruler,
  Activity,
  Timer,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Factory,
} from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { format, isAfter } from 'date-fns'

interface SensorsDashboardProps {
  sensors: SensorWithRelations[]
}

export function SensorsDashboard({ sensors }: SensorsDashboardProps) {
  // Calculate type statistics
  const typeStats = sensors.reduce(
    (acc, sensor) => {
      acc[sensor.type] = (acc[sensor.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Calculate status statistics
  const statusStats = sensors.reduce(
    (acc, sensor) => {
      acc[sensor.status] = (acc[sensor.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Get unique manufacturers
  const manufacturers = new Set(
    sensors
      .map((sensor) => sensor.manufacturer)
      .filter((m): m is string => m !== null && m !== undefined)
  )

  // Calculate calibration status
  const calibrationStats = sensors.reduce(
    (acc, sensor) => {
      if (!sensor.nextCalibration) {
        acc.unknown++
      } else if (isAfter(new Date(), sensor.nextCalibration)) {
        acc.overdue++
      } else {
        acc.upToDate++
      }
      return acc
    },
    { upToDate: 0, overdue: 0, unknown: 0 }
  )

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md">
      <div className="flex w-full space-x-4 pb-4">
        {/* Type Distribution */}
        <Card className="min-w-[300px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sensor Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(typeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {type === 'temperature' ? (
                    <Thermometer className="h-4 w-4" />
                  ) : type === 'humidity' ? (
                    <Droplets className="h-4 w-4" />
                  ) : type === 'airflow' ? (
                    <Wind className="h-4 w-4" />
                  ) : type === 'pressure' ? (
                    <Gauge className="h-4 w-4" />
                  ) : type === 'network' ? (
                    <Wifi className="h-4 w-4" />
                  ) : type === 'distance' ? (
                    <Ruler className="h-4 w-4" />
                  ) : (
                    <Activity className="h-4 w-4" />
                  )}
                  <span className="capitalize">{type}</span>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Status Overview */}
        <Card className="min-w-[300px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {status === 'active' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : status === 'inactive' ? (
                    <XCircle className="h-4 w-4 text-gray-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="capitalize">{status}</span>
                </div>
                <Badge
                  variant={
                    status === 'active'
                      ? 'default'
                      : status === 'inactive'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Calibration Status */}
        <Card className="min-w-[300px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Calibration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Up to Date</span>
              </div>
              <Badge variant="secondary">{calibrationStats.upToDate}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Overdue</span>
              </div>
              <Badge variant="destructive">{calibrationStats.overdue}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-gray-500" />
                <span>Unknown</span>
              </div>
              <Badge variant="secondary">{calibrationStats.unknown}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Manufacturer Overview */}
        <Card className="min-w-[300px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Manufacturers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                <span>Total Manufacturers</span>
              </div>
              <Badge variant="secondary">{manufacturers.size}</Badge>
            </div>
            <div className="mt-2 space-y-1">
              {Array.from(manufacturers).map((manufacturer) => (
                <div
                  key={manufacturer}
                  className="text-sm text-muted-foreground"
                >
                  • {manufacturer}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
