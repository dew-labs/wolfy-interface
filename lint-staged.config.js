import fs from 'node:fs'

import globs from './globs.js'

// This is because the node version of lint-staged dont support import json file directly, have to use `with { type: "json" }`
// But that will conflict with our syntax, so we have to use a workaround
const loadJSON = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)))
const packageJson = loadJSON('./package.json')

// Resolve conflict when filename have `$` in it
function escape(filePath) {
  return `'${filePath}'`
}

const settings = [
  {
    glob: globs.SCRIPT_AND_JSONS,
    script: filePaths => [
      `${packageJson.scripts['base:lint:script']} --fix ${filePaths.map(filePath => escape(filePath)).join(' ')}`,
    ],
  },
  {
    glob: [`(${globs.SCRIPT_AND_JSONS})`],
    script: filePaths => [
      `${packageJson.scripts['test']} related --run ${filePaths.map(filePath => escape(filePath)).join(' ')}`,
    ],
  },
  {
    glob: [...globs.TYPESCRIPT, '**/package.json'], // NOTE: upgrade package versions or remove packages can lead to type errors
    script: [() => 'tsc'],
  },
  {
    glob: globs.STYLE,
    script: filePaths => [
      `${packageJson.scripts['base:lint:style']} --fix ${filePaths.map(filePath => escape(filePath)).join(' ')}`,
    ],
  },
  {
    glob: globs.MARKDOWN,
    script: filenames => [
      `${packageJson.scripts['base:lint:markdown']} --no-globs --fix ${filenames.map(escape).join(' ')}`,
    ],
  },
]

export default Object.assign({}, ...settings.map(setting => ({[setting.glob]: setting.script})))
