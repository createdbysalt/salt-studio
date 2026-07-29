import ImageBox from '@/components/ImageBox'
import {ProjectGalleryVideoCell} from '@/components/ProjectGalleryVideoCell'
import type {ProjectBySlugQueryResult} from '@/sanity.types'
import {stegaClean} from 'next-sanity'

type Project = NonNullable<ProjectBySlugQueryResult>
type GalleryRows = NonNullable<Project['gallery']> | NonNullable<Project['btsImages']>
type GalleryRow = GalleryRows[number]
type GalleryItem = NonNullable<NonNullable<GalleryRow['items']>[number]>

type ProjectGalleryProps = {
  rows: GalleryRows
  title: string
}

function galleryItemIsVisible(item: GalleryItem | null | undefined): boolean {
  if (!item) return false
  if (item._type === 'projectGalleryPhoto') return Boolean(item.image?.asset)
  if (item._type === 'projectGalleryVideo') {
    const url = item.videoUrl ? stegaClean(item.videoUrl).trim() : ''
    return Boolean(url)
  }
  return false
}

/** True when at least one row has a real photo or video to render. */
export function galleryHasContent(rows: GalleryRows | null | undefined): boolean {
  return (rows ?? []).some((row) => (row?.items ?? []).some(galleryItemIsVisible))
}

function GalleryCell({
  item,
  title,
  aspectClass,
}: {
  item: GalleryItem
  title: string
  aspectClass: string
}) {
  if (item._type === 'projectGalleryPhoto') {
    const image = item.image
    if (!image?.asset) return null
    const alt = image.alt ? stegaClean(image.alt) : ''
    return (
      <div className={`relative overflow-hidden bg-foreground/[0.06] ${aspectClass}`}>
        <ImageBox
          image={image as never}
          alt={alt || 'Project still'}
          classesWrapper="absolute inset-0 !rounded-none bg-muted"
        />
      </div>
    )
  }

  if (item._type === 'projectGalleryVideo') {
    return (
      <ProjectGalleryVideoCell
        videoUrl={item.videoUrl}
        poster={item.poster}
        title={title}
        aspectClass={aspectClass}
      />
    )
  }

  return null
}

/** CMS-driven project gallery — 1- or 2-column rows of photos and/or videos. */
export function ProjectGallery({rows, title}: ProjectGalleryProps) {
  const visibleRows = rows.filter((row) => (row.items ?? []).some(galleryItemIsVisible))
  if (!visibleRows.length) return null

  return (
    <div className="flex flex-col gap-hairline">
      {visibleRows.map((row) => {
        const items = (row.items ?? []).filter(galleryItemIsVisible)
        if (!items.length) return null

        const isTwoCol = row._type === 'projectGalleryRowTwo'
        const aspectClass = isTwoCol ? 'aspect-[4/5] md:aspect-[16/10]' : 'aspect-[21/9]'

        return (
          <div
            key={row._key}
            className={
              isTwoCol ? 'grid grid-cols-1 gap-hairline md:grid-cols-2' : 'grid grid-cols-1'
            }
          >
            {items.map((item) => (
              <GalleryCell key={item._key} item={item} title={title} aspectClass={aspectClass} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
