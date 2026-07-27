import {Box, Card, Stack, Text} from '@sanity/ui'
import {useFormValue, type ObjectInputProps} from 'sanity'

/**
 * Custom input for the shared `ogImage` field.
 *
 * Renders the normal image upload, then — when no image is uploaded — a live
 * preview of the auto-generated `/api/og` branded card, built from the page's
 * `seoTitle` + `seoDescription`. This makes it obvious that leaving the field
 * empty still produces a share image (it's generated at render time, so the
 * empty upload box alone gives no hint that anything is happening).
 *
 * Uploading an image overrides the card, so the preview hides once one is set.
 */
export function OgImagePreviewInput(props: ObjectInputProps) {
  const value = props.value as {asset?: {_ref?: string}} | undefined
  const hasImage = Boolean(value?.asset?._ref)

  const seoTitle = useFormValue(['seoTitle']) as string | undefined
  const seoDescription = useFormValue(['seoDescription']) as string | undefined

  const title = (seoTitle || 'Salt Studio').toString().trim()
  const subtitle = (seoDescription || '').toString().trim()
  const params = new URLSearchParams({title})
  if (subtitle) params.set('subtitle', subtitle)
  const ogUrl = `/api/og?${params.toString()}`

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      {!hasImage && (
        <Card padding={3} radius={2} tone="transparent" border>
          <Stack space={3}>
            <Text size={1} muted>
              Auto-generated preview — this is the branded card that gets shared. Upload an image
              above to override it.
            </Text>
            <Box>
              {/* Same-origin /api/og route; renders the live 1200×630 card. */}
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
