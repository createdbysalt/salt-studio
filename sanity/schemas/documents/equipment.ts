import {
  BulbOutlineIcon,
  ColorWheelIcon,
  ImageIcon,
  MasterDetailIcon,
  WrenchIcon,
} from '@sanity/icons'
import type {ComponentType} from 'react'
import {defineField, defineType} from 'sanity'

/**
 * Equipment — controlled gear vocabulary referenced from projects.
 *
 * Three separate document types (Cameras, Lenses, Lights) share one shape.
 * Each item is typed once here, then referenced on projects so the CSV drift
 * (FUJI GFX 100 II vs FUJI GFX 100, DJI IINSPIRE, etc.) can't reappear.
 */
function equipmentType(name: string, title: string, icon: ComponentType, example: string) {
  return defineType({
    name,
    title,
    type: 'document',
    icon,
    fields: [
      defineField({
        name: 'name',
        title: 'Name',
        type: 'string',
        description: `The gear name as it appears on project pages (e.g. "${example}").`,
        validation: (rule) => rule.required().error('Name is required'),
      }),
      defineField({
        name: 'manufacturer',
        title: 'Manufacturer',
        type: 'string',
        description: 'Optional — the maker (e.g. "Red", "Fuji", "Aputure"). Used for grouping.',
      }),
      defineField({
        name: 'slug',
        title: 'URL slug',
        type: 'slug',
        description: 'Optional. Auto-generated from the name.',
        options: {source: 'name', maxLength: 96},
      }),
    ],
    orderings: [{title: 'Name', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]}],
    preview: {
      select: {title: 'name', subtitle: 'manufacturer'},
      prepare({title, subtitle}) {
        return {title: title || 'Untitled', subtitle: subtitle || undefined}
      },
    },
  })
}

export const camera = equipmentType('camera', 'Camera', ImageIcon, 'Red V-Raptor')
export const lens = equipmentType('lens', 'Lens', ColorWheelIcon, 'Leica Summilux')
export const light = equipmentType('light', 'Light', BulbOutlineIcon, 'Aputure LED')
export const rigging = equipmentType('rigging', 'Rigging', WrenchIcon, 'Bolt Motion Control')
export const artDepartment = equipmentType(
  'artDepartment',
  'Art Department',
  MasterDetailIcon,
  'Large Format LED Wall',
)
