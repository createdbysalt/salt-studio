#!/usr/bin/env node
/**
 * Runs `npm run typegen` only when Sanity schemas or GROQ queries changed.
 * Keeps `npm run dev` fast during UI-only work while preserving type safety after schema edits.
 */
import {execSync} from 'node:child_process'
import {existsSync, readdirSync, statSync} from 'node:fs'
import {join} from 'node:path'

const ROOT = process.cwd()
const SCHEMA_JSON = join(ROOT, 'schema.json')
const TYPES_TS = join(ROOT, 'sanity.types.ts')
const SCHEMAS_DIR = join(ROOT, 'sanity/schemas')
const QUERIES_TS = join(ROOT, 'sanity/lib/queries.ts')

function walkMtime(dir) {
  let max = 0
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      max = Math.max(max, walkMtime(path))
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      max = Math.max(max, statSync(path).mtimeMs)
    }
  }
  return max
}

function newestSourceMtime() {
  let max = walkMtime(SCHEMAS_DIR)
  if (existsSync(QUERIES_TS)) {
    max = Math.max(max, statSync(QUERIES_TS).mtimeMs)
  }
  return max
}

function generatedMtime() {
  if (!existsSync(SCHEMA_JSON) || !existsSync(TYPES_TS)) return 0
  return Math.min(statSync(SCHEMA_JSON).mtimeMs, statSync(TYPES_TS).mtimeMs)
}

const sourceMtime = newestSourceMtime()
const typesMtime = generatedMtime()

if (typesMtime === 0 || sourceMtime > typesMtime) {
  console.log('Sanity schema or queries changed — running typegen…')
  execSync('npm run typegen', {stdio: 'inherit', cwd: ROOT})
} else {
  console.log('Sanity types up to date — skipping typegen')
}
