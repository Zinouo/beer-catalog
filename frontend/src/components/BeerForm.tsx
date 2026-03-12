import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories, createBeer, updateBeer, getPictureUrl, type Beer } from '../api/beers'

interface Props {
  beer?: Beer
}

export default function BeerForm({ beer }: Props) {
  const navigate = useNavigate()
  const isEditing = !!beer

  const [name, setName] = useState(beer?.name || '')
  const [category, setCategory] = useState(beer?.category || '')
  const [description, setDescription] = useState(beer?.description || '')
  const [alcoholPercentage, setAlcoholPercentage] = useState(
    beer?.alcoholPercentage?.toString() || ''
  )
  const [validityStart, setValidityStart] = useState(
    beer?.validityStart ? beer.validityStart.slice(0, 10) : ''
  )
  const [validityEnd, setValidityEnd] = useState(
    beer?.validityEnd ? beer.validityEnd.slice(0, 10) : ''
  )

  const [existingPictureCount] = useState(
    beer?.pictureCount ?? 0
  )
  const [removedIndexes, setRemovedIndexes] = useState<number[]>([])

  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  const [categories, setCategories] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f))
    setNewPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [newFiles])

  const validateDates = () => {
    if (validityStart && validityEnd) {
      if (new Date(validityStart) >= new Date(validityEnd)) {
        setError('La date de début doit être avant la date de fin.')
        return false
      }
    }
    if ((validityStart && !validityEnd) || (!validityStart && validityEnd)) {
      setError('Les deux dates doivent être renseignées ou laissées vides.')
      return false
    }
    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewFiles((prev) => [...prev, ...files])
  }

  const removeExisting = (index: number) => {
    setRemovedIndexes((prev) => [...prev, index])
  }

  const removeNew = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validateDates()) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('category', category)
      formData.append('description', description)
      formData.append('alcoholPercentage', alcoholPercentage)
      if (validityStart) formData.append('validityStart', validityStart)
      if (validityEnd) formData.append('validityEnd', validityEnd)

      newFiles.forEach((file) => formData.append('pictures', file))

      removedIndexes.forEach((i) => formData.append('removedIndexes', String(i)))

      if (isEditing && beer) {
        await updateBeer(beer.id, formData)
        navigate(`/beers/${beer.id}`)
      } else {
        const created = await createBeer(formData)
        navigate(`/beers/${created.id}`)
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(category.toLowerCase()) && c !== category
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">
        {isEditing ? `Modifier "${beer.name}"` : 'Ajouter une bière'}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Nom <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Ex: Leffe Blonde"
        />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Catégorie <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={category}
          onChange={(e) => { setCategory(e.target.value); setShowSuggestions(true) }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => setShowSuggestions(true)}
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Ex: Blonde, IPA, Stout..."
        />

        {showSuggestions && filteredCategories.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-md max-h-40 overflow-y-auto">
            {filteredCategories.map((cat) => (
              <li
                key={cat}
                onMouseDown={() => { setCategory(cat); setShowSuggestions(false) }}
                className="px-4 py-2 text-sm hover:bg-amber-50 cursor-pointer"
              >
                {cat}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          placeholder="Décrivez la bière..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Degré d'alcool (%) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          required
          min={0}
          max={100}
          step={0.1}
          value={alcoholPercentage}
          onChange={(e) => setAlcoholPercentage(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Ex: 6.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Période de validité
          <span className="text-slate-400 font-normal ml-1">(optionnel — édition limitée)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Début</label>
            <input
              type="date"
              value={validityStart}
              onChange={(e) => setValidityStart(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Fin</label>
            <input
              type="date"
              value={validityEnd}
              onChange={(e) => setValidityEnd(e.target.value)}
              min={validityStart || undefined}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      {isEditing && existingPictureCount > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Photos actuelles
          </label>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: existingPictureCount }).map((_, i) =>
              removedIndexes.includes(i) ? null : (
                <div key={i} className="relative">
                  <img
                    src={getPictureUrl(beer!.id, i)}
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeExisting(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {isEditing ? 'Ajouter des photos' : 'Photos'}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-amber-50 file:text-amber-700 file:text-xs file:font-medium"
        />
        {newPreviews.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {newPreviews.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex-1 border border-slate-200 text-slate-700 font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Créer la bière'}
        </button>
      </div>
    </form>
  )
}