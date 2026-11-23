'use client'

import {EASE, gsap, prefersReducedMotion} from '@/components/motion/gsap'
import {proposalChoiceHref, useProposalSelection} from '@/components/ProposalSelection'
import {formatCents, monthlyBillingSentence} from '@/lib/proposal/quote'
import {useGSAP} from '@gsap/react'
import {useRef, useState, type MouseEvent} from 'react'

type PackageChoice = {
  id: string
  name: string
  price: string
  sale: string | null
}

type AddOnChoice = {
  id: string
  name: string
  price: string
  /** Set only when this proposal has two or more add-ons with the same key. */
  group: string | null
}

const rowClass =
  'flex items-center justify-between gap-4 rounded-[20px] border border-white/70 bg-[rgba(228,228,228,0.72)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-[24px]'

/**
 * Package and add-on rows with the running total. The total is the quote
 * on the shared selection, the same one the pay label, the statement, and
 * the posted form use.
 */
export function ProposalChoices({
  packages,
  addOns,
}: {
  packages: PackageChoice[]
  addOns: AddOnChoice[]
}) {
  const {token, kickoff, inputs, selection, quote, choose, readSelection} = useProposalSelection()
  const {packageId, addonIds} = selection
  const totalCents = quote?.totalCents ?? 0
  const firstStep = quote && quote.steps.length > 1 ? quote.steps[0] : null
  const monthlyLine = monthlyBillingSentence(quote?.monthly ?? [])
  const addOnBlocks = groupAddOnChoices(addOns)

  function chooseGroup(group: string, nextId: string | null) {
    const current = readSelection()
    const members = new Set(addOns.filter((item) => item.group === group).map((item) => item.id))
    const without = current.addonIds.filter((id) => !members.has(id))
    choose(current.packageId, nextId ? [...without, nextId] : without)
  }

  return (
    <div className="mt-6 grid gap-5">
      <div className="grid gap-4">
        {packages.length > 0 ? (
          <fieldset>
            <legend className="w-full">
              <span className="flex w-full items-center justify-between gap-3">
                <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
                  Choose your package
                </span>
                {inputs.percent != null ? (
                  <span className="rounded-full bg-[#f08a3a] px-2.5 py-1 text-[12px] font-medium leading-none tracking-[-0.01em] text-white">
                    {inputs.percent}% off for 24 hours only
                  </span>
                ) : null}
              </span>
            </legend>
            <div className="mt-3 grid gap-3">
              {packages.map((pkg) => {
                const selected = pkg.id === packageId
                return (
                  <a
                    key={pkg.id}
                    href={proposalChoiceHref(token, pkg.id, addonIds, kickoff)}
                    aria-current={selected ? 'true' : undefined}
                    onClick={(event) => {
                      if (modifiedClick(event)) return
                      event.preventDefault()
                      choose(pkg.id, readSelection().addonIds)
                    }}
                    className={rowClass}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ease-out ${
                          selected
                            ? 'border-[#08090a] bg-[#08090a]'
                            : 'border-[#08090a]/30 bg-transparent'
                        }`}
                      >
                        <span
                          className={`size-2 rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                            selected ? 'scale-100' : 'scale-0'
                          }`}
                        />
                      </span>
                      <span className="text-[1.15rem] font-medium tracking-[-0.02em]">
                        {pkg.name}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-baseline gap-2 font-medium tracking-[-0.03em]">
                      {pkg.sale ? (
                        <>
                          <s className="text-[0.95rem] text-[#8f8f8f]">{pkg.price}</s>
                          <span>{pkg.sale}</span>
                        </>
                      ) : (
                        pkg.price
                      )}
                    </span>
                  </a>
                )
              })}
            </div>
          </fieldset>
        ) : null}

        {addOnBlocks.map((block) =>
          block.kind === 'checks' ? (
            <fieldset key={`checks-${block.items[0]?.id ?? 'addons'}`}>
              <legend className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
                Select any add-ons
              </legend>
              <div className="mt-3 grid gap-3">
                {block.items.map((addOn) => {
                  const selected = addonIds.includes(addOn.id)
                  const next = selected
                    ? addonIds.filter((id) => id !== addOn.id)
                    : [...addonIds, addOn.id]
                  return (
                    <ChoiceRow
                      key={addOn.id}
                      href={proposalChoiceHref(token, packageId, next, kickoff)}
                      selected={selected}
                      shape="check"
                      name={addOn.name}
                      price={addOn.price}
                      onSelect={() => {
                        const current = readSelection()
                        const toggled = current.addonIds.includes(addOn.id)
                          ? current.addonIds.filter((id) => id !== addOn.id)
                          : [...current.addonIds, addOn.id]
                        choose(current.packageId, toggled)
                      }}
                    />
                  )
                })}
              </div>
            </fieldset>
          ) : (
            <fieldset key={block.group} role="radiogroup">
              <legend className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
                Choose one
              </legend>
              <div className="mt-3 grid gap-3">
                <ChoiceRow
                  href={proposalChoiceHref(
                    token,
                    packageId,
                    addonIds.filter((id) => !block.ids.has(id)),
                    kickoff,
                  )}
                  selected={!block.items.some((item) => addonIds.includes(item.id))}
                  shape="radio"
                  name="None"
                  price=""
                  onSelect={() => chooseGroup(block.group, null)}
                />
                {block.items.map((addOn) => {
                  const selected = addonIds.includes(addOn.id)
                  const without = addonIds.filter((id) => !block.ids.has(id))
                  return (
                    <ChoiceRow
                      key={addOn.id}
                      href={proposalChoiceHref(token, packageId, [...without, addOn.id], kickoff)}
                      selected={selected}
                      shape="radio"
                      name={addOn.name}
                      price={addOn.price}
                      onSelect={() => chooseGroup(block.group, addOn.id)}
                    />
                  )
                })}
              </div>
            </fieldset>
          ),
        )}
      </div>

      <div className="flex justify-end pr-5">
        <div className="border-t border-[#08090a]/30 pt-3 text-right">
          <p className="flex items-end justify-end gap-4">
            <span className="pb-[1.1em] font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-[#8f8f8f]">
              Total
            </span>
            <span className="whitespace-nowrap text-[clamp(3.75rem,6vw,5rem)] font-medium leading-none tracking-[-0.06em]">
              <FlipTotal value={formatCents(totalCents)} />
            </span>
          </p>
          {firstStep ? (
            <p className="mt-2 text-[0.95rem] font-medium leading-snug text-[#5c5c5c]">
              {/* The share is read off the selected package's own split, so a
                  50/50 package and a 30/40/30 one each state their own figure
                  without a sentence anywhere that has to be kept in step. */}
              <span className="block">
                {formatCents(firstStep.amountCents)}, {formatPercent(firstStep.percent)} of the
                total, {lowerFirst(firstStep.trigger)}.
              </span>
              <span className="block">The rest is invoiced later.</span>
            </p>
          ) : null}
          {monthlyLine ? (
            <p className="mt-2 max-w-[22rem] text-[0.95rem] font-medium leading-snug text-[#5c5c5c]">
              {monthlyLine}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

type AddOnBlock =
  | {kind: 'checks'; items: AddOnChoice[]}
  | {kind: 'radios'; group: string; ids: Set<string>; items: AddOnChoice[]}

/** A group key used by only one add-on stays a checkbox. */
function groupAddOnChoices(addOns: AddOnChoice[]): AddOnBlock[] {
  const counts = new Map<string, number>()
  for (const addOn of addOns) {
    if (!addOn.group) continue
    counts.set(addOn.group, (counts.get(addOn.group) ?? 0) + 1)
  }
  const seen = new Set<string>()
  const blocks: AddOnBlock[] = []
  const checks: AddOnChoice[] = []
  const flush = () => {
    if (checks.length === 0) return
    blocks.push({kind: 'checks', items: [...checks]})
    checks.length = 0
  }
  for (const addOn of addOns) {
    const count = addOn.group ? (counts.get(addOn.group) ?? 0) : 0
    if (!addOn.group || count < 2) {
      checks.push(addOn)
      continue
    }
    flush()
    if (seen.has(addOn.group)) continue
    seen.add(addOn.group)
    const items = addOns.filter((item) => item.group === addOn.group)
    blocks.push({
      kind: 'radios',
      group: addOn.group,
      ids: new Set(items.map((item) => item.id)),
      items,
    })
  }
  flush()
  return blocks
}

function ChoiceRow({
  href,
  selected,
  shape,
  name,
  price,
  onSelect,
}: {
  href: string
  selected: boolean
  shape: 'check' | 'radio'
  name: string
  price: string
  onSelect: () => void
}) {
  return (
    <a
      href={href}
      role={shape === 'radio' ? 'radio' : undefined}
      aria-checked={shape === 'radio' ? selected : undefined}
      aria-current={shape === 'check' && selected ? 'true' : undefined}
      onClick={(event) => {
        if (modifiedClick(event)) return
        event.preventDefault()
        onSelect()
      }}
      className={rowClass}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex size-5 shrink-0 items-center justify-center border text-[11px] leading-none text-white transition-colors duration-300 ease-out ${
            shape === 'radio' ? 'rounded-full' : 'rounded-[5px]'
          } ${selected ? 'border-[#08090a] bg-[#08090a]' : 'border-[#08090a]/30 bg-transparent'}`}
        >
          <span
            className={`transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              selected ? 'scale-100' : 'scale-0'
            } ${shape === 'radio' ? 'size-2 rounded-full bg-white' : ''}`}
          >
            {shape === 'check' ? '✓' : null}
          </span>
        </span>
        <span className="text-[1.15rem] font-medium tracking-[-0.02em]">{name}</span>
      </span>
      {price ? <span className="shrink-0 font-medium tracking-[-0.03em]">{price}</span> : null}
    </a>
  )
}

function lowerFirst(value: string) {
  return `${value.charAt(0).toLowerCase()}${value.slice(1)}`
}

/** "50%" for a whole percent, "33.3%" when a split needs the decimal. */
function formatPercent(percent: number) {
  return `${Number.isInteger(percent) ? percent : Math.round(percent * 10) / 10}%`
}

function modifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}

function FlipTotal({value}: {value: string}) {
  const [frame, setFrame] = useState({value, from: value, up: true})
  if (value !== frame.value) {
    const next = Number(value.replace(/[^0-9.-]/g, '')) || 0
    const prev = Number(frame.value.replace(/[^0-9.-]/g, '')) || 0
    setFrame({value, from: frame.value, up: next >= prev})
  }

  return (
    <span className="inline tabular-nums">
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {priceSlots(frame.value, frame.from).map((slot) =>
          slot.kind === 'digit' ? (
            <FlipDigit
              key={slot.id}
              char={slot.char}
              from={slot.from}
              up={frame.up}
              delay={slot.place * 0.045}
            />
          ) : (
            <span
              key={slot.id}
              className="inline-flex h-[1.45em] items-center align-top leading-none"
            >
              {slot.char}
            </span>
          ),
        )}
      </span>
    </span>
  )
}

function FlipDigit({
  char,
  from,
  up,
  delay,
}: {
  char: string
  from: string
  up: boolean
  delay: number
}) {
  const strip = useRef<HTMLSpanElement>(null)
  const rolls = from !== char

  useGSAP(() => {
    const node = strip.current
    if (!node) return
    if (!rolls || prefersReducedMotion()) {
      gsap.set(node, {yPercent: 0})
      return
    }
    gsap.fromTo(
      node,
      {yPercent: up ? 0 : -50},
      {yPercent: up ? -50 : 0, duration: 0.55, delay, ease: EASE.outQuint, overwrite: 'auto'},
    )
  }, [char, from, up, delay, rolls])

  const top = rolls ? (up ? from || ' ' : char) : char
  const bottom = rolls ? (up ? char : from || ' ') : null

  return (
    <span className="inline-block h-[1.45em] overflow-hidden px-[0.04em] align-top leading-none">
      <span ref={strip} className="flex flex-col">
        <span className="flex h-[1.45em] items-center justify-center leading-none">{top}</span>
        {bottom != null ? (
          <span className="flex h-[1.45em] items-center justify-center leading-none">{bottom}</span>
        ) : null}
      </span>
    </span>
  )
}

/**
 * Digits and marks of a price string. Decimal prices keep their cents as
 * plain marks so a whole-dollar total and a cents total both animate.
 */
function priceSlots(value: string, from: string) {
  const [valueWhole, valueCents] = value.split('.')
  const [fromWhole] = from.split('.')
  const next = valueWhole.replace(/\D/g, '').split('')
  const prev = fromWhole.replace(/\D/g, '').split('')
  const missing = Math.max(0, next.length - prev.length)
  const aligned = [...Array<string>(missing).fill(''), ...prev].slice(-next.length)
  const slots: Array<{
    id: string
    kind: 'mark' | 'digit'
    char: string
    from: string
    place: number
  }> = []
  const symbol = value.match(/^[^\d]+/)?.[0] ?? ''
  if (symbol) slots.push({id: 'symbol', kind: 'mark', char: symbol, from: symbol, place: 0})
  next.forEach((char, index) => {
    const place = next.length - 1 - index
    if (index > 0 && (next.length - index) % 3 === 0) {
      slots.push({id: `comma-${place}`, kind: 'mark', char: ',', from: ',', place})
    }
    slots.push({
      id: `digit-${place}`,
      kind: 'digit',
      char,
      from: aligned[index] ?? '',
      place,
    })
  })
  if (valueCents) {
    slots.push({id: 'cents', kind: 'mark', char: `.${valueCents}`, from: '', place: 0})
  }
  return slots
}
