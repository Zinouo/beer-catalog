import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBeer, type Beer } from '../api/beers'
import BeerForm from '../components/BeerForm'

export default function EditBeerPage() {
  const { id } = useParams<{ id: string }>()
  const [beer, setBeer] = useState<Beer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    getBeer(id)
      .then(setBeer)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return <div className="max-w-2xl mx-auto h-96 bg-slate-100 rounded-xl animate-pulse" />
  }

  if (error || !beer) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-500">Bière introuvable.</p>
        <Link to="/" className="text-amber-600 hover:underline mt-2 inline-block">Retour</Link>
      </div>
    )
  }

  return <BeerForm beer={beer} />
}