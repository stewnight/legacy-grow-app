'use client'

import dynamic from 'next/dynamic'
import { generateMermaidER } from '../../lib/schema-to-mermaid'

const Mermaid = dynamic(
  () => import('~/components/ui/mermaid').then((mod) => mod.Mermaid),
  { ssr: true }
)

export default function SchemaPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-2xl font-bold">Database Schema</h1>
      <div className="rounded-lg border bg-card p-4">
        <Mermaid chart={generateMermaidER()} />
      </div>
    </div>
  )
}
