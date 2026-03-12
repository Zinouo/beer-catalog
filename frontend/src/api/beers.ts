export interface Beer {
    id: string
    name: string
    category: string
    description: string
    alcoholPercentage: number
    pictureCount: number
    validityStart: string | null
    validityEnd: string | null
    createdBy: string
    createdAt: string
  }
  
  export interface BeerFilters {
    search?: string
    category?: string
    sort?: 'ASC' | 'DESC'
  }
  

  export const getPictureUrl = (beerId: string, index: number) =>
    `/api/beers/${beerId}/pictures/${index}`
  
  const getToken = () => localStorage.getItem('token')
  
  const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
  })
  
  export const getBeers = async (filters: BeerFilters = {}): Promise<Beer[]> => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.category) params.set('category', filters.category)
    if (filters.sort) params.set('sort', filters.sort)
  
    const res = await fetch(`/api/beers?${params}`, {
      headers: getToken() ? authHeaders() : {},
    })
    if (!res.ok) throw new Error('Failed to fetch beers')
    return res.json()
  }
  
  export const getBeer = async (id: string): Promise<Beer> => {
    const res = await fetch(`/api/beers/${id}`, {
      headers: getToken() ? authHeaders() : {},
    })
    if (!res.ok) throw new Error('Beer not found')
    return res.json()
  }
  
  export const getCategories = async (): Promise<string[]> => {
    const res = await fetch('/api/beers/categories')
    if (!res.ok) return []
    return res.json()
  }
  
  export const createBeer = async (data: FormData): Promise<Beer> => {
    const res = await fetch('/api/beers', {
      method: 'POST',
      headers: authHeaders(),
      body: data,
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to create beer')
    }
    return res.json()
  }
  
  export const updateBeer = async (id: string, data: FormData): Promise<Beer> => {
    const res = await fetch(`/api/beers/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: data,
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Failed to update beer')
    }
    return res.json()
  }
  
  export const deleteBeer = async (id: string): Promise<void> => {
    const res = await fetch(`/api/beers/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Failed to delete beer')
  }