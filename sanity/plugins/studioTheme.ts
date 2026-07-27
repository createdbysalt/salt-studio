import {buildLegacyTheme} from 'sanity'

/**
 * Salt Studio Theme
 *
 * Bento-style design: soft rounded cards, black & white, friendly typography.
 * Client branding at top, Salt Studio subtle at bottom.
 */

const props = {
  // Core palette - Black & White with soft grays
  '--salt-black': '#000000',
  '--salt-white': '#FFFFFF',
  '--salt-gray-50': '#FAFAFA',
  '--salt-gray-100': '#F5F5F5',
  '--salt-gray-200': '#E5E5E5',
  '--salt-gray-300': '#D4D4D4',
  '--salt-gray-400': '#A3A3A3',
  '--salt-gray-500': '#737373',
  '--salt-gray-600': '#525252',
  '--salt-gray-700': '#404040',
  '--salt-gray-800': '#262626',
  '--salt-gray-900': '#171717',

  // Accent colors for status
  '--salt-success': '#22C55E',
  '--salt-warning': '#F59E0B',
  '--salt-danger': '#EF4444',
  '--salt-info': '#3B82F6',
}

export const saltStudioTheme = buildLegacyTheme({
  // Base
  '--black': props['--salt-black'],
  '--white': props['--salt-white'],

  // Brand - clean black
  '--brand-primary': props['--salt-black'],

  // Grays
  '--gray': props['--salt-gray-400'],
  '--gray-base': props['--salt-gray-400'],

  // Components - white/light gray backgrounds
  '--component-bg': props['--salt-white'],
  '--component-text-color': props['--salt-black'],

  // Buttons
  '--default-button-color': props['--salt-black'],
  '--default-button-primary-color': props['--salt-black'],
  '--default-button-success-color': props['--salt-success'],
  '--default-button-warning-color': props['--salt-warning'],
  '--default-button-danger-color': props['--salt-danger'],

  // State colors
  '--state-info-color': props['--salt-info'],
  '--state-success-color': props['--salt-success'],
  '--state-warning-color': props['--salt-warning'],
  '--state-danger-color': props['--salt-danger'],

  // Navbar - black
  '--main-navigation-color': props['--salt-black'],
  '--main-navigation-color--inverted': props['--salt-white'],

  // Focus
  '--focus-color': props['--salt-black'],
})
