'use client'

import {itemDoneKey, usePortalStatus} from '@/components/ClientPortalStatus'

function ActionLink({href, children}: {href: string; children: string}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="btn-ghost group w-fit shrink-0 self-start"
    >
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

export function ClientPortalForms() {
  const {formItems, done, pendingKey, error, toggle} = usePortalStatus()

  return (
    <div className="mt-10">
      {error ? <p className="mb-4 text-body text-error">{error}</p> : null}
      <ul>
        {formItems.map((item) => {
          const key = itemDoneKey(item)
          const checked = Boolean(done[key])
          const formLabel = item.linkLabel?.trim().replace(' →', '') || 'Open form'
          return (
            <li key={item._key} className="flex items-start gap-4 border-t border-border-subtle py-5">
              <CheckControl
                checked={checked}
                pending={pendingKey === key}
                onToggle={() => toggle(item)}
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
                      <p className="mt-1 text-[15px] leading-relaxed text-secondary">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  {item.link ? <ActionLink href={item.link}>{formLabel}</ActionLink> : null}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
