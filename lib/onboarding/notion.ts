import type {OnboardingRecord, OnboardingReviewSink} from '@/lib/onboarding/types'

type NotionPage = {id: string}

type NotionQueryResponse = {
  results?: NotionPage[]
}

export class NotionReviewSink implements OnboardingReviewSink {
  private readonly version = process.env.NOTION_API_VERSION || '2022-06-28'

  constructor(private readonly config: {token: string; databaseId: string}) {}

  private async notionFetch(path: string, init: RequestInit) {
    const response = await fetch(`https://api.notion.com/v1${path}`, {
      ...init,
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
        'Notion-Version': this.version,
        ...init.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Notion request failed with ${response.status}`)
    }

    return response.json() as Promise<unknown>
  }

  private async findExisting(record: OnboardingRecord) {
    const response = (await this.notionFetch(`/databases/${this.config.databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify({
        filter: {
          property: 'Dedupe Key',
          rich_text: {equals: record.idempotencyKey},
        },
        page_size: 1,
      }),
    })) as NotionQueryResponse

    return response.results?.[0] ?? null
  }

  async enqueue(record: OnboardingRecord) {
    if (record.status === 'received_for_review') return

    const existing = await this.findExisting(record)
    if (existing) {
      await this.notionFetch(`/pages/${existing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          properties: {
            Status: {select: {name: 'Open'}},
            Reason: {select: {name: record.reviewReason ?? 'downstream_failed'}},
          },
        }),
      })
      return
    }

    await this.notionFetch('/pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: {database_id: this.config.databaseId},
        properties: {
          'Name': {
            title: [
              {
                text: {
                  content: `Review onboarding submission ${record.submissionId ?? record.idempotencyKey}`,
                },
              },
            ],
          },
          'Status': {select: {name: 'Open'}},
          'Source': {select: {name: 'Tally'}},
          'Reason': {select: {name: record.reviewReason ?? 'downstream_failed'}},
          'Dedupe Key': {rich_text: [{text: {content: record.idempotencyKey}}]},
          'Project ID': {rich_text: [{text: {content: record.projectId ?? 'unknown'}}]},
          'Submission ID': {rich_text: [{text: {content: record.submissionId ?? 'unknown'}}]},
        },
      }),
    })
  }
}
