import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreatePropertyWizard from './pages/CreatePropertyWizard'
import PropertyDetails from './pages/PropertyDetails'
import MainLayout from './layouts/MainLayout'
import { useAuth } from './context/AuthContext.tsx'
import type { ReactNode } from 'react'
import './App.css'

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }
  if (!isAuthenticated) {
    // Si no está autenticado, redirigir a la página de login
    return <Navigate to="/" replace />;
  }
  return children;
};

// Componente para la página de login que redirige si ya está autenticado
const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-property"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreatePropertyWizard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/property/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PropertyDetails />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Redirección genérica por si se intenta acceder a una ruta inexistente */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
