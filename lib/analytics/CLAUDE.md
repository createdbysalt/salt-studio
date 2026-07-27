# lib/analytics/

Comprehensive, consent-aware analytics system for client websites. Built on Google Tag Manager with typed event helpers and GDPR/CCPA compliance.

## Dual Tracking Architecture

This template supports **dual tracking** — Salt Studio and clients each get their own analytics data:

| Tracking            | Source                                               | Editable by Client? |
| ------------------- | ---------------------------------------------------- | ------------------- |
| Salt Studio GTM/GA4 | `.env` (`NEXT_PUBLIC_GTM_ID`)                        | No                  |
| Client's GA4        | Sanity (`developerSettings.clientGoogleAnalyticsId`) | Yes                 |

**Why dual tracking?**

- Salt gets portfolio-wide analytics across all client sites
- Clients get their own data in their own GA4 property
- If a client leaves, they keep their GA4, Salt keeps theirs
- Clients can't accidentally remove Salt's tracking

## Architecture

```
lib/analytics/
├── index.ts              # Barrel exports
├── gtm.tsx               # Salt's GTM scripts + Consent Mode v2 (from env)
├── client-ga.tsx         # Client's GA4 script (from Sanity)
├── consent.tsx           # Consent state + banner component
├── web-vitals.tsx        # Core Web Vitals tracking
├── page-view-tracker.tsx # Route change tracking
├── scroll-tracker.tsx    # Scroll depth tracking
├── error-tracker.tsx     # JS error tracking
├── debug-overlay.tsx     # Dev mode debug panel
├── events.ts             # Typed event helpers
├── types.ts              # TypeScript definitions
└── CLAUDE.md             # This file
```

## Setup (already done in this template)

The root layout (`app/layout.tsx`) includes:

```tsx
import {
  ClientGoogleAnalyticsScript,
  ConsentProvider,
  GoogleTagManagerNoScript,
  GoogleTagManagerScript,
  // ... other imports
} from '@/lib/analytics'
import {sanityFetch} from '@/sanity/lib/live'
import {developerSettingsQuery} from '@/sanity/lib/queries'

export default async function RootLayout({children}) {
  // Fetch client's GA4 ID from Sanity
  const {data: devSettings} = await sanityFetch({
    query: developerSettingsQuery,
    stega: false,
  })

  return (
    <html>
      <head>
        <GoogleTagManagerScript />
        <ClientGoogleAnalyticsScript measurementId={devSettings?.clientGoogleAnalyticsId} />
      </head>
      <body>
        <GoogleTagManagerNoScript />
        <ConsentProvider>{/* ... trackers and children */}</ConsentProvider>
      </body>
    </html>
  )
}
```

## Client onboarding

### Salt Studio tracking (required)

1. Set up Salt's GTM container (one-time, shared across clients)
2. Add to `.env.local` AND Vercel environment variables:
   ```
   NEXT_PUBLIC_GTM_ID=GTM-SALTXXX
   ```
3. In Salt's GTM, configure:
   - GA4 Configuration tag pointing to Salt's GA4 property
   - Consent Mode v2 settings
   - Any cross-client conversion/marketing tags

### Client tracking (optional)

1. Ask client: "Do you have Google Analytics, or should we create one for you?"
2. If creating for them: Create GA4 property under Salt's Google account, add client as Viewer
3. In Sanity Studio → Developer Settings → "Your Google Analytics ID"
4. Enter the GA4 Measurement ID (starts with G-)
5. Client's GA4 will now receive data alongside Salt's tracking

## Adding tracking to new pages/features

### CTA/Button clicks

```tsx
import {trackCTAClick} from '@/lib/analytics'

;<button
  onClick={() => {
    trackCTAClick({
      cta_text: 'Get Started',
      cta_location: 'hero',
      cta_type: 'primary',
      cta_destination: '/contact',
    })
    // ... rest of handler
  }}
>
  Get Started
</button>
```

### Form tracking

```tsx
import {trackFormStart, trackFormSubmit, trackFormError} from '@/lib/analytics'

function ContactForm() {
  const [hasStarted, setHasStarted] = useState(false)

  const handleFocus = () => {
    if (!hasStarted) {
      trackFormStart({form_name: 'contact', form_location: 'contact-page'})
      setHasStarted(true)
    }
  }

  const handleSubmit = async (data) => {
    try {
      await submitForm(data)
      trackFormSubmit({
        form_name: 'contact',
        form_location: 'contact-page',
        form_destination: '/thank-you',
      })
    } catch (error) {
      trackFormError({
        form_name: 'contact',
        form_location: 'contact-page',
        error_message: error.message,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input onFocus={handleFocus} ... />
    </form>
  )
}
```

### External links

```tsx
import {trackExternalLink} from '@/lib/analytics'

;<a
  href="https://partner.com"
  target="_blank"
  onClick={() =>
    trackExternalLink({
      link_url: 'https://partner.com',
      link_text: 'Visit Partner',
      link_location: 'footer',
    })
  }
>
  Visit Partner
</a>
```

### File downloads

```tsx
import {trackFileDownload} from '@/lib/analytics'

;<a
  href="/files/brochure.pdf"
  onClick={() =>
    trackFileDownload({
      file_name: 'brochure.pdf',
      file_type: 'pdf',
      file_url: '/files/brochure.pdf',
    })
  }
>
  Download Brochure
</a>
```

### Video tracking

```tsx
import {trackVideoPlay, trackVideoProgress} from '@/lib/analytics'

// On play
trackVideoPlay({
  video_title: 'Product Demo',
  video_url: 'https://youtube.com/...',
  video_provider: 'youtube',
})

// At milestones (25%, 50%, 75%, 100%)
trackVideoProgress({
  video_title: 'Product Demo',
  video_percent: 50,
})
```

### Search tracking

```tsx
import {trackSearch} from '@/lib/analytics'

const handleSearch = (query, results) => {
  trackSearch({
    search_term: query,
    search_results_count: results.length,
  })
}
```

### Custom events

For one-off events that don't fit the standard types:

```tsx
import {trackCustomEvent} from '@/lib/analytics'

trackCustomEvent('newsletter_signup', {
  signup_location: 'footer',
  email_domain: 'gmail.com',
})
```

### Error tracking (manual)

The `ErrorTracker` component handles JS errors automatically. For API/validation errors:

```tsx
import {trackError} from '@/lib/analytics'

// In your not-found.tsx
trackError({
  error_type: '404',
  error_message: 'Page not found',
  error_page: '/missing-page',
})

// In API error handlers
trackError({
  error_type: 'api_error',
  error_message: response.error,
  error_page: window.location.pathname,
})
```

## Event naming conventions

| Event            | When to use                                   |
| ---------------- | --------------------------------------------- |
| `page_view`      | Route changes (automatic via PageViewTracker) |
| `cta_click`      | Any clickable element meant to drive action   |
| `form_start`     | First interaction with a form                 |
| `form_submit`    | Successful form submission                    |
| `form_error`     | Form validation or submission failure         |
| `scroll_depth`   | User scrolls past milestones (automatic)      |
| `external_link`  | Click to external website                     |
| `file_download`  | Click to download a file                      |
| `video_play`     | Video playback started                        |
| `video_progress` | Video reached 25/50/75/100%                   |
| `search`         | User performs a search                        |
| `error`          | Any error (JS, API, 404)                      |

## Location values

Use consistent location strings:

- `hero` — Hero section
- `navbar` — Navigation bar
- `footer` — Footer
- `sidebar` — Sidebar
- `modal` — Modal/dialog
- `cta-section` — Dedicated CTA section
- `contact-page` — Contact page
- `{page-name}` — Specific page context

## Consent handling

All tracking respects user consent:

1. `ConsentProvider` shows a banner on first visit
2. User chooses "Accept all" or "Necessary only"
3. Choice is stored in localStorage
4. All `track*` functions check consent before firing
5. Google Consent Mode v2 is updated accordingly

**Never bypass consent.** If you need to track something critical, make it part of "necessary" consent (site functionality).

### Checking consent in code

```tsx
import {hasConsentFor, useConsent} from '@/lib/analytics'

// In a component
function MyComponent() {
  const {hasConsentFor} = useConsent()

  if (hasConsentFor('marketing')) {
    // Show personalized content
  }
}

// Outside components (in event handlers, etc.)
if (hasConsentFor('analytics')) {
  // Do something
}
```

## Debug mode

In development, the `AnalyticsDebugOverlay` shows a floating panel in the bottom-right corner:

- Click to expand/collapse
- Shows all dataLayer events in real-time
- Helps verify tracking is working
- Automatically hidden in production

Web Vitals also log to console in development.

## GTM configuration

### Required tags in GTM

1. **GA4 Configuration**
   - Trigger: All Pages
   - Measurement ID: Client's GA4 property

2. **GA4 Event — Web Vitals**
   - Event Name: `web_vitals`
   - Parameters: `metric_name`, `metric_value`, `metric_rating`
   - Trigger: Custom Event = `web_vitals`

3. **GA4 Event — Form Submit**
   - Event Name: `generate_lead` (or `form_submit`)
   - Parameters: `form_name`, `form_location`
   - Trigger: Custom Event = `form_submit`

### Consent Mode v2

The template ships with Consent Mode v2 defaults. In GTM:

1. Go to Admin → Container Settings
2. Enable "Enable consent overview"
3. For each tag, set appropriate consent requirements:
   - Analytics tags: `analytics_storage`
   - Ads tags: `ad_storage`, `ad_user_data`, `ad_personalization`

## Testing checklist

When adding analytics to a new page/feature:

- [ ] Events fire in Debug Overlay
- [ ] Events appear in GTM Preview mode
- [ ] Events have correct parameters
- [ ] Events respect consent (blocked when denied)
- [ ] No duplicate events on re-renders
- [ ] UTM parameters are captured (if applicable)

## Common issues

### Events not firing

1. Check consent is granted (Debug Overlay shows blocked events)
2. Check GTM ID is set in `.env.local`
3. Check component is inside `ConsentProvider`

### Duplicate events

1. Ensure trackers (PageViewTracker, ScrollTracker) are only in root layout
2. Check for multiple event handler calls

### Missing UTM parameters

1. PageViewTracker stores UTMs in sessionStorage
2. Check the landing page URL has UTM params
3. Subsequent pages should still have stored UTMs

### Consent banner not showing

1. User already consented (check localStorage `analytics_consent`)
2. Clear localStorage to test fresh state
3. Banner has 1s delay to avoid layout shift
