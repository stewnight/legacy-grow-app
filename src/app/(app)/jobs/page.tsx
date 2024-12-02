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
  jobEntityTypeEnum,
  statusEnum,
  type JobEntityType,
  type JobStatus,
} from '~/server/db/schema/enums'
import { JobWithRelations } from '../../../server/db/schema'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs'
import { CalendarView } from '../../../components/calendar/calendar-view'
import { CalendarIcon } from 'lucide-react'
import { TableIcon } from 'lucide-react'

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
      jobStatus: (params.status as JobStatus) || 'pending',
      entityType: params.entityType as JobEntityType,
    },
  })

  // Transform the data to match the expected type
  const jobs: JobWithRelations[] = jobsData.map((job) => ({
    ...job,
    assignedTo: job.assignedTo
      ? {
          id: job.assignedTo.id,
          name: job.assignedTo.name || '', // Convert null to empty string
        }
      : null,
    createdBy: {
      id: job.createdBy.id,
      name: job.createdBy.name || '', // Convert null to empty string
    },
  }))

  return (
    <div className="flex-1 space-y-4 p-4  pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
        <AppSheet mode="create" entity="job">
          <JobForm mode="create" />
        </AppSheet>
      </div>
      <div className="h-full">
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">
              <TableIcon className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4" />
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
            <CalendarView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
