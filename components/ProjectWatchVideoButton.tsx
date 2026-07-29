'use client'

import {ProjectVideoLightbox, resolveProjectVideoSources} from '@/components/ProjectVideoLightbox'
import {useId, useState} from 'react'

type ProjectWatchVideoButtonProps = {
  title: string
  videoUrl?: string | null
  className?: string
}

/** Opens the same project film popout as the hero. */
export function ProjectWatchVideoButton({
  title,
  videoUrl,
  className,
}: ProjectWatchVideoButtonProps) {
  const dialogId = useId()
  const [open, setOpen] = useState(false)
  const {hasVideo} = resolveProjectVideoSources(videoUrl)

  if (!hasVideo) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        className={`btn-ghost ${className ?? ''}`.trim()}
      >
        Watch film →
      </button>
      <ProjectVideoLightbox
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        videoUrl={videoUrl}
        dialogId={dialogId}
      />
    </>
  )
}
