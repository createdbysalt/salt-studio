import '../globals.css'
import '@/styles/index.css'
import {ProposalOpen} from '@/components/motion/ProposalOpen'
import type {Metadata} from 'next'

export const metadata: Metadata = {
  robots: {index: false, follow: false},
  title: 'Proposal',
}

export default function ProposalLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <ProposalOpen />
      {children}
    </>
  )
}
