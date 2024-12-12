import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '../ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { api } from '~/trpc/react'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import { format } from 'date-fns'
import Link from 'next/link'
import { AppSheet } from '../Layout/app-sheet'
import { JobForm } from '~/components/jobs/jobs-form'
import { Button } from '../ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface JobsTabProps {
  entityId: string
  entityType:
    | 'location'
    | 'plant'
    | 'batch'
    | 'genetics'
    | 'sensors'
    | 'processing'
    | 'harvest'
}

export default function JobsTab({ entityId, entityType }: JobsTabProps) {
  const [showCompleted, setShowCompleted] = useState(false)

  const { data: jobs, isLoading } = api.job.getAll.useQuery({
    filters: {
      entityId: entityId ?? undefined,
      entityType: entityType ?? undefined,
    },
  })

  const utils = api.useUtils()

  const { mutate: updateJobStatus } = api.job.update.useMutation({
    onSuccess: () => {
      void utils.job.getAll.invalidate()
    },
  })

  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A'
    return format(new Date(date), 'PP')
  }

  const handleStatusChange = (jobId: string) => {
    updateJobStatus({
      id: jobId,
      data: {
        jobStatus: 'completed',
        completedAt: new Date(),
      },
    })
  }

  const activeJobs =
    jobs?.items.filter(
      (job) => job.jobStatus !== 'completed' && job.entityId === entityId
    ) || []
  const completedJobs =
    jobs?.items.filter(
      (job) => job.jobStatus === 'completed' && job.entityId === entityId
    ) || []

  return (
    <TabsContent value="jobs">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Jobs</CardTitle>
              <CardDescription>
                Jobs related to this {entityType}
              </CardDescription>
            </div>
            <AppSheet mode="create" entity="job">
              <JobForm
                mode="create"
                initialData={{
                  entityType: entityType ?? 'none',
                  entityId: entityId ?? null,
                  status: 'active',
                  completedAt: null,
                }}
              />
            </AppSheet>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading jobs...</p>
            ) : activeJobs.length > 0 ? (
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={job.jobStatus === 'completed'}
                        onCheckedChange={() => handleStatusChange(job.id)}
                        disabled={job.jobStatus === 'completed'}
                      />
                      <div>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-medium hover:underline"
                        >
                          {job.title}
                        </Link>
                        <div className="mt-1 flex gap-2">
                          <Badge variant="outline">{job.category}</Badge>
                          <Badge
                            variant={
                              job.priority === 'high'
                                ? 'destructive'
                                : job.priority === 'medium'
                                  ? 'default'
                                  : 'secondary'
                            }
                          >
                            {job.priority}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Due: {formatDate(job.dueDate)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        job.jobStatus === 'completed' ? 'default' : 'secondary'
                      }
                    >
                      {job.jobStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No active jobs found</p>
            )}
          </CardContent>
        </Card>

        {completedJobs.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Completed Jobs</CardTitle>
                <CardDescription>
                  {completedJobs.length} completed job
                  {completedJobs.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            {showCompleted && (
              <CardContent>
                <div className="space-y-2">
                  {completedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between py-2 text-sm text-muted-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="hover:underline"
                        >
                          {job.title}
                        </Link>
                        <span>•</span>
                        <span>{job.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {job.category}
                        </Badge>
                        <span>Completed: {formatDate(job.completedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </TabsContent>
  )
}
