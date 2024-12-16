import { Suspense } from 'react'
import { Skeleton } from '~/components/ui/skeleton'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { DataTable } from '~/components/ui/data-table'
import { columns, NotesTableFilters } from '~/components/notes/notes-columns'
import { api } from '~/trpc/server'
import { AppSheet } from '~/components/layout/app-sheet'
import { NoteForm } from '~/components/notes/notes-form'
import { type NoteWithRelations } from '~/server/db/schema'
import { NotesDashboard } from '~/components/notes/notes-dashboard'

export default async function NotesPage() {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  const { items: notesData } = await api.note.getAll({
    limit: 100,
  })

  const notes: NoteWithRelations[] = notesData.map((note) => ({
    ...note,
    createdBy: {
      id: note.createdBy.id,
      name: note.createdBy.name ?? 'Unknown User',
      image: note.createdBy.image ?? '/images/placeholder-avatar.png',
    },
  }))

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Notes</h2>
        <AppSheet mode="create" entity="note">
          <NoteForm mode="create" />
        </AppSheet>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-[150px]" />
          </div>
        }
      >
        <NotesDashboard notes={notes} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <div className="space-y-4">
          {notes && (
            <DataTable
              columns={columns}
              data={notes}
              enableSorting
              enableFiltering
              enableColumnFilters
              filterColumn="title"
              filters={<NotesTableFilters />}
            />
          )}
        </div>
      </Suspense>
    </div>
  )
}
