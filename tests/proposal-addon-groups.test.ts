import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {previewProposal} from '@/components/proposalPreview'
import {
  categoryLabel,
  groupAddOnChoices,
  groupAddOnChoiceSections,
  groupByCategory,
} from '@/lib/proposal/addOnGroups'

const WEBSITE = 'Website add-ons'
const GROWTH = 'Growth add-ons'
const FALLBACK = 'Add-ons'

type Row = {
  id: string
  name: string
  group: string | null
  category: string | null
}

function row(id: string, category: string | null, group: string | null = null, name = id): Row {
  return {id, name, group, category}
}

test('blank category text stays one ungrouped block', () => {
  const items = [row('a', null), row('b', ''), row('c', '   ')]
  assert.equal(
    groupByCategory(items, (item) => item.category, FALLBACK),
    null,
  )
  assert.equal(categoryLabel('   '), null)
  assert.equal(categoryLabel(null), null)
  assert.equal(categoryLabel(undefined), null)

  const sections = groupAddOnChoiceSections(items, (item) => item.category, FALLBACK)
  assert.equal(sections.length, 1)
  assert.equal(sections[0]?.label, null)
  assert.deepEqual(sections[0]?.blocks, groupAddOnChoices(items))
})

test('mixed categories follow first appearance and leave blanks last', () => {
  const growthPlan = row('growth', `  ${WEBSITE}  `, null, 'Growth Plan')
  const notes = row('notes', '  ', null, 'Monthly notes')
  const video = row('video', GROWTH, null, 'Testimonial video edits')
  const show = row('show', GROWTH, 'plans', 'Show Up')
  const known = row('known', GROWTH, 'plans', 'Be Known')
  const place = row('place', GROWTH, 'plans', 'Be the Place')
  const items = [growthPlan, notes, video, show, known, place]
  const groups = groupByCategory(items, (item) => item.category, FALLBACK)

  assert.ok(groups)
  assert.deepEqual(
    groups.map((group) => group.label),
    [WEBSITE, GROWTH, FALLBACK],
  )
  assert.deepEqual(
    groups[0]?.items.map((item) => item.id),
    ['growth'],
  )
  assert.deepEqual(
    groups[1]?.items.map((item) => item.id),
    ['video', 'show', 'known', 'place'],
  )
  assert.deepEqual(
    groups[2]?.items.map((item) => item.id),
    ['notes'],
  )
})

test('when every add-on has a category there is no fallback group', () => {
  const items = [
    row('growth', WEBSITE, null, 'Growth Plan'),
    row('video', GROWTH, null, 'Testimonial video edits'),
    row('show', ` ${GROWTH} `, 'plans', 'Show Up'),
  ]
  const groups = groupByCategory(items, (item) => item.category, FALLBACK)

  assert.ok(groups)
  assert.deepEqual(
    groups.map((group) => group.label),
    [WEBSITE, GROWTH],
  )
  assert.equal(
    groups.some((group) => group.label === FALLBACK),
    false,
  )
})

test('choose-one radios stay inside a category and a lone key stays a checkbox', () => {
  const items = [
    row('growth', WEBSITE, null, 'Growth Plan'),
    row('video', GROWTH, null, 'Testimonial video edits'),
    row('show', GROWTH, 'plans', 'Show Up'),
    row('known', GROWTH, 'plans', 'Be Known'),
    row('place', GROWTH, 'plans', 'Be the Place'),
    row('solo', GROWTH, 'solo', 'Solo'),
    row('notes', null, null, 'Monthly notes'),
  ]
  const sections = groupAddOnChoiceSections(items, (item) => item.category, FALLBACK)
  const growth = sections.find((section) => section.label === GROWTH)

  assert.ok(growth)
  assert.equal(growth.blocks.length, 3)

  const [checks, radios, solo] = growth.blocks
  assert.equal(checks?.kind, 'checks')
  assert.equal(radios?.kind, 'radios')
  assert.equal(solo?.kind, 'checks')
  if (checks?.kind !== 'checks' || radios?.kind !== 'radios' || solo?.kind !== 'checks') return

  assert.deepEqual(
    checks.items.map((item) => item.name),
    ['Testimonial video edits'],
  )
  assert.equal(radios.group, 'plans')
  assert.deepEqual(
    radios.items.map((item) => item.name),
    ['Show Up', 'Be Known', 'Be the Place'],
  )
  assert.deepEqual([...radios.ids], ['show', 'known', 'place'])
  assert.deepEqual(
    solo.items.map((item) => item.id),
    ['solo'],
  )

  const website = sections.find((section) => section.label === WEBSITE)
  assert.equal(website?.blocks.length, 1)
  assert.equal(website?.blocks[0]?.kind, 'checks')
})

test('with no categories a choose-one group is unchanged', () => {
  const items = [
    row('video', null),
    row('show', '   ', 'plans'),
    row('known', null, 'plans'),
    row('notes', ''),
  ]
  const sections = groupAddOnChoiceSections(items, (item) => item.category, FALLBACK)
  const blocks = groupAddOnChoices(items)

  assert.equal(sections.length, 1)
  assert.equal(sections[0]?.label, null)
  assert.deepEqual(sections[0]?.blocks, blocks)
  assert.equal(blocks[0]?.kind, 'checks')
  assert.equal(blocks[1]?.kind, 'radios')
  if (blocks[1]?.kind !== 'radios') return
  assert.deepEqual(
    blocks[1].items.map((item) => item.id),
    ['show', 'known'],
  )
  assert.equal(blocks[2]?.kind, 'checks')
})

test('grouped preview fixture keeps the sample prices and one uncategorized add-on', () => {
  const grouped = previewProposal(undefined, {groupAddOns: true}).addOns ?? []
  const allowed = new Set([900, 500, 1500, 2000, 2500])

  assert.deepEqual(
    grouped.map((addOn) => addOn.name),
    [
      'Growth Plan',
      'Testimonial video edits',
      'Show Up',
      'Be Known',
      'Be the Place',
      'Monthly notes',
    ],
  )
  assert.deepEqual(
    grouped.map((addOn) => addOn.category),
    [WEBSITE, GROWTH, GROWTH, GROWTH, GROWTH, null],
  )
  for (const addOn of grouped) {
    assert.equal(typeof addOn.amount, 'number')
    assert.equal(allowed.has(addOn.amount ?? -1), true)
  }

  const choices = grouped.flatMap((addOn) => {
    if (!addOn._id || !addOn.name) return []
    return [
      {
        id: addOn._id,
        name: addOn.name,
        group: addOn.chooseOneGroup ?? null,
        category: addOn.category ?? null,
      },
    ]
  })
  const sections = groupAddOnChoiceSections(choices, (item) => item.category, FALLBACK)
  const growth = sections.find((section) => section.label === GROWTH)
  const radios = growth?.blocks.find((block) => block.kind === 'radios')
  const checks = growth?.blocks.find((block) => block.kind === 'checks')

  assert.deepEqual(
    sections.map((section) => section.label),
    [WEBSITE, GROWTH, FALLBACK],
  )
  assert.equal(checks?.kind, 'checks')
  assert.equal(radios?.kind, 'radios')
  if (checks?.kind !== 'checks' || radios?.kind !== 'radios') return
  assert.deepEqual(
    checks.items.map((item) => item.name),
    ['Testimonial video edits'],
  )
  assert.deepEqual(
    radios.items.map((item) => item.name),
    ['Show Up', 'Be Known', 'Be the Place'],
  )
  assert.deepEqual(
    sections[2]?.blocks.flatMap((block) => block.items.map((item) => item.name)),
    ['Monthly notes'],
  )

  const plain = previewProposal().addOns ?? []
  assert.equal(
    plain.every((addOn) => addOn.category == null),
    true,
  )
  assert.equal(
    groupByCategory(plain, (addOn) => addOn.category, FALLBACK),
    null,
  )
})

test('grouping code does not name a category', () => {
  const files = [
    'lib/proposal/addOnGroups.ts',
    'components/ProposalPackages.tsx',
    'components/ProposalChoices.tsx',
    'components/ProposalPage.tsx',
  ]
  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    assert.equal(source.includes(WEBSITE), false, file)
    assert.equal(source.includes(GROWTH), false, file)
    assert.equal(source.includes('Social and marketing add-ons'), false, file)
  }
})
