'use client'

import {submitContactForm} from '@/app/actions/contact'
import {ContactSelect} from '@/components/ContactSelect'
import {Reveal} from '@/components/Reveal'
import {trackFormError, trackFormStart, trackFormSubmit} from '@/lib/analytics'
import {useActionState, useEffect, useMemo, useRef, useState} from 'react'

type FormField = {
  _key: string
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  options?: string[]
}

type ContactFormProps = {
  title?: string
  description?: string
  fields: FormField[]
  submitLabel?: string
  successHeadline?: string
  successMessage?: string
  errorHeadline?: string
  errorMessage?: string
  footerNote?: string
  style?: 'stacked' | 'columns' | 'compact'
  /** `page` = /contact. `embed` = portable-text blocks. */
  variant?: 'page' | 'embed'
}

const DEFAULT_SUCCESS_HEADLINE = 'Signal acquired.'
const DEFAULT_SUCCESS_MESSAGE =
  "Message received. We'll be back within one business day — usually faster. If it's urgent, reply to the confirmation email and we'll route it straight to whoever's on deck."
const DEFAULT_ERROR_HEADLINE = 'Signal lost.'
const DEFAULT_ERROR_MESSAGE =
  "Something didn't send. Try again, or email us directly at hello@createdbysalt.com. We'd rather hear from you twice than not at all."

type FormState = {
  success: boolean
  message: string
  errors?: Record<string, string>
}

type AskPath = 'unset' | 'project'

const initialState: FormState = {
  success: false,
  message: '',
}

/**
 * Contact form — planned intake. Detail fields appear once the visitor
 * picks what they're asking about. Page uses underline fields.
 */
export function ContactForm({
  title,
  description,
  fields,
  submitLabel = 'Launch →',
  successHeadline = DEFAULT_SUCCESS_HEADLINE,
  successMessage = DEFAULT_SUCCESS_MESSAGE,
  errorHeadline = DEFAULT_ERROR_HEADLINE,
  errorMessage = DEFAULT_ERROR_MESSAGE,
  footerNote,
  style = 'stacked',
  variant = 'embed',
}: ContactFormProps) {
  const hasStartedRef = useRef(false)
  const isPage = variant === 'page'
  const [ask, setAsk] = useState('')
  const askPath = resolveAskPath(ask)

  const visibleFields = useMemo(
    () => (isPage ? fieldsForAskPath(fields, askPath) : fields),
    [fields, isPage, askPath],
  )

  // Bind the full CMS field set so the action identity stays stable as the
  // ask-path forks. Hidden optional fields simply omit from FormData.
  const boundAction = submitContactForm.bind(
    null,
    fields.map((f) => ({
      name: f.name,
      label: f.label,
      type: f.type,
      required: f.required,
    })),
  )

  const [state, formAction, isPending] = useActionState(boundAction, initialState)

  const handleFormStart = () => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      trackFormStart({
        form_name: 'contact',
        form_location: isPage ? 'page' : 'embed',
      })
    }
  }

  useEffect(() => {
    if (state.success) {
      trackFormSubmit({
        form_name: 'contact',
        form_location: isPage ? 'page' : 'embed',
      })
    } else if (state.message && state.errors) {
      trackFormError({
        form_name: 'contact',
        form_location: isPage ? 'page' : 'embed',
        error_message: Object.values(state.errors).join(', '),
      })
    }
  }, [state, isPage])

  if (state.success) {
    return (
      <div id="briefing" className={isPage ? 'w-full' : 'mx-auto max-w-3xl px-5 py-14 sm:px-6'}>
        <Reveal immediate y={10}>
          <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold leading-tight tracking-[-0.02em] text-foreground">
            {successHeadline}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/70 md:text-base">
            {successMessage}
          </p>
        </Reveal>
      </div>
    )
  }

  const formBody = (
    <form action={formAction} onFocus={handleFormStart} className="w-full">
      {state.message && !state.success ? (
        <div className="mb-8" role="alert">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-error">
            {errorHeadline}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            {state.errors ? state.message : <ErrorBody text={errorMessage} />}
          </p>
        </div>
      ) : null}

      <div
        className={
          isPage
            ? 'flex flex-col gap-5 sm:gap-6'
            : `space-y-5 ${
                style === 'columns'
                  ? 'md:grid md:grid-cols-2 md:gap-x-5 md:gap-y-5 md:space-y-0'
                  : ''
              }`
        }
      >
        {visibleFields.map((field) => {
          const display = displayField(field)
          return (
            <FormFieldInput
              key={field._key}
              field={display}
              error={state.errors?.[field.name]}
              page={isPage}
              wide={!isPage && field.type === 'textarea'}
              selectValue={field.name === 'projectType' ? ask : undefined}
              onSelectChange={field.name === 'projectType' ? (value) => setAsk(value) : undefined}
            />
          )
        })}
      </div>

      <div className="mt-8 sm:mt-10">
        <button
          type="submit"
          disabled={isPending}
          className={`btn-solid min-h-12 w-full justify-center sm:min-h-0 sm:w-auto ${
            isPending ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {isPending ? 'Sending…' : submitLabel}
        </button>

        {!isPage && footerNote?.trim() ? (
          <p className="mt-4 text-xs leading-relaxed text-foreground/40">{footerNote}</p>
        ) : null}
      </div>
    </form>
  )

  if (isPage) {
    return <div id="briefing">{formBody}</div>
  }

  return (
    <section id="briefing" className="bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-12">
        {title?.trim() || description?.trim() ? (
          <div className="mb-8 md:mb-10">
            {title?.trim() ? (
              <h2 className="text-[clamp(1.35rem,3vw,1.85rem)] font-semibold tracking-[-0.02em] text-foreground">
                {title}
              </h2>
            ) : null}
            {description?.trim() ? (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/70">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        {formBody}
      </div>
    </section>
  )
}

function ErrorBody({text}: {text: string}) {
  const email = 'hello@createdbysalt.com'
  const parts = text.split(email)
  if (parts.length === 1) return <>{text}</>
  return (
    <>
      {parts[0]}
      <a
        href={`mailto:${email}`}
        className="text-foreground underline decoration-foreground/40 underline-offset-[0.15em] transition-colors hover:decoration-foreground"
      >
        {email}
      </a>
      {parts.slice(1).join(email)}
    </>
  )
}

function resolveAskPath(ask: string): AskPath {
  return ask ? 'project' : 'unset'
}

/** Always → ask → message → detail fields → referral. */
function fieldsForAskPath(fields: FormField[], path: AskPath): FormField[] {
  const byName = new Map(fields.map((f) => [f.name, f]))
  const pick = (...names: string[]) =>
    names.map((n) => byName.get(n)).filter((f): f is FormField => Boolean(f))

  const head = pick('name', 'email', 'company', 'projectType', 'message')
  const branch = path === 'project' ? pick('deliverables', 'budget', 'dates') : []
  const tail = pick('referral')

  // Keep any unknown CMS fields after known ones (won't break unknown schemas).
  const known = new Set([...head, ...branch, ...tail].map((f) => f.name))
  const rest = path === 'unset' ? [] : fields.filter((f) => !known.has(f.name))

  return [...head, ...branch, ...tail, ...rest]
}

function displayField(field: FormField): FormField {
  if (field.name === 'projectType') {
    return {...field, label: 'How can we help?'}
  }
  return field
}

function FormFieldInput({
  field,
  error,
  page,
  wide,
  selectValue,
  onSelectChange,
}: {
  field: FormField
  error?: string
  page: boolean
  wide?: boolean
  selectValue?: string
  onSelectChange?: (value: string) => void
}) {
  const labelClass =
    'mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-foreground/40 sm:text-[11px]'

  // text-base (16px) on small screens avoids iOS input zoom; slightly denser from sm up.
  // Focus indicator is the accent border (the system focus ring for form fields).
  const inputClass = page
    ? `w-full border-0 border-b bg-transparent px-0 py-3 font-sans text-base text-foreground placeholder:text-foreground/40 transition-colors duration-200 focus:outline-none focus:ring-0 sm:py-2.5 sm:text-[0.9375rem] ${
        error ? 'border-error focus:border-error' : 'border-foreground/15 focus:border-accent'
      }`
    : `w-full rounded-lg border bg-surface px-3.5 py-3 font-sans text-base text-foreground placeholder:text-foreground/40 transition-colors duration-200 focus:outline-none focus:ring-0 sm:py-2.5 sm:text-[0.9375rem] ${
        error ? 'border-error focus:border-error' : 'border-foreground/15 focus:border-accent'
      }`

  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <label htmlFor={field.name} className={labelClass}>
        {field.label}
        {field.required ? <span className="text-foreground/40"> *</span> : null}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          id={field.name}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required}
          rows={page ? 3 : 4}
          className={`${inputClass} min-h-[5rem] resize-y`}
        />
      ) : field.type === 'select' ? (
        <ContactSelect
          name={field.name}
          label={field.label}
          options={field.options ?? []}
          placeholder={field.placeholder || 'Select an option'}
          required={field.required}
          error={Boolean(error)}
          variant={page ? 'underline' : 'boxed'}
          value={selectValue}
          onChange={onSelectChange}
        />
      ) : (
        <input
          type={field.type}
          id={field.name}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required}
          autoComplete={
            field.type === 'email' ? 'email' : field.name === 'name' ? 'name' : undefined
          }
          className={inputClass}
        />
      )}

      {error ? <p className="mt-1.5 text-sm text-error">{error}</p> : null}
    </div>
  )
}
