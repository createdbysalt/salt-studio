import {resolveCtaHref} from '@/components/homeHero'
import {RentalHero, type RentalHeroCta} from '@/components/RentalHero'
import {RentalPhotoGallery} from '@/components/RentalPhotoGallery'
import {RentalProse} from '@/components/RentalProse'
import {StudioCta} from '@/components/StudioCta'
import {StudioGalleryScroll} from '@/components/StudioGalleryScroll'
import {resolveStudioImageSrc, type StudioSanityImage} from '@/components/StudioMedia'
import {StudioSpecs} from '@/components/StudioSpecs'
import type {RentalPageBySlugQueryResult} from '@/sanity.types'
import {stegaClean} from 'next-sanity'

type RentalData = NonNullable<RentalPageBySlugQueryResult>
type SpecRow = {_key: string; label: string | null; value: string | null}

type RentalPageProps = {
  data: RentalData
}

function resolveSpecRows(data: RentalData): SpecRow[] {
  const loc = data.specsLocation
  if (loc) {
    const rows = [...(loc.specRows ?? [])]
    if (loc.address) rows.push({_key: 'address', label: 'Address', value: loc.address})
    return rows
  }
  return data.specRows ?? []
}

function toGalleryImages(gallery: StudioSanityImage[] | null | undefined) {
  if (!gallery?.length) return []
  return gallery
    .map((image, index) => {
      const src = resolveStudioImageSrc(image, '', 2000, 1333)
      if (!src) return null
      return {
        src,
        alt: image?.alt?.trim() || `Photo ${index + 1}`,
      }
    })
    .filter((image): image is {src: string; alt: string} => Boolean(image))
}

function stripTrailingArrow(label: string) {
  return label.replace(/\s*→\s*$/, '').trim()
}

function resolveHeroCtas(data: RentalData, ctaHref: string | null): RentalHeroCta[] {
  const kind = stegaClean(data.kind)
  if (kind === 'gear') {
    const pdfs: RentalHeroCta[] = []
    if (data.gearListPdfUrl && data.gearListPdfLabel) {
      pdfs.push({
        label: stripTrailingArrow(stegaClean(data.gearListPdfLabel)),
        href: stegaClean(data.gearListPdfUrl),
      })
    }
    if (data.studioSpecPdfUrl && data.studioSpecPdfLabel) {
      pdfs.push({
        label: stripTrailingArrow(stegaClean(data.studioSpecPdfLabel)),
        href: stegaClean(data.studioSpecPdfUrl),
      })
    }
    return pdfs
  }

  if (data.cta?.buttonLabel) {
    return [{label: stegaClean(data.cta.buttonLabel), href: ctaHref || '/contact'}]
  }
  return []
}

/**
 * Composes /rentals/[slug] — all visitor-facing copy and media come from Sanity.
 */
export function RentalPage({data}: RentalPageProps) {
  const specRows = resolveSpecRows(data)
  const rentalImages = toGalleryImages(data.gallery as StudioSanityImage[] | null | undefined)
  const useImages = toGalleryImages(data.useGallery as StudioSanityImage[] | null | undefined)
  const ctaHref = resolveCtaHref(data.cta)
  const heroCtas = resolveHeroCtas(data, ctaHref)

  const proseBlocks = [
    {subhead: data.whoForSubhead, body: data.whoForBody},
    {subhead: data.includedSubhead, body: data.includedBody},
    {subhead: data.extraSubhead, body: data.extraBody},
  ]

  return (
    <div className="bg-background-light text-foreground-light">
      <RentalHero
        headline={data.headline}
        eyebrow={data.eyebrow}
        supportLine={data.lead}
        heroImage={data.heroImage as StudioSanityImage}
        heroVideoUrl={data.heroVideoUrl}
        ctas={heroCtas}
      />

      {useImages.length > 0 ? (
        <StudioGalleryScroll images={useImages} label={data.title ?? undefined} lightbox />
      ) : null}

      {specRows.length > 0 ? <StudioSpecs subhead={data.specsSubhead} rows={specRows} /> : null}

      {rentalImages.length > 0 ? (
        <RentalPhotoGallery
          heading={data.gallerySubhead}
          images={rentalImages}
          label={data.gallerySubhead || data.title || undefined}
        />
      ) : null}

      <RentalProse blocks={proseBlocks} />

      <StudioCta subhead={data.cta?.subhead} buttonLabel={data.cta?.buttonLabel} link={ctaHref} />
    </div>
  )
}
