import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Explore from './pages/Explore'
import CreatePropertyWizard from './pages/CreatePropertyWizard'
import PropertyDetails from './pages/PropertyDetails'
import MyProperties from './pages/MyProperties'
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
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Componente para la página de login que redirige si ya está autenticado
const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/explore" replace />;
  }
  return <Login />;
};

// Componente para la página de registro que redirige si ya está autenticado
const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/explore" replace />;
  }
  return <Register />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta raíz redirige a explorar */}
        <Route path="/" element={<Navigate to="/explore" replace />} />
        
        {/* Página de login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Página de registro */}
        <Route path="/register" element={<RegisterPage />} />
        
        <Route
          path="/explore"
          element={<Explore />}
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
          path="/edit-property/:id"
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
            <MainLayout>
              <PropertyDetails />
            </MainLayout>
          }
        />
        <Route
          path="/properties"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MyProperties />
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
