import { Suspense } from 'react'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { DataTable } from '~/components/ui/data-table'
import { columns } from './_components/tasks-columns'
import { api } from '~/trpc/server'
import { AppSheet } from '~/components/layout/app-sheet'
import { TaskForm } from './_components/tasks-form'

export default async function TasksPage() {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  const { items: tasks } = await api.task.getAll({
    limit: 100,
    filters: {
      taskStatus: 'pending',
    },
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
        <AppSheet mode="create" entity="task">
          <TaskForm mode="create" />
        </AppSheet>
      </div>
      <div className="h-full">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <DataTable columns={columns} data={tasks} filterColumn="title" />
        </Suspense>
      </div>
    </div>
  )
}
