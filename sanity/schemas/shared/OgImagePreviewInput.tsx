import {Box, Card, Stack, Text} from '@sanity/ui'
import {useFormValue, type ObjectInputProps} from 'sanity'

/**
 * Custom input for the shared `ogImage` field.
 *
 * Renders the normal image upload, then — when no image is uploaded — a live
 * preview of the auto-generated `/api/og` card. Project documents preview their
 * own title card (eyebrow + project name); every other page previews the
 * site-wide statement card. Uploading an image overrides the auto card.
 */
export function OgImagePreviewInput(props: ObjectInputProps) {
  const value = props.value as {asset?: {_ref?: string}} | undefined
  const hasImage = Boolean(value?.asset?._ref)

  // The parent document, live — so the preview updates as fields change.
  const doc = useFormValue([]) as
    | {_type?: string; title?: string; projectType?: string; year?: string}
    | undefined

  const isProject = doc?._type === 'project' && Boolean(doc?.title)

  // Same param shape the site uses in lib/seo/og-image.ts — keep the version in sync.
  const params = new URLSearchParams({v: 'bw-11'})
  if (isProject) {
    const kind = doc?.projectType === 'case-study' ? 'Case study' : 'Project'
    const year = doc?.year ? String(doc.year).trim() : ''
    params.set('title', String(doc?.title))
    params.set('eyebrow', year ? `${kind} · ${year}` : kind)
  }
  const ogUrl = `/api/og?${params.toString()}`

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      {!hasImage && (
        <Card padding={3} radius={2} tone="transparent" border>
          <Stack space={3}>
            <Text size={1} muted>
              {isProject
                ? 'This project’s social card — the image used when this project is shared.'
                : 'Site-wide social card — the image used when this page is shared.'}
            </Text>
            <Box>
              <img
                src={ogUrl}
                alt="Auto-generated social share card preview"
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: 480,
                  aspectRatio: '1200 / 630',
                  borderRadius: 4,
                }}
              />
            </Box>
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
