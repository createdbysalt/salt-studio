'use client'

import {Check, Copy} from 'lucide-react'
import {useState} from 'react'

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const input = document.createElement('textarea')
  input.value = value
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.left = '-9999px'
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
}

export function CopyLinkButton({href, label}: {href: string; label: string}) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    try {
      await copyText(href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      title={copied ? 'Copied' : 'Copy link'}
      aria-label={copied ? `Copied ${label} link` : `Copy ${label} link`}
      className="btn-ghost shrink-0 self-start px-3"
    >
      {copied ? (
        <Check size={16} strokeWidth={1.75} aria-hidden />
      ) : (
        <Copy size={16} strokeWidth={1.75} aria-hidden />
      )}
    </button>
  )
}
