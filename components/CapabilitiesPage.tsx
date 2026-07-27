import {CapabilitiesAgency} from '@/components/CapabilitiesAgency'
import {CapabilitiesCta} from '@/components/CapabilitiesCta'
import {CapabilitiesHero} from '@/components/CapabilitiesHero'
import {CapabilitiesManifesto} from '@/components/CapabilitiesManifesto'
import {CapabilitiesModuleGrid} from '@/components/CapabilitiesModuleGrid'
import {CapabilitiesStages} from '@/components/CapabilitiesStages'
import {CapabilitiesWhere} from '@/components/CapabilitiesWhere'
import type {CapabilitiesPageQueryResult} from '@/sanity.types'
import {stegaClean} from 'next-sanity'
import type {ReactNode} from 'react'

type CapabilitiesData = NonNullable<CapabilitiesPageQueryResult>
type Section = NonNullable<CapabilitiesData['sections']>[number]

const MANIFESTO_TYPES = new Set(['capWhyModularSection', 'capHowWeWorkSection'])

const STAGE_TYPES = new Set(['capCreativeSection', 'capProductionSection', 'capPostSection'])

type CapabilitiesPageProps = {
  sections: Section[]
}

/**
 * Composes the Capabilities route from Sanity sections with deck-informed layout:
 * light editorial shell, dark inserts, technical module grid, stage triptych.
 */
export function CapabilitiesPage({sections}: CapabilitiesPageProps) {
  const nodes: ReactNode[] = []
  let i = 0

  while (i < sections.length) {
    const section = sections[i]

    if (section._type === 'capHeroSection') {
      nodes.push(
        <CapabilitiesHero
          key={section._key}
          headline={section.headline}
          lead={section.lead}
          founderAnchor={section.founderAnchor}
          secondaryLine={section.secondaryLine}
          ambientVideoUrl={'ambientVideoUrl' in section ? section.ambientVideoUrl : null}
        />,
      )
      i += 1
      continue
    }

    if (section._type === 'capWhereWeWorkSection') {
      nodes.push(
        <CapabilitiesWhere
          key={section._key}
          subhead={'subhead' in section ? section.subhead : null}
          sideTagline={'sideTagline' in section ? section.sideTagline : null}
          leftLocation={'leftLocation' in section ? section.leftLocation : null}
          rightLocation={'rightLocation' in section ? section.rightLocation : null}
        />,
      )
      i += 1
      continue
    }

    if (MANIFESTO_TYPES.has(section._type)) {
      const batch: Section[] = []
      while (i < sections.length && MANIFESTO_TYPES.has(sections[i]._type)) {
        batch.push(sections[i])
        i += 1
      }

      const toItem = (item: Section) => ({
        _key: item._key,
        subhead: 'subhead' in item ? item.subhead : null,
        body: 'body' in item ? item.body : null,
        sideImage: 'sideImage' in item ? item.sideImage : null,
      })

      // Why Modular (copy + image), then How we work (own band).
      const why = batch.find((s) => s._type === 'capWhyModularSection')
      const how = batch.filter((s) => s._type === 'capHowWeWorkSection')

      if (why) {
        nodes.push(
          <CapabilitiesManifesto
            key={`${why._key}-feature`}
            layout="feature"
            items={[toItem(why)]}
          />,
        )
      }
      if (how.length) {
        // Text-only band (no side image) — avoid reusing the Why Modular still.
        nodes.push(
          <CapabilitiesManifesto
            key={how.map((s) => s._key).join('-')}
            layout="pair"
            items={how.map(toItem)}
          />,
        )
      }
      continue
    }

    if (section._type === 'capModuleTilesSection') {
      nodes.push(
        <CapabilitiesModuleGrid
          key={section._key}
          subhead={section.subhead}
          tiles={section.moduleTiles}
        />,
      )
      i += 1
      continue
    }

    if (STAGE_TYPES.has(section._type)) {
      const batch: Section[] = []
      while (i < sections.length && STAGE_TYPES.has(sections[i]._type)) {
        batch.push(sections[i])
        i += 1
      }
      nodes.push(
        <CapabilitiesStages
          key={batch.map((s) => s._key).join('-')}
          stages={batch.map((item) => ({
            _key: item._key,
            _type: item._type,
            subhead: 'subhead' in item ? item.subhead : null,
            introLine: 'introLine' in item ? item.introLine : null,
            body: 'body' in item ? item.body : null,
          }))}
        />,
      )
      continue
    }

    if (section._type === 'capAgencyBrandsSection') {
      nodes.push(
        <CapabilitiesAgency
          key={section._key}
          subhead={section.subhead}
          body={section.body}
          pullQuote={section.pullQuote}
          ambientVideoUrl={'ambientVideoUrl' in section ? section.ambientVideoUrl : null}
        />,
      )
      i += 1
      continue
    }

    if (section._type === 'ctaSection') {
      const cta = 'cta' in section ? section.cta : null
      nodes.push(
        <CapabilitiesCta
          key={section._key}
          subhead={cta?.subhead}
          buttonLabel={cta?.buttonLabel}
          link={cta?.link ? stegaClean(cta.link) : '/contact'}
        />,
      )
      i += 1
      continue
    }

    i += 1
  }

  return <div className="bg-background-light text-foreground-light">{nodes}</div>
}
