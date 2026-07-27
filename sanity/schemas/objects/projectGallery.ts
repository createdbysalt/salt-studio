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
      description: 'Still for this gallery cell.',
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
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'Vimeo page URL (e.g. https://vimeo.com/123) or a direct HTTPS MP4 link.',
      validation: (rule) =>
        rule
          .required()
          .error('Add a video URL')
          .uri({allowRelative: false, scheme: ['https']})
          .warning('Use an HTTPS video URL'),
    }),
    defineField({
      name: 'poster',
      title: 'Poster image',
      type: 'image',
      description: 'Optional still shown before the video plays. Recommended for MP4s.',
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
    select: {url: 'videoUrl', caption: 'caption', media: 'poster'},
    prepare({url, caption, media}) {
      return {
        title: caption || url || 'Video',
        subtitle: 'Video',
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
