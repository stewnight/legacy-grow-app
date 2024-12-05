'use client';

import * as React from 'react';
import { cn } from '~/lib/utils';
import { Badge } from '~/components/ui/badge';
import { type JobWithRelations } from '~/server/db/schema';
import { type JobStatus, type JobPriority } from '~/server/db/schema/enums';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { api } from '~/trpc/react';

interface JobCardProps {
  job: JobWithRelations;
  isMonthView?: boolean;
}

export function JobCard({ job, isMonthView = false }: JobCardProps) {
  const { data: assignedTo } = api.user.getById.useQuery(
    { id: job.assignedToId ?? '' },
    { enabled: !!job.assignedToId }
  );
  const getPriorityColor = (priority: JobPriority) => {
    switch (priority) {
      case 'critical':
      case 'urgent':
      case 'high':
        return 'bg-destructive/80 hover:bg-destructive/90 text-destructive-foreground';
      case 'medium':
        return 'bg-primary/80 hover:bg-primary/90 text-primary-foreground';
      case 'low':
        return 'bg-secondary/80 hover:bg-secondary/90 text-secondary-foreground';
    }
  };

  const getStatusVariant = (status: JobStatus) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      case 'deferred':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Link href={`/jobs/${job.id}`}>
      <div
        className={cn('mb-1 cursor-pointer rounded-md p-2 text-sm', getPriorityColor(job.priority))}
      >
        <div className="truncate text-[13px] font-medium">{job.title}</div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-1">
          {!isMonthView && (
            <Badge variant="outline" className="text-[10px]">
              {job.category}
            </Badge>
          )}
          <Badge variant={getStatusVariant(job.jobStatus)} className="text-[10px]">
            {job.jobStatus}
          </Badge>
          <Avatar className={cn('h-5 w-5', isMonthView && 'h-4 w-4')}>
            <AvatarImage src={assignedTo?.image ?? ''} />
            <AvatarFallback>{assignedTo?.name?.[0] ?? 'U'}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </Link>
  );
}
