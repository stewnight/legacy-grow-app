import { BaseSheet } from '../../components/base-sheet'
import { FacilityForm } from './_components/facility-form'

export default function FacilitiesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Facilities</h2>
        <BaseSheet mode="create" title="Facility" description="facility">
          <FacilityForm mode="create" />
        </BaseSheet>
      </div>
    </div>
  )
}
