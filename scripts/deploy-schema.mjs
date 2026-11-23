#!/usr/bin/env node
/**
 * Pushes the schema in this repo to Sanity's servers after a production build.
 *
 * Sanity keeps two copies for the default workspace:
 *
 * 1. `_.schemas.default`, written by `sanity schema deploy`. That is the copy
 *    this script already updated. The MCP connector does not validate against it.
 * 2. The schema bound to the Studio application in `sanity.cli.ts`
 *    (`deployment.appId`, `gkrryoy9a8hua4jgaqaqi2qs`). The connector validates
 *    against this copy. `sanity deploy --external` uploads the lexicon
 *    descriptor and attaches it to that existing application. It does not
 *    upload a Studio bundle. `--schema-required` is omitted so this command
 *    does not also rewrite `_.schemas.default`.
 *
 * This runs only on a production build, and only when a deploy token is set.
 * A local build, a preview build, and a build with no token all skip it, so
 * nothing here can break a deploy by being absent. A failed command still
 * stops the build.
 *
 * SCHEMA_DEPLOY_DRY_RUN=1 prints the commands and exits without running them.
 * The production and token guards still apply. The token is never printed.
 *
 * The token wants the token-only "Deploy Studio" role, which cannot read or
 * write content. Create one with:
 *   npx sanity tokens add "vercel-build-schema-deploy" --role deploy-studio
 */
import {spawnSync} from 'node:child_process'

const TOKEN_VAR = 'SANITY_DEPLOY_TOKEN'
const DRY_RUN_VAR = 'SCHEMA_DEPLOY_DRY_RUN'
const STUDIO_APP_ID = 'gkrryoy9a8hua4jgaqaqi2qs'

// Keep this id in sync with `deployment.appId` in sanity.cli.ts. The CLI
// reads the id from that file; it is not a flag on the command below.
const COMMANDS = [
  {
    name: 'workspace schema (_.schemas.default)',
    args: ['sanity', 'schema', 'deploy'],
  },
  {
    name: `studio app schema (${STUDIO_APP_ID})`,
    args: ['sanity', 'deploy', '--external', '--yes'],
  },
]

function skip(reason) {
  console.log(`[schema deploy] skipped: ${reason}`)
  process.exit(0)
}

function commandLine(args) {
  return `npx ${args.join(' ')}`
}

function logAuth() {
  console.log(`[schema deploy] auth: SANITY_AUTH_TOKEN set from ${TOKEN_VAR} (redacted)`)
}

function fail(command, status) {
  console.error(
    [
      '',
      `[schema deploy] FAILED (${command.name}). The build is stopped on purpose.`,
      '',
      'The website code is fine. What failed is a copy of the schema on',
      "Sanity's servers. The MCP connector reads the copy bound to the Studio",
      `application ${STUDIO_APP_ID}, not only _.schemas.default. Letting this`,
      'pass quietly is how that copy went stale before.',
      '',
      `Command: ${commandLine(command.args)}`,
      '',
      'To unblock a deploy right now, either:',
      '  1. run these from the repo yourself, then redeploy:',
      '       npx sanity schema deploy',
      '       npx sanity deploy --external --yes',
      `  2. remove ${TOKEN_VAR} from the Vercel project, which makes this step skip.`,
      '',
      `Most likely cause: ${TOKEN_VAR} expired or lost its Deploy Studio role.`,
      '',
    ].join('\n'),
  )
  process.exit(status ?? 1)
}

const forced = process.env.FORCE_SCHEMA_DEPLOY === '1'
if (!forced && process.env.VERCEL_ENV !== 'production') {
  skip(`not a production build (VERCEL_ENV=${process.env.VERCEL_ENV ?? 'unset'})`)
}

const token = process.env[TOKEN_VAR]?.trim()
if (!token) {
  skip(`no ${TOKEN_VAR}. The copies on Sanity's servers stay as they are.`)
}

const dryRun = process.env[DRY_RUN_VAR] === '1'

if (dryRun) {
  console.log('[schema deploy] dry run: commands are logged and not executed')
} else {
  console.log('[schema deploy] pushing the schema in this repo to Sanity')
}

for (const command of COMMANDS) {
  console.log(`[schema deploy] ${dryRun ? 'would run' : 'running'}: ${commandLine(command.args)}`)
  logAuth()
  if (command.args.includes('--external')) {
    console.log(
      `[schema deploy] target: existing studio app ${STUDIO_APP_ID} (deployment.appId). No bundle upload. This command does not rewrite _.schemas.default.`,
    )
  }
  if (dryRun) continue

  const result = spawnSync('npx', command.args, {
    stdio: 'inherit',
    // The CLI reads its credentials from SANITY_AUTH_TOKEN. Passing the deploy
    // token that way keeps it out of the shell history and the build log.
    env: {...process.env, SANITY_AUTH_TOKEN: token},
  })

  if (result.status !== 0) {
    fail(command, result.status)
  }
}

console.log(`[schema deploy] ${dryRun ? 'dry run done' : 'done'}`)
