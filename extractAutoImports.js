import fs from 'fs'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default function extractAutoImports() {
  const filePath = path.join(__dirname, 'auto-imports.d.ts')
  try {
    const content = fs.readFileSync(filePath, 'utf8')

    // Find all const declarations in the global declare block
    const constRegex = /^\s*const\s+(\w+):/gm
    const constants = []
    let match

    while ((match = constRegex.exec(content)) !== null) {
      constants.push(match[1])
    }

    return constants
  } catch (error) {
    console.error('Error reading file:', error.message)
    return []
  }
}

export function extractAutoImportedReactComponents() {
  const allImports = extractAutoImports()

  // Filter only PascalCase names (React components)
  // PascalCase: starts with uppercase letter, followed by letters/numbers
  return allImports.filter(name => /^[A-Z][a-zA-Z0-9]*$/.test(name))
}
