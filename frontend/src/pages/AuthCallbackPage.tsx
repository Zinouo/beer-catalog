import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AuthCallbackPage() {
  const { setTokenAndFetchUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      setTokenAndFetchUser(token).then(() => navigate('/'))
    } else {
      navigate('/')
    }
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-slate-500">Connexion en cours...</p>
    </div>
  )
}