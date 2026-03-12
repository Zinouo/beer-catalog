import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBeer, deleteBeer, type Beer } from '../api/beers'
import { useAuth } from '../hooks/useAuth'
import ImageCarousel from '../components/ImageCarousel'

export default function BeerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [beer, setBeer] = useState<Beer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    getBeer(id)
      .then(setBeer)
      .catch(() => setError('Bière introuvable.'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!id || !confirm('Supprimer cette bière ?')) return
    setIsDeleting(true)
    try {
      await deleteBeer(id)
      navigate('/')
    } catch {
      alert('Erreur lors de la suppression.')
      setIsDeleting(false)
    }
  }

  const canEdit = user && beer && user.id === beer.createdBy

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[4/3] bg-slate-100 rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-5 bg-slate-100 rounded w-3/4" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !beer) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-slate-500 text-lg">{error || 'Bière introuvable'}</p>
        <Link to="/" className="mt-4 inline-block text-amber-600 hover:underline">
          Retour au catalogue
        </Link>
      </div>
    )
  }

  const isLimitedEdition = beer.validityStart && beer.validityEnd
  const alcoholColor =
    beer.alcoholPercentage < 4 ? 'bg-green-100 text-green-700' :
    beer.alcoholPercentage < 7 ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700'

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="mb-6 text-sm text-slate-400">
        <Link to="/" className="hover:text-slate-600">Catalogue</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-700">{beer.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ImageCarousel beerId={beer.id} count={beer.pictureCount ?? 0} />

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-800">{beer.name}</h1>
              <span className={`text-sm font-bold px-3 py-1 rounded-full shrink-0 ${alcoholColor}`}>
                {beer.alcoholPercentage}% vol.
              </span>
            </div>
            <span className="inline-block text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {beer.category}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed">{beer.description}</p>

          {isLimitedEdition && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-800 mb-1">⏳ Édition limitée</p>
              <p className="text-sm text-amber-700">
                Du {new Date(beer.validityStart!).toLocaleDateString('fr-BE')}
                {' '}au {new Date(beer.validityEnd!).toLocaleDateString('fr-BE')}
              </p>
            </div>
          )}

          {canEdit && (
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <Link
                to={`/beers/${beer.id}/edit`}
                className="flex-1 text-center bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Modifier
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}