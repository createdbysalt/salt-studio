import {redirect} from 'next/navigation'

/**
 * No public rentals hub — IA is three pages only:
 * /rentals/studio · /rentals/podcast · /rentals/gear
 */
export default function RentalsHubRoute() {
  redirect('/rentals/studio')
}
