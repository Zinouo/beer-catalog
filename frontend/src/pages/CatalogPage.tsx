import { useEffect, useState, useCallback } from 'react'
import { getBeers, getCategories, type Beer, type BeerFilters } from '../api/beers'
import BeerCard from '../components/BeerCard'

export default function CatalogPage() {
  const [beers, setBeers] = useState<Beer[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [filters, setFilters] = useState<BeerFilters>({ sort: 'ASC' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  const fetchBeers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getBeers(filters)
      setBeers(data)
    } catch {
      setError('Impossible de charger les bières.')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchBeers() }, [fetchBeers])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">Nos bières</h1>
        <p className="text-slate-500">{beers.length} bière{beers.length > 1 ? 's' : ''} disponible{beers.length > 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="Rechercher une bière..."
          value={filters.search || ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />

        <select
          value={filters.category || ''}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value || undefined }))}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={filters.sort || 'ASC'}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as 'ASC' | 'DESC' }))}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        >
          <option value="ASC">Alcool ↑</option>
          <option value="DESC">Alcool ↓</option>
        </select>
      </div>

      {error && (
        <div className="text-center py-16 text-red-500">{error}</div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : beers.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🍺</p>
          <p className="text-slate-500 text-lg">Aucune bière trouvée</p>
          <p className="text-slate-400 text-sm mt-1">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {beers.map((beer) => (
            <BeerCard key={beer.id} beer={beer} />
          ))}
        </div>
      )}
    </div>
  )
}