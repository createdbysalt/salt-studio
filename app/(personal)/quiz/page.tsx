import {QuizFlow} from '@/components/QuizFlow'
import type {Metadata} from 'next'

/**
 * The Salt Score — automation-potential quiz.
 *
 * Launch-gated: noindex and unlinked from nav/services until the first paid
 * audit sale (see docs/plans/2026-07-27-salt-score-quiz.md). Lift the robots
 * block and add nav/services links when the gate opens.
 */
export const metadata: Metadata = {
  title: 'The Salt Score',
  description:
    'Nine questions, two minutes: find out how many hours a week of your business could run itself.',
  robots: {index: false, follow: false},
}

export default function QuizRoute() {
  return (
    <main className="min-h-svh bg-background">
      <QuizFlow />
    </main>
  )
}
