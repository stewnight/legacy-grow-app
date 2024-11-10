'use client'

import { MoreHorizontal } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { type Plant } from '~/server/db/schemas/cultivation'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'

export function PlantActions({ plant }: { plant: Plant }) {
  const router = useRouter()
  const updatePlant = api.plant.update.useMutation({
    onSuccess: () => {
      router.refresh()
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            updatePlant.mutate({
              id: plant.id,
              quarantine: !plant.quarantine,
            })
          }
        >
          {plant.quarantine ? 'Remove from Quarantine' : 'Mark as Quarantined'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            updatePlant.mutate({
              id: plant.id,
              stage:
                plant.stage === 'seedling'
                  ? 'vegetative'
                  : plant.stage === 'vegetative'
                    ? 'flowering'
                    : 'harvested',
            })
          }
        >
          Advance Growth Stage
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
