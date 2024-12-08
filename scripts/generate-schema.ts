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

  for (const module of modules) {
    console.log('\n--- Processing Module ---')
    console.log('Module exports:', Object.keys(module))

    for (const [exportName, exportValue] of Object.entries(module)) {
      console.log(`\nChecking export: ${exportName}`)

      // Skip schema and relation exports
      if (exportName.includes('Schema') || exportName.includes('Relations')) {
        console.log('Skipping: Schema or Relations export')
        continue
      }

      // Log the structure of the export
      if (exportValue && typeof exportValue === 'object') {
        const obj = exportValue as any
        console.log('Export structure:', {
          isDrizzleTable: obj[Symbol.for('drizzle:IsDrizzleTable')],
          name: obj[Symbol.for('drizzle:Name')],
          hasColumns: obj[Symbol.for('drizzle:Columns')] !== undefined,
          keys: safeGetKeys(obj),
          symbols: Object.getOwnPropertySymbols(obj).map((sym) =>
            sym.toString()
          ),
        })
      }

      // Check if this is a table
      if (!isTableWithColumns(exportValue)) {
        console.log('Skipping: Not a valid Drizzle table')
        continue
      }

      const table = exportValue
      const tableName = table[Symbol.for('drizzle:BaseName')]
      console.log(`\nProcessing table: ${tableName}`)

      const columns = table[Symbol.for('drizzle:Columns')]
      console.log('Table structure:', {
        name: tableName,
        columnCount: Object.keys(columns).length,
      })

      const tableInfo: TableInfo = {
        name: tableName,
        columns: [],
        relations: [],
      }

      // Get columns
      console.log('\nProcessing columns:')
      for (const [columnName, column] of Object.entries(columns)) {
        if (!column || typeof column !== 'object') {
          console.log(`Skipping column ${columnName}: Invalid column data`)
          continue
        }

        console.log(`\nColumn ${columnName}:`, {
          type: column.dataType || column.$type || 'unknown',
          nullable: !column.notNull,
          hasDefault: 'default' in column,
          isUnique: column.isUnique,
          isPrimary: column.primaryKey,
          hasReferences: 'references' in column,
          keys: safeGetKeys(column),
        })

        const columnInfo: ColumnInfo = {
          name: columnName,
          type: getColumnType(column),
          nullable: !column.notNull,
          defaultValue: column.default,
          isUnique: column.isUnique,
          isPrimary: column.primaryKey,
        }

        // Handle references
        if ('references' in column) {
          console.log('Reference details:', {
            table: column.references.table,
            column: column.references.column,
            onDelete: column.references.onDelete,
          })
          columnInfo.references = {
            table: column.references.table[Symbol.for('drizzle:BaseName')],
            column: column.references.column,
            onDelete: column.references.onDelete,
          }
        }

        tableInfo.columns.push(columnInfo)
        totalColumns++
      }

      // Get relations
      const relationsExport = (module as any)[`${exportName}Relations`]
      if (relationsExport && typeof relationsExport === 'object') {
        console.log('\nProcessing relations:')
        console.log('Relations export structure:', {
          hasRelations: '$relations' in relationsExport,
          keys: safeGetKeys(relationsExport),
        })

        const relations = relationsExport
        if ('$relations' in relations) {
          for (const [relationName, relation] of Object.entries(
            relations.$relations
          )) {
            if (!relation || typeof relation !== 'object') {
              console.log(
                `Skipping relation ${relationName}: Invalid relation data`
              )
              continue
            }

            console.log(`\nRelation ${relationName}:`, {
              type: relation.fields?.length === 1 ? 'one' : 'many',
              fields: relation.fields,
              references: relation.references,
              keys: safeGetKeys(relation),
            })

            tableInfo.relations.push({
              name: relationName,
              type: relation.fields?.length === 1 ? 'one' : 'many',
              table: relation.references?.table[Symbol.for('drizzle:BaseName')],
              fields: relation.fields || [],
              references: relation.references || [],
            })
            totalRelations++
          }
        }
      }

      tables.push(tableInfo)
      console.log(`\nFinished processing table ${tableName}:`, {
        columnCount: tableInfo.columns.length,
        relationCount: tableInfo.relations.length,
      })
    }
  }

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
