'use client'

import {
  firstIncompleteGroupKey,
  isGroupComplete,
  itemDoneKey,
  usePortalStatus,
  type PortalChecklistItem,
} from '@/components/ClientPortalStatus'
import {CopyLinkButton} from '@/components/CopyLinkButton'
import {useState} from 'react'

function ActionLink({href, children}: {href: string; children: string}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="btn-ghost group shrink-0">
      <span>{children}</span>
      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </a>
  )
}

function CheckControl({
  checked,
  pending,
  onToggle,
  label,
}: {
  checked: boolean
  pending: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={pending}
      onClick={onToggle}
      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
        checked
          ? 'border-foreground bg-foreground text-background'
          : 'border-foreground/40 bg-transparent'
      } disabled:opacity-50`}
    >
      {checked ? (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path
            d="M2 5.2 4.1 7.3 8 2.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </button>
  )
}

function DriveLink({href, children}: {href: string; children: string}) {
  return <ActionLink href={href}>{children}</ActionLink>
}

function ChecklistRow({
  item,
  checked,
  pending,
  onToggle,
}: {
  item: PortalChecklistItem
  checked: boolean
  pending: boolean
  onToggle: () => void
}) {
  const formHref = item.link
  const formLabel = item.linkLabel?.trim().replace(' →', '') || 'Open'

  return (
    <li className="flex items-start gap-4 border-t border-border-subtle py-5">
      <CheckControl
        checked={checked}
        pending={pending}
        onToggle={onToggle}
        label={`${checked ? 'Mark not done' : 'Mark done'}: ${item.title}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className={`text-body ${checked ? 'text-foreground/50' : 'text-foreground'}`}>
              {item.title}
              {item.required === false ? (
                <span className="ml-3 text-telemetry text-muted-foreground">Optional</span>
              ) : null}
            </p>
            {item.description ? (
              <p className="mt-1 text-[15px] leading-relaxed text-secondary">{item.description}</p>
            ) : null}
          </div>
          {formHref ? (
            <div className="flex shrink-0 items-start gap-2 self-start">
              <CopyLinkButton href={formHref} label={item.title ?? 'form'} />
              <ActionLink href={formHref}>{formLabel}</ActionLink>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  )
}

export function ClientPortalChecklist({driveUrl}: {driveUrl?: string | null}) {
  const {groups, done, pendingKey, error, toggle} = usePortalStatus()
  const [openKey, setOpenKey] = useState(() => firstIncompleteGroupKey(groups, done))

  const onToggle = (item: PortalChecklistItem) => {
    const nextDone = {...done, [itemDoneKey(item)]: !done[itemDoneKey(item)]}
    toggle(item)
    const openGroup = groups.find((group) => group._key === openKey)
    if (openGroup && isGroupComplete(openGroup, nextDone)) {
      setOpenKey(firstIncompleteGroupKey(groups, nextDone))
    }
  }

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 border border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-label text-muted-foreground">Shared Drive</p>
          <p className="mt-2 max-w-xl text-body">
            Logos, fonts, and photos must be uploaded to the shared Drive. Do not email them, and do
            not attach them here.
          </p>
        </div>
        {driveUrl ? <DriveLink href={driveUrl}>Open shared Drive</DriveLink> : null}
      </div>

      {error ? <p className="mt-4 text-body text-error">{error}</p> : null}

      <div className="mt-10 flex flex-col">
        {groups.map((group) => {
          const open = openKey === group._key
          const total = group.items.length
          const complete = group.items.filter(
            (item) => done[`${item.categoryKey}:${item._key}`],
          ).length
          const panelId = `checklist-panel-${group._key}`
          return (
            <div key={group._key} className="border-t border-border">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenKey(open ? '' : group._key)}
                className="group flex w-full items-center justify-between gap-[20px] py-[22px] text-left"
              >
                <span className="font-sans text-h3 font-semibold tracking-heading">
                  {group.title}
                </span>
                <span className="flex items-center gap-[12px]">
                  <span className="text-label text-muted-foreground">
                    {complete}/{total}
                  </span>
                  <span
                    aria-hidden
                    style={{rotate: open ? '180deg' : '0deg'}}
                    className="inline-flex text-foreground/55 transition-[rotate,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-foreground"
                  >
                    <svg width="14" height="9" viewBox="0 0 12 8" fill="none">
                      <path
                        d="M1 1.5 6 6.5 11 1.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </span>
              </button>
              <div
                id={panelId}
                aria-hidden={!open}
                inert={!open ? true : undefined}
                className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className={`min-h-0 overflow-hidden ${open ? '' : 'pointer-events-none'}`}>
                  <div
                    className={`pb-[32px] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] ${
                      open ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
                    }`}
                  >
                    {group.description || (group.needsDrive && group.folderUrl) ? (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        {group.description ? (
                          <p className="max-w-xl text-body text-secondary">{group.description}</p>
                        ) : (
                          <span />
                        )}
                        {group.needsDrive && group.folderUrl ? (
                          <DriveLink href={group.folderUrl}>
                            {group.folderLabel ?? 'Open shared Drive'}
                          </DriveLink>
                        ) : null}
                      </div>
                    ) : null}
                    <ul
                      className={
                        group.description || (group.needsDrive && group.folderUrl) ? 'mt-4' : ''
                      }
                    >
                      {group.items.map((item) => {
                        const key = `${item.categoryKey}:${item._key}`
                        return (
                          <ChecklistRow
                            key={item._key}
                            item={item}
                            checked={Boolean(done[key])}
                            pending={pendingKey === key}
                            onToggle={() => onToggle(item)}
                          />
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
