'use client'

import { Mermaid } from '~/components/ui/mermaid'
import { generateMermaidER } from '~/lib/schema-to-mermaid'

export default function SchemaPage() {
  const mermaidMarkup = generateMermaidER()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Database Schema</h1>
      <div className="bg-white rounded-lg shadow-lg p-4">
        <Mermaid chart={mermaidMarkup} />
      </div>
    </div>
  )
}
