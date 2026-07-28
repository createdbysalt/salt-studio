import pw from '/Users/gabriellamartins/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js'
const { chromium } = pw
import { mkdir } from 'node:fs/promises'

// Retina project screenshots. Renders at deviceScaleFactor 2 so a 1440-wide
// desktop layout outputs a crisp 2880px PNG. Viewport crop (hero), not full-page.
const OUT = 'brand-identity/project-shots'
const DPR = 2

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
}

// Each job = one page. `views` picks which viewports to shoot.
const JOBS = [
  { dir: 'photon-studio', base: 'hero', url: 'https://photonstudio.vercel.app/' },
  { dir: 'lisa-trent', base: 'hero', url: 'https://lisa-trent.vercel.app/homepage-prototype' },
  { dir: 'mfi-canada', base: 'hero', url: 'https://mficanada.ca/' },
  { dir: 'one-conference', base: 'landing-hero', url: 'https://oneyouthconference.com/old-home' },
  { dir: 'one-conference', base: 'custom-hero', url: 'https://oneyouthconference.com/' },
  { dir: 'viva-church', base: 'hero', url: 'https://www.vivachurch.ca/' },
  { dir: 'salt', base: 'hero', url: 'https://usesalt.io/' },
  { dir: 'playground', base: 'hero', url: 'https://www.ontheplayground.studio/' },
]

const CONSENT = ['accept all', 'accept cookies', 'necessary only', 'allow all', 'reject all', 'i agree', 'got it', 'accept', 'close']

async function dismissConsent(page) {
  await page.evaluate((labels) => {
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase()
    for (const el of document.querySelectorAll('button, [role="button"]')) {
      if (labels.includes(norm(el.textContent))) { el.click(); break }
    }
  }, CONSENT)
}

// Real Chrome has proprietary codecs (H.264) so background videos actually
// paint; chrome-headless-shell renders them black. Fall back to bundled chromium.
let browser
for (const opts of [{ channel: 'chrome' }, { channel: 'msedge' }, {}]) {
  try {
    browser = await chromium.launch({ headless: true, ...opts })
    console.log(`launched: ${opts.channel || 'bundled chromium'}`)
    break
  } catch (e) {
    console.log(`skip ${opts.channel || 'bundled'}: ${e.message.split('\n')[0]}`)
  }
}
if (!browser) throw new Error('no browser could launch')
try {
  for (const job of JOBS) {
    await mkdir(`${OUT}/${job.dir}`, { recursive: true })
    for (const [view, size] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext({
        viewport: size,
        deviceScaleFactor: DPR,
        isMobile: view === 'mobile',
        userAgent:
          view === 'mobile'
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
            : undefined,
      })
      const page = await context.newPage()
      try {
        await page.goto(job.url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
        await dismissConsent(page)
        // kick off any hero background videos and wait for the first frame
        await page.evaluate(async () => {
          window.scrollTo(0, 0)
          const vids = [...document.querySelectorAll('video')]
          await Promise.all(
            vids.map(async (v) => {
              try {
                v.muted = true
                v.playsInline = true
                await v.play().catch(() => {})
              } catch {}
            }),
          )
        })
        await page.waitForTimeout(3000) // let hero video/fonts/animations settle
        const path = `${OUT}/${job.dir}/${job.base}-${view}.png`
        await page.screenshot({ path }) // viewport crop, DPR 2
        console.log(`OK  ${path}  (${size.width * DPR}x${size.height * DPR})`)
      } catch (e) {
        console.log(`ERR ${job.dir}/${job.base}-${view}: ${e.message}`)
      } finally {
        await context.close()
      }
    }
  }
} finally {
  await browser.close()
}
console.log('done')
