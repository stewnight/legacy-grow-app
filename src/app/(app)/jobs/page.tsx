import { Suspense } from 'react';
import { Skeleton } from '~/components/ui/skeleton';
import { auth } from '~/server/auth';
import { redirect } from 'next/navigation';
import { DataTable } from '~/components/ui/data-table';
import { columns, JobsTableFilters } from './_components/jobs-columns';
import { api } from '~/trpc/server';
import { AppSheet } from '~/components/layout/app-sheet';
import { JobForm } from './_components/jobs-form';
import { type JobWithRelations } from '~/server/db/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { CalendarView } from '~/components/calendar/calendar-view';
import { GanttView } from '~/components/gantt/gantt-view';
import { CalendarIcon, TableIcon, GanttChartIcon } from 'lucide-react';
import { type User } from 'next-auth';

type UserWithImage = {
  id: string;
  name: string | null;
  image: string | null;
};

export default async function JobsPage() {
  const session = await auth();
  if (!session) {
    redirect('/');
  }

  const { items: jobsData } = await api.job.getAll({
    limit: 100,
  });

  const jobs: JobWithRelations[] = jobsData.map((job) => ({
    ...job,
    assignedTo: job.assignedTo
      ? {
          id: job.assignedTo.id,
          name: job.assignedTo.name || '',
          image: (job.assignedTo as UserWithImage).image || '',
        }
      : null,
    createdBy: {
      id: job.createdBy.id,
      name: job.createdBy.name || '',
      image: (job.createdBy as UserWithImage).image || '',
    },
  }));

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Jobs</h2>
        <AppSheet mode="create" entity="job">
          <JobForm mode="create" />
        </AppSheet>
      </div>
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
            <TabsTrigger value="gantt" className="flex items-center gap-2">
              <GanttChartIcon className="h-4 w-4" />
              <span>Timeline</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <div className="space-y-4">
                {jobs && (
                  <DataTable
                    columns={columns}
                    data={jobs}
                    filterColumn="title"
                    enableSorting
                    enableFiltering
                    enableColumnFilters
                    filters={<JobsTableFilters />}
                  />
                )}
              </div>
            </Suspense>
          </TabsContent>
          <TabsContent value="calendar">
            <CalendarView jobs={jobs} />
          </TabsContent>
          <TabsContent value="gantt">
            <GanttView jobs={jobs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
