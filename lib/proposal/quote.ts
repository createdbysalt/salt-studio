/**
 * One quote for the proposal page and for checkout.
 *
 * The page, the running total, and the server action all call the same
 * functions here, so the number on screen and the number charged are the
 * same math. Pure module: no server-only imports, so client components can
 * format with it too.
 */

export type ProposalSelection = {
  packageId: string | null
  addonIds: string[]
  kickoffDate: string | null
}

export type ProposalQuery = {
  package?: string | string[]
  addon?: string | string[]
  kickoff?: string | string[]
}

type Priced = {_id: string; amount?: number | null}

type ScheduleStep = {_key?: string | null; percent?: number | null; trigger?: string | null}

type Schedule = {name?: string | null; steps?: ScheduleStep[] | null}

/** A package may carry its own split, overriding the proposal's. */
type PricedPackage = Priced & {paymentSchedule?: Schedule | null}

/** The slice of a proposal document the quote needs. */
export type QuoteProposal = {
  status?: string | null
  validUntil?: string | null
  packages?: PricedPackage[] | null
  addOns?: Priced[] | null
  recommendedPackageId?: string | null
  kickoffOptions?: Array<{date?: string | null}> | null
  sameDayOffer?: {deadline?: string | null} | null
  paymentSchedule?: {name?: string | null; steps?: ScheduleStep[] | null} | null
  sections?: Array<{
    _type: string
    enabled?: boolean | null
    sameDayDiscount?: {enabled?: boolean | null; percent?: number | null} | null
  }> | null
}

export type QuoteStep = {
  key: string
  percent: number
  trigger: string
  amountCents: number
}

export type ProposalQuote = {
  packageId: string
  /** Full package price in cents, before any discount. */
  packageAmountCents: number
  /** Package price in cents after the same-day percent, if it applies. */
  packageDueCents: number
  /** The same-day percent that applied, or null. */
  percent: number | null
  addOns: Array<{id: string; amountCents: number}>
  /** Discounted package plus add-ons. */
  totalCents: number
  steps: QuoteStep[]
  /** The name of the split applied, the package's own or the proposal's. */
  scheduleName: string | null
  /** The first step. This is what checkout charges. */
  firstCents: number
}

const DEFAULT_STEP: QuoteStep = {key: 'full', percent: 100, trigger: 'On signing', amountCents: 0}

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function queryValues(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function isAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function mostExpensivePackageId(packages: Priced[]) {
  let bestId: string | null = null
  let best = -Infinity
  for (const pkg of packages) {
    if (!pkg._id || !isAmount(pkg.amount)) continue
    if (pkg.amount > best) {
      best = pkg.amount
      bestId = pkg._id
    }
  }
  return bestId
}

/**
 * Turns the URL (or hidden form fields) into a selection the proposal
 * actually offers. Unknown ids are dropped. No package in the query means
 * the most expensive one, then the recommended one, then the first.
 */
export function resolveProposalSelection(
  proposal: QuoteProposal,
  query: ProposalQuery,
): ProposalSelection {
  const packages = proposal.packages ?? []
  const requestedPackage = firstQueryValue(query.package)
  const packageId =
    packages.find((item) => item._id === requestedPackage)?._id ??
    mostExpensivePackageId(packages) ??
    packages.find((item) => item._id === proposal.recommendedPackageId)?._id ??
    packages[0]?._id ??
    null

  const knownAddOns = new Set((proposal.addOns ?? []).map((item) => item._id))
  const addonIds = Array.from(new Set(queryValues(query.addon).filter((id) => knownAddOns.has(id))))

  const kickoffs = proposal.kickoffOptions ?? []
  const requestedKickoff = firstQueryValue(query.kickoff)
  const kickoffDate =
    kickoffs.find((item) => item.date === requestedKickoff)?.date ?? kickoffs[0]?.date ?? null

  return {packageId, addonIds, kickoffDate}
}

/** A stable key for "the same selection", used to reuse an open session. */
export function selectionKey(selection: ProposalSelection) {
  return [selection.packageId ?? '', ...[...selection.addonIds].sort()].join('|')
}

export function proposalIsExpired(proposal: QuoteProposal, now = Date.now()) {
  if (proposal.status === 'expired') return true
  if (!proposal.validUntil) return false
  const end = new Date(proposal.validUntil)
  return !Number.isNaN(end.getTime()) && end.getTime() < now
}

export function proposalIsAccepted(proposal: QuoteProposal) {
  return proposal.status === 'signed' || proposal.status === 'paid'
}

/**
 * The same-day percent, or null when it does not apply.
 *
 * It applies only while `sameDayOffer.deadline` is still in the future by
 * the clock passed in. No deadline means no discount, even if the sticker
 * toggle is on. That is the one rule the sticker, the strikethrough, and
 * the charge all share.
 */
export function sameDayPercent(proposal: QuoteProposal, now = Date.now()): number | null {
  if (proposalIsExpired(proposal, now) || proposalIsAccepted(proposal)) return null
  const packages = (proposal.sections ?? []).find(
    (section) => section._type === 'proposalPackagesSection' && section.enabled !== false,
  )
  const discount = packages?.sameDayDiscount
  if (discount?.enabled !== true) return null
  const percent = discount.percent
  if (typeof percent !== 'number' || !Number.isInteger(percent) || percent < 1 || percent > 90) {
    return null
  }
  const deadline = proposal.sameDayOffer?.deadline
  if (!deadline) return null
  const end = new Date(deadline)
  if (Number.isNaN(end.getTime()) || end.getTime() <= now) return null
  return percent
}

/**
 * The same-day percent to use. The live clock decides for someone who has
 * not signed. A signature keeps the percent frozen on it, so the price
 * cannot climb while they were away from a payment they already agreed to.
 */
/** The parts of a signature the carry-over decision looks at. */
export type SignedRecord = {
  selection_key: string
  total_cents: number
  first_cents: number
  agreed_text_sha256: string | null
  agreed_document?: {contentSha256?: string} | null
}

/**
 * The content hash recorded on a signature, wherever it was kept.
 *
 * A frozen v3 document carries it inside the document, because that row's
 * `agreed_text_sha256` holds the hash of the document itself, which includes
 * the signer's name and the moment they signed and so differs on every visit.
 * Older rows kept the content hash in `agreed_text_sha256` directly. A v3
 * document frozen before the field existed has neither, and returning null
 * means the signature will not carry over, which is the safe direction.
 */
export function signedContentHash(signed: SignedRecord | null | undefined) {
  if (!signed) return null
  return signed.agreed_document?.contentSha256 ?? signed.agreed_text_sha256 ?? null
}

/**
 * Whether a signature is for the deal in front of us.
 *
 * Same package and add-ons, and the proposal has not been edited since. An
 * edit to the wording or the scope makes this false, so the client signs
 * again against what the proposal says now.
 */
export function sameSignedDeal(
  signed: SignedRecord | null | undefined,
  currentSelectionKey: string,
  currentContentHash: string,
) {
  if (!signed) return false
  if (signed.selection_key !== currentSelectionKey) return false
  const recorded = signedContentHash(signed)
  return recorded != null && recorded === currentContentHash
}

/**
 * Whether re-pricing today lands on the figures the client signed.
 *
 * This is the guard that protects the charge. The amount taken must never
 * come from the stored row alone; it is recomputed from the live proposal
 * and only honoured when it agrees to the cent. If a price was corrected
 * after someone signed and walked away, this is false, and they are re-priced
 * rather than charged the old number.
 */
export function matchesSignedFigures(
  frozen: {totalCents: number; firstCents: number} | null | undefined,
  signed: SignedRecord | null | undefined,
) {
  if (!frozen || !signed) return false
  return frozen.totalCents === signed.total_cents && frozen.firstCents === signed.first_cents
}

export function honoredPercent(
  live: number | null,
  signed: {same_day_percent: number | null} | null,
) {
  if (live != null) return live
  return signed?.same_day_percent ?? null
}

/** Whole dollars after the percent, rounded half up. Matches the card. */
export function discountedAmount(amount: number, percent: number | null) {
  if (percent == null) return amount
  return Math.round((amount * (100 - percent)) / 100)
}

export function toCents(amount: number) {
  return Math.round(amount * 100)
}

/**
 * Splits a total in cents across the schedule. Each step is rounded on its
 * own, and the last step is the total minus the earlier steps, so the steps
 * always sum to the total exactly.
 */
export function splitCents(totalCents: number, percents: number[]) {
  if (percents.length === 0) return []
  const steps: number[] = []
  let used = 0
  for (let index = 0; index < percents.length - 1; index++) {
    const cents = Math.round((totalCents * percents[index]) / 100)
    steps.push(cents)
    used += cents
  }
  steps.push(totalCents - used)
  return steps
}

/**
 * The steps of one schedule, or null when it cannot be used.
 *
 * Null covers an absent schedule and a broken one alike: no steps, or steps
 * that do not add up to 100. Refusing a broken schedule rather than charging
 * from it is the point. A split that sums to 90 would otherwise quietly
 * undercharge, and one that sums to 110 would overcharge.
 */
function stepsFromSchedule(schedule: Schedule | null | undefined) {
  const raw = (schedule?.steps ?? []).flatMap((step, index) => {
    const percent = step.percent
    if (typeof percent !== 'number' || !Number.isFinite(percent) || percent <= 0) return []
    return [
      {
        key: step._key || `step-${index + 1}`,
        percent,
        trigger: (step.trigger ?? '').trim() || `Payment ${index + 1}`,
      },
    ]
  })
  const total = raw.reduce((sum, step) => sum + step.percent, 0)
  if (raw.length === 0 || Math.abs(total - 100) > 0.0001) return null
  return raw
}

/** The proposal-wide split, used by any package that does not set its own. */
function scheduleSteps(proposal: QuoteProposal) {
  return stepsFromSchedule(proposal.paymentSchedule) ?? [DEFAULT_STEP]
}

/**
 * Everything the math needs, resolved once on the server with its clock.
 * Serializable, so the running total on the client runs the same function
 * on the same inputs instead of its own copy of the sum.
 */
export type QuoteInputs = {
  /**
   * `steps` on a package is its own split. Null means it follows the
   * proposal's, which is the usual case. `scheduleName` is carried so the
   * signed row can record the split that was actually applied, not the one
   * sitting on the proposal.
   */
  packages: Array<{
    id: string
    amount: number
    steps?: Array<{key: string; percent: number; trigger: string}> | null
    scheduleName?: string | null
  }>
  addOns: Array<{id: string; amount: number}>
  percent: number | null
  steps: Array<{key: string; percent: number; trigger: string}>
  scheduleName?: string | null
}

export function quoteInputs(proposal: QuoteProposal, now = Date.now()): QuoteInputs {
  return {
    packages: (proposal.packages ?? []).flatMap((pkg) => {
      if (!pkg._id || !isAmount(pkg.amount)) return []
      const own = stepsFromSchedule(pkg.paymentSchedule)
      return [
        {
          id: pkg._id,
          amount: pkg.amount,
          steps: own,
          scheduleName: own ? (pkg.paymentSchedule?.name ?? null) : null,
        },
      ]
    }),
    addOns: (proposal.addOns ?? []).flatMap((addOn) =>
      addOn._id && isAmount(addOn.amount) ? [{id: addOn._id, amount: addOn.amount}] : [],
    ),
    percent: sameDayPercent(proposal, now),
    steps: scheduleSteps(proposal).map(({key, percent, trigger}) => ({key, percent, trigger})),
    scheduleName: proposal.paymentSchedule?.name ?? null,
  }
}

/**
 * The quote for one selection. Null when the selection has no package the
 * proposal offers, or the package has no price.
 */
export function quoteSelection(
  inputs: QuoteInputs,
  selection: Pick<ProposalSelection, 'packageId' | 'addonIds'>,
): ProposalQuote | null {
  const pkg = inputs.packages.find((item) => item.id === selection.packageId)
  if (!pkg) return null

  const percent = inputs.percent
  const packageAmountCents = toCents(pkg.amount)
  const packageDueCents = toCents(discountedAmount(pkg.amount, percent))

  const known = new Map(inputs.addOns.map((item) => [item.id, item]))
  const addOns = Array.from(new Set(selection.addonIds)).flatMap((id) => {
    const addOn = known.get(id)
    return addOn ? [{id, amountCents: toCents(addOn.amount)}] : []
  })

  const totalCents = packageDueCents + addOns.reduce((sum, item) => sum + item.amountCents, 0)

  // The selected package's own split wins. Falling back to the proposal's
  // keeps every existing proposal behaving exactly as before, since a package
  // only carries a split when one was set on it.
  const own = pkg.steps && pkg.steps.length > 0 ? pkg.steps : null
  const schedule = own ?? (inputs.steps.length > 0 ? inputs.steps : [DEFAULT_STEP])
  const scheduleName = own
    ? (pkg.scheduleName ?? null)
    : inputs.steps.length > 0
      ? (inputs.scheduleName ?? null)
      : null

  const amounts = splitCents(
    totalCents,
    schedule.map((step) => step.percent),
  )
  const steps = schedule.map((step, index) => ({...step, amountCents: amounts[index] ?? 0}))

  return {
    packageId: pkg.id,
    packageAmountCents,
    packageDueCents,
    percent,
    addOns,
    totalCents,
    steps,
    scheduleName,
    firstCents: steps[0]?.amountCents ?? totalCents,
  }
}

export function quoteProposal(
  proposal: QuoteProposal,
  selection: ProposalSelection,
  now = Date.now(),
): ProposalQuote | null {
  return quoteSelection(quoteInputs(proposal, now), selection)
}

/** "$2,475" for whole dollars, "$1,486.50" otherwise. */
export function formatCents(cents: number) {
  const whole = cents % 100 === 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100)
}

/** "$5,500" from a whole-dollar amount. */
export function formatAmount(amount: number | null | undefined) {
  if (!isAmount(amount)) return ''
  return formatCents(toCents(amount))
}
