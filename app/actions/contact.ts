'use server'

import {Resend} from 'resend'

/**
 * Contact Form Server Action
 *
 * Interest form → Resend to the studio, confirmation to the submitter.
 *
 * Required environment variables:
 * - RESEND_API_KEY: Your Resend API key (get one at https://resend.com)
 * - CONTACT_EMAIL: Email address to receive form submissions
 * - RESEND_FROM_EMAIL: Sender email (must be verified domain in Resend)
 *
 * If RESEND_API_KEY is not configured, submissions are logged to console only.
 */

type FormField = {
  name: string
  label: string
  type: string
  required?: boolean
}

type ContactFormState = {
  success: boolean
  message: string
  errors?: Record<string, string>
}

const CONFIRMATION_SUBJECT = "You're on the list."
const CONFIRMATION_TEXT = `You're on the list.

We take a few projects a year. We read every note. If this is one of them, we'll write.`

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function fieldValue(formData: FormData, field: FormField): string {
  if (field.type === 'multiselect') {
    return formData
      .getAll(field.name)
      .map((value) => value.toString().trim())
      .filter(Boolean)
      .join(', ')
  }
  return formData.get(field.name)?.toString().trim() || ''
}

export async function submitContactForm(
  fields: FormField[],
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const data: Record<string, string> = {}
  const errors: Record<string, string> = {}

  for (const field of fields) {
    const value = fieldValue(formData, field)
    data[field.name] = value

    if (field.required && !value) {
      errors[field.name] = `${field.label} is required`
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        errors[field.name] = 'Please enter a valid email address'
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Please fix the errors below',
      errors,
    }
  }

  try {
    console.log('Contact form submission:', data)

    const contactEmail = process.env.CONTACT_EMAIL
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    const senderName = data.name || data.Name || 'Website Visitor'
    const senderEmail = data.email || data.Email || ''
    const org = data.organization || data.company || data.business || data.organizationName || ''

    const labeledRows = fields
      .map((field) => {
        const value = data[field.name]
        if (!value) return null
        return {label: field.label, value}
      })
      .filter((row): row is {label: string; value: string} => Boolean(row))

    const textBody = labeledRows.map((row) => `${row.label}: ${row.value}`).join('\n\n')

    if (resend && contactEmail) {
      const {error} = await resend.emails.send({
        from: fromEmail,
        to: contactEmail,
        replyTo: senderEmail || undefined,
        subject: `Interest — ${senderName}${org ? ` · ${org}` : ''}`,
        text: textBody,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
              Interest form
            </h2>
            ${labeledRows
              .map(
                (row) => `
                  <div style="margin-bottom: 16px;">
                    <strong style="color: #555;">${row.label}:</strong>
                    <p style="margin: 4px 0 0 0; color: #333;">${row.value.replace(/\n/g, '<br>')}</p>
                  </div>
                `,
              )
              .join('')}
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #888; font-size: 12px;">
              Submitted at ${new Date().toLocaleString()}
            </p>
          </div>
        `,
      })

      if (error) {
        console.error('Resend error:', error)
        return {
          success: false,
          message: 'Failed to send message. Please try again.',
        }
      }

      if (senderEmail) {
        const {error: confirmError} = await resend.emails.send({
          from: fromEmail,
          to: senderEmail,
          subject: CONFIRMATION_SUBJECT,
          text: CONFIRMATION_TEXT,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="margin-bottom: 16px;">You're on the list.</h2>
              <p>We take a few projects a year. We read every note. If this is one of them, we'll write.</p>
            </div>
          `,
        })
        if (confirmError) {
          console.error('Resend confirmation error:', confirmError)
        }
      }
    } else if (!resend) {
      console.warn('RESEND_API_KEY not configured. Form submission logged but not emailed.')
    } else if (!contactEmail) {
      console.warn('CONTACT_EMAIL not configured. Form submission logged but not emailed.')
    }

    return {
      success: true,
      message: CONFIRMATION_SUBJECT,
    }
  } catch (error) {
    console.error('Contact form error:', error)
    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    }
  }
}
