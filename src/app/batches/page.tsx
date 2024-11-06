import { api } from '~/trpc/server'
import { CreateBatchForm } from './create-batch-form'
import { BatchList } from './batch-list'

export default async function BatchesPage() {
  const batches = await api.batch.list()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Batches</h1>
        <p className="text-gray-500">Manage your plant batches</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-semibold">Create New Batch</h2>
          <CreateBatchForm />
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-semibold">Active Batches</h2>
          <BatchList batches={batches} />
        </div>
      </div>
    </div>
  )
}
