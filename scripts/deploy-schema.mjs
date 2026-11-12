#!/usr/bin/env node
/**
 * Pushes the schema in this repo to Sanity's servers after a production build.
 *
 * There are two copies of the schema. The one in `sanity/schemas/` is what the
 * Studio at /edit and the website read, so merging a pull request updates it.
 * Sanity keeps a second copy on their servers, and that is the one the MCP
 * connector checks before it will create a document. Nothing updated that copy
 * automatically, so it sat stale from 2026-07-27 until November and rejected
 * every `proposal` document as an unknown type.
 *
 * This runs only on a production build, and only when a deploy token is set.
 * A local build, a preview build, and a build with no token all skip it, so
 * nothing here can break a deploy by being absent.
 *
 * The token wants the token-only "Deploy Studio" role, which cannot read or
 * write content. Create one with:
 *   npx sanity tokens add "vercel-build-schema-deploy" --role deploy-studio
 */
import {spawnSync} from 'node:child_process'

const TOKEN_VAR = 'SANITY_DEPLOY_TOKEN'

function skip(reason) {
  console.log(`[schema deploy] skipped: ${reason}`)
  process.exit(0)
}

const forced = process.env.FORCE_SCHEMA_DEPLOY === '1'
if (!forced && process.env.VERCEL_ENV !== 'production') {
  skip(`not a production build (VERCEL_ENV=${process.env.VERCEL_ENV ?? 'unset'})`)
}

const token = process.env[TOKEN_VAR]?.trim()
if (!token) {
  skip(`no ${TOKEN_VAR}. The copy on Sanity's servers stays as it is.`)
}

console.log('[schema deploy] pushing the schema in this repo to Sanity')
const result = spawnSync('npx', ['sanity', 'schema', 'deploy'], {
  stdio: 'inherit',
  // The CLI reads its credentials from SANITY_AUTH_TOKEN. Passing the deploy
  // token that way keeps it out of the shell history and the build log.
  env: {...process.env, SANITY_AUTH_TOKEN: token},
})

if (result.status !== 0) {
  console.error(
    [
      '',
      '[schema deploy] FAILED. The build is stopped on purpose.',
      '',
      'The website code is fine. What failed is the copy of the schema on',
      "Sanity's servers, which the MCP connector reads before creating a",
      'document. Letting this pass quietly is how that copy went stale before.',
      '',
      'To unblock a deploy right now, either:',
      '  1. run `npx sanity schema deploy` from the repo yourself, then redeploy, or',
      `  2. remove ${TOKEN_VAR} from the Vercel project, which makes this step skip.`,
      '',
      `Most likely cause: ${TOKEN_VAR} expired or lost its Deploy Studio role.`,
      '',
    ].join('\n'),
  )
  process.exit(result.status ?? 1)
}

console.log('[schema deploy] done')
