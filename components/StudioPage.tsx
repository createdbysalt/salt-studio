import {StudioCrew} from '@/components/StudioCrew'
import {StudioCta} from '@/components/StudioCta'
import {StudioGalleryScroll} from '@/components/StudioGalleryScroll'
import {StudioHero} from '@/components/StudioHero'
import {StudioIntro} from '@/components/StudioIntro'
import {StudioLisbon} from '@/components/StudioLisbon'
import {StudioSpecs} from '@/components/StudioSpecs'
import type {StudioPageQueryResult} from '@/sanity.types'
import {stegaClean} from 'next-sanity'
import type {ReactNode} from 'react'

type StudioData = NonNullable<StudioPageQueryResult>
type Section = NonNullable<StudioData['sections']>[number]
type SpecRow = {_key: string; label: string | null; value: string | null}

type StudioPageProps = {
  sections: Section[]
}

function resolveSpecRows(section: {
  location?: {address?: string | null; specRows?: SpecRow[] | null} | null
}): SpecRow[] {
  const loc = section.location
  if (!loc) return []
  const rows = [...(loc.specRows ?? [])]
  if (loc.address) rows.push({_key: 'address', label: 'Address', value: loc.address})
  return rows
}

/**
 * Composes /studio — light facility chapters + dark crew closer.
 */
export function StudioPage({sections}: StudioPageProps) {
  const nodes: ReactNode[] = []

  for (const section of sections) {
    if (section._type === 'studioHeroSection') {
      nodes.push(
        <StudioHero
          key={section._key}
          headline={section.headline}
          heroImage={'heroImage' in section ? section.heroImage : null}
        />,
      )
      if (section.lead) {
        nodes.push(<StudioIntro key={`${section._key}-intro`} lead={section.lead} />)
      }
      nodes.push(<StudioGalleryScroll key={`${section._key}-gallery`} />)
      continue
    }

    if (section._type === 'studioSpecsSection') {
      nodes.push(
        <StudioSpecs
          key={section._key}
          subhead={section.subhead}
          rows={resolveSpecRows(section)}
        />,
      )
      continue
    }

    if (section._type === 'studioLisbonSection') {
      const body = section.body ?? section.location?.summary ?? null
      nodes.push(
        <StudioLisbon
          key={section._key}
          headline={section.headline}
          body={body}
          sideImage={'sideImage' in section ? section.sideImage : null}
          locationImage={
            section.location && 'image' in section.location ? section.location.image : null
          }
        />,
      )
      continue
    }

    if (section._type === 'studioCrewSection') {
      nodes.push(
        <StudioCrew
          key={section._key}
          subhead={section.subhead}
          intro={'intro' in section ? section.intro : null}
          crew={section.crew}
        />,
      )
      continue
    }

    if (section._type === 'ctaSection') {
      const cta = 'cta' in section ? section.cta : null
      nodes.push(
        <StudioCta
          key={section._key}
          subhead={cta?.subhead}
          buttonLabel={cta?.buttonLabel}
          link={cta?.link ? stegaClean(cta.link) : '/contact'}
        />,
      )
    }
  }

  return <div className="bg-background-light text-foreground-light">{nodes}</div>
}
