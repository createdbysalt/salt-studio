import '../globals.css'
import '@/styles/index.css'
import {handleError} from '@/app/(personal)/client-functions'
import {DraftModeToast} from '@/app/(personal)/DraftModeToast'
import {SanityLive} from '@/sanity/lib/live'
import {VisualEditing} from 'next-sanity/visual-editing'
import {draftMode} from 'next/headers'
import {Toaster} from 'sonner'

export default async function TableLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      {children}
      <Toaster />
      <SanityLive onError={handleError} />
      {(await draftMode()).isEnabled && (
        <>
          <DraftModeToast
            action={async () => {
              'use server'

              await Promise.allSettled([
                (await draftMode()).disable(),
                new Promise((resolve) => setTimeout(resolve, 1000)),
              ])
            }}
          />
          <VisualEditing />
        </>
      )}
    </>
  )
}
