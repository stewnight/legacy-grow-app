import { readdir, stat, writeFile } from 'fs/promises'
import { join, relative } from 'path'

const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /\.turbo/,
  /\.vercel/,
  /public\/storybook/,
  /dist/,
  /build/,
  /coverage/,
  /\.DS_Store/,
]

interface TreeNode {
  name: string
  isDirectory: boolean
  children?: TreeNode[]
}

async function buildTree(
  path: string,
  relativePath = ''
): Promise<TreeNode | null> {
  try {
    const stats = await stat(path)
    const name = path.split('/').pop() || ''

    // Check if path should be ignored
    if (IGNORE_PATTERNS.some((pattern) => pattern.test(path))) {
      return null
    }

    if (stats.isDirectory()) {
      const entries = await readdir(path)
      const children = await Promise.all(
        entries.map((entry) =>
          buildTree(join(path, entry), join(relativePath, entry))
        )
      )
      const validChildren = children.filter(
        (child): child is TreeNode => child !== null
      )

      return {
        name,
        isDirectory: true,
        children: validChildren,
      }
    }

    return {
      name,
      isDirectory: false,
    }
  } catch (error) {
    console.error(`Error processing path ${path}:`, error)
    return null
  }
}

function generateMarkdown(node: TreeNode, level = 0): string {
  const indent = '  '.repeat(level)
  const prefix = node.isDirectory ? '📁' : ''
  let output = `${indent}${prefix}${node.name}\n`

  if (node.children) {
    output += node.children
      .sort((a, b) => {
        // Directories first, then files
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })
      .map((child) => generateMarkdown(child, level + 1))
      .join('')
  }

  return output
}

async function main() {
  const rootPath = process.cwd()
  const tree = await buildTree(rootPath)

  if (!tree) {
    console.error('Failed to generate directory tree')
    process.exit(1)
  }

  const markdown = `# Project Structure\n\n\`\`\`\n${generateMarkdown(tree)}\`\`\`\n`
  await writeFile('STRUCTURE.md', markdown)
  console.log('Successfully generated STRUCTURE.md')
}

main().catch(console.error)
