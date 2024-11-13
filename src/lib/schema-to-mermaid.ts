import * as schema from '~/server/db/schema'

const RESERVED_WORDS = ['note', 'class', 'end']

// Add schema groups for better organization
const SCHEMA_GROUPS = {
  'Core Schema': ['user', 'account', 'session', 'systemLog'],
  'Facility Schema': ['facility', 'area', 'location'],
  'Cultivation Schema': ['genetic', 'batch', 'plant'],
  'Operations Schema': ['sensor', 'sensorReading', 'taskTemplate', 'task'],
  'Processing Schema': ['harvest', 'processing', 'complianceLog'],
  'Notes Schema': ['Note'],
}

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

// Helper to get the group for a table
function getTableGroup(tableName: string): string | undefined {
  return Object.entries(SCHEMA_GROUPS).find(([_, tables]) =>
    tables.includes(tableName)
  )?.[0]
}

export function generateMermaidER() {
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

  // Add group comments
  Object.entries(SCHEMA_GROUPS).forEach(([groupName, _]) => {
    mermaidMarkup += `    %% ${groupName}\n`
  })

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

  // Custom relationships map for special cases
  const CUSTOM_RELATIONSHIPS = new Map([
    ['plant:plant', 'mother'],
    ['Note:Note', 'parent'],
    ['area:area', ''],
    ['task:user', 'assignedTo'],
    ['complianceLog:user', 'verifiedBy'],
    ['Note:user', 'createdBy'],
  ])

  // Second pass: Add relationships
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

      // Check for custom relationship
      const relationKey = `${baseTable}:${targetTable}`
      const customRelation = CUSTOM_RELATIONSHIPS.get(relationKey)

      // Add relationship with proper cardinality
      if (customRelation !== undefined) {
        if (customRelation) {
          mermaidMarkup += `    ${sourceTable} --> ${targetTableName}: ${customRelation}\n`
        } else {
          mermaidMarkup += `    ${sourceTable} --> ${targetTableName}\n`
        }
      } else if (relation.fields?.length === 1) {
        // One-to-many relationship
        mermaidMarkup += `    ${sourceTable} --> "*" ${targetTableName}\n`
      } else if (relation.type === 'many') {
        // Many-to-many relationship
        mermaidMarkup += `    ${sourceTable} --> "*" ${targetTableName}\n`
      }
    })
  })

  return mermaidMarkup
}
