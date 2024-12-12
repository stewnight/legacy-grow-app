import { writeFile } from 'fs/promises'
import { type PgTableWithColumns } from 'drizzle-orm/pg-core'
import * as batches from '../src/server/db/schema/batches'
import * as buildings from '../src/server/db/schema/buildings'
import * as core from '../src/server/db/schema/core'
import * as equipment from '../src/server/db/schema/equipment'
import * as genetics from '../src/server/db/schema/genetics'
import * as harvests from '../src/server/db/schema/harvests'
import * as jobs from '../src/server/db/schema/jobs'
import * as locations from '../src/server/db/schema/locations'
import * as notes from '../src/server/db/schema/notes'
import * as plants from '../src/server/db/schema/plants'
import * as processing from '../src/server/db/schema/processing'
import * as rooms from '../src/server/db/schema/rooms'
import * as sensors from '../src/server/db/schema/sensors'
import * as sensorReadings from '../src/server/db/schema/sensorReadings'

interface TableInfo {
  name: string
  columns: ColumnInfo[]
  relations: RelationInfo[]
}

interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue?: string
  isUnique?: boolean
  isPrimary?: boolean
  references?: {
    table: string
    column: string
    onDelete?: string
  }
}

interface RelationInfo {
  name: string
  type: 'one' | 'many'
  table: string
  fields: string[]
  references: string[]
}

interface DrizzleRelation {
  references?: {
    table: any
    column: string
    onDelete?: string
  }
  fields?: string[]
}

interface DrizzleColumn {
  dataType?: string
  $type?: string
  notNull?: boolean
  default?: any
  isUnique?: boolean
  primaryKey?: boolean
  references?: {
    table: any
    column: string
    onDelete?: string
  }
  enumValues?: string[]
  precision?: number
  scale?: number
  length?: number
}

declare const DrizzleColumns: unique symbol

interface DrizzleTable {
  [DrizzleColumns]: Record<string, DrizzleColumn>
}

function isTableWithColumns(value: unknown): value is PgTableWithColumns<any> {
  if (!value || typeof value !== 'object') return false
  const obj = value as any
  return (
    obj[Symbol.for('drizzle:IsDrizzleTable')] === true &&
    obj[Symbol.for('drizzle:Name')] &&
    typeof obj[Symbol.for('drizzle:Name')] === 'string' &&
    obj[Symbol.for('drizzle:Columns')] &&
    typeof obj[Symbol.for('drizzle:Columns')] === 'object'
  )
}

function safeGetKeys(obj: any): string[] {
  if (!obj || typeof obj !== 'object') return []
  return Object.keys(obj)
}

function getTableName(obj: any): string {
  if (!obj) return 'unknown'
  return obj[Symbol.for('drizzle:BaseName')] || obj.name || 'unknown'
}

async function generateSchemaDoc() {
  const tables: TableInfo[] = []
  let totalColumns = 0
  let totalRelations = 0

  // Get all tables from the schema modules
  const modules = [
    batches,
    buildings,
    core,
    equipment,
    genetics,
    harvests,
    jobs,
    locations,
    notes,
    plants,
    processing,
    rooms,
    sensors,
    sensorReadings,
  ]

  console.log('\n=== Starting Schema Generation ===')
  console.log(`Found ${modules.length} schema modules to process`)

  // First pass: collect all tables
  const tableMap = new Map<string, TableInfo>()
  for (const module of modules) {
    for (const [exportName, exportValue] of Object.entries(module)) {
      if (exportName.includes('Schema') || exportName.includes('Relations')) {
        continue
      }

      if (isTableWithColumns(exportValue)) {
        const tableName = getTableName(exportValue)
        const tableInfo: TableInfo = {
          name: tableName,
          columns: [],
          relations: [],
        }
        tableMap.set(exportName, tableInfo)
      }
    }
  }

  // Second pass: process tables and relations
  for (const module of modules) {
    console.log('\n--- Processing Module ---')
    console.log('Module exports:', Object.keys(module))

    for (const [exportName, exportValue] of Object.entries(module)) {
      console.log(`\nChecking export: ${exportName}`)

      // Skip schema exports
      if (exportName.includes('Schema')) {
        console.log('Skipping: Schema export')
        continue
      }

      // Process relations first
      if (exportName.includes('Relations')) {
        console.log('Processing relations export')
        const relations = exportValue
        if (
          relations &&
          typeof relations === 'object' &&
          '$relations' in relations
        ) {
          const tableName = exportName.replace('Relations', '')
          const tableInfo = tableMap.get(tableName)
          if (tableInfo) {
            for (const [relationName, relation] of Object.entries(
              relations.$relations
            )) {
              if (!relation || typeof relation !== 'object') continue

              const typedRelation = relation as DrizzleRelation
              const relatedTableName = getTableName(
                typedRelation.references?.table
              )
              const relationType =
                typedRelation.fields?.length === 1 ? 'one' : 'many'

              console.log(
                `Found relation: ${tableName} -> ${relationType} -> ${relatedTableName} (${relationName})`
              )

              tableInfo.relations.push({
                name: relationName,
                type: relationType,
                table: relatedTableName,
                fields: typedRelation.fields || [],
                references: typedRelation.references
                  ? [typedRelation.references.column]
                  : [],
              })
              totalRelations++
            }
          }
        }
        continue
      }

      // Process table
      if (!isTableWithColumns(exportValue)) {
        console.log('Skipping: Not a valid Drizzle table')
        continue
      }

      const table = exportValue
      const tableName = getTableName(table)
      console.log(`\nProcessing table: ${tableName}`)

      const tableInfo = tableMap.get(exportName)
      if (!tableInfo) continue

      const typedTable = table as unknown as DrizzleTable
      const columns = (typedTable as any)[
        Symbol.for('drizzle:Columns')
      ] as Record<string, DrizzleColumn>
      console.log('Table structure:', {
        name: tableName,
        columnCount: Object.keys(columns).length,
      })

      // Get columns
      console.log('\nProcessing columns:')
      for (const [columnName, column] of Object.entries(columns)) {
        if (!column || typeof column !== 'object') {
          console.log(`Skipping column ${columnName}: Invalid column data`)
          continue
        }

        const typedColumn = column as DrizzleColumn
        console.log(`\nColumn ${columnName}:`, {
          type: typedColumn.dataType || typedColumn.$type || 'unknown',
          nullable: !typedColumn.notNull,
          hasDefault: 'default' in typedColumn,
          isUnique: typedColumn.isUnique,
          isPrimary: typedColumn.primaryKey,
          hasReferences: 'references' in typedColumn,
          keys: safeGetKeys(typedColumn),
        })

        const columnInfo: ColumnInfo = {
          name: columnName,
          type: getColumnType(typedColumn),
          nullable: !typedColumn.notNull,
          defaultValue: typedColumn.default,
          isUnique: typedColumn.isUnique,
          isPrimary: typedColumn.primaryKey,
        }

        // Handle references
        if ('references' in typedColumn && typedColumn.references) {
          console.log('Reference details:', {
            table: typedColumn.references.table,
            column: typedColumn.references.column,
            onDelete: typedColumn.references.onDelete,
          })
          columnInfo.references = {
            table: getTableName(typedColumn.references.table),
            column: typedColumn.references.column,
            onDelete: typedColumn.references.onDelete,
          }
        }

        tableInfo.columns.push(columnInfo)
        totalColumns++
      }

      console.log(`\nFinished processing table ${tableName}:`, {
        columnCount: tableInfo.columns.length,
        relationCount: tableInfo.relations.length,
      })
    }
  }

  // Convert map to array
  tables.push(...tableMap.values())

  console.log('\n=== Schema Statistics ===')
  console.log(`Total Tables: ${tables.length}`)
  console.log(`Total Columns: ${totalColumns}`)
  console.log(`Total Relations: ${totalRelations}`)

  // Generate Mermaid diagram
  console.log('\n=== Generating Documentation ===')
  let markdown = '# Database Schema\n\n'
  markdown += '```mermaid\nerDiagram\n\n'

  // Add entities
  console.log('Adding entities to diagram...')
  for (const table of tables) {
    markdown += `    ${table.name} {\n`
    for (const column of table.columns) {
      const type = column.type.replace(/[<>]/g, '')
      markdown += `        ${type} ${column.name}${column.nullable ? ' NULL' : ''}${column.isPrimary ? ' PK' : ''}${column.isUnique ? ' UK' : ''}\n`
    }
    markdown += '    }\n\n'
  }

  // Add relationships
  console.log('Adding relationships to diagram...')
  for (const table of tables) {
    // Add foreign key relationships
    for (const column of table.columns) {
      if (column.references) {
        const cardinality = column.nullable ? '|o--||' : '||--||'
        markdown += `    ${table.name} ${cardinality} ${column.references.table} : "${column.name}"\n`
      }
    }

    // Add explicit relations
    for (const relation of table.relations) {
      const cardinality = relation.type === 'many' ? '||--o{' : '||--||'
      markdown += `    ${table.name} ${cardinality} ${relation.table} : "${relation.name}"\n`
    }
  }

  markdown += '```\n\n'

  // Add summary
  markdown += '## Summary\n\n'
  markdown += `- Total Tables: ${tables.length}\n`
  markdown += `- Total Columns: ${totalColumns}\n`
  markdown += `- Total Relations: ${totalRelations}\n\n`

  // Add table details
  console.log('Adding table details...')
  markdown += '## Tables\n\n'
  for (const table of tables) {
    markdown += `### ${table.name}\n\n`

    // Columns
    markdown += '#### Columns\n\n'
    markdown +=
      '| Name | Type | Nullable | Default | Unique | Primary | References |\n'
    markdown +=
      '|------|------|----------|----------|---------|----------|------------|\n'

    for (const column of table.columns) {
      markdown += `| ${column.name} | ${column.type} | ${column.nullable ? 'Yes' : 'No'} | ${
        column.defaultValue || '-'
      } | ${column.isUnique ? 'Yes' : 'No'} | ${column.isPrimary ? 'Yes' : 'No'} | ${
        column.references
          ? `${column.references.table}.${column.references.column}${
              column.references.onDelete
                ? ` (${column.references.onDelete})`
                : ''
            }`
          : '-'
      } |\n`
    }

    markdown += '\n'

    // Relations
    if (table.relations.length > 0) {
      markdown += '#### Relations\n\n'
      markdown += '| Name | Type | Related Table | Fields | References |\n'
      markdown += '|------|------|--------------|---------|------------|\n'

      for (const relation of table.relations) {
        markdown += `| ${relation.name} | ${relation.type} | ${relation.table} | ${relation.fields.join(
          ', '
        )} | ${relation.references.join(', ')} |\n`
      }

      markdown += '\n'
    }
  }

  await writeFile('SCHEMA.md', markdown)
  console.log('\nSuccessfully generated SCHEMA.md')
}

function getColumnType(column: any): string {
  if (!column) return 'unknown'

  console.log('Getting column type:', {
    hasDataType: 'dataType' in column,
    dataType: column.dataType,
    hasEnumValues: 'enumValues' in column,
    hasPrecision: 'precision' in column,
    hasScale: 'scale' in column,
    hasLength: 'length' in column,
    hasType: '$type' in column,
    keys: safeGetKeys(column),
  })

  if (column.dataType) {
    if (column.enumValues) {
      return `enum(${column.enumValues.join('|')})`
    }

    if (column.precision !== undefined && column.scale !== undefined) {
      return `numeric(${column.precision},${column.scale})`
    }

    if (column.length) {
      return `${column.dataType}(${column.length})`
    }

    return column.dataType
  }

  if (column.$type) {
    return `json<${column.$type}>`
  }

  return 'unknown'
}

generateSchemaDoc().catch(console.error)
