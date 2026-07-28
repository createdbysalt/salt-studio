/**
 * Hero tiles for the Capabilities scrubbed bento gallery.
 * Screenshots live in /public/project-shots (captured from live client sites).
 * `href` only when a matching project page exists in Sanity.
 */
export type CapabilitiesBentoShot = {
  id: string
  title: string
  src: string
  href?: string
}

export const CAPABILITIES_BENTO_SHOTS: CapabilitiesBentoShot[] = [
  {
    id: 'photon-studio',
    title: 'Photon Studio',
    src: '/project-shots/photon-studio.png',
    href: '/projects/photon-studio',
  },
  {
    id: 'lisa-trent',
    title: 'Lisa Trent',
    src: '/project-shots/lisa-trent.png',
  },
  {
    id: 'mfi-canada',
    title: 'MFI Canada',
    src: '/project-shots/mfi-canada.png',
    href: '/projects/mfi-canada',
  },
  {
    id: 'one-conference-landing',
    title: 'ONE Conference',
    src: '/project-shots/one-conference-landing.png',
  },
  {
    id: 'viva-church',
    title: 'Viva Church',
    src: '/project-shots/viva-church.png',
  },
  {
    id: 'one-conference',
    title: 'ONE Conference custom',
    src: '/project-shots/one-conference.png',
  },
  {
    id: 'salt',
    title: 'Salt',
    src: '/project-shots/salt.png',
  },
  {
    id: 'playground',
    title: 'Playground',
    src: '/project-shots/playground.png',
  },
]
