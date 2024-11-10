'use client'

import { Button } from '~/components/ui/button'
import { Plus, Package, Dna } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  return (
    <div className="grid gap-4">
      <Button asChild>
        <Link href="/plants/new">
          <Plus className="mr-2 h-4 w-4" />
          Add New Plant
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/batches/new">
          <Package className="mr-2 h-4 w-4" />
          Create Batch
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/strains/new">
          <Dna className="mr-2 h-4 w-4" />
          Add Strain
        </Link>
      </Button>
    </div>
  )
}
