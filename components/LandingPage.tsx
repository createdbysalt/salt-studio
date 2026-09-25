import {
  LandingCtaSection,
  LandingDeliverableSection,
  LandingFaqSection,
  LandingFitSection,
  LandingHeroSection,
  LandingLogoSection,
  LandingMeasurementSection,
  LandingPricingSection,
  LandingProblemSection,
  LandingProcessSection,
  LandingProofSection,
  LandingSystemSection,
  LandingTeamSection,
  type Landing,
  type LandingCta,
} from '@/components/LandingSections'
import {LandingStickyCta} from '@/components/LandingStickyCta'
import {SiteLogo} from '@/components/SiteLogo'
import {stegaClean} from 'next-sanity'

const DEFAULT_CTA_LABEL = 'Book a call'
const DEFAULT_CTA_HREF = 'https://cal.com/createdbysalt/discovery'

/** Page-level CTA shared by every button on a landing page. */
export function resolveLandingCta(data: Landing): LandingCta {
  return {
    label: stegaClean(data.ctaLabel ?? '').trim() || DEFAULT_CTA_LABEL,
    href: stegaClean(data.ctaLink ?? '').trim() || DEFAULT_CTA_HREF,
    subhead: data.ctaSubhead ?? null,
  }
}

/**
 * Landing page assembler.
 *
 * Renders the ordered `sections` array, hides the global nav when the document asks
 * for it (logo only, so paid clicks are not leaked into the menu), and mounts the
 * sticky mobile button bar. Sections toggled off in Studio are skipped.
 */
export function LandingPage({data}: {data: Landing}) {
  const cta = resolveLandingCta(data)
  const hideNav = data.hideNav !== false
  const sticky = data.stickyMobileCta !== false
  const sections = (data.sections ?? []).filter((section) => section.enabled !== false)

  return (
    <>
      {hideNav && (
        <>
          {/* Hide the global nav for this route only. The style leaves with the page. */}
          <style>{`[data-site-nav]{display:none !important}`}</style>
          <div className="page-chrome pointer-events-none fixed top-0 z-[70] w-full pt-4">
            <SiteLogo className="pointer-events-auto" />
          </div>
        </>
      )}
      <div className={sticky ? 'pb-20 md:pb-0' : ''}>
        {sections.map((section) => {
          switch (section._type) {
            case 'lpHeroSection':
              return <LandingHeroSection key={section._key} section={section} cta={cta} />
            case 'lpLogoSection':
              return <LandingLogoSection key={section._key} section={section} />
            case 'lpProblemSection':
              return <LandingProblemSection key={section._key} section={section} />
            case 'lpSystemSection':
              return <LandingSystemSection key={section._key} section={section} />
            case 'lpDeliverableSection':
              return <LandingDeliverableSection key={section._key} section={section} />
            case 'lpProcessSection':
              return <LandingProcessSection key={section._key} section={section} />
            case 'lpMeasurementSection':
              return <LandingMeasurementSection key={section._key} section={section} />
            case 'lpProofSection':
              return <LandingProofSection key={section._key} section={section} />
            case 'lpCtaSection':
            case 'lpFinalCtaSection':
              return <LandingCtaSection key={section._key} section={section} cta={cta} />
            case 'lpPricingSection':
              return <LandingPricingSection key={section._key} section={section} />
            case 'lpFitSection':
              return <LandingFitSection key={section._key} section={section} />
            case 'lpTeamSection':
              return <LandingTeamSection key={section._key} section={section} />
            case 'lpFaqSection':
              return <LandingFaqSection key={section._key} section={section} />
            default:
              return null
          }
        })}
      </div>
      {sticky && <LandingStickyCta label={cta.label} href={cta.href} />}
    </>
  )
}
