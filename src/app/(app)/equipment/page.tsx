import { Suspense } from 'react'
import { api } from '~/trpc/server'
import {
  columns,
  EquipmentTableFilters,
} from '../../../components/equipment/equipment-columns'
import { DataTable } from '~/components/ui/data-table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { isBefore } from 'date-fns'
import { Skeleton } from '~/components/ui/skeleton'
import { AppSheet } from '~/components/Layout/app-sheet'
import { EquipmentForm } from '../../../components/equipment/equipment-form'
import { type Equipment } from '~/server/db/schema/equipment'

export default async function EquipmentPage() {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  const { items: equipmentData } = await api.equipment.getAll({
    limit: 100,
  })

  // Helper function to safely check if maintenance is due
  const isMaintenanceDue = (equipment: Equipment) => {
    if (!equipment.nextMaintenanceDate) return false
    const nextMaintenance = new Date(equipment.nextMaintenanceDate)
    return isBefore(nextMaintenance, new Date())
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Equipment</h2>
          <p className="text-muted-foreground">
            Manage your facility&apos;s equipment and maintenance schedules
          </p>
        </div>
        <AppSheet mode="create" entity="equipment">
          <EquipmentForm mode="create" />
        </AppSheet>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Equipment</CardTitle>
            <CardDescription>Active equipment in your facility</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{equipmentData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Due</CardTitle>
            <CardDescription>Equipment requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {equipmentData.filter(isMaintenanceDue).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Offline Equipment</CardTitle>
            <CardDescription>Equipment currently unavailable</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {
                equipmentData.filter(
                  (item) =>
                    item.status === 'offline' || item.status === 'maintenance'
                ).length
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-transparent">
        <CardHeader>
          <CardTitle>Equipment List</CardTitle>
          <CardDescription>
            View and manage all equipment in your facility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <div className="space-y-4">
              {equipmentData && (
                <DataTable
                  columns={columns}
                  data={equipmentData}
                  filterColumn="name"
                  enableSorting
                  enableFiltering
                  enableColumnFilters
                  filters={<EquipmentTableFilters />}
                />
              )}
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
