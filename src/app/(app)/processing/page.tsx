import { api } from '~/trpc/server'
import { ProcessingDashboard } from '~/components/processing/processing-dashboard'
import { type ProcessingWithRelations } from '~/server/db/schema/processing'

export default async function ProcessingPage() {
  const { items } = await api.processing.getAll({})

  if (!items) {
    return <div>No processings found</div>
  }

  // Transform the items to include the required relation fields
  const processingsWithRelations: ProcessingWithRelations[] = items.map(
    (item) => ({
      ...item,
      harvest: {
        id: item.harvestId,
        batchId: item.batchId,
        locationId: item.locationId,
        status: 'pending',
        quality: null,
        wetWeight: '0',
        dryWeight: null,
        wasteWeight: null,
        yieldPercentage: null,
        startedAt: null,
        completedAt: null,
        estimatedDuration: null,
        actualDuration: null,
        properties: null,
        labResults: null,
        createdById: item.createdById,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      batch: {
        id: item.batchId,
        identifier: 'BATCH-' + item.batchId.slice(0, 8),
        geneticId: '',
        locationId: item.locationId,
        stage: 'vegetative',
        batchStatus: 'active',
        startDate: null,
        expectedEndDate: null,
        actualEndDate: null,
        plantCount: 0,
        properties: null,
        metadata: null,
        notes: null,
        status: 'active',
        createdById: item.createdById,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      location: {
        id: item.locationId,
        roomId: '',
        name: 'Processing Location',
        type: 'room',
        coordinates: null,
        properties: null,
        dimensions: null,
        capacity: 0,
        status: 'active',
        createdById: item.createdById,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdBy: {
        id: item.createdById,
        name: '',
        image: '',
      },
    })
  )

  return (
    <div className="container mx-auto py-10">
      <ProcessingDashboard processing={processingsWithRelations} />
    </div>
  )
}
