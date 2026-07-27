'use client'

import {DEFAULT_MARQUEE_CLIENTS, normalizeCtaLabel, type MarqueeClient} from '@/components/homeHero'
import {ScrambleText} from '@/components/ScrambleText'
import {isVimeoUrl, vimeoBackgroundSrc} from '@/lib/vimeo'
import type {HomePageQueryResult} from '@/sanity.types'
import {studioUrl} from '@/sanity/lib/api'
import {urlForImage} from '@/sanity/lib/utils'
import VimeoPlayer from '@vimeo/player'
import {ChevronLeft, ChevronRight, Pause, Play} from 'lucide-react'
import {AnimatePresence, motion} from 'motion/react'
import {createDataAttribute, stegaClean, toPlainText} from 'next-sanity'
import Link from 'next/link'
import {useCallback, useEffect, useRef, useState} from 'react'

type ShowcaseProject = NonNullable<NonNullable<HomePageQueryResult>['showcaseProjects']>[number]

/** Showcase project plus an optional resolved poster (Sanity cover or Vimeo oEmbed). */
export type HeroProject = ShowcaseProject & {posterUrl?: string | null}

export interface VideoHeroProps {
  projects: HeroProject[]
  /** Client roster for the bottom marquee, resolved from Sanity `client` docs. */
  marqueeClients?: MarqueeClient[]
  /** From `home.heroCtaLabel` — per-project button (e.g. Extrapolate). */
  projectCtaLabel?: string | null
  /** From the referenced `home.cta` CTA — the persistent bottom-right button label. */
  ctaLabel?: string | null
  /** From the referenced `home.cta` CTA — where the button goes. Defaults to /contact. */
  ctaHref?: string | null
  /** Home document id — enables Sanity Presentation overlays on the bottom strip. */
  homeId?: string | null
}

// Short 2-digit year for the hero tech block (e.g. "2025" → "25", "2021–22" → "22").
function shortYear(year?: string | null): string | null {
  if (!year) return null
  const digits = year.trim().slice(-2)
  return /\d{2}/.test(digits) ? digits : null
}

// --- Salt Studio CTA button ---

function GhostCTA({
  href,
  label,
  external,
  className = '',
}: {
  href: string
  label: string
  external?: boolean
  className?: string
}) {
  const baseClasses =
    'group pointer-events-auto relative inline-flex items-center overflow-hidden border border-white/40 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:border-white'

  const content = (
    <span className="inline-flex items-center gap-2">
      <ScrambleText text={label} />
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
      >
        →
      </span>
    </span>
  )

  if (external) {
    return (
      <a href={href} className={`${baseClasses} ${className}`}>
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={`${baseClasses} ${className}`}>
      {content}
    </Link>
  )
}

// --- Bottom client marquee + CTA ---

// --- Client marquee ---

const MARQUEE_CLIENT_CLASS =
  'shrink-0 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.26em] text-white/50 transition-colors duration-300 hover:text-white/85 lg:text-[13px] lg:tracking-[0.28em]'

function MarqueeClientName({client}: {client: MarqueeClient}) {
  const website = client.website?.trim()

  if (website) {
    return (
      <a
        href={website}
        target="_blank"
        rel="noopener noreferrer"
        className={`${MARQUEE_CLIENT_CLASS} cursor-pointer`}
      >
        {client.name}
      </a>
    )
  }

  return <span className={MARQUEE_CLIENT_CLASS}>{client.name}</span>
}

export function ClientStrip({
  clients,
  ctaLabel,
  ctaHref = '/contact',
  homeId,
}: {
  clients: MarqueeClient[]
  ctaLabel: string
  ctaHref?: string
  homeId?: string | null
}) {
  const groups = [0, 1]
  const homeAttribute = homeId
    ? createDataAttribute({baseUrl: studioUrl, id: homeId, type: 'home'})
    : null

  return (
    <motion.div
      initial={{opacity: 0, y: 10}}
      animate={{opacity: 1, y: 0}}
      transition={{delay: 0.5, duration: 0.5}}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden flex-col md:flex"
    >
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
      <div className="pointer-events-auto relative w-full px-6 pb-6">
        <div className="flex items-center gap-6">
          <div className="min-w-0 flex-1" data-sanity={homeAttribute?.('clientSource')}>
            <div
              className="group/marquee relative overflow-hidden"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, black 0, black 92%, transparent 100%)',
                maskImage: 'linear-gradient(to right, black 0, black 92%, transparent 100%)',
              }}
            >
              <div className="flex w-max items-center animate-[client-marquee_80s_linear_infinite] group-hover/marquee:[animation-play-state:paused]">
                {groups.map((dup) => (
                  <div
                    key={dup}
                    aria-hidden={dup === 1}
                    className="flex shrink-0 items-center gap-12 pr-12"
                  >
                    {clients.map((client) => (
                      <MarqueeClientName
                        key={`${dup}-${client.id ?? client.name}`}
                        client={client}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="shrink-0" data-sanity={homeAttribute?.('cta')}>
            <GhostCTA href={ctaHref} label={ctaLabel} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function MobileCTA({
  label,
  href = '/contact',
  homeId,
}: {
  label: string
  href?: string
  homeId?: string | null
}) {
  const homeAttribute = homeId
    ? createDataAttribute({baseUrl: studioUrl, id: homeId, type: 'home'})
    : null

  return (
    <motion.div
      initial={{opacity: 0, y: 10}}
      animate={{opacity: 1, y: 0}}
      transition={{delay: 0.5, duration: 0.5}}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-center justify-center px-5 py-5 md:hidden"
      data-sanity={homeAttribute?.('cta')}
    >
      <GhostCTA href={href} label={label} />
    </motion.div>
  )
}

function ProjectInfo({project, projectCtaLabel}: {project: HeroProject; projectCtaLabel: string}) {
  const overviewText = project.overview ? toPlainText(project.overview as any) : ''
  const year = shortYear(project.year)
  const techRows: {label: string; value: string; path: string}[] = []
  if (project.camera) techRows.push({label: 'Camera', value: project.camera, path: 'cameras'})
  if (project.lens) techRows.push({label: 'Lens', value: project.lens, path: 'lenses'})
  if (project.lighting) techRows.push({label: 'Light', value: project.lighting, path: 'lighting'})

  const dataAttribute =
    project._id && project._type
      ? createDataAttribute({
          baseUrl: studioUrl,
          id: project._id,
          type: project._type,
        })
      : null

  return (
    <>
      {/*
        Copy order (website copy § system / homepage hero):
        Title → description → Camera/Lens/Light + /YY → Extrapolate
      */}
      <motion.div
        key={project._key}
        initial={{x: -20, opacity: 0}}
        animate={{x: 0, opacity: 1}}
        transition={{delay: 0.35, duration: 0.5}}
        className="absolute left-6 top-1/2 z-20 hidden max-w-[20rem] -translate-y-1/2 md:block"
      >
        {project.title && (
          <h1
            data-sanity={dataAttribute?.('title')}
            className="font-sans text-4xl font-bold uppercase leading-[0.95] tracking-tight text-white lg:text-5xl"
          >
            {project.title}
          </h1>
        )}

        {overviewText && (
          <p
            data-sanity={dataAttribute?.('overview')}
            className="mt-4 max-w-[16rem] font-mono text-[11px] uppercase leading-[1.7] tracking-[0.08em] text-white/70"
          >
            {overviewText}
          </p>
        )}

        {(techRows.length > 0 || year) && (
          <dl className="mt-5 space-y-1.5">
            {techRows.map((row, index) => {
              const isLast = index === techRows.length - 1
              return (
                <div key={row.label} className="grid grid-cols-[4rem_1fr] gap-3">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                    {row.label}
                  </dt>
                  <dd className="flex items-baseline gap-5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/80">
                    <span data-sanity={dataAttribute?.(row.path)}>{row.value}</span>
                    {isLast && year ? (
                      <span data-sanity={dataAttribute?.('year')} className="text-white/90">
                        /{year}
                      </span>
                    ) : null}
                  </dd>
                </div>
              )
            })}
            {techRows.length === 0 && year ? (
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/90">
                <span data-sanity={dataAttribute?.('year')}>/{year}</span>
              </div>
            ) : null}
          </dl>
        )}

        {project.slug && (
          <GhostCTA href={`/projects/${project.slug}`} label={projectCtaLabel} className="mt-5" />
        )}
      </motion.div>
    </>
  )
}

function ProgressBar({progress}: {progress: number}) {
  return (
    <div className="relative h-[2px] rounded-full bg-white/20">
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-linear"
        style={{
          width: `${progress}%`,
          background:
            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,1) 100%)',
        }}
      />
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-300 ease-linear"
        style={{left: `${progress}%`}}
      >
        <div className="h-[8px] w-[8px] rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
      </div>
    </div>
  )
}

function VideoControls({
  currentIndex,
  totalVideos,
  title,
  projectSlug,
  progress,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
}: {
  currentIndex: number
  totalVideos: number
  title: string
  projectSlug?: string | null
  progress: number
  isPlaying: boolean
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const counterLabel = `${String(currentIndex + 1).padStart(2, '0')} - ${String(totalVideos).padStart(2, '0')}`
  const titleClasses =
    'truncate font-mono text-[11px] uppercase tracking-[0.15em] text-white/90 transition-colors hover:text-white'
  const mobileTitleClasses =
    'truncate font-mono text-[13px] uppercase tracking-[0.15em] text-white/90 transition-colors hover:text-white'
  return (
    <>
      {/* Desktop */}
      <motion.div
        initial={{x: 30, opacity: 0}}
        animate={{x: 0, opacity: 1}}
        transition={{delay: 0.4, duration: 0.5}}
        className="absolute right-6 top-1/2 z-30 hidden w-56 -translate-y-1/2 md:block lg:w-64"
      >
        <div className="mb-3 flex items-baseline gap-4">
          <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-white">
            {String(currentIndex + 1).padStart(2, '0')} - {String(totalVideos).padStart(2, '0')}
          </span>
          <span className="truncate font-mono text-[11px] uppercase tracking-[0.15em] text-white/90">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="flex h-4 w-4 shrink-0 items-center justify-center text-white transition-opacity hover:opacity-70"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
            )}
          </button>
          <div className="flex-1">
            <ProgressBar progress={progress} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onPrev}
              className="flex h-4 w-4 items-center justify-center text-white transition-opacity hover:opacity-70"
              aria-label="Previous video"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={onNext}
              className="flex h-4 w-4 items-center justify-center text-white transition-opacity hover:opacity-70"
              aria-label="Next video"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile */}
      <motion.div
        initial={{y: 30, opacity: 0}}
        animate={{y: 0, opacity: 1}}
        transition={{delay: 0.4, duration: 0.5}}
        className="pointer-events-none absolute bottom-20 left-5 right-5 z-30 md:hidden"
      >
        <div className="pointer-events-auto mb-4 flex items-baseline justify-center gap-4">
          <span className="shrink-0 font-mono text-[13px] font-bold tracking-[0.12em] text-white">
            {counterLabel}
          </span>
          {projectSlug ? (
            <Link href={`/projects/${projectSlug}`} className={mobileTitleClasses}>
              {title}
            </Link>
          ) : (
            <span className={mobileTitleClasses}>{title}</span>
          )}
        </div>
        <div className="pointer-events-auto flex items-center justify-center gap-4">
          <button
            onClick={onTogglePlay}
            className="flex h-4 w-4 shrink-0 items-center justify-center text-white"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <Pause className="h-3 w-3 fill-current" strokeWidth={0} />
            ) : (
              <Play className="h-3 w-3 fill-current" strokeWidth={0} />
            )}
          </button>
          <div className="w-48">
            <ProgressBar progress={progress} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onPrev}
              className="flex h-4 w-4 items-center justify-center text-white"
              aria-label="Previous video"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={onNext}
              className="flex h-4 w-4 items-center justify-center text-white"
              aria-label="Next video"
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// --- Vimeo embed ---

function VimeoEmbed({
  url,
  posterUrl,
  onTimeUpdate,
  onEnded,
  playerRef,
}: {
  url: string
  posterUrl?: string | null
  onTimeUpdate: (progress: number) => void
  onEnded: () => void
  playerRef: React.MutableRefObject<VimeoPlayer | null>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onTimeUpdateRef = useRef(onTimeUpdate)
  const onEndedRef = useRef(onEnded)
  const hasAdvancedRef = useRef(false)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)

  const src = vimeoBackgroundSrc(url)

  onTimeUpdateRef.current = onTimeUpdate
  onEndedRef.current = onEnded

  useEffect(() => {
    setIsPlayingVideo(false)
    hasAdvancedRef.current = false
    if (!containerRef.current || !src) return

    // Own the iframe in the effect so VimeoPlayer.destroy() can't yank a
    // React-managed node out of the tree (breaks Strict Mode remounts).
    const iframe = document.createElement('iframe')
    iframe.src = src
    iframe.title = 'Project video'
    iframe.allow = 'autoplay; fullscreen; picture-in-picture'
    iframe.style.cssText =
      'position:absolute;top:50%;left:50%;width:100vw;height:100vh;' +
      'min-width:177.78vh;min-height:56.25vw;transform:translate(-50%,-50%);' +
      'border:none;pointer-events:none;'
    containerRef.current.appendChild(iframe)

    const player = new VimeoPlayer(iframe)
    playerRef.current = player

    let lastSeconds = 0
    const markPlaying = () => setIsPlayingVideo(true)

    player.on('playing', markPlaying)
    player.on('timeupdate', (data: {percent: number; seconds: number; duration: number}) => {
      if (data.percent > 0 || data.seconds > 0) setIsPlayingVideo(true)
      onTimeUpdateRef.current(data.percent * 100)

      if (hasAdvancedRef.current) return

      if (data.duration > 0 && data.duration - data.seconds < 3) {
        hasAdvancedRef.current = true
        onEndedRef.current()
        return
      }

      if (lastSeconds > 5 && data.seconds < lastSeconds - 5) {
        hasAdvancedRef.current = true
        onEndedRef.current()
        return
      }

      lastSeconds = data.seconds
    })

    player
      .ready()
      .then(() => player.play().catch(() => {}))
      .catch(() => {})

    return () => {
      player.off('playing', markPlaying)
      player.destroy()
      iframe.remove()
      playerRef.current = null
    }
  }, [src, playerRef])

  if (!src) return null

  return (
    <div className="absolute inset-0 overflow-hidden">
      {posterUrl ? (
        <img
          src={posterUrl}
          alt=""
          decoding="async"
          fetchPriority="high"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            isPlayingVideo ? 'opacity-0' : 'opacity-100'
          }`}
        />
      ) : null}
      <div
        ref={containerRef}
        className={`absolute inset-0 transition-opacity duration-500 ${
          isPlayingVideo ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

// --- Main component ---

export function VideoHero({
  projects,
  marqueeClients,
  projectCtaLabel,
  ctaLabel,
  ctaHref = '/contact',
  homeId,
}: VideoHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const vimeoPlayerRef = useRef<VimeoPlayer | null>(null)

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  const currentProject = projects[currentIndex]
  const currentIsVimeo = currentProject?.videoUrl ? isVimeoUrl(currentProject.videoUrl) : false

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1))
    setProgress(0)
    setIsPlaying(true)
  }, [projects.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1))
    setProgress(0)
    setIsPlaying(true)
  }, [projects.length])

  const handleNativeTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const duration = videoRef.current.duration
      if (duration) {
        setProgress((current / duration) * 100)
      }
    }
  }, [])

  const handleVimeoTimeUpdate = useCallback((percent: number) => {
    setProgress(percent)
  }, [])

  const togglePlay = useCallback(() => {
    if (currentIsVimeo && vimeoPlayerRef.current) {
      if (isPlaying) {
        vimeoPlayerRef.current.pause()
      } else {
        vimeoPlayerRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying, currentIsVimeo])

  const posterUrl =
    currentProject?.posterUrl ||
    (currentProject?.coverImage
      ? urlForImage(currentProject.coverImage as any)
          ?.width(1920)
          .height(1080)
          .url()
      : undefined)

  const nextIndex = currentIndex === projects.length - 1 ? 0 : currentIndex + 1
  const nextVideoUrl = projects.length > 1 ? projects[nextIndex]?.videoUrl : null
  const nextPosterUrl = projects.length > 1 ? projects[nextIndex]?.posterUrl : null

  // Warm the next slide during idle time without autoplaying a competing stream.
  useEffect(() => {
    if (!nextVideoUrl || !isVimeoUrl(nextVideoUrl)) return
    const src = vimeoBackgroundSrc(nextVideoUrl)
    if (!src) return

    let cancelled = false
    let iframe: HTMLIFrameElement | null = null
    const warm = () => {
      if (cancelled) return
      iframe = document.createElement('iframe')
      iframe.src = src.replace('autoplay=1', 'autoplay=0')
      iframe.setAttribute('aria-hidden', 'true')
      iframe.tabIndex = -1
      iframe.style.cssText =
        'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:0;top:0'
      document.body.appendChild(iframe)
    }

    const ric = window.requestIdleCallback?.(warm, {timeout: 2500})
    const timeout = ric == null ? window.setTimeout(warm, 1200) : null

    return () => {
      cancelled = true
      if (ric != null) window.cancelIdleCallback?.(ric)
      if (timeout != null) window.clearTimeout(timeout)
      iframe?.remove()
    }
  }, [nextVideoUrl, currentIndex])

  const roster = marqueeClients?.length ? marqueeClients : DEFAULT_MARQUEE_CLIENTS
  const bottomCtaLabel = normalizeCtaLabel(ctaLabel)
  const activeProjectCtaLabel =
    stegaClean(projectCtaLabel || '')
      ?.replace(/[→\s]+$/, '')
      .trim() || 'Extrapolate'

  if (!projects.length) return null

  return (
    <section className="fixed inset-0 z-40 overflow-hidden bg-[#1a1a1a]">
      <link rel="preconnect" href="https://player.vimeo.com" />
      <link rel="preconnect" href="https://i.vimeocdn.com" />
      <link rel="preconnect" href="https://f.vimeocdn.com" />
      {posterUrl ? <link rel="preload" as="image" href={posterUrl} /> : null}
      {nextPosterUrl ? <link rel="prefetch" as="image" href={nextPosterUrl} /> : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentProject._key}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.35}}
          className="absolute inset-0"
        >
          {currentProject.videoUrl && isVimeoUrl(currentProject.videoUrl) ? (
            <VimeoEmbed
              url={currentProject.videoUrl}
              posterUrl={posterUrl}
              onTimeUpdate={handleVimeoTimeUpdate}
              onEnded={handleNext}
              playerRef={vimeoPlayerRef}
            />
          ) : currentProject.videoUrl ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop={false}
              playsInline
              preload="auto"
              onTimeUpdate={handleNativeTimeUpdate}
              onEnded={handleNext}
              className="absolute inset-0 h-full w-full object-cover"
              poster={posterUrl || undefined}
            >
              <source src={currentProject.videoUrl} type="video/mp4" />
            </video>
          ) : posterUrl ? (
            <img
              src={posterUrl}
              alt={currentProject.title || ''}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-black/50 mix-blend-multiply" />

      <ProjectInfo project={currentProject} projectCtaLabel={activeProjectCtaLabel} />

      <VideoControls
        currentIndex={currentIndex}
        totalVideos={projects.length}
        title={currentProject.title || 'Untitled'}
        projectSlug={currentProject.slug}
        progress={progress}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <ClientStrip
        clients={roster}
        ctaLabel={bottomCtaLabel}
        ctaHref={ctaHref ?? '/contact'}
        homeId={homeId}
      />
      <MobileCTA label={bottomCtaLabel} href={ctaHref ?? '/contact'} homeId={homeId} />
    </section>
  )
}
