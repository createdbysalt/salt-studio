import {ImageIcon, InlineIcon, PlayIcon, SquareIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

/** Single photo cell in a project gallery row. */
export const projectGalleryPhoto = defineType({
  name: 'projectGalleryPhoto',
  title: 'Photo',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      description:
        'Still for the project page gallery. Use high-res — 2400px wide or larger (16:9 works best).',
      options: {
        hotspot: true,
        accept: 'image/png,image/jpeg,image/webp,image/gif',
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Describe the image for screen readers.',
          validation: (rule) => rule.warning('Alt text improves accessibility and SEO'),
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Optional caption shown on the image.',
        }),
      ],
      validation: (rule) => rule.required().error('Add a photo'),
    }),
  ],
  preview: {
    select: {media: 'image', caption: 'image.caption', alt: 'image.alt'},
    prepare({media, caption, alt}) {
      return {
        title: caption || alt || 'Photo',
        subtitle: 'Photo',
        media,
      }
    },
  },
})

/** Single video cell in a project gallery row. */
export const projectGalleryVideo = defineType({
  name: 'projectGalleryVideo',
  title: 'Video',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'source',
      title: 'Video source',
      type: 'string',
      description: 'Upload a file, or paste a YouTube / Vimeo / MP4 link.',
      options: {
        list: [
          {title: 'Upload', value: 'upload'},
          {title: 'YouTube', value: 'youtube'},
          {title: 'Link (Vimeo / MP4)', value: 'link'},
        ],
        layout: 'radio',
      },
      initialValue: 'youtube',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as
            | {
                videoUrl?: string
                videoFile?: {_type?: string}
              }
            | undefined
          // Legacy cells may only have a URL — don't block publish until re-saved.
          if (!value && (parent?.videoUrl || parent?.videoFile)) return true
          if (!value) return 'Pick where this video comes from'
          return true
        }),
    }),
    defineField({
      name: 'videoFile',
      title: 'Video file',
      type: 'file',
      description:
        'Upload an MP4 (preferred), WebM, or MOV. Use a high-res file — 1080p or higher.',
      options: {
        accept: 'video/mp4,video/webm,video/quicktime',
      },
      hidden: ({parent}) => (parent?.source ?? 'link') !== 'upload',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {source?: string} | undefined
          if (parent?.source === 'upload' && !value) {
            return 'Upload a video file'
          }
          return true
        }),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description:
        'YouTube: watch / youtu.be link. Link source: Vimeo page URL or a direct HTTPS MP4.',
      hidden: ({parent}) => parent?.source === 'upload',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as
            | {
                source?: string
                videoFile?: {_type?: string}
              }
            | undefined
          const source = parent?.source ?? (value ? 'link' : undefined)
          if (source === 'upload') return true
          if (!value) {
            if (parent?.videoFile) return true
            return source === 'youtube' ? 'Add a YouTube URL' : 'Add a video URL'
          }
          try {
            const parsed = new URL(value)
            if (parsed.protocol !== 'https:') return 'Use an HTTPS video URL'
            if (source === 'youtube') {
              const host = parsed.hostname.replace(/^www\./, '')
              if (
                host !== 'youtube.com' &&
                host !== 'm.youtube.com' &&
                host !== 'youtu.be' &&
                host !== 'youtube-nocookie.com'
              ) {
                return 'Use a YouTube URL (youtube.com or youtu.be)'
              }
            }
          } catch {
            return 'Enter a valid URL'
          }
          return true
        }),
    }),
    defineField({
      name: 'poster',
      title: 'Poster image',
      type: 'image',
      description: 'Optional still shown before the video plays. Recommended for uploads and MP4s.',
      options: {
        hotspot: true,
        accept: 'image/png,image/jpeg,image/webp,image/gif',
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        }),
      ],
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption under / on the video.',
    }),
  ],
  preview: {
    select: {
      source: 'source',
      url: 'videoUrl',
      caption: 'caption',
      media: 'poster',
      filename: 'videoFile.asset.originalFilename',
    },
    prepare({source, url, caption, media, filename}) {
      const subtitle =
        source === 'upload'
          ? `Video · Upload${filename ? ` · ${filename}` : ''}`
          : source === 'youtube'
            ? 'Video · YouTube'
            : 'Video · Link'
      return {
        title: caption || filename || url || 'Video',
        subtitle,
        media: media || PlayIcon,
      }
    },
  },
})

const mediaMembers = [
  defineArrayMember({type: 'projectGalleryPhoto', title: 'Photo'}),
  defineArrayMember({type: 'projectGalleryVideo', title: 'Video'}),
]

/** Full-width gallery row — one photo or video. */
export const projectGalleryRowOne = defineType({
  name: 'projectGalleryRowOne',
  title: '1 column',
  type: 'object',
  icon: SquareIcon,
  fields: [
    defineField({
      name: 'items',
      title: 'Media',
      type: 'array',
      description: 'One photo or video for this full-width row.',
      of: mediaMembers,
      validation: (rule) => rule.required().min(1).max(1).error('Add exactly one photo or video'),
    }),
  ],
  preview: {
    select: {
      item0Type: 'items.0._type',
      photo: 'items.0.image',
      videoPoster: 'items.0.poster',
      videoUrl: 'items.0.videoUrl',
      caption: 'items.0.caption',
    },
    prepare({item0Type, photo, videoPoster, videoUrl, caption}) {
      const isVideo = item0Type === 'projectGalleryVideo'
      return {
        title: caption || (isVideo ? videoUrl || 'Video' : 'Photo') || '1 column',
        subtitle: isVideo ? '1 column · Video' : '1 column · Photo',
        media: isVideo ? videoPoster || PlayIcon : photo || ImageIcon,
      }
    },
  },
})

/** Split gallery row — two photos and/or videos side by side. */
export const projectGalleryRowTwo = defineType({
  name: 'projectGalleryRowTwo',
  title: '2 columns',
  type: 'object',
  icon: InlineIcon,
  fields: [
    defineField({
      name: 'items',
      title: 'Media',
      type: 'array',
      description: 'Two cells — each can be a photo or a video. Order is left → right.',
      of: mediaMembers,
      validation: (rule) =>
        rule.required().min(2).max(2).error('Add exactly two photos and/or videos'),
    }),
  ],
  preview: {
    select: {
      t0: 'items.0._type',
      t1: 'items.1._type',
      photo0: 'items.0.image',
      photo1: 'items.1.image',
    },
    prepare({t0, t1, photo0, photo1}) {
      const label = (type: string | undefined) =>
        type === 'projectGalleryVideo'
          ? 'Video'
          : type === 'projectGalleryPhoto'
            ? 'Photo'
            : 'Empty'
      return {
        title: `${label(t0)} + ${label(t1)}`,
        subtitle: '2 columns',
        media: photo0 || photo1 || InlineIcon,
      }
    },
  },
})
