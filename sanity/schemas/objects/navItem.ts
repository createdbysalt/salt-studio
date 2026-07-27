import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * The set of document types a nav link may point to. resolveHref() in
 * sanity/lib/utils.ts knows how to turn each of these into a URL, so keep the
 * two in sync when adding a new linkable page type.
 */
const NAV_LINK_TARGETS = [
  {type: 'home'},
  {type: 'workPage'},
  {type: 'servicesPage'},
  {type: 'aboutPage'},
  {type: 'contactPage'},
  {type: 'workCategory'},
  {type: 'page'},
  {type: 'project'},
  {type: 'legalPage'},
]

const labelField = defineField({
  name: 'label',
  title: 'Label',
  type: 'string',
  description: 'The text shown in the nav. Leave blank to use the linked page’s own title.',
})

const linkField = defineField({
  name: 'link',
  title: 'Links to',
  type: 'reference',
  to: NAV_LINK_TARGETS,
  description: 'The page this nav item opens.',
  validation: (rule) => rule.required().error('Every nav item needs a destination page.'),
})

/** A single link inside a dropdown. No further nesting. */
export const navChild = defineType({
  name: 'navChild',
  title: 'Dropdown link',
  type: 'object',
  fields: [labelField, linkField],
  preview: {
    select: {label: 'label', type: 'link._type', slug: 'link.slug.current'},
    prepare({label, type, slug}) {
      return {
        title: label || '(uses page title)',
        subtitle: slug ? `${type} · ${slug}` : type,
      }
    },
  },
})

/**
 * A top-level nav item. Always links somewhere itself; add `children` to turn
 * it into a hover dropdown.
 */
export const navItem = defineType({
  name: 'navItem',
  title: 'Nav item',
  type: 'object',
  fields: [
    labelField,
    linkField,
    defineField({
      name: 'children',
      title: 'Dropdown links',
      type: 'array',
      description:
        'Optional. Add links here to turn this item into a hover dropdown. The parent link above still navigates on click (usually the first child page).',
      of: [defineArrayMember({type: 'navChild'})],
    }),
  ],
  preview: {
    select: {
      label: 'label',
      type: 'link._type',
      slug: 'link.slug.current',
      firstChild: 'children.0.label',
    },
    prepare({label, type, slug, firstChild}) {
      return {
        title: label || '(uses page title)',
        subtitle: firstChild ? 'Dropdown' : slug ? `${type} · ${slug}` : type,
      }
    },
  },
})
