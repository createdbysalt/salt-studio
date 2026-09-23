import {ContactForm} from '@/components/ContactForm'
import {ContactHero} from '@/components/ContactHero'
import type {ContactPageQueryResult} from '@/sanity.types'

type ContactData = NonNullable<ContactPageQueryResult>
type Section = NonNullable<ContactData['sections']>[number]

type ContactPageProps = {
  sections: Section[]
}

/**
 * Composes /contact — stacked on mobile/tablet, split thesis | form from lg up.
 */
export function ContactPage({sections}: ContactPageProps) {
  let headline: string | null = null
  let lead: string | null = null
  let directLine: string | null = null
  let responseLine: string | null = null
  let formSection: Extract<Section, {_type: 'contactFormSection'}> | null = null

  for (const section of sections) {
    if (section._type === 'contactHeroSection') {
      headline = section.headline ?? null
      lead = section.lead ?? null
    }
    if (section._type === 'contactDirectSection') {
      directLine = section.directContactLine ?? null
    }
    if (section._type === 'contactFooterSection') {
      responseLine = section.responseLine ?? null
    }
    if (section._type === 'contactFormSection') {
      formSection = section
    }
  }

  const form = formSection?.formConfig
  const fields = (form?.fields ?? [])
    .filter((f) => Boolean(f?.name && f?.label && f?.type))
    .map((f) => ({
      _key: f!._key,
      name: f!.name as string,
      label: f!.label as string,
      type: f!.type as 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'multiselect',
      placeholder: f!.placeholder ?? undefined,
      required: f!.required ?? undefined,
      options: f!.options ?? undefined,
    }))

  return (
    <div data-nav-surface="paper" className="overflow-x-clip bg-background text-foreground">
      {/* Horizontal inset matches Navbar (px-5 md:px-6) so columns align with logo / nav right */}
      <div className="w-full px-5 pb-14 pt-[calc(var(--project-nav-height)+2.5rem)] sm:pb-16 sm:pt-[calc(var(--project-nav-height)+3.5rem)] md:px-6 md:pb-20 md:pt-[calc(var(--project-nav-height-md)+4rem)] lg:pt-[calc(var(--project-nav-height-md)+5.5rem)]">
        <div className="grid grid-cols-1 items-start gap-10 sm:gap-12 md:gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          <ContactHero
            headline={headline}
            lead={lead}
            directLine={directLine}
            responseLine={responseLine}
          />
          {fields.length > 0 ? (
            <div className="min-w-0 w-full">
              <ContactForm
                title={form?.title ?? undefined}
                description={form?.description ?? undefined}
                fields={fields}
                submitLabel={form?.submitLabel ?? undefined}
                successHeadline={form?.successHeadline ?? undefined}
                successMessage={form?.successMessage ?? undefined}
                errorHeadline={form?.errorHeadline ?? undefined}
                errorMessage={form?.errorMessage ?? undefined}
                style={form?.style ?? undefined}
                variant="page"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
