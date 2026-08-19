import {permanentRedirect} from 'next/navigation'

/**
 * About lives as a side panel. /about is a legacy/bookmark URL — send it to Gabi.
 */
export default function AboutRoute() {
  permanentRedirect('/gabi')
}
