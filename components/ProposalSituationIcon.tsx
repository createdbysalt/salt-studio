import {
  CircleAlert,
  Clock,
  DoorOpen,
  FileText,
  MessageCircle,
  Search,
  Share2,
  Users,
} from 'lucide-react'

const SITUATION_ICONS = [
  'scattered',
  'waiting',
  'arrival',
  'missing',
  'calling',
  'document',
  'people',
  'friction',
] as const

type SituationIconName = (typeof SITUATION_ICONS)[number]

function isSituationIcon(value: string): value is SituationIconName {
  return (SITUATION_ICONS as readonly string[]).includes(value)
}

/**
 * Stroke marks for a situation card. The set is closed so a new theme
 * has to be added here and in the Sanity list together.
 */
export function ProposalSituationIcon({name}: {name: string | null | undefined}) {
  if (!name || !isSituationIcon(name)) return null
  const className = 'size-[28px] shrink-0 md:size-10'
  const strokeWidth = 1.5

  switch (name) {
    case 'scattered':
      return <Share2 aria-hidden className={className} strokeWidth={strokeWidth} />
    case 'waiting':
      return <Clock aria-hidden className={className} strokeWidth={strokeWidth} />
    case 'arrival':
      return <DoorOpen aria-hidden className={className} strokeWidth={strokeWidth} />
    case 'missing':
      return <Search aria-hidden className={className} strokeWidth={strokeWidth} />
    case 'calling':
      return <MessageCircle aria-hidden className={className} strokeWidth={strokeWidth} />
    case 'document':
      return <FileText aria-hidden className={className} strokeWidth={strokeWidth} />
    case 'people':
      return <Users aria-hidden className={className} strokeWidth={strokeWidth} />
    case 'friction':
      return <CircleAlert aria-hidden className={className} strokeWidth={strokeWidth} />
    default: {
      const unhandled: never = name
      void unhandled
      return null
    }
  }
}
