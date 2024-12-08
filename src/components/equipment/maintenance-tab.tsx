'use client'

import { type Equipment } from '~/server/db/schema/equipment'
import { api } from '~/trpc/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { AppSheet } from '~/components/layout/app-sheet'
import { JobForm } from '~/components/jobs/jobs-form'
import { Badge } from '~/components/ui/badge'
import { ScrollArea } from '~/components/ui/scroll-area'
import { format } from 'date-fns'
import Link from 'next/link'
import {
  WrenchIcon,
  ClockIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
} from 'lucide-react'
import { type MaintenanceType } from '~/server/db/schema/enums'

interface MaintenanceTabProps {
  equipment: Equipment
}

export function MaintenanceTab({ equipment }: MaintenanceTabProps) {
  const { data: maintenanceJobs } = api.job.getAll.useQuery(
    {
      filters: {
        entityId: equipment.id,
        entityType: 'equipment',
        category: 'maintenance',
      },
    },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  )

  const getMaintenanceTypeIcon = (type: MaintenanceType) => {
    switch (type) {
      case 'preventive':
        return <ClockIcon className="h-4 w-4" />
      case 'corrective':
        return <WrenchIcon className="h-4 w-4" />
      case 'predictive':
        return <AlertCircleIcon className="h-4 w-4" />
      case 'condition-based':
        return <CheckCircle2Icon className="h-4 w-4" />
      default:
        return <WrenchIcon className="h-4 w-4" />
    }
  }

  const getMaintenanceJobTemplate = () => ({
    title: `Maintenance - ${equipment.name}`,
    category: 'maintenance',
    entityType: 'equipment' as const,
    entityId: equipment.id,
    priority: 'medium' as const,
    properties: {
      maintenance: {
        type: 'preventive' as const,
        frequency: equipment.maintenanceFrequency,
        lastPerformed: null,
        partsUsed: [],
        readings: [],
      },
      recurring:
        equipment.maintenanceFrequency !== 'as_needed'
          ? {
              frequency: equipment.maintenanceFrequency,
              interval: 1,
            }
          : null,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Maintenance History</h3>
          <p className="text-sm text-muted-foreground">
            View and manage maintenance tasks for this equipment
          </p>
        </div>
        <AppSheet mode="create" entity="job">
          <JobForm mode="create" defaultValues={getMaintenanceJobTemplate()} />
        </AppSheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Maintenance</CardTitle>
            <CardDescription>Scheduled maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {maintenanceJobs?.items
                  .filter((job) => job.jobStatus !== 'completed')
                  .map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getMaintenanceTypeIcon(
                            job.properties?.maintenance?.type ?? 'preventive'
                          )}
                          <Link
                            href={`/jobs/${job.id}`}
                            className="font-medium hover:underline"
                          >
                            {job.title}
                          </Link>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Due:{' '}
                          {job.dueDate
                            ? format(new Date(job.dueDate), 'PP')
                            : 'Not set'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          job.jobStatus === 'in_progress'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {job.jobStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                {(!maintenanceJobs?.items.length ||
                  !maintenanceJobs.items.filter(
                    (job) => job.jobStatus !== 'completed'
                  ).length) && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <CheckCircle2Icon className="mb-2 h-8 w-8" />
                    <p>No upcoming maintenance</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance History</CardTitle>
            <CardDescription>Completed maintenance tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {maintenanceJobs?.items
                  .filter((job) => job.jobStatus === 'completed')
                  .map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getMaintenanceTypeIcon(
                            job.properties?.maintenance?.type ?? 'preventive'
                          )}
                          <Link
                            href={`/jobs/${job.id}`}
                            className="font-medium hover:underline"
                          >
                            {job.title}
                          </Link>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Completed:{' '}
                          {job.completedAt
                            ? format(new Date(job.completedAt), 'PP')
                            : 'Not recorded'}
                        </p>
                      </div>
                      <Badge variant="secondary">completed</Badge>
                    </div>
                  ))}
                {(!maintenanceJobs?.items.length ||
                  !maintenanceJobs.items.filter(
                    (job) => job.jobStatus === 'completed'
                  ).length) && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <WrenchIcon className="mb-2 h-8 w-8" />
                    <p>No maintenance history</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
