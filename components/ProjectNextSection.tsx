import {ProjectCardMedia} from '@/components/ProjectCardMedia'
import type {WorkProjectCard} from '@/components/ProjectGrid'
import {ArrowUpRight} from 'lucide-react'
import {stegaClean} from 'next-sanity'
import Link from 'next/link'

/**
 * Glitch&Grit-style closer: oversized “Next project” masthead, three contact-sheet
 * cards with Full project →, and a centered Back to all link.
 */
export function ProjectNextSection({projects}: {projects: WorkProjectCard[]}) {
  if (projects.length === 0) return null

  return (
    <section
      aria-label="Next project"
      className="relative border-t border-foreground/10 px-5 pb-20 pt-24 md:px-6 md:pb-28 md:pt-32"
    >
      <div className="relative mx-auto w-full max-w-[100rem]">
        <h2 className="pointer-events-none text-center font-sans text-[clamp(5rem,16vw,13rem)] font-bold uppercase leading-[0.78] tracking-[-0.05em] text-foreground/90">
          Next
          <br />
          project
        </h2>

        <ul className="relative z-10 -mt-6 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 md:-mt-10 lg:grid-cols-3 lg:gap-x-5">
          {projects.map((project, position) => {
            const title = project.title ? stegaClean(project.title).trim() : 'Untitled'
            const slug = project.slug ? stegaClean(project.slug).trim() : ''
            if (!slug) return null
            const indexMark = project.indexMark ?? String(position + 1).padStart(2, '0')

            return (
              <li key={project._id}>
                <Link href={`/projects/${slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-foreground/6">
                    <ProjectCardMedia
                      title={title}
                      coverImage={project.coverImage}
                      videoUrl={project.videoUrl}
                      posterUrl={project.posterUrl}
                      playback="autoplay"
                    />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2.5 md:mt-2.5 md:gap-3">
                    <span className="shrink-0 font-sans text-[15px] font-bold tabular-nums tracking-[-0.02em] text-foreground md:text-[16px]">
                      {indexMark}
                    </span>
                    <h3 className="min-w-0 truncate font-sans text-[15px] font-bold uppercase tracking-[-0.02em] text-foreground md:text-[16px]">
                      {title}
                    </h3>
                    <span className="ml-auto inline-flex shrink-0 items-center gap-1 font-sans text-[12px] font-bold uppercase tracking-[-0.01em] text-foreground/55 transition-colors duration-300 group-hover:text-foreground md:text-[13px]">
                      Full project
                      <ArrowUpRight
                        aria-hidden
                        strokeWidth={2.75}
                        absoluteStrokeWidth
                        className="h-[15px] w-[15px] transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 md:h-[16px] md:w-[16px]"
                      />
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="mt-14 text-center md:mt-16">
          <Link
            href="/work"
            className="font-sans text-[13px] font-bold uppercase tracking-[-0.02em] text-foreground/70 transition-colors duration-300 hover:text-foreground md:text-[14px]"
          >
            ← Back to all
          </Link>
        </p>
      </div>
    </section>
  )
}
