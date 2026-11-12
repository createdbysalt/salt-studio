/**
 * A plain PDF of the agreement or statement of work the client is reading.
 * Standard PDF fonts only, so the file does not depend on a library.
 *
 * Called from ProposalScopePanel when the client downloads the open document.
 * No other file builds that PDF. It reads the title and body already on screen
 * and returns bytes. It does not read or write Sanity.
 */

export type PdfBlock =
  | {kind: 'kicker'; text: string}
  | {kind: 'title'; text: string}
  | {kind: 'note'; text: string}
  /** A whole part of the agreement: the package, an add-on, standing terms. */
  | {kind: 'part'; text: string}
  | {kind: 'heading'; text: string}
  | {kind: 'paragraph'; text: string}
  | {kind: 'bullet'; text: string; marker: string}

const PAGE_W = 612
const PAGE_H = 792
const MARGIN_X = 68
const TOP = 72
const BOTTOM = 64
const CONTENT_W = PAGE_W - MARGIN_X * 2

type Style = {
  font: 'F1' | 'F2'
  size: number
  leading: number
  gapBefore: number
  indent: number
  color: 'ink' | 'muted'
}

const STYLES: Record<PdfBlock['kind'], Style> = {
  kicker: {font: 'F1', size: 9, leading: 12, gapBefore: 0, indent: 0, color: 'muted'},
  title: {font: 'F2', size: 26, leading: 32, gapBefore: 16, indent: 0, color: 'ink'},
  note: {font: 'F1', size: 11, leading: 16, gapBefore: 8, indent: 0, color: 'muted'},
  // A part sits clearly above the sections inside it. Without the step in
  // size, an add-on's own Fees heading looked the same as the package's, and
  // nothing told the reader which one they were looking at.
  part: {font: 'F2', size: 18, leading: 24, gapBefore: 34, indent: 0, color: 'ink'},
  heading: {font: 'F2', size: 13, leading: 18, gapBefore: 18, indent: 0, color: 'ink'},
  paragraph: {font: 'F1', size: 11, leading: 16, gapBefore: 10, indent: 0, color: 'ink'},
  bullet: {font: 'F1', size: 11, leading: 16, gapBefore: 3, indent: 16, color: 'ink'},
}

type Drawn = {
  text: string
  font: 'F1' | 'F2'
  size: number
  x: number
  y: number
  color: 'ink' | 'muted'
}

export function buildProposalPdf(blocks: PdfBlock[]): Uint8Array {
  const pages = layout(blocks.filter((block) => block.text.trim().length > 0))
  return encodePdf(pages.length > 0 ? pages : layout([{kind: 'title', text: 'Agreement'}]))
}

function layout(blocks: PdfBlock[]): Drawn[][] {
  const pages: Drawn[][] = [[]]
  let y = PAGE_H - TOP

  const place = (text: string, style: Style, gapBefore: number) => {
    const step = gapBefore + style.leading
    if (y - step < BOTTOM && pages[pages.length - 1].length > 0) {
      pages.push([])
      y = PAGE_H - TOP
    } else {
      y -= gapBefore
    }
    y -= style.leading
    pages[pages.length - 1].push({
      text,
      font: style.font,
      size: style.size,
      x: MARGIN_X + style.indent,
      y,
      color: style.color,
    })
  }

  blocks.forEach((block, index) => {
    const style = STYLES[block.kind]
    // A part heading left near the foot of a page reads as a caption on the
    // section above it. Break first when there is not enough room for the
    // heading and a couple of lines under it.
    if (block.kind === 'part' && index > 0 && y - style.gapBefore - style.leading * 3 < BOTTOM) {
      pages.push([])
      y = PAGE_H - TOP
    }
    const width = CONTENT_W - style.indent
    const lines =
      block.kind === 'bullet'
        ? wrap(`${block.marker} ${block.text}`, style.size, width, false)
        : wrap(block.text, style.size, width, style.font === 'F2')
    lines.forEach((line, lineIndex) => {
      place(line, style, index === 0 && lineIndex === 0 ? 0 : lineIndex === 0 ? style.gapBefore : 0)
    })
  })

  return pages
}

function encodePdf(pages: Drawn[][]): Uint8Array {
  const pageCount = pages.length
  const fontRegular = 3 + pageCount * 2
  const fontBold = fontRegular + 1
  const objects: string[] = []

  objects.push('<< /Type /Catalog /Pages 2 0 R >>')
  const kids = Array.from({length: pageCount}, (_, index) => `${3 + index * 2} 0 R`).join(' ')
  objects.push(`<< /Type /Pages /Count ${pageCount} /Kids [${kids}] >>`)

  pages.forEach((page, index) => {
    const contentId = 4 + index * 2
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> >>`,
    )
    const stream = pageStream(page, index + 1, pageCount)
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
  })

  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  objects.push(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  )

  return asciiBytes(serialize(objects))
}

function pageStream(lines: Drawn[], pageNumber: number, pageCount: number): string {
  const pageLabel = pageCount > 1 ? `${pageNumber} / ${pageCount}` : String(pageNumber)
  const commands = [
    '0.82 G',
    `${MARGIN_X} 48 m`,
    `${PAGE_W - MARGIN_X} 48 l`,
    'S',
    '0.45 g',
    `BT /F1 9 Tf 1 0 0 1 ${MARGIN_X} 32 Tm (Salt Studio) Tj ET`,
    `BT /F1 9 Tf 1 0 0 1 ${PAGE_W - MARGIN_X - textWidth(pageLabel, 9, false)} 32 Tm (${pdfEscape(pageLabel)}) Tj ET`,
  ]

  for (const line of lines) {
    commands.push(line.color === 'muted' ? '0.45 g' : '0 g')
    commands.push(
      `BT /${line.font} ${line.size} Tf 1 0 0 1 ${line.x} ${line.y} Tm (${pdfEscape(line.text)}) Tj ET`,
    )
  }
  return commands.join('\n')
}

function wrap(text: string, size: number, maxWidth: number, bold: boolean): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  const fits = (value: string) => textWidth(value, size, bold) <= maxWidth

  for (const word of words) {
    const pieces = fits(word) ? [word] : breakWord(word, size, maxWidth, bold)
    for (const piece of pieces) {
      const next = current ? `${current} ${piece}` : piece
      if (!current || fits(next)) current = next
      else {
        lines.push(current)
        current = piece
      }
    }
  }
  if (current) lines.push(current)
  return lines
}

function breakWord(word: string, size: number, maxWidth: number, bold: boolean): string[] {
  const pieces: string[] = []
  let current = ''
  for (const char of word) {
    const next = current + char
    if (textWidth(next, size, bold) <= maxWidth) current = next
    else {
      if (current) pieces.push(current)
      current = char
    }
  }
  if (current) pieces.push(current)
  return pieces
}

function textWidth(text: string, size: number, bold: boolean): number {
  let units = 0
  for (const char of text) units += charUnits(char)
  return (units / 1000) * size * (bold ? 1.06 : 1)
}

function charUnits(char: string): number {
  if (char === ' ') return 280
  if ("iljI.,:;'|!()".includes(char)) return 280
  if ('frt'.includes(char)) return 360
  if ('mwMW@%'.includes(char)) return 860
  if (char >= 'A' && char <= 'Z') return 700
  return 520
}

function pdfEscape(text: string): string {
  let out = ''
  for (const char of text) {
    const byte = winAnsi(char.codePointAt(0) ?? 32)
    if (byte === 0x28 || byte === 0x29 || byte === 0x5c) out += `\\${String.fromCharCode(byte)}`
    else if (byte >= 32 && byte < 127) out += String.fromCharCode(byte)
    else out += `\\${byte.toString(8).padStart(3, '0')}`
  }
  return out
}

function winAnsi(code: number): number {
  const mapped: Record<number, number> = {
    0x20ac: 0x80,
    0x2026: 0x85,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201c: 0x93,
    0x201d: 0x94,
    0x2022: 0x95,
    0x2013: 0x96,
    0x2014: 0x97,
    0x2122: 0x99,
  }
  if (mapped[code]) return mapped[code]
  if (code === 0x0a || code === 0x0d || code === 0x09) return 0x20
  if (code >= 32 && code <= 255) return code
  return 0x3f
}

function serialize(objects: string[]): string {
  const parts = ['%PDF-1.4\n']
  const offsets: number[] = []
  let cursor = parts[0].length
  objects.forEach((object, index) => {
    offsets.push(cursor)
    const part = `${index + 1} 0 obj\n${object}\nendobj\n`
    parts.push(part)
    cursor += part.length
  })
  parts.push(`xref\n0 ${objects.length + 1}\n`)
  parts.push('0000000000 65535 f \n')
  for (const offset of offsets) parts.push(`${String(offset).padStart(10, '0')} 00000 n \n`)
  parts.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`)
  parts.push(`startxref\n${cursor}\n%%EOF\n`)
  return parts.join('')
}

function asciiBytes(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length)
  for (let index = 0; index < value.length; index += 1)
    bytes[index] = value.charCodeAt(index) & 0xff
  return bytes
}
