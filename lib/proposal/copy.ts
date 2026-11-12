/**
 * Default wording the proposal page falls back to when a field is left empty.
 *
 * Shared so the Studio and the page cannot drift. The schema shows this text
 * as the placeholder and the initial value; the page prints it when the field
 * comes back empty. If the two were written out separately, editing one would
 * quietly leave the other behind.
 *
 * Plain strings only, no imports. This module is pulled into the Studio
 * bundle as well as the site.
 */

/** The sentence under "The investment.", above the package cards. */
export const PACKAGES_INTRO =
  "We're excited to partner with you. This is the work we'd take on together."

/** The sentence under "We can't wait to work together." */
export const INVESTMENT_INTRO =
  'Select a package, then any add-ons. The total and the scope of work update as you go.'
