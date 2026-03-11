import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import CatalogPage from './pages/CatalogPage'
import BeerDetailPage from './pages/BeerDetailPage'
import CreateBeerPage from './pages/CreateBeerPage'
import EditBeerPage from './pages/EditBeerPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/beers/:id" element={<BeerDetailPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/beers/new" element={<CreateBeerPage />} />
            <Route path="/beers/:id/edit" element={<EditBeerPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}