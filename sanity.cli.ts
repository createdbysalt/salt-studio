import {loadEnvConfig} from '@next/env'
import {defineCliConfig} from 'sanity/cli'

const dev = process.env.NODE_ENV !== 'production'
loadEnvConfig(__dirname, dev, {info: () => null, error: console.error})

// @TODO report top-level await bug
// Using a dynamic import here as `loadEnvConfig` needs to run before this file is loaded
// const { projectId, dataset } = await import('@/lib/sanity.api')
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

export default defineCliConfig({
  api: {projectId, dataset},
  // Studio application the MCP connector validates against. `sanity deploy
  // --external` updates this app's schema and does not create a new app when
  // the id resolves. Keep in sync with STUDIO_APP_ID in scripts/deploy-schema.mjs.
  deployment: {
    appId: 'gkrryoy9a8hua4jgaqaqi2qs',
  },
  vite: {
    resolve: {
      alias: {
        '@': __dirname,
      },
    },
  },
})
