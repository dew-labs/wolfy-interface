import fs from 'fs'

import globs from './globs.js'

// This is because the node version of lint-staged dont support import json file directly, have to use `with { type: "json" }`
// But that will conflict with our syntax, so we have to use a workaround
const loadJSON = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)))
const packageJson = loadJSON('./package.json')

// Resolve conflict when filename have `$` in it
function escape(filepath) {
  return `'${filepath}'`
}

const settings = [
  {
    glob: globs.SCRIPT_AND_JSONS,
    script: filenames => [
      `${packageJson.scripts['base:lint:script']} --fix ${filenames.map(escape).join(' ')}`,
    ],
  },
  {
    glob: [`(${globs.SCRIPT_AND_JSONS})`],
    script: filenames => [
      `${packageJson.scripts['test']} related --run ${filenames.map(escape).join(' ')}`,
    ],
  },
  {
    glob: globs.TYPESCRIPT,
    script: [() => 'tsc'],
  },
  {
    glob: globs.STYLE,
    script: filenames => [
      `${packageJson.scripts['base:lint:style']} --fix ${filenames.map(escape).join(' ')}`,
    ],
  },
]

export default Object.assign(
  {},
  ...settings.map(setting => ({
    [setting.glob]: setting.script,
  })),
)
