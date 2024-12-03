import { Suspense } from 'react'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { DataTable } from '~/components/ui/data-table'
import { columns } from './_components/jobs-columns'
import { api } from '~/trpc/server'
import { AppSheet } from '~/components/layout/app-sheet'
import { JobForm } from './_components/jobs-form'
import {
  type JobStatus,
  type JobPriority,
  type JobEntityType,
} from '~/server/db/schema/enums'
import { type JobWithRelations } from '../../../server/db/schema'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import { CalendarView } from '../../../components/calendar/calendar-view'
import { CalendarIcon, TableIcon } from 'lucide-react'
import { JobsFilters } from './_components/jobs-filters'

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  const params = await Promise.resolve(searchParams)

  const { items: jobsData } = await api.job.getAll({
    limit: 100,
    filters: {
      jobStatus: params.status as JobStatus,
      entityType: params.entityType as JobEntityType,
      priority: params.priority as JobPriority,
      assignedToId: params.assignedToId as string,
    },
  })

  const jobs: JobWithRelations[] = jobsData.map((job) => ({
    ...job,
    assignedTo: job.assignedTo
      ? {
          id: job.assignedTo.id,
          name: job.assignedTo.name || '',
        }
      : null,
    createdBy: {
      id: job.createdBy.id,
      name: job.createdBy.name || '',
    },
  }))

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
        <AppSheet mode="create" entity="job">
          <JobForm mode="create" />
        </AppSheet>
      </div>
      <JobsFilters userId={session.user.id} />
      <div className="h-full">
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              <span>List</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Calendar</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              {jobs && (
                <DataTable columns={columns} data={jobs} filterColumn="title" />
              )}
            </Suspense>
          </TabsContent>
          <TabsContent value="calendar">
            <CalendarView jobs={jobs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
