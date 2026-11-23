/**
 * The pick list navigates by repeating `addon` on the query string.
 * Next.js 16.2 collapses that repeated key when it builds the segment cache
 * key (`Object.fromEntries` in ppr-navigations), so a multi-value addon list
 * and the single-value list that keeps only the last addon share one cache
 * entry. The server render never commits. This harness does the same: it
 * only hands the new selection back to the page when the collapsed key
 * changes. The total, the pay label, the statement, and the posted add-ons
 * still have to describe one selection.
 */
import assert from 'node:assert/strict'
import {mock, test} from 'node:test'
import type {ProposalStatementAddOn, ProposalStatementPackage} from '@/components/ProposalSelection'

process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= 'jkqf2ng5'
process.env.NEXT_PUBLIC_SANITY_DATASET ??= 'production'
process.env.SANITY_API_READ_TOKEN ??= 'test-token'

let replaceImpl: (url: string) => void = () => {}

mock.module('server-only', {namedExports: {}})
mock.module('next/navigation', {
  namedExports: {
    useRouter() {
      return {
        replace(url: string) {
          replaceImpl(url)
        },
        refresh() {},
        push() {},
        back() {},
        forward() {},
        prefetch() {},
      }
    },
  },
})
mock.module('@/app/(proposal)/p/[token]/actions', {
  namedExports: {
    signProposal: async () => ({ok: false, error: 'not submitted in tests'}),
  },
})

const NOW = Date.parse('2026-11-23T15:00:00.000Z')
const KICKOFF = '2026-11-17'

type Committed = {packageId: string | null; addonIds: string[]}

function collapsedKey(search: string) {
  return JSON.stringify(Object.fromEntries(new URLSearchParams(search)))
}

function searchOf(selection: Committed) {
  const params = new URLSearchParams()
  if (selection.packageId) params.set('package', selection.packageId)
  for (const id of selection.addonIds) params.append('addon', id)
  params.set('kickoff', KICKOFF)
  return params.toString()
}

test('pay label, statement, and posted add-ons follow the total after the pick-list sequence', async () => {
  const {pay, total, postedAddOns, statement} = await clickSequence([
    'Video edits',
    'Plan two',
    'Plan three',
    'None',
    'Monthly notes',
    'Video edits',
  ])

  assert.deepEqual(
    {
      total,
      pay,
      postedAddOns,
      landing: statement.includes('Landing page'),
      notes: statement.includes('Monthly notes'),
      video: statement.includes('Video edits'),
    },
    {
      total: '$4,800',
      pay: 'Pay $2,400',
      postedAddOns: ['addon-notes'],
      landing: true,
      notes: true,
      video: false,
    },
  )
})

test('selecting and clearing one add-on still updates the pay label', async () => {
  const {pay, total, postedAddOns, statement} = await clickSequence(['Video edits', 'Video edits'])

  assert.equal(total, '$4,800')
  assert.equal(pay, 'Pay $2,400')
  assert.deepEqual(postedAddOns, [])
  assert.equal(statement.includes('Landing page'), true)
  assert.equal(statement.includes('Video edits'), false)
})

async function clickSequence(names: string[]) {
  const {Window} = await import('happy-dom')
  const win = new Window({url: 'http://localhost:4000/p/preview'})
  installDom(win)

  const {act, useEffect, useRef, useState} = await import('react')
  const {createRoot} = await import('react-dom/client')
  const {previewProposal} = await import('@/components/proposalPreview')
  const {quoteInputs} = await import('@/lib/proposal/quote')
  const {ProposalChoices} = await import('@/components/ProposalChoices')
  const {ProposalSignForm} = await import('@/components/ProposalSignForm')
  const {ProposalScopePanel} = await import('@/components/ProposalScopePanel')
  const {ProposalLiveStatement, ProposalSelectionProvider} =
    await import('@/components/ProposalSelection')

  const proposal = previewProposal()
  const inputs = quoteInputs(proposal, NOW)
  const choicePackages = (proposal.packages ?? []).flatMap((pkg) => {
    if (!pkg._id || !pkg.name || typeof pkg.amount !== 'number') return []
    return [
      {id: pkg._id, name: pkg.name, price: `$${pkg.amount.toLocaleString('en-US')}`, sale: null},
    ]
  })
  const choiceAddOns = (proposal.addOns ?? []).flatMap((addOn) => {
    if (!addOn._id || !addOn.name || typeof addOn.amount !== 'number') return []
    const group = (addOn.chooseOneGroup ?? '').trim().toLowerCase() || null
    const price =
      (addOn.billingType ?? '').toLowerCase() === 'monthly'
        ? `$${addOn.amount.toLocaleString('en-US')} a month`
        : `$${addOn.amount.toLocaleString('en-US')}`
    return [{id: addOn._id, name: addOn.name, price, group}]
  })
  const statementPackages = (proposal.packages ?? []).flatMap((pkg) => {
    if (!pkg._id || !pkg.name) return []
    return [
      {
        id: pkg._id,
        name: pkg.name,
        scope: pkg.scope ?? [],
        items: pkg.includedItems ?? [],
      },
    ]
  }) as ProposalStatementPackage[]
  const statementAddOns = (proposal.addOns ?? []).flatMap((addOn) => {
    if (!addOn._id || !addOn.name) return []
    return [
      {
        id: addOn._id,
        name: addOn.name,
        scope: addOn.scope ?? [],
        line: addOn.line ?? '',
      },
    ]
  }) as ProposalStatementAddOn[]

  const container = win.document.createElement('div')
  win.document.body.appendChild(container)
  const root = createRoot(container)

  function Harness() {
    const [committed, setCommitted] = useState<Committed>({
      packageId: 'pkg-landing',
      addonIds: [],
    })
    const committedRef = useRef(committed)
    committedRef.current = committed

    useEffect(() => {
      replaceImpl = (url: string) => {
        const params = new URLSearchParams(url.split('?')[1] ?? '')
        const next = {packageId: params.get('package'), addonIds: params.getAll('addon')}
        if (collapsedKey(searchOf(committedRef.current)) === collapsedKey(params.toString())) return
        setCommitted(next)
      }
      return () => {
        replaceImpl = () => {}
      }
    }, [])

    return (
      <ProposalSelectionProvider
        token="preview"
        kickoff={KICKOFF}
        inputs={inputs}
        packageId={committed.packageId}
        addonIds={committed.addonIds}
      >
        <ProposalChoices packages={choicePackages} addOns={choiceAddOns} />
        <ProposalSignForm
          defaults={{legalName: 'Preview', email: 'preview@example.test'}}
          note={null}
        >
          <ProposalScopePanel
            appearance="inline"
            label="Statement of Work"
            title="Statement of Work"
            dismissLabel="Dismiss scope of work"
            closeLabel="Close scope of work"
          >
            <ProposalLiveStatement
              packages={statementPackages}
              addOns={statementAddOns}
              standing={[]}
            />
          </ProposalScopePanel>
        </ProposalSignForm>
      </ProposalSelectionProvider>
    )
  }

  await act(async () => {
    root.render(<Harness />)
  })

  for (const name of names) {
    await act(async () => {
      const link = [...container.querySelectorAll('fieldset a')].find((node) =>
        node.textContent?.includes(name),
      )
      if (!link) throw new Error(`No pick-list row named ${name}`)
      ;(link as unknown as HTMLAnchorElement).click()
    })
  }

  await act(async () => {
    const open = [...container.querySelectorAll('button')].find(
      (node) => node.textContent?.trim() === 'Statement of Work',
    )
    if (!open) throw new Error('Statement of Work control is missing')
    open.click()
  })

  const total = container.querySelector('.sr-only')?.textContent ?? ''
  const pay =
    container.querySelector('button[name="intent"][value="checkout"]')?.textContent?.trim() ?? ''
  const postedAddOns = [...container.querySelectorAll('input[name="addon"]')].map(
    (input) => input.getAttribute('value') ?? '',
  )
  const dialog = container.ownerDocument?.querySelector('[role="dialog"]')
  const statement = dialog?.textContent ?? ''

  await act(async () => {
    root.unmount()
  })
  await win.happyDOM.abort()
  win.close()

  return {pay, total, postedAddOns, statement}
}

function installDom(win: import('happy-dom').Window) {
  const globals = globalThis as unknown as Record<string, unknown>
  globals.window = win
  globals.document = win.document
  globals.navigator = win.navigator
  globals.HTMLElement = win.HTMLElement
  globals.SVGElement = win.SVGElement
  globals.Element = win.Element
  globals.Node = win.Node
  globals.DocumentFragment = win.DocumentFragment
  globals.MutationObserver = win.MutationObserver
  globals.getComputedStyle = win.getComputedStyle.bind(win)
  globals.requestAnimationFrame = win.requestAnimationFrame.bind(win)
  globals.cancelAnimationFrame = win.cancelAnimationFrame.bind(win)
  globals.IS_REACT_ACT_ENVIRONMENT = true
  if (!win.matchMedia) {
    win.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false
      },
      onchange: null,
    })) as unknown as typeof win.matchMedia
  }
}
