import { Link } from 'react-router-dom'
import type { Beer } from '../api/beers'
import { getPictureUrl } from '../api/beers'

interface Props {
  beer: Beer
}

export default function BeerCard({ beer }: Props) {
  const hasImage = beer.pictures?.length > 0

  const alcoholColor =
    beer.alcoholPercentage < 4 ? 'bg-green-100 text-green-700' :
    beer.alcoholPercentage < 7 ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700'

  return (
    <Link to={`/beers/${beer.id}`} className="group block">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200">

        <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
          {hasImage ? (
            <img
              src={getPictureUrl(beer.id, 0)}
              alt={beer.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🍺
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors leading-tight">
              {beer.name}
            </h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${alcoholColor}`}>
              {beer.alcoholPercentage}%
            </span>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {beer.category}
          </span>
        </div>
      </div>
    </Link>
  )
}