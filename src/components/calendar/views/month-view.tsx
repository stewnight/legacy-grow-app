import * as React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { cn } from '~/lib/utils';
import { type JobWithRelations } from '~/server/db/schema';
import { JobCard } from '../job-card';
import { AppSheet } from '../../layout/app-sheet';
import { JobForm } from '../../../app/(app)/jobs/_components/jobs-form';
import { SheetTrigger } from '../../ui/sheet';
import { Button } from '../../ui/button';
import { PlusIcon } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  days: Date[];
  jobs: JobWithRelations[];
}

export function MonthView({ currentDate, days, jobs }: MonthViewProps) {
  return (
    <div>
      <div className="grid grid-cols-7 text-muted-foreground">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="border-b p-0.5 text-center text-xs font-medium">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-sm">
        {days.map((date) => {
          const dayJobs = jobs.filter(
            (job) =>
              job.dueDate &&
              format(new Date(job.dueDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          );

          return (
            <div
              key={date.toISOString()}
              className={cn(
                'group relative min-h-[5rem] border-b border-r p-2',
                !isSameMonth(date, currentDate) && 'bg-muted/50',
                isToday(date) && 'bg-accent/5'
              )}
            >
              <div
                className={cn(
                  'mb-1 flex items-center justify-between text-right text-sm font-medium',
                  !isSameMonth(date, currentDate) && 'text-muted-foreground'
                )}
              >
                {format(date, 'd')}
                <AppSheet
                  mode="create"
                  entity="job"
                  trigger={
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto cursor-pointer p-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  }
                >
                  <JobForm
                    defaultValues={{
                      dueDate: date,
                      entityType: 'none',
                      entityId: null,
                    }}
                  />
                </AppSheet>
              </div>
              {dayJobs.length > 0 && (
                <div className="space-y-1">
                  {dayJobs.slice(0, 2).map((job) => (
                    <JobCard key={job.id} job={job} isMonthView />
                  ))}
                  {dayJobs.length > 2 && (
                    <div className="px-2 text-xs text-muted-foreground">
                      +{dayJobs.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
