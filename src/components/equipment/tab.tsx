import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '../ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { api } from '~/trpc/react'
import { Badge } from '~/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'
import { AppSheet } from '../layout/app-sheet'
import { EquipmentForm } from '~/app/(app)/equipment/_components/equipment-form'
import { Button } from '../ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface EquipmentTabProps {
  entityId: string
  entityType: 'room' | 'location' | 'building'
}

export default function EquipmentTab({
  entityId,
  entityType,
}: EquipmentTabProps) {
  const [showInactive, setShowInactive] = useState(false)

  const { data: equipment, isLoading } = api.equipment.getAll.useQuery({
    filters: {
      roomId: entityType === 'room' ? entityId : undefined,
    },
  })

  const utils = api.useUtils()

  const { mutate: assignRoom } = api.equipment.assignRoom.useMutation({
    onSuccess: () => {
      void utils.equipment.getAll.invalidate()
    },
  })

  const { mutate: unassignRoom } = api.equipment.unassignRoom.useMutation({
    onSuccess: () => {
      void utils.equipment.getAll.invalidate()
    },
  })

  const formatDate = (date: Date | string | null): string => {
    if (!date) return 'N/A'
    return format(new Date(date), 'PP')
  }

  const activeEquipment =
    equipment?.items.filter(
      (item) => item.status === 'active' || item.status === 'maintenance'
    ) || []

  const inactiveEquipment =
    equipment?.items.filter(
      (item) => item.status === 'offline' || item.status === 'decommissioned'
    ) || []

  const isMaintenanceDue = (date: Date | string | null) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  return (
    <TabsContent value="equipment">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Equipment</CardTitle>
              <CardDescription>Equipment in this {entityType}</CardDescription>
            </div>
            <AppSheet mode="create" entity="equipment">
              <Button variant="outline" size="sm">
                Add Equipment
              </Button>
              <EquipmentForm
                mode="create"
                defaultValues={{
                  name: '',
                  type: 'sensor',
                  status: 'active',
                  maintenanceFrequency: 'monthly',
                  roomId: entityType === 'room' ? entityId : undefined,
                  metadata: {},
                  specifications: {},
                }}
              />
            </AppSheet>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading equipment...</p>
            ) : activeEquipment.length > 0 ? (
              <div className="space-y-4">
                {activeEquipment.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded border p-4"
                  >
                    <div>
                      <Link
                        href={`/equipment/${item.id}`}
                        className="font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1 flex gap-2">
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge
                          variant={
                            item.status === 'maintenance'
                              ? 'destructive'
                              : 'default'
                          }
                        >
                          {item.status}
                        </Badge>
                        {isMaintenanceDue(item.nextMaintenanceDate) && (
                          <Badge variant="destructive">Maintenance Due</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Next Maintenance: {formatDate(item.nextMaintenanceDate)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {entityType === 'room' && item.roomId !== entityId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            assignRoom({
                              equipmentId: item.id,
                              roomId: entityId,
                            })
                          }
                        >
                          Assign
                        </Button>
                      )}
                      {item.roomId === entityId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unassignRoom({ equipmentId: item.id })}
                        >
                          Unassign
                        </Button>
                      )}
                      <AppSheet mode="edit" entity="equipment">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <EquipmentForm mode="edit" defaultValues={item} />
                      </AppSheet>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No active equipment found</p>
            )}
          </CardContent>
        </Card>

        {inactiveEquipment.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Inactive Equipment</CardTitle>
                <CardDescription>
                  {inactiveEquipment.length} inactive equipment
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            {showInactive && (
              <CardContent>
                <div className="space-y-2">
                  {inactiveEquipment.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 text-sm text-muted-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/equipment/${item.id}`}
                          className="hover:underline"
                        >
                          {item.name}
                        </Link>
                        <span>•</span>
                        <span>
                          {item.manufacturer} {item.model}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {item.status}
                        </Badge>
                        {entityType === 'room' && item.roomId !== entityId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              assignRoom({
                                equipmentId: item.id,
                                roomId: entityId,
                              })
                            }
                          >
                            Assign
                          </Button>
                        )}
                        {item.roomId === entityId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              unassignRoom({ equipmentId: item.id })
                            }
                          >
                            Unassign
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </TabsContent>
  )
}
