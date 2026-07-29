import pw from '/Users/gabriellamartins/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js'

const {chromium} = pw

// One-off: Playground's desktop hero video was bot-blocked in headless.
// Headed real Chrome is the strongest anti-bot posture.
const browser = await chromium.launch({headless: false, channel: 'chrome'})
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: 2})
const page = await ctx.newPage()
await page
  .goto('https://www.ontheplayground.studio/', {waitUntil: 'networkidle', timeout: 45000})
  .catch(() => {})
const CONSENT = [
  'accept all',
  'accept cookies',
  'necessary only',
  'allow all',
  'reject all',
  'i agree',
  'got it',
  'accept',
  'close',
]
await page.evaluate(async (labels) => {
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase()
  for (const el of document.querySelectorAll('button, [role="button"]')) {
    if (labels.includes(norm(el.textContent))) {
      el.click()
      break
    }
  }
  window.scrollTo(0, 0)
  for (const v of document.querySelectorAll('video')) {
    try {
      v.muted = true
      v.playsInline = true
      await v.play().catch(() => {})
    } catch {}
  }
}, CONSENT)
await page.waitForTimeout(5000)
const restricted = await page.evaluate(() =>
  document.body.innerText.includes("couldn't verify the security"),
)
await page.screenshot({path: 'brand-identity/project-shots/playground/hero-desktop.png'})
console.log(restricted ? 'STILL BLOCKED' : 'OK video loaded')
await browser.close()
