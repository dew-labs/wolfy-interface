import fs from 'node:fs'

import micromatch from 'micromatch'
import {packageDirectorySync} from 'pkg-dir'

import globs from './globs.js'

// This is because the node version of lint-staged dont support import json file directly, have to use `with { type: "json" }`
// But that will conflict with our syntax, so we have to use a workaround
const loadJSON = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)))
const packageJson = loadJSON('./package.json')

// Resolve conflict when filename have `$` in it
function escape(filePath) {
  return `'${filePath}'`
}

const projectRoot = packageDirectorySync()

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
    // Upgrade package versions or remove packages can lead to runtime errors
    glob: ['**/package.json'],
    script: [() => `${packageJson.scripts['test']} run`],
  },
  {
    // Upgrade package versions or remove packages can lead to type errors
    glob: [...globs.TYPESCRIPT, '**/package.json'],
    script: [() => 'tsc'],
  },
  {
    // Upgrade package versions or remove packages can lead to type errors
    glob: globs.TYPESCRIPT,
    script: filenames => {
      const match = micromatch.not(filenames, globs.TEST)
      return `${packageJson.scripts['type:coverage']} -- ${match.map(value => value.replace(`${projectRoot}/`, '')).join(' ')}`
    },
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
