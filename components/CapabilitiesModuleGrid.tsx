import {CapStagger, CapStaggerItem} from '@/components/CapabilitiesMotion'

type ModuleTile = {
  _key: string
  label?: string | null
  inHouse?: boolean | null
}

type CapabilitiesModuleGridProps = {
  subhead?: string | null
  tiles?: ModuleTile[] | null
}

/** Full-bleed technical module manifest — not marketing pills. */
export function CapabilitiesModuleGrid({subhead, tiles}: CapabilitiesModuleGridProps) {
  const list = tiles ?? []
  if (!list.length) return null

  return (
    <section className="border-b border-black/10 bg-white">
      {subhead ? (
        <div className="border-b border-black/10 px-4 py-6 sm:px-5 sm:py-8 md:px-8 md:py-10">
          <h2 className="font-mono text-lg font-medium tracking-tight text-black sm:text-xl md:text-2xl">
            {subhead}
          </h2>
        </div>
      ) : null}

      <CapStagger className="grid grid-cols-2 border-t border-l border-black/15 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {list.map((tile) => {
          const inHouse = tile.inHouse !== false
          return (
            <CapStaggerItem
              key={tile._key}
              className={`group relative flex min-h-[100px] flex-col justify-between border-b border-r border-black/15 px-2.5 py-2.5 transition-colors duration-300 sm:min-h-[120px] sm:px-3 sm:py-3 md:min-h-[140px] md:px-4 md:py-4 ${
                inHouse
                  ? 'bg-white hover:bg-black/[0.04]'
                  : 'bg-[#EFEFEF] text-black/70 hover:bg-black/[0.07]'
              }`}
            >
              <span className="font-mono text-[10px] uppercase leading-snug tracking-[0.06em] sm:text-[11px] sm:tracking-[0.08em] md:text-[12px]">
                {tile.label}
              </span>
              <span className="mt-2 font-mono text-[8px] uppercase tracking-[0.12em] text-black/35 transition-colors duration-300 group-hover:text-black/50 sm:mt-3 sm:text-[9px] sm:tracking-[0.14em]">
                {inHouse ? 'In-house' : 'On request'}
              </span>
            </CapStaggerItem>
          )
        })}
      </CapStagger>
    </section>
  )
}
