'use server'

import {Resend} from 'resend'

/**
 * Contact Form Server Action
 *
 * Handles form submissions with email delivery via Resend.
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

// Initialize Resend client (null if not configured)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function submitContactForm(
  fields: FormField[],
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Extract and validate form data
  const data: Record<string, string> = {}
  const errors: Record<string, string> = {}

  for (const field of fields) {
    const value = formData.get(field.name)?.toString().trim() || ''
    data[field.name] = value

    // Validate required fields
    if (field.required && !value) {
      errors[field.name] = `${field.label} is required`
    }

    // Validate email format
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        errors[field.name] = 'Please enter a valid email address'
      }
    }
  }

  // Return validation errors
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Please fix the errors below',
      errors,
    }
  }

  try {
    // Log submission (for development/debugging)
    console.log('Contact form submission:', data)

    const contactEmail = process.env.CONTACT_EMAIL
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    // Send email if Resend is configured
    if (resend && contactEmail) {
      // Find the sender's name and email from form data
      const senderName = data.name || data.Name || 'Website Visitor'
      const senderEmail = data.email || data.Email || 'unknown'

      // Build email body from form fields
      const emailBody = fields
        .map((field) => {
          const value = data[field.name]
          if (value) {
            return `**${field.label}:** ${value}`
          }
          return null
        })
        .filter(Boolean)
        .join('\n\n')

      const {error} = await resend.emails.send({
        from: fromEmail,
        to: contactEmail,
        replyTo: senderEmail !== 'unknown' ? senderEmail : undefined,
        subject: `New contact form submission from ${senderName}`,
        text: emailBody.replace(/\*\*/g, ''), // Plain text version
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            ${fields
              .map((field) => {
                const value = data[field.name]
                if (value) {
                  return `
                    <div style="margin-bottom: 16px;">
                      <strong style="color: #555;">${field.label}:</strong>
                      <p style="margin: 4px 0 0 0; color: #333;">${value.replace(/\n/g, '<br>')}</p>
                    </div>
                  `
                }
                return ''
              })
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
    } else if (!resend) {
      console.warn('RESEND_API_KEY not configured. Form submission logged but not emailed.')
    } else if (!contactEmail) {
      console.warn('CONTACT_EMAIL not configured. Form submission logged but not emailed.')
    }

    return {
      success: true,
      message: 'Message sent successfully!',
    }
  } catch (error) {
    console.error('Contact form error:', error)
    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    }
  }
}
