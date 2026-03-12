import { useState } from 'react'
import { getPictureUrl } from '../api/beers'

interface Props {
  beerId: string
  count: number 
}

export default function ImageCarousel({ beerId, count }: Props) {
  const [current, setCurrent] = useState(0)

  if (count === 0) {
    return (
      <div className="aspect-[4/3] bg-slate-100 rounded-xl flex items-center justify-center text-7xl">
        🍺
      </div>
    )
  }

  const prev = () => setCurrent((i) => (i - 1 + count) % count)
  const next = () => setCurrent((i) => (i + 1) % count)

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden">
        <img
          src={getPictureUrl(beerId, current)}
          alt={`Photo ${current + 1}`}
          className="w-full h-full object-cover"
        />

        {count > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {Array.from({ length: count }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === current ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === current ? 'border-amber-500' : 'border-transparent'
              }`}
            >
              <img
                src={getPictureUrl(beerId, i)}
                alt={`Miniature ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}