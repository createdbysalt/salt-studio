/**
 * A plain PDF of the agreement or statement of work the client is reading.
 * Standard PDF fonts only, so the file does not depend on a library.
 *
 * ProposalScopePanel builds the open document from the page on screen.
 * The signed statement is the same renderer, fed by the blocks in sign.ts.
 * It does not read or write Sanity.
 *
 * The page is the agreement's letter page: a mark, a cover, section headings,
 * body type, and a footer with the page count. Scope headings stay headings.
 * Bullets stay bullets.
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
const BOTTOM = 56
const CONTENT_W = PAGE_W - MARGIN_X * 2
const CONTENT_RIGHT = PAGE_W - MARGIN_X

const INK = 0.031
const BODY = 0.239
const LABEL = 0.42
const MUTED = 0.541
const RULE = 0.82

const COVER_FIELDS = [
  {prefix: 'Client legal name: ', label: 'LEGAL NAME'},
  {prefix: 'Mailing address: ', label: 'MAILING ADDRESS'},
  {prefix: 'Signed date: ', label: 'SIGNED DATE'},
] as const

type Style = {
  font: 'F1' | 'F2'
  size: number
  leading: number
  gapBefore: number
  indent: number
  gray: number
}

const STYLES: Record<PdfBlock['kind'], Style> = {
  kicker: {font: 'F1', size: 9, leading: 12, gapBefore: 0, indent: 0, gray: MUTED},
  title: {font: 'F2', size: 26, leading: 31, gapBefore: 0, indent: 0, gray: INK},
  note: {font: 'F1', size: 11, leading: 15, gapBefore: 8, indent: 0, gray: INK},
  // A part sits clearly above the sections inside it.
  part: {font: 'F2', size: 17, leading: 22, gapBefore: 28, indent: 0, gray: INK},
  heading: {font: 'F2', size: 10, leading: 14, gapBefore: 16, indent: 0, gray: INK},
  paragraph: {font: 'F1', size: 9.5, leading: 13, gapBefore: 8, indent: 0, gray: BODY},
  bullet: {font: 'F1', size: 9.5, leading: 13, gapBefore: 2, indent: 14, gray: BODY},
}

type Op =
  | {
      type: 'text'
      text: string
      font: 'F1' | 'F2'
      size: number
      x: number
      y: number
      gray: number
    }
  | {type: 'rule'; x1: number; x2: number; y: number; gray: number}

type Page = {ops: Op[]; logo: boolean; siteLine: boolean}

export function buildProposalPdf(blocks: PdfBlock[]): Uint8Array {
  const usable = blocks.filter((block) => block.text.trim().length > 0)
  const pages = layout(usable.length > 0 ? usable : [{kind: 'title', text: 'Agreement'}])
  return encodePdf(pages)
}

function layout(blocks: PdfBlock[]): Page[] {
  const title = blocks.find((block) => block.kind === 'title')?.text ?? 'Statement of Work'
  const notes = blocks.filter((block) => block.kind === 'note')
  const body = blocks.filter(
    (block) => block.kind !== 'kicker' && block.kind !== 'title' && block.kind !== 'note',
  )
  const rows = notes.flatMap((note) => {
    const field = COVER_FIELDS.find((item) => note.text.startsWith(item.prefix))
    if (!field) return []
    return [{label: field.label, value: note.text.slice(field.prefix.length).trim()}]
  })
  const otherNotes = notes.filter(
    (note) => !COVER_FIELDS.some((field) => note.text.startsWith(field.prefix)),
  )

  const pages: Page[] = [{ops: [], logo: true, siteLine: rows.length > 0}]
  let y = PAGE_H - 118

  const placeCover = (text: string, style: Style, gapBefore: number) => {
    const lines = wrap(text, style.size, CONTENT_W - style.indent, style.font === 'F2')
    lines.forEach((line, lineIndex) => {
      y -= lineIndex === 0 ? gapBefore + style.leading : style.leading
      pages[0].ops.push({
        type: 'text',
        text: line,
        font: style.font,
        size: style.size,
        x: MARGIN_X,
        y,
        gray: style.gray,
      })
    })
  }

  placeCover(title, STYLES.title, 0)
  if (rows.length > 0 && /statement of work|master services agreement/i.test(title)) {
    placeCover('Cover Page', {...STYLES.title, font: 'F1', gray: MUTED}, 4)
  }
  for (const note of otherNotes) placeCover(note.text, STYLES.note, 18)

  if (rows.length > 0) {
    y -= 22
    for (const row of rows) y = placeRow(pages[0], row.label, row.value, y)
    if (body.length > 0) flow(body, pages, PAGE_H - TOP, true)
    return pages
  }

  y -= 8
  flow(body, pages, y, false)
  return pages
}

function placeRow(page: Page, label: string, value: string, y: number) {
  page.ops.push({type: 'rule', x1: MARGIN_X, x2: CONTENT_RIGHT, y, gray: RULE})
  const valueLines = wrap(value, 9, CONTENT_RIGHT - 240, false)
  const height = Math.max(26, 14 + valueLines.length * 12)
  page.ops.push({
    type: 'text',
    text: label,
    font: 'F1',
    size: 6.6,
    x: MARGIN_X,
    y: y - 16,
    gray: LABEL,
  })
  valueLines.forEach((line, index) => {
    page.ops.push({
      type: 'text',
      text: line,
      font: 'F1',
      size: 9,
      x: 240,
      y: y - 16 - index * 12,
      gray: INK,
    })
  })
  return y - height
}

function flow(blocks: PdfBlock[], pages: Page[], startY: number, freshPage: boolean) {
  if (freshPage) pages.push({ops: [], logo: false, siteLine: false})
  let y = startY

  const place = (text: string, style: Style, gapBefore: number) => {
    const page = pages[pages.length - 1]
    const gap = page.ops.length === 0 ? 0 : gapBefore
    const step = gap + style.leading
    if (y - step < BOTTOM && page.ops.length > 0) {
      pages.push({ops: [], logo: false, siteLine: false})
      y = PAGE_H - TOP
    } else {
      y -= gap
    }
    y -= style.leading
    pages[pages.length - 1].ops.push({
      type: 'text',
      text,
      font: style.font,
      size: style.size,
      x: MARGIN_X + style.indent,
      y,
      gray: style.gray,
    })
  }

  blocks.forEach((block, index) => {
    const style = STYLES[block.kind]
    if (block.kind === 'part' && index > 0 && y - style.gapBefore - style.leading * 3 < BOTTOM) {
      pages.push({ops: [], logo: false, siteLine: false})
      y = PAGE_H - TOP
    }
    const width = CONTENT_W - style.indent
    const lines =
      block.kind === 'bullet'
        ? wrap(`${block.marker} ${block.text}`, style.size, width, false)
        : wrap(block.text, style.size, width, style.font === 'F2')
    lines.forEach((line, lineIndex) => {
      place(line, style, lineIndex === 0 ? style.gapBefore : 0)
    })
  })
}

function encodePdf(pages: Page[]): Uint8Array {
  const title = coverTitle(pages)
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
    const stream = pageStream(page, index + 1, pageCount, title)
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
  })

  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  objects.push(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  )

  return asciiBytes(serialize(objects))
}

function coverTitle(pages: Page[]) {
  const first = pages[0]?.ops.find((op) => op.type === 'text' && op.size === 26 && op.gray === INK)
  return first && first.type === 'text' ? first.text : 'Statement of Work'
}

function pageStream(page: Page, pageNumber: number, pageCount: number, title: string): string {
  const label = `Salt Studio LLC. ${documentName(title)}. Page ${pageNumber} of ${pageCount}`
  const commands = [
    `${num(MUTED)} g`,
    `BT /F1 6.5 Tf 1 0 0 1 ${MARGIN_X} 28 Tm (${pdfEscape(label)}) Tj ET`,
  ]
  if (page.logo) commands.push(logoMark())
  if (page.siteLine) {
    commands.push(
      `${num(MUTED)} g`,
      `BT /F1 9 Tf 1 0 0 1 ${MARGIN_X} 46 Tm (${pdfEscape('Salt Studio LLC. createdbysalt.com')}) Tj ET`,
    )
  }
  for (const op of page.ops) {
    if (op.type === 'rule') {
      commands.push(
        `${num(op.gray)} G`,
        '0.6 w',
        `${num(op.x1)} ${num(op.y)} m ${num(op.x2)} ${num(op.y)} l S`,
      )
      continue
    }
    commands.push(`${num(op.gray)} g`)
    commands.push(
      `BT /${op.font} ${num(op.size)} Tf 1 0 0 1 ${num(op.x)} ${num(op.y)} Tm (${pdfEscape(op.text)}) Tj ET`,
    )
  }
  return commands.join('\n')
}

function documentName(title: string) {
  if (/statement of work/i.test(title)) return 'Statement of Work'
  if (/master services agreement/i.test(title)) return 'Master Services Agreement'
  const name = title.trim()
  return name || 'Document'
}

/** The round Salt mark on the agreement cover, drawn from the badge paths. */
function logoMark() {
  const size = 34
  const scale = size / 871.34
  const top = PAGE_H - 64.5
  const matrix = `${num(scale)} 0 0 ${num(-scale)} ${MARGIN_X} ${num(top)} cm`
  return [
    'q',
    matrix,
    '0 g',
    circlePath(435.67, 435.67, 435.67),
    'f',
    '0.89 g',
    BADGE_PATHS.map((path) => svgPath(path)).join('\n'),
    'f*',
    'Q',
  ].join('\n')
}

const BADGE_PATHS = [
  'M290.79,589.64c10.86-10.29,19.26-22.45,25.19-36.46,5.93-14.03,8.9-29.15,8.92-46.08.02-13.86-2.08-25.93-6.3-36.65-4.22-10.72-11.4-20.12-21.53-28.55-10.14-8.41-23.93-16-41.39-22.86-10.23-4.1-18.12-8.42-23.67-12.85-5.55-4.42-9.51-9.55-11.89-15.31-2.37-5.75-3.56-12.8-3.55-21.06.02-11.74,2.63-20.87,7.84-27.09,5.21-6.23,12.4-8.25,21.58-6.35,7.23,1.49,13.4,5.01,18.51,10.35,5.11,5.35,9.16,12.17,12.15,20.44,2.99,8.28,4.74,17.56,5.26,28,13.41.27,26.82.64,40.22,1.09-1.21-18.21-4.85-34.81-10.92-50.4-6.07-15.58-14.48-29.21-25.22-40.93-10.75-11.69-23.88-20.38-39.4-25.23-14.64-4.57-27.25-4.4-37.84,1.24-10.59,5.62-18.68,15.87-24.25,30.7-5.58,14.82-8.38,33.45-8.41,55.19-.03,20.39,2.16,37.55,6.55,51.03,4.39,13.5,11.48,24.54,21.26,32.9,9.78,8.38,22.69,15.49,38.74,21.12,11.64,4.02,20.45,7.95,26.45,11.98,5.99,4.05,10.04,8.49,12.16,13.48,2.11,5,3.16,10.93,3.15,17.91,0,7.54-1.25,14.07-3.73,19.7-2.48,5.64-6.06,10.2-10.74,13.71-4.68,3.5-10.37,5.99-17.08,7.35-8.12,1.66-14.95.8-20.51-2.76-5.55-3.56-9.96-9.73-13.21-18.54-3.26-8.8-5.4-19.93-6.44-33.24-13.5,2.39-27,4.85-40.5,7.4.85,25.9,4.52,47.93,11.03,65.34,6.5,17.44,15.58,29.46,27.21,36.08,11.64,6.65,25.57,7.01,41.81,1.98,14.83-4.59,27.67-12.37,38.53-22.65Z',
  'M353.4,575.27c4.61-19.53,9.22-38.49,13.83-56.86l72.26-12.23c4.57,13.78,9.14,26.98,13.71,39.61l41.83-12.36c-22.52-50.78-45.02-114.97-67.5-192.56l-47.62-14.2c-22.68,73.56-45.37,160.52-68.08,260.89l41.56-12.28ZM403.66,384.86c8.25,30.53,16.51,59.16,24.76,85.89l-49.75,3.22c8.33-31.6,16.66-61.31,24.99-89.11Z',
  'M614.69,498.08l.02-18.27-108.79,20.51c7.4,5.38,14.81,10.22,22.21,14.52l.18-143.91-40.21-11.99-.23,176.61,126.81-37.46Z',
  'M670.81,481.5l.07-55.78,56.35,10.77v-6.23s-152.89-45.6-152.89-45.6l-.03,22.61,56.09,10.72-.1,75.48,40.5-11.97Z',
]

/** Four cubics. PDF content streams have no arc operator. */
function circlePath(cx: number, cy: number, radius: number) {
  const handle = radius * 0.5522847498
  return [
    `${num(cx + radius)} ${num(cy)} m`,
    `${num(cx + radius)} ${num(cy + handle)} ${num(cx + handle)} ${num(cy + radius)} ${num(cx)} ${num(cy + radius)} c`,
    `${num(cx - handle)} ${num(cy + radius)} ${num(cx - radius)} ${num(cy + handle)} ${num(cx - radius)} ${num(cy)} c`,
    `${num(cx - radius)} ${num(cy - handle)} ${num(cx - handle)} ${num(cy - radius)} ${num(cx)} ${num(cy - radius)} c`,
    `${num(cx + handle)} ${num(cy - radius)} ${num(cx + radius)} ${num(cy - handle)} ${num(cx + radius)} ${num(cy)} c`,
    'h',
  ].join('\n')
}

function svgPath(d: string) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? []
  let index = 0
  let command = ''
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  let controlX = 0
  let controlY = 0
  let cubic = false
  const ops: string[] = []
  const next = () => Number(tokens[index++])
  const isLetter = (value: string | undefined) => value != null && /[a-zA-Z]/.test(value)

  while (index < tokens.length) {
    if (isLetter(tokens[index])) command = tokens[index++] ?? ''
    if (command === 'M') {
      x = next()
      y = next()
      startX = x
      startY = y
      cubic = false
      ops.push(`${num(x)} ${num(y)} m`)
      if (!isLetter(tokens[index])) command = 'L'
    } else if (command === 'l') {
      x += next()
      y += next()
      cubic = false
      ops.push(`${num(x)} ${num(y)} l`)
    } else if (command === 'v') {
      y += next()
      cubic = false
      ops.push(`${num(x)} ${num(y)} l`)
    } else if (command === 'c') {
      const x1 = x + next()
      const y1 = y + next()
      const x2 = x + next()
      const y2 = y + next()
      const endX = x + next()
      const endY = y + next()
      ops.push(`${num(x1)} ${num(y1)} ${num(x2)} ${num(y2)} ${num(endX)} ${num(endY)} c`)
      controlX = x2
      controlY = y2
      x = endX
      y = endY
      cubic = true
    } else if (command === 's') {
      const x1 = cubic ? x * 2 - controlX : x
      const y1 = cubic ? y * 2 - controlY : y
      const x2 = x + next()
      const y2 = y + next()
      const endX = x + next()
      const endY = y + next()
      ops.push(`${num(x1)} ${num(y1)} ${num(x2)} ${num(y2)} ${num(endX)} ${num(endY)} c`)
      controlX = x2
      controlY = y2
      x = endX
      y = endY
      cubic = true
    } else if (command === 'Z' || command === 'z') {
      ops.push('h')
      x = startX
      y = startY
      cubic = false
    } else {
      throw new Error(`Unsupported badge path command ${command}`)
    }
  }
  return ops.join('\n')
}

function num(value: number) {
  const rounded = Math.round(value * 100) / 100
  return Object.is(rounded, -0) ? '0' : String(rounded)
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
