import 'server-only'
import {buildReportUserMessage, GROWTH_REPORT_SYSTEM} from '@/lib/growth/reportPrompt'
import {GrowthReportSchema, tidyGrowthReport, type GrowthReport} from '@/lib/growth/reportSchema'
import type {SiteRead} from '@/lib/growth/site'
import type {GrowthReportRow} from '@/lib/growth/store'
import Anthropic from '@anthropic-ai/sdk'
import {zodOutputFormat} from '@anthropic-ai/sdk/helpers/zod'

/**
 * Writes one paid report with Claude. One request, structured output, no
 * tools. The model sees the quiz answers and the measured site data and
 * nothing that identifies the buyer beyond first name and business name.
 */

export const GROWTH_REPORT_MODEL = 'claude-opus-5-5'

export function growthReportConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export async function writeGrowthReport(
  row: GrowthReportRow,
  site: SiteRead | null,
): Promise<{report: GrowthReport; model: string}> {
  // The SDK's own limits (ten minutes, two retries) outlast the function this
  // runs in. Fail inside the time we have, so the failure is recorded and the
  // report page can try again.
  const client = new Anthropic({timeout: 180_000, maxRetries: 0})

  const response = await client.beta.messages.create({
    model: GROWTH_REPORT_MODEL,
    max_tokens: 16000,
    // If the model declines, the API reruns the request on its fallback inside
    // the same call instead of leaving a paid buyer with nothing.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: {effort: 'medium', format: zodOutputFormat(GrowthReportSchema)},
    system: GROWTH_REPORT_SYSTEM,
    messages: [{role: 'user', content: buildReportUserMessage(row, site)}],
  })

  if (response.stop_reason === 'refusal') throw new Error('The model declined to write the report')
  if (response.stop_reason === 'max_tokens') throw new Error('The report was cut off')

  // When a fallback model took over, anything before the last fallback marker
  // is the first model's abandoned start. Only what follows is the answer.
  const lastFallback = response.content.map((block) => block.type).lastIndexOf('fallback')
  const text = response.content
    .slice(lastFallback + 1)
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('')
  const report = GrowthReportSchema.parse(JSON.parse(text))
  if (report.stages.length === 0 || report.plan.length === 0) {
    throw new Error('The report came back without stages or a plan')
  }

  return {report: tidyGrowthReport(report, site !== null), model: response.model}
}
