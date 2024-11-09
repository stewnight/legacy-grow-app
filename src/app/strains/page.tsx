import { Suspense } from 'react'
import { StrainList } from './_components/strain-list'
import { CreateStrainForm } from './_components/create-strain-form'
import { Card, CardHeader, CardTitle } from '~/components/ui/card'

export default function StrainsPage() {
  return (
    <main className="container mx-auto p-4">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create New Strain</CardTitle>
            </CardHeader>
            <CreateStrainForm />
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Strain Library</CardTitle>
            </CardHeader>
            <Suspense fallback={<div>Loading strains...</div>}>
              <StrainList />
            </Suspense>
          </Card>
        </div>
      </div>
    </main>
  )
}
