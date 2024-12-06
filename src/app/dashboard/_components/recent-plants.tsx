'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

const recentPlants = [
  {
    id: '1',
    strain: 'Blue Dream',
    stage: 'Vegetative',
    health: 'Healthy',
    age: '14 days',
  },
  {
    id: '2',
    strain: 'OG Kush',
    stage: 'Flowering',
    health: 'Healthy',
    age: '45 days',
  },
  {
    id: '3',
    strain: 'Girl Scout Cookies',
    stage: 'Seedling',
    health: 'Attention Needed',
    age: '3 days',
  },
]

export function RecentPlants() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Strain</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Health</TableHead>
          <TableHead>Age</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentPlants.map((plant) => (
          <TableRow key={plant.id}>
            <TableCell className="font-medium">{plant.strain}</TableCell>
            <TableCell>{plant.stage}</TableCell>
            <TableCell>{plant.health}</TableCell>
            <TableCell>{plant.age}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
