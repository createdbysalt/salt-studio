import {CapReveal, CapStagger, CapStaggerItem} from '@/components/CapabilitiesMotion'
import {resolveCrewPortraitSrc, type StudioSanityImage} from '@/components/StudioMedia'
import Image from 'next/image'

type CrewMember = {
  _id: string
  name?: string | null
  title?: string | null
  tier?: string | null
  portrait?: StudioSanityImage
  affiliation?: {name?: string | null} | null
}

type StudioCrewProps = {
  subhead?: string | null
  intro?: string | null
  crew?: CrewMember[] | null
}

function MemberCard({member, size}: {member: CrewMember; size: 'lead' | 'support'}) {
  const src = resolveCrewPortraitSrc(member._id, member.portrait)
  const alt = member.portrait?.alt?.trim() || `Portrait of ${member.name ?? 'Salt Studio team'}`

  return (
    <article className="group">
      <div
        className={`relative overflow-hidden bg-black/[0.04] transition-transform duration-500 ease-out group-hover:-translate-y-0.5 ${
          size === 'lead' ? 'aspect-[4/5]' : 'aspect-[3/4]'
        }`}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={
              size === 'lead' ? '(max-width: 768px) 50vw, 40vw' : '(max-width: 768px) 45vw, 18vw'
            }
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.18em] text-black/25">
            Portrait
          </div>
        )}
      </div>
      <div className="mt-3 sm:mt-4">
        {member.name ? (
          <h3
            className={`font-mono font-medium uppercase tracking-[0.08em] text-black transition-colors duration-300 group-hover:text-black/80 ${
              size === 'lead' ? 'text-[13px] sm:text-sm' : 'text-[11px] sm:text-[12px]'
            }`}
          >
            {member.name}
          </h3>
        ) : null}
        {member.title ? (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-black/45 transition-colors duration-300 group-hover:text-black/55 sm:text-[11px]">
            {member.title}
          </p>
        ) : null}
        {member.affiliation?.name ? (
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-black/30">
            {member.affiliation.name}
          </p>
        ) : null}
      </div>
    </article>
  )
}

/**
 * Light crew chapter — leads large on top, support row below.
 */
export function StudioCrew({subhead, intro, crew}: StudioCrewProps) {
  const members = crew ?? []
  if (!members.length && !subhead) return null

  const leads = members.filter((m) => m.tier === 'lead')
  const support = members.filter((m) => m.tier !== 'lead')
  const leadRow = leads.length ? leads : members.slice(0, 2)
  const supportRow = leads.length ? support : members.slice(2)

  return (
    <section className="border-t border-black/10 bg-background-light text-foreground-light">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20 md:px-10 md:py-24">
        <CapReveal y={12}>
          {subhead ? (
            <h2 className="font-mono text-[clamp(1.75rem,4vw,3rem)] font-medium leading-none tracking-tight text-black">
              {subhead}
            </h2>
          ) : null}
          {intro ? (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-black/50">{intro}</p>
          ) : null}
        </CapReveal>

        {leadRow.length ? (
          <div className="mt-10 md:mt-14">
            <CapReveal delay={0.06} y={8}>
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-black/35">
                Mission leads
              </p>
            </CapReveal>
            <CapStagger className="grid list-none grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {leadRow.map((member) => (
                <CapStaggerItem key={member._id}>
                  <MemberCard member={member} size="lead" />
                </CapStaggerItem>
              ))}
            </CapStagger>
          </div>
        ) : null}

        {supportRow.length ? (
          <div className="mt-12 border-t border-black/10 pt-10 md:mt-16 md:pt-12">
            <CapReveal delay={0.04} y={8}>
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-black/35">
                Support crew
              </p>
            </CapReveal>
            <CapStagger className="grid list-none grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 lg:gap-4">
              {supportRow.map((member) => (
                <CapStaggerItem key={member._id}>
                  <MemberCard member={member} size="support" />
                </CapStaggerItem>
              ))}
            </CapStagger>
          </div>
        ) : null}
      </div>
    </section>
  )
}
