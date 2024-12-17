'use client'

import { type ColumnDef, type Table } from '@tanstack/react-table'
import { type SensorWithRelations } from '~/server/db/schema'
import { DataTableColumnHeader } from '~/components/ui/data-table-column-header'
import { DataTableFacetedFilter } from '~/components/ui/data-table-faceted-filter'
import { Badge } from '~/components/ui/badge'
import { format } from 'date-fns'
import { AppSheet } from '~/components/layout/app-sheet'
import { SensorForm } from '~/components/sensors/sensors-form'
import { Button } from '~/components/ui/button'
import {
  CalendarIcon,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Wifi,
  Ruler,
  Link as LinkIcon,
  Columns2,
  EyeIcon,
  PencilIcon,
  Activity,
  Timer,
  Cpu,
  Lightbulb,
  FileWarning,
  FlaskConical,
  Dam,
  Sun,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { sensorTypeEnum, statusEnum } from '~/server/db/schema/enums'
import React from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

interface SensorsTableFiltersProps {
  table?: Table<SensorWithRelations>
}

export function SensorsTableFilters({ table }: SensorsTableFiltersProps) {
  if (!table) return null

  // Get unique manufacturers for the filter
  const manufacturers = React.useMemo(() => {
    const mfgSet = new Set<string>()
    table.getFilteredRowModel().rows.forEach((row) => {
      const manufacturer = row.getValue('manufacturer')
      if (manufacturer) {
        mfgSet.add(manufacturer as string)
      }
    })
    return Array.from(mfgSet).map((mfg) => ({
      label: mfg,
      value: mfg,
    }))
  }, [table])

  // Get unique locations for the filter
  const locations = React.useMemo(() => {
    const locMap = new Map<string, { id: string; name: string }>()
    table.getFilteredRowModel().rows.forEach((row) => {
      const location = row.original.location
      if (location) {
        locMap.set(location.id, { id: location.id, name: location.name })
      }
    })
    return Array.from(locMap.values()).map((loc) => ({
      label: loc.name,
      value: loc.id,
    }))
  }, [table])

  return (
    <div className="flex max-w-full flex-1 items-center space-x-2 overflow-x-auto">
      <DataTableFacetedFilter
        column={table.getColumn('type')}
        title="Type"
        options={sensorTypeEnum.enumValues.map((type) => ({
          label: type.charAt(0).toUpperCase() + type.slice(1),
          value: type,
          icon:
            type === 'temperature'
              ? Thermometer
              : type === 'humidity'
                ? Droplets
                : type === 'airflow'
                  ? Wind
                  : type === 'co2'
                    ? FileWarning
                    : type === 'light'
                      ? Sun
                      : type === 'ph'
                        ? FlaskConical
                        : type === 'ec'
                          ? Dam
                          : type === 'moisture'
                            ? Droplets
                            : Activity,
        }))}
      />
      <DataTableFacetedFilter
        column={table.getColumn('status')}
        title="Status"
        options={statusEnum.enumValues.map((status) => ({
          label: status.charAt(0).toUpperCase() + status.slice(1),
          value: status,
        }))}
      />
      {manufacturers.length > 0 && (
        <DataTableFacetedFilter
          column={table.getColumn('manufacturer')}
          title="Manufacturer"
          options={manufacturers}
        />
      )}
      {locations.length > 0 && (
        <DataTableFacetedFilter
          column={table.getColumn('location')}
          title="Location"
          options={locations}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <Columns2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanHide()
            )
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const columns: ColumnDef<SensorWithRelations>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      const sensor = row.original
      return (
        <Link
          href={`/sensors/${sensor.id}`}
          className="text-nowrap font-medium hover:underline"
        >
          {sensor.id.slice(0, 8)}
        </Link>
      )
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const sensor = row.original
      const icon = {
        temperature: <Thermometer className="h-4 w-4" />,
        humidity: <Droplets className="h-4 w-4" />,
        airflow: <Wind className="h-4 w-4" />,
        pressure: <Gauge className="h-4 w-4" />,
        network: <Wifi className="h-4 w-4" />,
        distance: <Ruler className="h-4 w-4" />,
        co2: <FileWarning className="h-4 w-4" />,
        light: <Sun className="h-4 w-4" />,
        ph: <FlaskConical className="h-4 w-4" />,
        ec: <Dam className="h-4 w-4" />,
        moisture: <Droplets className="h-4 w-4" />,
      }[sensor.type] ?? <Activity className="h-4 w-4" />

      return (
        <div className="flex items-center gap-2 text-nowrap">
          {icon}
          <span className="capitalize">{sensor.type}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'manufacturer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Manufacturer" />
    ),
    cell: ({ row }) => {
      const sensor = row.original
      return (
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          <span>{sensor.manufacturer}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'model',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Model" />
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={
            status === 'active'
              ? 'default'
              : status === 'inactive'
                ? 'secondary'
                : 'destructive'
          }
        >
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'location',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const sensor = row.original
      if (!sensor.location) {
        return <span className="text-muted-foreground">Not assigned</span>
      }
      return (
        <Link
          href={`/locations/${sensor.location.id}`}
          className="flex items-center gap-1 text-nowrap hover:underline"
        >
          <LinkIcon className="h-3 w-3" />
          <span>{sensor.location.name}</span>
        </Link>
      )
    },
    filterFn: (row, id, value) => {
      const location = row.original.location
      if (!location) return false
      return value.includes(location.id)
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'lastCalibration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Calibration" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('lastCalibration') as Date
      if (!date) return null
      return (
        <div className="flex items-center gap-2 text-nowrap">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <span>{format(date, 'PP')}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/sensors/${row.original.id}`}>
              <EyeIcon className="h-3 w-3" />
            </Link>
          </Button>
          <AppSheet
            mode="edit"
            entity="sensor"
            trigger={
              <Button variant="ghost" size="icon">
                <PencilIcon className="h-3 w-3" />
              </Button>
            }
          >
            <SensorForm mode="edit" initialData={row.original} />
          </AppSheet>
        </div>
      )
    },
  },
]
