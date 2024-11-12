import * as schema from '~/server/db/schema'

// List of Mermaid class diagram reserved words that need escaping
const RESERVED_WORDS = ['note', 'class', 'end']

function escapeName(name: string | undefined): string {
  if (!name) {
    console.warn('Received undefined name in escapeName')
    return '"undefined"'
  }
  if (RESERVED_WORDS.includes(name.toLowerCase())) {
    return `"${name}"`
  }
  return name
}

export function generateMermaidER() {
  // Get all tables (excluding relation objects and enums)
  const tables = Object.entries(schema).filter(([key, value]) => {
    const isTable =
      value &&
      typeof value === 'object' &&
      'name' in value &&
      Symbol.for('drizzle:IsDrizzleTable') in value
    const isRelation = key.endsWith('Relations')
    return isTable && !isRelation
  })

  let mermaidMarkup = 'classDiagram\n'

  // First pass: Create all table definitions
  tables.forEach(([tableKey, tableDefinition]) => {
    const table = tableDefinition as any
    const columns = table[Symbol.for('drizzle:Columns')]
    if (!columns) return

    const baseTableName = table[Symbol.for('drizzle:BaseName')]
    if (!baseTableName) {
      console.warn('Missing base table name for:', tableKey)
      return
    }

    const tableName = escapeName(baseTableName)

    // Add table definition
    mermaidMarkup += `    class ${tableName} {\n`

    // Add columns
    Object.entries(columns).forEach(([columnName, column]: [string, any]) => {
      const type =
        column.dataType?.toString() ||
        column.constructor.name.replace('Pg', '').toLowerCase()
      const notNull = column.notNull ? '*' : ''
      mermaidMarkup += `        ${columnName}${notNull} ${type}\n`
    })

    mermaidMarkup += '    }\n'
  })

  // Second pass: Add relationships from relations.ts
  Object.entries(schema).forEach(([key, value]) => {
    if (!key.endsWith('Relations')) return

    const relationConfig = (value as any)?.config?.relations
    if (!relationConfig) return

    const baseTable = (value as any)?.config?.table?.[
      Symbol.for('drizzle:BaseName')
    ]
    if (!baseTable) return

    Object.entries(relationConfig).forEach(([_, relation]: [string, any]) => {
      const targetTable =
        relation.references?.[0]?.[Symbol.for('drizzle:BaseName')]
      if (!targetTable) return

      const sourceTable = escapeName(baseTable)
      const targetTableName = escapeName(targetTable)

      // Add relationship
      if (relation.fields?.length === 1) {
        // One-to-one or many-to-one
        mermaidMarkup += `    ${sourceTable} --> ${targetTableName}\n`
      } else if (relation.type === 'many') {
        // One-to-many
        mermaidMarkup += `    ${sourceTable} --> "*" ${targetTableName}\n`
      }
    })
  })

  return mermaidMarkup
}
